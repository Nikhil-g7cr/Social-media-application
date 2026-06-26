import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Image as ImageIcon,
  Smile,
  Trash2,
  Paperclip,
  File as FileIcon,
  Play,
  Download,
  X,
} from "lucide-react";
import { initializeSocket } from "../../utils/socket";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import {
  useGetConversationsQuery,
  useGetMessagesByConversationIdQuery,
  useStartConversationMutation,
  useClearChatHistoryMutation,
  type Conversation as RTKConversation,
  type ChatMessage,
  type ChatAttachment,
} from "../../redux/features/chat/chatApiSlice";
import { useSearchUsersQuery } from "../../redux/features/user/userApiSlice";
import Avatar from "../../shared/shared-components/Avatar";
import API from "../../config/axiosConfig";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";

// --- TypeScript Interfaces ---
interface UIMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

interface UIConversation {
  id: string;
  participantName: string;
  avatarUrl?: string | null;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  participantId: string;
}

const MessagesPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetConvId = searchParams.get("convId");

  const { user, token } = useAppSelector((state: any) => state.auth);
  const CURRENT_USER_ID = user?.id || "";
  const onlineUserIds = useAppSelector(
    (state: any) => state.onlineUsers?.onlineUserIds || [],
  );

  // --- State ---
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<UIConversation | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Search State ---

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  // ==============Debouncing===============================
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    "",
    500,
  );

  const { data: searchResults = [], isFetching: isSearchFetching } =
    useSearchUsersQuery(debouncedTerm, { skip: !debouncedTerm.trim() });
  // =======================end=============================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- RTK Query ---
  const { data: apiConversations, isLoading: isConversationsLoading } =
    useGetConversationsQuery();
  const { data: apiMessages } = useGetMessagesByConversationIdQuery(
    activeConversation?.id || "",
    {
      skip: !activeConversation,
    },
  );
  const [startConversation] = useStartConversationMutation();
  const [clearChatHistory] = useClearChatHistoryMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track a newly created conversation so we can auto-open it after refetch
  const pendingConvIdRef = useRef<string | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // --- JOIN ROOM when switching active conversation (Bug Fix #6) ---
  useEffect(() => {
    if (activeConversation) {
      const socket = initializeSocket();
      socket.emit("joinRoom", { conversationId: activeConversation.id });
    }
  }, [activeConversation]);

  // --- Update conversations from RTK Query ---
  useEffect(() => {
    if (apiConversations) {
      const formattedConversations = apiConversations.map(
        (conv: RTKConversation) => ({
          id: conv.id,
          participantName: conv.participant?.name || "Unknown User",
          avatarUrl: conv.participant?.avatarUrl,
          lastMessage: conv.latestMessage?.content || "No messages yet",
          time: conv.latestMessage?.createdAt
            ? new Date(conv.latestMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unreadCount: 0,
          isOnline: false,
          participantId: conv.participant?.id || "",
        }),
      );
      setConversations(formattedConversations);

      // Auto-open via URL param
      if (targetConvId && !activeConversation) {
        const target = formattedConversations.find(
          (c) => c.id === targetConvId,
        );
        if (target) {
          setActiveConversation(target);
          setIsMobileChatOpen(true);
        }
      }

      // Auto-open a newly started conversation after refetch
      if (pendingConvIdRef.current) {
        const target = formattedConversations.find(
          (c) => c.id === pendingConvIdRef.current,
        );
        if (target) {
          pendingConvIdRef.current = null;
          setActiveConversation(target);
          setIsMobileChatOpen(true);
        }
      }
    }
  }, [apiConversations, targetConvId]);

  // --- Load message history when a conversation is selected ---
  useEffect(() => {
    if (apiMessages) {
      // Backend returns normalized camelCase objects: { id, senderId, content, createdAt }
      const formattedMessages: UIMessage[] = apiMessages.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: msg.attachments,
      }));
      setMessages(formattedMessages);
      scrollToBottom();
    }
  }, [apiMessages]);

  // --- Handlers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = (conv: UIConversation) => {
    setActiveConversation(conv);
    setMessages([]); // Clear old messages while new ones load
    setIsMobileChatOpen(true);
  };

  const handleStartNewChat = async (userId: string) => {
    try {
      const res = await startConversation(userId).unwrap();
      if (res.conversationId) {
        setIsSearchOpen(false);
        setSearchTerm("");
        const existing = conversations.find((c) => c.id === res.conversationId);
        if (existing) {
          handleSelectConversation(existing);
        } else {
          pendingConvIdRef.current = res.conversationId;
        }
      }
    } catch (e) {
      console.error("Failed to start chat", e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => {
        const sizeInMB = file.size / (1024 * 1024);
        if (file.type.startsWith("image/") && sizeInMB > 20) {
          alert(`Image ${file.name} is too large. Max 20MB.`);
          return false;
        }
        if (file.type.startsWith("video/") && sizeInMB > 100) {
          alert(`Video ${file.name} is too large. Max 100MB.`);
          return false;
        }
        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/") &&
          sizeInMB > 50
        ) {
          alert(`Document ${file.name} is too large. Max 50MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!newMessage.trim() && selectedFiles.length === 0) ||
      !activeConversation
    )
      return;

    setIsUploading(true);
    const uploadedAttachments: ChatAttachment[] = [];

    for (const file of selectedFiles) {
      try {
        const fileId = Math.random().toString(36).substring(7);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        const res = await API.post("/files/upload-url", {
          fileName: file.name,
          contentType: file.type,
          folder: "chat-attachments",
          fileSize: file.size,
          mimeType: file.type,
        });

        // Backend wraps responses with { status, data, message }
        const uploadUrl = res.data?.data?.uploadUrl || res.data?.uploadUrl;

        if (!uploadUrl) throw new Error("Failed to get upload URL");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: percentComplete,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(file);
        });

        const extension = file.name.split(".").pop() || "";
        const baseUrl = uploadUrl.split("?")[0];

        uploadedAttachments.push({
          id: "",
          fileUrl: baseUrl,
          fileType: file.type,
          fileSizeBytes: file.size,
          originalFileName: file.name,
          mimeType: file.type,
          fileExtension: extension,
        });
      } catch (err) {
        console.error("File upload error", err);
        alert(`Failed to upload ${file.name}`);
      }
    }

    const text = newMessage;
    setNewMessage("");
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    // Send via WebSocket — the gateway saves to DB and broadcasts back
    const socket = initializeSocket();
    socket.emit("sendMessage", {
      conversationId: activeConversation.id,
      text,
      attachments:
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    });

    setTimeout(scrollToBottom, 100);
  };

  // ===============cleaning the conversation===============
  const cleanConversations = useMemo(() => {
    if (!conversations) return [];

    // 1. Filter out conversations where the user doesn't exist anymore
    // (Adjust the condition if your backend sends a specific flag like conv.isDeleted)
    const validConversations = conversations.filter(
      (conv) => conv.participantId && conv.participantName,
    );

    // 2. Remove duplicates (Keep only one conversation per participantId)
    const seenParticipants = new Set();
    const deduplicatedConversations = [];

    for (const conv of validConversations) {
      // If we haven't seen this user yet, add them to our clean list
      if (!seenParticipants.has(conv.participantId)) {
        seenParticipants.add(conv.participantId);
        deduplicatedConversations.push(conv);
      }
    }

    return deduplicatedConversations;
  }, [conversations]);

  const handleClearChat = async () => {
    if (!activeConversation) return;
    if (
      window.confirm(
        "Are you sure you want to clear this chat history from your screen? This action cannot be undone.",
      )
    ) {
      try {
        await clearChatHistory(activeConversation.id).unwrap();
        setMessages([]); // Immediately clear local state messages
      } catch (e) {
        console.error("Failed to clear chat history", e);
      }
    }
  };

  if (isConversationsLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden border-t border-gray-200">
      {/* --- LEFT COLUMN: CONVERSATION LIST --- */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${isMobileChatOpen ? "hidden md:flex" : "flex"}`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-200" ref={searchWrapperRef}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users to chat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            {/* Search Dropdown */}
            {isSearchOpen && debouncedTerm.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-50">
                {isSearchFetching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                ) : (
                  (() => {
                    // 1. Pre-filter the results before rendering
                    const filteredResults =
                      searchResults?.filter((u) => u.id !== CURRENT_USER_ID) ||
                      [];

                    // 2. Check if the *filtered* results are empty
                    if (filteredResults.length === 0) {
                      return (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No users found.
                        </div>
                      );
                    }

                    // 3. Render the list if results exist
                    return (
                      <ul className="py-2">
                        {filteredResults.map((u) => (
                          <li
                            key={u.id}
                            onClick={() => handleStartNewChat(u.id)}
                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                          >
                            <Avatar
                              url={u.avatarUrl}
                              name={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {u.name}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                @{u.username}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {/* USE cleanConversations HERE */}
          {cleanConversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No conversations yet. Search for someone above!
            </div>
          ) : (
            // USE cleanConversations HERE
            cleanConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
                  activeConversation?.id === conv.id ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    url={conv.avatarUrl || undefined}
                    name={conv.participantName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {onlineUserIds.includes(conv.participantId) && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conv.participantName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conv.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      conv.unreadCount > 0
                        ? "font-semibold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: ACTIVE CHAT --- */}
      <div
        className={`w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-50/50 ${!isMobileChatOpen ? "hidden md:flex" : "flex"}`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar
                  url={activeConversation.avatarUrl || undefined}
                  name={activeConversation.participantName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-md font-semibold text-gray-900">
                    {activeConversation.participantName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {onlineUserIds.includes(activeConversation.participantId)
                      ? "Active now"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  onClick={handleClearChat}
                  title="Clear Chat History"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe =
                  String(msg.senderId).toLowerCase() ===
                  String(CURRENT_USER_ID).toLowerCase();
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-col gap-2 mb-2">
                            {msg.attachments.map((att: any) => {
                              if (att.mimeType?.startsWith("image/")) {
                                return (
                                  <img
                                    key={att.id}
                                    src={att.fileUrl}
                                    alt={att.originalFileName}
                                    className="max-w-full max-h-64 rounded-lg object-contain cursor-pointer"
                                    onClick={() =>
                                      window.open(att.fileUrl, "_blank")
                                    }
                                  />
                                );
                              } else if (att.mimeType?.startsWith("video/")) {
                                return (
                                  <video
                                    key={att.id}
                                    src={att.fileUrl}
                                    controls
                                    className="max-w-full max-h-64 rounded-lg"
                                  />
                                );
                              } else {
                                return (
                                  <a
                                    key={att.id}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? "bg-blue-700 hover:bg-blue-800 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"} transition`}
                                  >
                                    <FileIcon className="h-5 w-5" />
                                    <div className="flex flex-col overflow-hidden">
                                      <span className="text-sm font-semibold truncate">
                                        {att.originalFileName}
                                      </span>
                                      <span className="text-xs opacity-75">
                                        {(att.fileSizeBytes / 1024).toFixed(1)}{" "}
                                        KB
                                      </span>
                                    </div>
                                    <Download className="h-4 w-4 ml-auto" />
                                  </a>
                                );
                              }
                            })}
                          </div>
                        )}
                        {msg.text && (
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 mx-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-center bg-gray-50 border border-gray-200 p-2 rounded-lg shadow-sm w-48"
                    >
                      <div className="mr-2">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-6 w-6 text-blue-500" />
                        ) : file.type.startsWith("video/") ? (
                          <Play className="h-6 w-6 text-purple-500" />
                        ) : (
                          <FileIcon className="h-6 w-6 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-red-50 text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2"
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <div className="flex items-center gap-2 text-gray-400 pb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:text-blue-600 hover:bg-gray-100 rounded-full transition hidden sm:block"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] bg-gray-100 border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={
                    (!newMessage.trim() && selectedFiles.length === 0) ||
                    isUploading
                  }
                  className="p-3 mb-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? (
                    <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Send className="h-10 w-10 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your Messages
            </h3>
            <p className="text-gray-500 max-w-sm">
              Search for someone above to start a new conversation, or select
              one from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
