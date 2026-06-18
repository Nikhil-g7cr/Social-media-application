import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { initializeSocket } from "../../utils/socket";
import API from "../../config/axiosConfig";

// --- TypeScript Interfaces ---
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface SocketMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantName: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  participantId: string;
}

const CURRENT_USER_ID = "me"; // Replace with actual logged-in user ID

const MessagesPage: React.FC = () => {
  // --- State ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Mock Data & Data Fetching ---
  useEffect(() => {
    // ==========intialize websocket============
    const socket = initializeSocket();
    socket.on("newMessage", (message: SocketMessage) => {
      console.log("New MEssage recieved", message);

      setMessages((prevMessages) => {
        if (prevMessages.find((m) => m.id === message.id)) return prevMessages;

        return [...prevMessages, message];
      });
      scrollToBottom();
    });

    // 2. Listen for users coming online
    socket.on("userOnline", (userId: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          // Assuming your conversation object has a participantId to match against
          conv.participantId === userId ? { ...conv, isOnline: true } : conv,
        ),
      );
    });

    // 3. Listen for users going offline
    socket.on("userOffline", (userId: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === userId ? { ...conv, isOnline: false } : conv,
        ),
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("userOnline");
      socket.off("userOffline");
    };

    // ===========end websocket==============
    // TODO: Replace with actual API call: API.get('/conversations')
    // const fetchConversations = () => {
    //   setTimeout(() => {
    //     setConversations([
    //       {
    //         id: 'conv1',
    //         participantName: 'Alex Johnson',
    //         avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=EBF4FF&color=1E3A8A',
    //         lastMessage: 'Hey! Are we still on for tomorrow?',
    //         time: '10:42 AM',
    //         unreadCount: 2,
    //         isOnline: true,
    //       },
    //       {
    //         id: 'conv2',
    //         participantName: 'Sarah Smith',
    //         avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=FCE7F3&color=9D174D',
    //         lastMessage: 'Thanks for the help earlier!',
    //         time: 'Yesterday',
    //         unreadCount: 0,
    //         isOnline: false,
    //       },
    //       {
    //         id: 'conv3',
    //         participantName: 'Tech Group',
    //         avatarUrl: 'https://ui-avatars.com/api/?name=Tech+Group&background=DEF7EC&color=03543F',
    //         lastMessage: 'Nikhil: I just pushed the new backend updates.',
    //         time: 'Mon',
    //         unreadCount: 5,
    //         isOnline: true,
    //       }
    //     ]);
    //     setIsLoading(false);
    //   }, 500);
    // };

    // fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (activeConversation) {
      const fetchMessageHistory = async () => {
        try {
          // Fetch messages for this specific conversation ID
          const response = await API.get(
            `/message/conversation/${activeConversation.id}`,
          );

          const history = response.data.data || response.data;

          const formattedMessages = history.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            text: msg.content || msg.text, // Depends on your backend schema
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));

          setMessages(formattedMessages);
          scrollToBottom();
        } catch (error) {
          console.error("Failed to load messages:", error);
        }
      };

      fetchMessageHistory();
    }
  }, [activeConversation]);

  //   fetching the chats==========================
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        // Fetch from your NestJS conversation controller
        // Adjust the URL if your endpoint is named differently (e.g., '/conversations')
        const response = await API.get("/conversation");

        // Assuming your backend wraps data in a standard format
        const realConversations = response.data.data || response.data;

        // Map backend data to match our UI interface (adjust keys based on your NestJS entity)
        const formattedConversations = realConversations.map((conv: any) => ({
          id: conv.id,
          participantName: conv.user?.fullName || "Unknown User", // Example mapping
          avatarUrl:
            conv.user?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${conv.user?.fullName}&background=random`,
          lastMessage: conv.lastMessage?.text || "No messages yet",
          time: conv.lastMessage?.createdAt || "",
          unreadCount: conv.unreadCount || 0,
          isOnline: false, // We will update this via WebSockets below!
        }));

        setConversations(formattedConversations);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  //   ==================================================

  // --- Handlers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setIsMobileChatOpen(true); // Slide in chat on mobile
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const newMsgObj: Message = {
      id: Date.now().toString(),
      senderId: CURRENT_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsgObj]);
    setNewMessage("");
    setTimeout(scrollToBottom, 100);

    // TODO: Send via WebSockets or REST API

    const socket = initializeSocket();

    socket.emit("sendMessage", {
      conversationId: activeConversation.id,
      text: newMessage,
    });
    // e.g., socket.emit('sendMessage', { conversationId: activeConversation.id, text: newMessage })
    // OR await API.post('/messages', { conversationId: activeConversation.id, text: newMessage })
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    // Container height assumes you have a standard Navbar taking up some space (e.g., h-16 or 4rem).
    // Adjust h-[calc(100vh-4rem)] as needed.
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden border-t border-gray-200">
      {/* --- LEFT COLUMN: CONVERSATION LIST --- */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${isMobileChatOpen ? "hidden md:flex" : "flex"}`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${activeConversation?.id === conv.id ? "bg-blue-50/50" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conv.avatarUrl}
                  alt={conv.participantName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                {conv.isOnline && (
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
                  className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500"}`}
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
          ))}
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
                <img
                  src={activeConversation.avatarUrl}
                  alt={activeConversation.participantName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-md font-semibold text-gray-900">
                    {activeConversation.participantName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeConversation.isOnline ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
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
                const isMe = msg.senderId === CURRENT_USER_ID;
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
                        <p className="text-sm">{msg.text}</p>
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
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2"
              >
                <div className="flex items-center gap-2 text-gray-400 pb-2">
                  <button
                    type="button"
                    className="p-2 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
                  >
                    <ImageIcon className="h-5 w-5" />
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
                  disabled={!newMessage.trim()}
                  className="p-3 mb-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State for Desktop */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Send className="h-10 w-10 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your Messages
            </h3>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the sidebar to start chatting or start
              a new conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
