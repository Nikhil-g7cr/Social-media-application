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
    avatarUrl: string | null;
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
            // Backend now returns properly shaped data directly
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
            // Backend now returns normalized camelCase objects, no manual mapping needed
            transformResponse: (response: any) => response.data || response,
            providesTags: (_result, _error, conversationId) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useStartConversationMutation,
    useGetMessagesByConversationIdQuery,
} = chatApiSlice;
