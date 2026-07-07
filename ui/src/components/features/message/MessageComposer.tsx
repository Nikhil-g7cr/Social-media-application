import type { ChangeEvent, FormEvent, KeyboardEvent, RefObject } from "react";
import {
  File as FileIcon,
  Image as ImageIcon,
  Paperclip,
  Play,
  Send,
  Smile,
  X,
} from "lucide-react";

export const MAX_MESSAGE_LENGTH = 4000;

interface MessageComposerProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  messageDraft: string;
  selectedFiles: File[];
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onMessageDraftChange: (value: string) => void;
  onRemoveSelectedFile: (index: number) => void;
  onSendMessage: (event: FormEvent) => void;
}

const MessageComposer = ({
  fileInputRef,
  isUploading,
  messageDraft,
  selectedFiles,
  onFileSelect,
  onMessageDraftChange,
  onRemoveSelectedFile,
  onSendMessage,
}: MessageComposerProps) => (
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
              onClick={() => onRemoveSelectedFile(idx)}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-red-50 text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )}
    <form onSubmit={onSendMessage} className="flex items-end gap-2">
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
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
      <div className="flex-1 flex flex-col gap-1">
        <textarea
          value={messageDraft}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => onMessageDraftChange(e.target.value)}
          placeholder="Type a message..."
          className={`w-full max-h-32 min-h-11 bg-gray-100 border rounded-2xl px-4 py-3 focus:bg-white outline-none resize-none transition-all ${
            messageDraft.length >= MAX_MESSAGE_LENGTH
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          rows={1}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (
                messageDraft.length <= MAX_MESSAGE_LENGTH &&
                ((messageDraft.trim() || selectedFiles.length > 0) && !isUploading)
              ) {
                e.preventDefault();
                onSendMessage(e);
              }
            }
          }}
        />
        {messageDraft.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <span
              className={`text-[11px] font-medium ${
                messageDraft.length >= MAX_MESSAGE_LENGTH
                  ? "text-red-600 font-semibold"
                  : messageDraft.length >= MAX_MESSAGE_LENGTH * 0.9
                    ? "text-amber-500 font-medium"
                    : "text-gray-400"
              }`}
            >
              {messageDraft.length >= MAX_MESSAGE_LENGTH && (
                <span>⚠️ Maximum 4,000 character limit reached</span>
              )}
            </span>
            <span
              className={`text-[11px] font-medium ml-auto ${
                messageDraft.length >= MAX_MESSAGE_LENGTH
                  ? "text-red-600 font-semibold"
                  : messageDraft.length >= MAX_MESSAGE_LENGTH * 0.9
                    ? "text-amber-500 font-medium"
                    : "text-gray-400"
              }`}
            >
              {messageDraft.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={
          (!messageDraft.trim() && selectedFiles.length === 0) ||
          isUploading ||
          messageDraft.length > MAX_MESSAGE_LENGTH
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
);

export default MessageComposer;

