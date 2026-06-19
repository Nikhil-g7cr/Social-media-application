import { apiSlice } from '../../apiSlice';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
}

export interface Conversation {
    id: string;
    type: string;
    participant: ConversationParticipant | null;
    latestMessage: ChatMessage | null;
    createdAt: string;
}

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], void>({
            query: () => ({ url: 'conversation' }),
            transformResponse: (response: any) => response.data || response,
            providesTags: ['Conversation'],
        }),
        startConversation: builder.mutation<{ conversationId: string }, string>({
            query: (userId) => ({
                url: `conversation/start/${userId}`,
                method: 'POST',
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: ['Conversation'],
        }),
        getMessagesByConversationId: builder.query<ChatMessage[], string>({
            query: (conversationId) => ({ url: `message/conversation/${conversationId}` }),
            transformResponse: (response: any) => {
                const messages = response.data || response;
                return messages.map((m: any) => ({
                    id: m.ID,
                    conversationId: m.ConversationID,
                    senderId: m.SenderID,
                    content: m.Message,
                    createdAt: m.CreatedAt,
                }));
            },
            providesTags: (_result, _error, conversationId) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
        }),
        sendMessage: builder.mutation<ChatMessage, { conversationId: string, content: string }>({
            query: (data) => ({
                url: 'chat/messages',
                method: 'POST',
                data,
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useStartConversationMutation,
    useGetMessagesByConversationIdQuery,
    useSendMessageMutation,
} = chatApiSlice;
