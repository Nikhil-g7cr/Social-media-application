import type { Conversation } from '../../../shared/interfaces/conversation';
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
    sender?: ConversationParticipant | null;
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

// export interface Conversation {
//     title: any;
//     id: string;
//     type: string;
//     participant: ConversationParticipant | null;
//     latestMessage: ChatMessage | null;
//     createdAt: string;
// }

export interface CreateGroupConversationRequest {
    title: string;
    participants: string[];
}

export interface AddGroupMembersRequest {
    conversationId: string;
    participants: string[];
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

                // ✅ moved outside the try so it's still in scope below
                const listener = (message: ChatMessage) => {
                    let found = false;
                    updateCachedData((draft) => {
                        const conv = draft.find(c => c.id === message.conversationId);
                        if (conv) {
                            found = true;
                            conv.latestMessage = message;
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

                try {
                    await cacheDataLoaded;
                    socket.on('newMessage', listener);
                } catch {}

                await cacheEntryRemoved;
                socket.off('newMessage', listener); // ✅ added
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

        // groupchat api
        startGroupConv: builder.mutation<{conversationId: string },CreateGroupConversationRequest>({
            query:(data) => ({
                url:`/conversation/group`,
                method:`POST`,
                data,
            }),
            transformResponse:(response:any)=> response.data || response,
            invalidatesTags:["Conversation"]
        }),
        addGroupMembers: builder.mutation<{ conversationId: string; addedCount: number }, AddGroupMembersRequest>({
            query: ({ conversationId, participants }) => ({
                url: `/conversation/${conversationId}/members`,
                method: 'POST',
                data: { participants },
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: ['Conversation'],
        }),
        // ======end=========
        getMessagesByConversationId: builder.query<ChatMessage[], string>({
            query: (conversationId) => ({ url: `message/conversation/${conversationId}` }),
            transformResponse: (response: any) => response.data || response,
            providesTags: (_result, _error, conversationId) => [{ type: 'Chat', id: `Conv_${conversationId}` }],
            async onCacheEntryAdded(conversationId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();

                // ✅ moved outside the try so it's still in scope below
                const listener = (message: ChatMessage) => {
                    if (message.conversationId === conversationId) {
                        updateCachedData((draft) => {
                            if (!draft.find((m) => m.id === message.id)) {
                                draft.push(message);
                            }
                        });
                    }
                };

                try {
                    await cacheDataLoaded;
                    socket.on('newMessage', listener);
                } catch {}

                await cacheEntryRemoved;
                socket.off('newMessage', listener); // ✅ added — cleanup when this cache entry (this conversation) is no longer subscribed to
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
    useStartGroupConvMutation,
    useAddGroupMembersMutation,
    useGetMessagesByConversationIdQuery,
    useClearChatHistoryMutation,
} = chatApiSlice;
