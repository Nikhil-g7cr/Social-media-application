import type { ChatMessage } from "../../redux/features/chat/chatApiSlice";

export type ConversationType = "single" | "group" | "broadcast";

export interface UIConversationParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role?: "admin" | "owner" | "member";
}

export interface UIConversation {
  id: string;

  // Conversation
  type: ConversationType;
  title?: string|null;

  // Common display properties
  displayName: string|null;
  displayAvatar?: string | null;

  // Single chat (kept for backward compatibility)
  participantId?: string;
  participantName?: string;
  participantUsername?: string;
  avatarUrl?: string | null;

  // Group chat
  participants: UIConversationParticipant[];

  // Message
  lastMessage: string;
  lastMessageId?: string;
  lastMessageSenderId?: string;
  time: string;

  unreadCount: number;

  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role?: "admin" | "owner" | "member";
}

export interface Conversation {
  id: string;

  title: string | null;

  type: ConversationType;

  participant: ConversationParticipant | null;

  participants: ConversationParticipant[];

  displayName: string;

  displayAvatar?: string | null;

  latestMessage: ChatMessage | null;

  createdAt: string;
}
