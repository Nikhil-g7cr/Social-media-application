import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { initializeSocket } from "../../utils/socket";
import { useAppSelector } from "../../redux/hooks";
import {
  useAddGroupMembersMutation,
  useClearChatHistoryMutation,
  useGetConversationsQuery,
  useGetMessagesByConversationIdQuery,
  useStartConversationMutation,
  useStartGroupConvMutation,
  type ChatAttachment,
} from "../../redux/features/chat/chatApiSlice";
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
} from "../../redux/features/user/userApiSlice";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import API from "../../config/axiosConfig";
import type { UIConversation } from "../../shared/interfaces/conversation";
import type { SearchedUser } from "../../components/features/message/userSearchBar";
import AddMembersModal from "../../components/features/message/AddMembersModal";
import ChatHeader from "../../components/features/message/ChatHeader";
import EmptyConversationState from "../../components/features/message/EmptyConversationState";
import LoadingState from "../../components/features/message/LoadingState";
import MessageComposer from "../../components/features/message/MessageComposer";
import MessageSidebar from "../../components/features/message/MessageSidebar";
import MessageThread from "../../components/features/message/MessageThread";
import {
  formatConversation,
  formatMessage,
  getUniqueConversations,
  NO_MESSAGES_PLACEHOLDER,
} from "../../utils/messageUtils";
import type {
  CreateGroupData,
  UIMessage,
} from "../../shared/interfaces/message";

const MessagesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const deepLinkConversationId = searchParams.get("convId");

  const { user } = useAppSelector((state: any) => state.auth);
  const CURRENT_USER_ID = user?.id || "";
  const onlineUserIds = useAppSelector(
    (state: any) => state.onlineUsers?.onlineUserIds || [],
  );

  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<UIConversation | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<
    SearchedUser[]
  >([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [fileId: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    "",
    500,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const pendingNewConversationIdRef = useRef<string | null>(null);

  const { data: userSearchResults = [], isFetching: isSearchFetching } =
    useSearchUsersQuery(debouncedTerm, { skip: !debouncedTerm.trim() });
  const { data: followers = [] } = useGetFollowersQuery(CURRENT_USER_ID, {
    skip: !CURRENT_USER_ID,
  });
  const { data: following = [] } = useGetFollowingQuery(CURRENT_USER_ID, {
    skip: !CURRENT_USER_ID,
  });

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
  const [startGroupConv] = useStartGroupConvMutation();
  const [addGroupMembers, { isLoading: isAddingGroupMembers }] =
    useAddGroupMembersMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (!activeConversation) return;

    const socket = initializeSocket();
    socket.emit("joinRoom", { conversationId: activeConversation.id });

    const handleNewMessage = (newMsg: any) => {
      if (newMsg.conversationId !== activeConversation.id) return;

      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;

        return [
          ...prev,
          formatMessage({
            id: newMsg.id,
            conversationId: newMsg.conversationId,
            senderId: newMsg.senderId,
            sender: newMsg.sender,
            content: newMsg.content,
            createdAt: newMsg.createdAt,
            attachments: newMsg.attachments,
          }),
        ];
      });
      scrollToBottom();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [activeConversation]);

  useEffect(() => {
    if (!serverConversations) return;

    const formattedConversations = serverConversations.map(formatConversation);
    setConversations(formattedConversations);

    if (deepLinkConversationId && !activeConversation) {
      const targetConversation = formattedConversations.find(
        (c) => c.id === deepLinkConversationId,
      );
      if (targetConversation) {
        setActiveConversation(targetConversation);
        setIsMobileChatOpen(true);
      }
    }

    if (pendingNewConversationIdRef.current) {
      const targetConversation = formattedConversations.find(
        (c) => c.id === pendingNewConversationIdRef.current,
      );
      if (targetConversation) {
        pendingNewConversationIdRef.current = null;
        setMessages([]);
        setActiveConversation(targetConversation);
        setIsMobileChatOpen(true);
      }
    }
  }, [activeConversation, deepLinkConversationId, serverConversations]);

  useEffect(() => {
    if (!serverMessages) return;

    setMessages(serverMessages.map(formatMessage));
    scrollToBottom();
  }, [serverMessages]);

  const uniqueConversations = useMemo(
    () => getUniqueConversations(conversations),
    [conversations],
  );
  const mutualUserSearchResults = useMemo(() => {
    const followerIds = new Set(followers.map((friend) => friend.id));
    const followingIds = new Set(following.map((friend) => friend.id));

    return userSearchResults.filter(
      (searchedUser) =>
        followerIds.has(searchedUser.id) && followingIds.has(searchedUser.id),
    );
  }, [followers, following, userSearchResults]);

  const handleSelectConversation = (conversation: UIConversation) => {
    setActiveConversation(conversation);
    setIsMobileChatOpen(true);
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setIsSearchOpen(true);
  };

  const handleStartNewChat = async (targetUser: SearchedUser) => {
    try {
      const res = await startConversation(targetUser.id).unwrap();
      if (!res.conversationId) return;

      setIsSearchOpen(false);
      setSearchTerm("");
      setActiveConversation({
        id: res.conversationId,
        type: "single",
        title: "",
        displayName: targetUser.name,
        displayAvatar: targetUser.avatarUrl,
        participantId: targetUser.id,
        participantName: targetUser.name,
        participantUsername: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        participants: [
          {
            id: targetUser.id,
            name: targetUser.name,
            username: targetUser.username ?? "",
            avatarUrl: targetUser.avatarUrl,
          },
        ],
        lastMessage: NO_MESSAGES_PLACEHOLDER,
        unreadCount: 0,
        time: "",
        createdAt: new Date().toISOString(),
      });
      setIsMobileChatOpen(true);
    } catch (error: any) {
      const msg = error?.data?.message || "Could not start this conversation.";
      notification.error({ message: "Couldn't open chat", description: msg });
    }
  };

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

  const uploadFile = async (file: File): Promise<ChatAttachment | null> => {
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

      const uploadUrl: string | undefined =
        uploadUrlResponse.data?.uploadUrl ||
        uploadUrlResponse.data?.data?.uploadUrl;

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

      return {
        id: "",
        fileUrl: baseUrl,
        fileType: file.type,
        fileSizeBytes: file.size,
        originalFileName: file.name,
        mimeType: file.type,
        fileExtension: extension,
      };
    } catch (err) {
      console.error("File upload error", err);
      alert(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!messageDraft.trim() && selectedFiles.length === 0) ||
      !activeConversation
    ) {
      return;
    }

    setIsUploading(true);
    const uploadResults = await Promise.all(selectedFiles.map(uploadFile));
    const uploadedAttachments = uploadResults.filter(
      (attachment): attachment is ChatAttachment => Boolean(attachment),
    );
    const textToSend = messageDraft;

    setMessageDraft("");
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    const socket = initializeSocket();
    socket.emit(
      "sendMessage",
      {
        conversationId: activeConversation.id,
        text: textToSend,
        attachments:
          uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      },
      (response: { status?: string; data?: any; error?: string }) => {
        if (response?.status === "success" && response.data) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === response.data.id)) return prev;

            return [
              ...prev,
              formatMessage({
                id: response.data.id,
                conversationId:
                  response.data.conversationId || activeConversation.id,
                senderId: response.data.senderId,
                sender: response.data.sender,
                content: response.data.content,
                createdAt: response.data.createdAt,
                attachments: response.data.attachments,
              }),
            ];
          });
          scrollToBottom();
        } else {
          notification.error({
            message: "Message failed to send",
            description: response?.error || "please try again.",
          });
        }
      },
    );

    setTimeout(scrollToBottom, 100);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;

    const userConfirmed = window.confirm(
      "Are you sure you want to clear this chat history from your screen? This action cannot be undone.",
    );
    if (!userConfirmed) return;

    try {
      await clearChatHistory(activeConversation.id).unwrap();
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear chat history", error);
    }
  };

  const handleSelectMemberToAdd = (member: SearchedUser) => {
    setSelectedMembersToAdd((prev) =>
      prev.some((existing) => existing.id === member.id)
        ? prev
        : [...prev, member],
    );
  };

  const handleRemoveMemberToAdd = (userId: string) => {
    setSelectedMembersToAdd((prev) =>
      prev.filter((member) => member.id !== userId),
    );
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setSelectedMembersToAdd([]);
  };

  const handleAddGroupMembers = async () => {
    if (!activeConversation || selectedMembersToAdd.length === 0) return;

    try {
      await addGroupMembers({
        conversationId: activeConversation.id,
        participants: selectedMembersToAdd.map((member) => member.id),
      }).unwrap();

      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              participants: [
                ...prev.participants,
                ...selectedMembersToAdd.map((member) => ({
                  id: member.id,
                  name: member.name,
                  username: member.username ?? "",
                  avatarUrl: member.avatarUrl ?? null,
                })),
              ],
            }
          : prev,
      );
      notification.success({ message: "Members added" });
      handleCloseAddMemberModal();
    } catch (error: any) {
      notification.error({
        message: "Could not add members",
        description: error?.data?.message || "Please try again.",
      });
    }
  };

  const handleCreateGroupChat = async (data: CreateGroupData) => {
    try {
      const response = await startGroupConv({
        title: data.title,
        participants: data.participants,
      }).unwrap();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const getMessageSenderName = (msg: UIMessage) => {
    if (msg.sender?.name) return msg.sender.name;

    const participant = activeConversation?.participants.find(
      (member) =>
        String(member.id).toLowerCase() === String(msg.senderId).toLowerCase(),
    );

    return participant?.name || msg.sender?.username || "Unknown user";
  };

  if (isConversationsLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden border-t border-gray-200">
        <MessageSidebar
          activeConversation={activeConversation}
          conversations={uniqueConversations}
          currentUserId={CURRENT_USER_ID}
          debouncedTerm={debouncedTerm}
          isMobileChatOpen={isMobileChatOpen}
          isSearchFetching={isSearchFetching}
          isSearchOpen={isSearchOpen}
          onlineUserIds={onlineUserIds}
          searchTerm={searchTerm}
          searchWrapperRef={searchWrapperRef}
          userSearchResults={mutualUserSearchResults}
          onCreateGroupChat={handleCreateGroupChat}
          onSearchFocus={() => setIsSearchOpen(true)}
          onSearchTermChange={handleSearchTermChange}
          onSelectConversation={handleSelectConversation}
          onStartNewChat={handleStartNewChat}
        />

        <div
          className={`w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-50/50 ${!isMobileChatOpen ? "hidden md:flex" : "flex"}`}
        >
          {activeConversation ? (
            <>
              <ChatHeader
                activeConversation={activeConversation}
                onlineUserIds={onlineUserIds}
                onBack={() => setIsMobileChatOpen(false)}
                onClearChat={handleClearChat}
                onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
              />
              <MessageThread
                activeConversation={activeConversation}
                currentUserId={CURRENT_USER_ID}
                messages={messages}
                messagesEndRef={messagesEndRef}
                getMessageSenderName={getMessageSenderName}
              />
              <MessageComposer
                fileInputRef={fileInputRef}
                isUploading={isUploading}
                messageDraft={messageDraft}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
                onMessageDraftChange={setMessageDraft}
                onRemoveSelectedFile={handleRemoveSelectedFile}
                onSendMessage={handleSendMessage}
              />
            </>
          ) : (
            <EmptyConversationState />
          )}
        </div>
      </div>

      <AddMembersModal
        activeConversation={activeConversation}
        currentUserId={CURRENT_USER_ID}
        isAddingGroupMembers={isAddingGroupMembers}
        isOpen={isAddMemberModalOpen}
        selectedMembers={selectedMembersToAdd}
        onAddMembers={handleAddGroupMembers}
        onCancel={handleCloseAddMemberModal}
        onRemoveMember={handleRemoveMemberToAdd}
        onSelectMember={handleSelectMemberToAdd}
      />
    </>
  );
};

export default MessagesPage;
