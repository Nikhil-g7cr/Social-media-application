import type {
  ChatAttachment,
  ChatMessage,
} from "../redux/features/chat/chatApiSlice";
import type {
  Conversation as ServerConversation,
  UIConversation,
} from "../shared/interfaces/conversation";
import type { UIMessage } from "../shared/interfaces/types";

export const NO_MESSAGES_PLACEHOLDER = "No messages yet";

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatConversation = (
  conv: ServerConversation,
): UIConversation => ({
  id: conv.id,
  type: conv.type,
  title: conv.title,
  displayName:
    conv.type === "group"
      ? conv.title
      : conv.participant?.name || "Unknown User",
  displayAvatar:
    conv.type === "group"
      ? conv.displayAvatar || null
      : conv.participant?.avatarUrl,
  participantName: conv.participant?.name || "",
  participantId: conv.participant?.id || "",
  avatarUrl:
    conv.type === "group"
      ? conv.displayAvatar || null
      : conv.participant?.avatarUrl,
  participants: conv.participants ?? [],
  lastMessage: conv.latestMessage?.content || NO_MESSAGES_PLACEHOLDER,
  time: conv.latestMessage?.createdAt
    ? formatTime(conv.latestMessage.createdAt)
    : "",
  unreadCount: 0,
  createdAt: conv.createdAt,
});

export const formatAttachment = (att: ChatAttachment): ChatAttachment => ({
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
});

export const formatMessage = (msg: ChatMessage): UIMessage => ({
  id: msg.id,
  senderId: msg.senderId,
  sender: msg.sender,
  text: msg.content,
  timestamp: formatTime(msg.createdAt),
  attachments: (msg.attachments ?? []).map(formatAttachment),
});

export const getUniqueConversations = (
  conversations: UIConversation[],
): UIConversation[] => {
  const groups = conversations.filter((c) => c.type === "group");
  const singles = conversations.filter((c) => c.type === "single");
  const conversationByParticipantId = new Map<string, UIConversation>();

  for (const conv of singles) {
    const existing = conversationByParticipantId.get(conv.participantId!);

    if (!existing) {
      conversationByParticipantId.set(conv.participantId!, conv);
      continue;
    }

    const candidateHasHistory = conv.lastMessage !== NO_MESSAGES_PLACEHOLDER;
    const existingHasHistory = existing.lastMessage !== NO_MESSAGES_PLACEHOLDER;

    if (candidateHasHistory && !existingHasHistory) {
      conversationByParticipantId.set(conv.participantId!, conv);
    }
  }

  return [...Array.from(conversationByParticipantId.values()), ...groups];
};
