import type { ChatAttachment } from "../../redux/features/chat/chatApiSlice";

export interface UIMessage {
  id: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string | null;
  } | null;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface CreateGroupData {
  title: string;
  participants: string[];
}

