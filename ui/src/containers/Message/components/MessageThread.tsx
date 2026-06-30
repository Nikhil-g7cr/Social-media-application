import type { RefObject } from "react";
import { Download, File as FileIcon } from "lucide-react";
import type { UIConversation } from "../../../shared/interfaces/conversation";
import type { UIMessage } from "../types";

interface MessageThreadProps {
  activeConversation: UIConversation;
  currentUserId: string;
  messages: UIMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  getMessageSenderName: (message: UIMessage) => string;
}

const MessageThread = ({
  activeConversation,
  currentUserId,
  messages,
  messagesEndRef,
  getMessageSenderName,
}: MessageThreadProps) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((msg) => {
      const isSentByMe =
        String(msg.senderId).toLowerCase() ===
        String(currentUserId).toLowerCase();
      const shouldShowSenderName =
        activeConversation.type === "group" && !isSentByMe;

      return (
        <div
          key={msg.id}
          className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
          >
            {shouldShowSenderName && (
              <span className="text-xs font-medium text-gray-500 mb-1 mx-1">
                {getMessageSenderName(msg)}
              </span>
            )}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isSentByMe
                  ? "bg-green-600 text-white rounded-br-none"
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
                          onClick={() => window.open(att.fileUrl, "_blank")}
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
                              {(att.fileSizeBytes / 1024).toFixed(1)} KB
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
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
);

export default MessageThread;

