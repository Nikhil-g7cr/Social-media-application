import type { ChatMessage } from "../../redux/features/chat/chatApiSlice";

export interface UIConversationParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface UIConversation {
  id: string;

  // Conversation
  type: "single" | "group";
  title?: string;

  // Common display properties
  displayName: string;
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

export type ConversationType = "single" | "group" | "broadcast";

export interface ConversationParticipant {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
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