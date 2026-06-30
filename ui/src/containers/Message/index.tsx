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
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import {
  useGetConversationsQuery,
  useGetMessagesByConversationIdQuery,
  useStartConversationMutation,
  useClearChatHistoryMutation,
  type Conversation as ServerConversation,
  type ChatMessage,
  type ChatAttachment,
  useStartGroupConvMutation,
} from "../../redux/features/chat/chatApiSlice";
import { useSearchUsersQuery } from "../../redux/features/user/userApiSlice";
import Avatar from "../../shared/shared-components/Avatar";
import API from "../../config/axiosConfig";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { notification } from "antd";
import CreateGroupFeature from "../../components/layout/CreateGroupChat";

// =====================================================================
// TYPES
// =====================================================================
// UI-friendly shape of a single chat message (after we normalize
// whatever the server sends us into something easy to render).
interface UIMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

// UI-friendly shape of a conversation row shown in the left sidebar list.
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

const NO_MESSAGES_PLACEHOLDER = "No messages yet";

const MessagesPage: React.FC = () => {
  // =====================================================================
  // ======= Reading ?convId= from the URL so we can deep-link straight
  // ======= into a specific conversation (e.g. from a notification)
  // =====================================================================
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const deepLinkConversationId = searchParams.get("convId");
  // ===================== end of URL deep-link setup =====================

  const { user } = useAppSelector((state: any) => state.auth);
  const CURRENT_USER_ID = user?.id || "";
  const onlineUserIds = useAppSelector(
    (state: any) => state.onlineUsers?.onlineUserIds || [],
  );

  // =====================================================================
  // ======= Local UI state: sidebar list, active chat, message list,
  // ======= the message draft box, and mobile responsive view toggle
  // =====================================================================
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<UIConversation | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  // ===================== end of local UI state =====================

  // =====================================================================
  // ======= Attachment state: files picked but not yet sent, and the
  // ======= per-file upload progress while they're being pushed to Azure
  // =====================================================================
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [fileId: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ===================== end of attachment state =====================

  // =====================================================================
  // ======= "Start a new chat" search box state (top of sidebar)
  // =====================================================================
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    "",
    500,
  );

  const { data: userSearchResults = [], isFetching: isSearchFetching } =
    useSearchUsersQuery(debouncedTerm, { skip: !debouncedTerm.trim() });

  // Close the "new chat" search dropdown when the user clicks outside it
  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);
  // ===================== end of new-chat search box state =====================

  // =====================================================================
  // ======= Server data: conversation list + messages for the active
  // ======= conversation, plus the mutations we can call against them
  // =====================================================================
  const { data: serverConversations, isLoading: isConversationsLoading } =
    useGetConversationsQuery();

  const { data: serverMessages } = useGetMessagesByConversationIdQuery(
    activeConversation?.id || "",
    {
      skip: !activeConversation,
    },
  );

  const [startConversation] = useStartConversationMutation();
  const [clearChatHistory] = useClearChatHistoryMutation();
  // ===================== end of server data hooks =====================

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Holds the conversation ID we just created via "start new chat" so that
  // once the conversation list refetches and includes it, we can jump
  // straight into it automatically.
  const pendingNewConversationIdRef = useRef<string | null>(null);

  // =====================================================================
  // ======= Auto-scroll the message thread to the bottom whenever new
  // ======= messages are added to the currently open conversation
  // =====================================================================
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);
  // ===================== end of auto-scroll effect =====================

  // =====================================================================
  // ======= Join the socket.io room & Listen for real-time messages
  // =====================================================================
  useEffect(() => {
    if (activeConversation) {
      const socket = initializeSocket();
      socket.emit("joinRoom", { conversationId: activeConversation.id });

      // Add the real-time listener for incoming messages
      const handleNewMessage = (newMsg: any) => {
        // Only push to UI if it belongs to the chat we are currently viewing
        if (newMsg.conversationId === activeConversation.id) {
          setMessages((prev) => {
            // Deduplication check (just in case the callback also fired)
            if (prev.find((m) => m.id === newMsg.id)) return prev;

            return [
              ...prev,
              {
                id: newMsg.id,
                senderId: newMsg.senderId,
                text: newMsg.content,
                timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                attachments: newMsg.attachments,
              },
            ];
          });
          scrollToBottom();
        }
      };

      socket.on("newMessage", handleNewMessage);

      // Cleanup listener when changing conversations or unmounting
      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [activeConversation]);
  // ===================== end of socket room join effect =====================

  // =====================================================================
  // ======= Normalize the raw server conversation list into UIConversation
  // ======= shape, and handle the two "auto open a conversation" cases:
  // ======= 1) a ?convId= deep link from the URL
  // ======= 2) a conversation we just created via "start new chat"
  // =====================================================================
  useEffect(() => {
    if (!serverConversations) return;

    const formattedConversations: UIConversation[] = serverConversations.map(
      (conv: ServerConversation) => ({
        id: conv.id,
        participantName: conv.participant?.name || "Unknown User",
        avatarUrl: conv.participant?.avatarUrl,
        lastMessage: conv.latestMessage?.content || NO_MESSAGES_PLACEHOLDER,
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

    // --- Case 1: deep link from URL (?convId=...) ---
    if (deepLinkConversationId && !activeConversation) {
      const targetConversation = formattedConversations.find(
        (c) => c.id === deepLinkConversationId,
      );
      if (targetConversation) {
        setActiveConversation(targetConversation);
        setIsMobileChatOpen(true);
      }
    }

    // --- Case 2: we just started a brand new conversation, open it now
    //     that it has shown up in the refetched list ---
    if (pendingNewConversationIdRef.current) {
      const targetConversation = formattedConversations.find(
        (c) => c.id === pendingNewConversationIdRef.current,
      );
      if (targetConversation) {
        pendingNewConversationIdRef.current = null;
        setMessages([]); // avoid flashing the previous chat's messages
        setActiveConversation(targetConversation);
        setIsMobileChatOpen(true);
      }
    }
  }, [serverConversations, deepLinkConversationId]);
  // ===================== end of conversation list normalization effect =====================

  // =====================================================================
  // ======= Load message history whenever the server returns messages
  // ======= for the active conversation (fires on conversation switch)
  // =====================================================================
  useEffect(() => {
    if (!serverMessages) return;

    // Backend returns normalized camelCase objects: { id, senderId, content, createdAt, attachments[] }
    console.log(serverMessages);
    const formattedMessages: UIMessage[] = serverMessages.map((msg: any) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.content,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: (msg.attachments ?? []).map((att: any) => ({
        id: att.id,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSizeBytes: att.fileSizeBytes,
        originalFileName: att.originalFileName,
        mimeType: att.mimeType,
        fileExtension: att.fileExtension,
        imageWidth: att.imageWidth,
        imageHeight: att.imageHeight,
        videoDuration: att.videoDuration,
        thumbnailUrl: att.thumbnailUrl,
      })),
    }));
    setMessages(formattedMessages);
    scrollToBottom();
  }, [serverMessages]);
  // ===================== end of message history loading effect =====================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // =====================================================================
  // ======= User clicked a conversation in the sidebar list
  // =====================================================================
  const handleSelectConversation = (conversation: UIConversation) => {
    setActiveConversation(conversation);
    // setMessages([]); // clear old messages while the new ones load
    setIsMobileChatOpen(true);
  };
  // ===================== end of select-conversation handler =====================

  // =====================================================================
  // ======= User picked someone from the "start new chat" search box.
  // ======= The backend either returns an EXISTING conversation id
  // ======= (if you two already have one) or creates a new one — either
  // ======= way we just open whatever id comes back.
  // =====================================================================
  const handleStartNewChat = async (targetUser: { id: string; name: string; username?: string; avatarUrl?: string }) => {
  try {
    const res = await startConversation(targetUser.id).unwrap();
    if (!res.conversationId) return;

    setIsSearchOpen(false);
    setSearchTerm("");
    // setMessages([]);
    setActiveConversation({
      id: res.conversationId,
      participantName: targetUser.name,
      avatarUrl: targetUser.avatarUrl,
      lastMessage: NO_MESSAGES_PLACEHOLDER,
      time: "",
      unreadCount: 0,
      isOnline: onlineUserIds.includes(targetUser.id),
      participantId: targetUser.id,
    });
    setIsMobileChatOpen(true);
  } catch (error: any) {
    const msg = error?.data?.message || "Could not start this conversation.";
    notification.error({ message: "Couldn't open chat", description: msg }); // use antd, like elsewhere in the app
  }
};
  // ===================== end of start-new-chat handler =====================

  // =====================================================================
  // ======= Validate and stage files picked from the attachment button
  // ======= (size limits differ for images / videos / other documents)
  // =====================================================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const pickedFiles = Array.from(e.target.files);
    const validFiles = pickedFiles.filter((file) => {
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
  };
  // ===================== end of file selection/validation handler =====================

  // =====================================================================
  // ======= Send the current draft message (+ any staged attachments).
  // ======= Attachments are uploaded to Azure Blob first, then the
  // ======= text + attachment metadata is sent over the socket so the
  // ======= gateway can persist it and broadcast it back to the room.
  // =====================================================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!messageDraft.trim() && selectedFiles.length === 0) ||
      !activeConversation
    )
      return;

    setIsUploading(true);
    const uploadedAttachments: ChatAttachment[] = [];

    for (const file of selectedFiles) {
      try {
        const fileId = Math.random().toString(36).substring(7);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        const uploadUrlResponse = await API.post("/files/upload-url", {
          fileName: file.name,
          contentType: file.type,
          folder: "chat-attachments",
          fileSize: file.size,
          mimeType: file.type,
        });

        // Backend returns { uploadUrl, blobPath, expiresIn } directly (no data wrapper)
        const uploadUrl: string | undefined =
          uploadUrlResponse.data?.uploadUrl ||
          uploadUrlResponse.data?.data?.uploadUrl;

        console.log("[upload] SAS url received:", uploadUrl ? "OK" : "MISSING", uploadUrlResponse.data);

        if (!uploadUrl) throw new Error("Failed to get upload URL from server");

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

    const textToSend = messageDraft;
    setMessageDraft("");
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    // Send via WebSocket — the gateway saves it to the DB and broadcasts
    // the saved/normalized message back to everyone in the room.
    // Send via WebSocket
    const socket = initializeSocket();
    socket.emit("sendMessage", {
      conversationId: activeConversation.id,
      text: textToSend,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    }, (response: { status?: string; data?: any; error?: string }) => {
        
        // ✅ Check for 'status === success' instead of 'event === messageSent'
        if (response?.status === 'success' && response.data) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === response.data.id)) return prev;

            return [...prev, {
                id: response.data.id,
                senderId: response.data.senderId,
                text: response.data.content, // Make sure to read 'content'
                timestamp: new Date(response.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                attachments: response.data.attachments,
              },
            ];
          });
          scrollToBottom();
        } else {
          notification.error({ 
            message: "Message failed to send", 
            description: response?.error || "please try again." 
          });
        }
      }
    );

    setTimeout(scrollToBottom, 100);
  };
  // ===================== end of send-message handler =====================

  // =====================================================================
  // ======= Build the sidebar list we actually render:
  // ======= 1) drop any conversation missing participant info
  // ======= 2) collapse to ONE row per participant — if duplicates exist
  // =======    (e.g. left over from before this dedup logic existed),
  // =======    prefer whichever duplicate actually HAS message history
  // =======    so we never show the "looks like a brand new empty chat"
  // =======    version when a real conversation with history exists.
  // =====================================================================
  const uniqueConversations = useMemo(() => {
    if (!conversations) return [];

    const validConversations = conversations.filter(
      (conv) => conv.participantId && conv.participantName,
    );

    const conversationByParticipantId = new Map<string, UIConversation>();

    for (const conv of validConversations) {
      const existing = conversationByParticipantId.get(conv.participantId);

      if (!existing) {
        conversationByParticipantId.set(conv.participantId, conv);
        continue;
      }

      // If we already stored a duplicate for this participant, keep
      // whichever one actually has messages instead of just keeping
      // whichever happened to come first in the server's response.
      const candidateHasHistory = conv.lastMessage !== NO_MESSAGES_PLACEHOLDER;
      const existingHasHistory =
        existing.lastMessage !== NO_MESSAGES_PLACEHOLDER;

      if (candidateHasHistory && !existingHasHistory) {
        conversationByParticipantId.set(conv.participantId, conv);
      }
    }

    return Array.from(conversationByParticipantId.values());
  }, [conversations]);
  // ===================== end of sidebar list de-duplication =====================

  // =====================================================================
  // ======= Wipe message history for the active conversation (per-user;
  // ======= this only hides messages for the requesting user, it does
  // ======= NOT delete them for the other participant)
  // =====================================================================
  const handleClearChat = async () => {
    if (!activeConversation) return;

    const userConfirmed = window.confirm(
      "Are you sure you want to clear this chat history from your screen? This action cannot be undone.",
    );
    if (!userConfirmed) return;

    try {
      await clearChatHistory(activeConversation.id).unwrap();
      setMessages([]); // reflect the clear immediately in the UI
    } catch (error) {
      console.error("Failed to clear chat history", error);
    }
  };
  // ===================== end of clear-chat handler =====================

  // =======================Create GroupChat============================

  interface CreateGroupData {
    title: string;
    participants: string[];
  }
  const navigate = useNavigate();
  const [startGroupConv] = useStartGroupConvMutation();

  const handleCreateGroupChat = async (data: CreateGroupData) => {
    console.log("Data:-->", data);
    try {
      const response = await startGroupConv({
        title: data.title,
        participants: data.participants,
      }).unwrap();

      console.log("Group created:", response);

      // Refresh conversations if needed
      // refetch();

      // Navigate to the new conversation
      navigate(`/messages/${response.conversationId}`);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  // ===================================================================

  if (isConversationsLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden border-t border-gray-200">
      {/* ===================================================================== */}
      {/* ======= LEFT COLUMN: conversation list + "start new chat" search ===== */}
      {/* ===================================================================== */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${isMobileChatOpen ? "hidden md:flex" : "flex"}`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-200" ref={searchWrapperRef}>
        <div className="flex flex-row justify-between align-middle">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <CreateGroupFeature onSubmit={handleCreateGroupChat}/>
        </div>

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
            {/* --- "start new chat" results dropdown --- */}
            {isSearchOpen && debouncedTerm.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-50">
                {isSearchFetching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                ) : (
                  (() => {
                    // Don't show ourselves as a chat target
                    const filteredResults =
                      userSearchResults?.filter(
                        (u) => u.id !== CURRENT_USER_ID,
                      ) || [];

                    if (filteredResults.length === 0) {
                      return (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No users found.
                        </div>
                      );
                    }

                    return (
                      <ul className="py-2">
                        {filteredResults.map((searchedUser) => (
                          <li
                            key={searchedUser.id}
                            onClick={() =>
                              handleStartNewChat(searchedUser)
                            }
                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                          >
                            <Avatar
                              url={searchedUser.avatarUrl}
                              name={searchedUser.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {searchedUser.name}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                @{searchedUser.username}
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
            {/* --- end of "start new chat" results dropdown --- */}
          </div>
        </div>

        {/* --- Conversation list (deduplicated) --- */}
        <div className="flex-1 overflow-y-auto">
          {uniqueConversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No conversations yet. Search for someone above!
            </div>
          ) : (
            uniqueConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
                  activeConversation?.id === conv.id ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="relative shrink-0">
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
                    <span className="text-xs text-gray-500 shrink-0">
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
                  <div className="shrink-0 bg-blue-600 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* --- end of conversation list --- */}
      </div>
      {/* ===================== end of LEFT COLUMN ===================== */}

      {/* ===================================================================== */}
      {/* ======= RIGHT COLUMN: active chat thread + message composer ========== */}
      {/* ===================================================================== */}
      <div
        className={`w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-50/50 ${!isMobileChatOpen ? "hidden md:flex" : "flex"}`}
      >
        {activeConversation ? (
          <>
            {/* --- Chat header: participant info + action buttons --- */}
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
            {/* --- end of chat header --- */}

            {/* --- Message thread --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isSentByMe =
                  String(msg.senderId).toLowerCase() ===
                  String(CURRENT_USER_ID).toLowerCase();
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isSentByMe
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
                                    className={`flex items-center gap-2 p-2 rounded-lg ${isSentByMe ? "bg-blue-700 hover:bg-blue-800 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"} transition`}
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
            {/* --- end of message thread --- */}

            {/* --- Composer: staged attachment previews + text input --- */}
            <div className="p-4 bg-white border-t border-gray-200">
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
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-11 bg-gray-100 border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
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
                    (!messageDraft.trim() && selectedFiles.length === 0) ||
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
            {/* --- end of composer --- */}
          </>
        ) : (
          // --- Empty state: no conversation selected yet ---
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
      {/* ===================== end of RIGHT COLUMN ===================== */}
    </div>
  );
};

export default MessagesPage;