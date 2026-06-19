import { apiSlice } from '../../apiSlice';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
}

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessagesByConversationId: builder.query<ChatMessage[], string>({
            query: (conversationId) => ({ url: `/chat/messages/${conversationId}` }),
            providesTags: (_result, _error, conversationId) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
        }),
        sendMessage: builder.mutation<ChatMessage, { conversationId: string, content: string }>({
            query: (data) => ({
                url: '/chat/messages',
                method: 'POST',
                data,
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
        }),
    }),
});

export const {
    useGetMessagesByConversationIdQuery,
    useSendMessageMutation,
} = chatApiSlice;
