import { Send } from "lucide-react";

const EmptyConversationState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
    <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
      <Send className="h-10 w-10 ml-1" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
    <p className="text-gray-500 max-w-sm">
      Search for someone above to start a new conversation, or select one from
      the sidebar.
    </p>
  </div>
);

export default EmptyConversationState;

