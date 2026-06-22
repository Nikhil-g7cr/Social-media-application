import { apiSlice } from '../../apiSlice';

export interface ChatAttachment {
    id: string;
    fileUrl: string;
    fileType: string;
    fileSizeBytes: number;
    originalFileName: string;
    mimeType: string;
    fileExtension: string;
    imageWidth?: number;
    imageHeight?: number;
    videoDuration?: number;
    thumbnailUrl?: string;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    attachments?: ChatAttachment[];
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
            transformResponse: (response: any) => response.data || response,
            providesTags: ['Conversation'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();
                try {
                    await cacheDataLoaded;
                    const listener = (message: ChatMessage) => {
                        let found = false;
                        updateCachedData((draft) => {
                            const conv = draft.find(c => c.id === message.conversationId);
                            if (conv) {
                                found = true;
                                conv.latestMessage = message;
                                // Move to top
                                const index = draft.indexOf(conv);
                                if (index > 0) {
                                    draft.splice(index, 1);
                                    draft.unshift(conv);
                                }
                            }
                        });
                        if (!found) {
                            dispatch(apiSlice.util.invalidateTags(['Conversation']));
                        }
                    };
                    socket.on('newMessage', listener);
                } catch {}
                await cacheEntryRemoved;
            }
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
            transformResponse: (response: any) => response.data || response,
            providesTags: (_result, _error, conversationId) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
            async onCacheEntryAdded(conversationId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();
                try {
                    await cacheDataLoaded;
                    const listener = (message: ChatMessage) => {
                        if (message.conversationId === conversationId) {
                            updateCachedData((draft) => {
                                // Avoid duplicate inserts
                                if (!draft.find((m) => m.id === message.id)) {
                                    draft.push(message);
                                }
                            });
                        }
                    };
                    socket.on('newMessage', listener);
                } catch {}
                await cacheEntryRemoved;
            }
        }),
        clearChatHistory: builder.mutation<{ success: boolean }, string>({
            query: (conversationId) => ({
                url: `conversation/${conversationId}/clear`,
                method: 'PATCH',
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, conversationId) => [
                'Conversation',
                { type: 'Chat', id: `Conv_${conversationId}` }
            ],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useStartConversationMutation,
    useGetMessagesByConversationIdQuery,
    useClearChatHistoryMutation,
} = chatApiSlice;
