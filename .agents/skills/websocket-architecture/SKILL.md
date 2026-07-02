---
name: websocket-architecture
description: >
  Documents how Socket.IO WebSockets work in this social media application,
  end-to-end from the NestJS API gateway to the React/Redux UI, including
  all real-time channels (chat messages, notifications, online presence, feed).
  Use this skill whenever adding, debugging, or modifying any real-time feature.
---

# WebSocket Architecture — Social Media App

## Stack
- **Server**: NestJS + `@nestjs/websockets` + `socket.io` (v4)
- **Client**: React + `socket.io-client` + RTK Query `onCacheEntryAdded`

---

## 1. Server Side — NestJS (`api/`)

### Entry Point
`api/src/main.ts` — Plain `NestFactory.create()`. Socket.IO is wired
**automatically** by the `@WebSocketGateway` decorator; no manual adapter
setup is required in main.ts.

### The Gateway — `api/src/modules/chat/chat.gateway.ts`
```ts
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
```
- **Authentication**: JWT extracted from `client.handshake.auth.token`
  (`Bearer <token>`). The helper `extractUserIdFromSocket()` verifies it
  using `JwtService` + `AppConfig` (secret: `appAXTSecret`). If invalid →
  userId is `null`.
- **On connect (`handleConnection`):**
  1. Client joins a personal room: `user_<userId>`
  2. Client auto-joins ALL conversation rooms it participates in
     (queried via the `CP` / `ConversationParticipants` model)
  3. Online-presence counter incremented; if first connection → broadcasts
     `userOnline` to all clients
  4. Sends `syncOnlineUsers` (full list) to the newly connected client only
- **On disconnect (`handleDisconnect`):**
  1. Decrements presence counter; if last connection → broadcasts `userOffline`
- **Subscribed events (client → server):**
  | Event | Handler | Description |
  |---|---|---|
  | `joinRoom` | `handleJoinRoom` | Client joins a specific conversation room |
  | `sendMessage` | `handleMessage` | Saves message to MSSQL, then broadcasts to room |

### Message Flow (`sendMessage`)
1. Sender ID extracted from JWT (never trusted from client)
2. `ChatService.saveMessage()` called:
   - Creates `Message` + `MessageAttachment` rows in MSSQL
   - Fetches sender's profile from `Users` table
   - Creates `MESSAGE` notifications for all other conversation participants
     (via `NotificationService.createNotification()`)
   - Returns a **normalized plain object** (not a Sequelize model instance)
3. `server.to(conversationId).emit('newMessage', savedMessage)` — broadcasts
   to all participants in that conversation room

### Notification Gateway (reuses ChatGateway's server)
`api/src/modules/notification/notification.service.ts`
- **No separate gateway** — it injects `ChatGateway` with `forwardRef` and
  calls `this.chatGateway.server.to('user_<userId>').emit('newNotification', notification)`
- Triggered by NestJS EventEmitter events:
  | Event | Notification type |
  |---|---|
  | `like.added` | `LIKE` |
  | `comment.added` | `COMMENT` |
  | `follow.requested` | `FOLLOW_REQUEST` |
  | `follow.accepted` | `FOLLOW_ACCEPTED` |
  | (direct call from ChatService) | `MESSAGE` |

### Module Wiring
- `ChatModule` exports `ChatGateway`
- `NotificationModule` imports `ChatModule` (via `forwardRef`) to inject `ChatGateway`
- `ChatModule` imports `NotificationModule` (via `forwardRef`) to inject `NotificationService`
- ⚠️ Circular dependency — always use `forwardRef(() => X)` for both sides

---

## 2. Client Side — React UI (`ui/`)

### Socket Singleton — `ui/src/utils/socket.ts`
```ts
let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  const token = sessionStorage.getItem('accessToken');
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'], // skip polling
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket   = (): Socket | null => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };
```
- **`SOCKET_URL`** = `APP_API_URL` with `/api` suffix stripped
  (`environment.APP_API_URL.replace(/\/api\/?$/, '')`)
- Pattern is a **module-level singleton** — calling `initializeSocket()`
  multiple times returns the same socket instance
- Token is read from `sessionStorage` at call time

### App-Level Initialization — `ui/src/App.tsx`
On mount (if `accessToken` exists in sessionStorage):
1. `initializeSocket()` called once
2. Listens for presence events and dispatches to Redux:
   | Socket event | Redux action |
   |---|---|
   | `syncOnlineUsers` | `setOnlineUsers(userIds[])` |
   | `userOnline` | `userOnline(userId)` |
   | `userOffline` | `userOffline(userId)` |
3. Cleanup removes all three listeners on unmount

### Redux Online Presence — `onlineUsersSlice.ts`
Simple slice with state `{ onlineUserIds: string[] }`. Three reducers:
`setOnlineUsers`, `userOnline`, `userOffline`. Consumed anywhere in the UI
via `useAppSelector(state => state.onlineUsers.onlineUserIds)`.

### Real-Time in RTK Query — `onCacheEntryAdded` Pattern
All real-time feature slices hook socket listeners into RTK Query cache entries.
The pattern is identical for each:

```ts
async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
  const { initializeSocket } = await import('../../../utils/socket');
  const socket = initializeSocket();
  const listener = (payload) => { updateCachedData(draft => { /* immer mutation */ }); };
  try {
    await cacheDataLoaded;          // wait for initial HTTP fetch
    socket.on('eventName', listener);
  } catch {}
  await cacheEntryRemoved;          // wait until component unmounts
  socket.off('eventName', listener); // ← ALWAYS clean up
}
```

| File | Event | Action |
|---|---|---|
| `chatApiSlice` → `getConversations` | `newMessage` | Updates `latestMessage` on matching conversation; re-sorts to top; invalidates if unknown conversation |
| `chatApiSlice` → `getMessagesByConversationId` | `newMessage` | Appends message to the active conversation's message array (deduplicated by id) |
| `notificationApiSlice` → `getNotifications` | `newNotification` | Prepends notification to the list (deduplicated by ID) |
| `postApiSlice` → `getFeedPosts` | `newPostInFeed` | Prepends new post to the feed (deduplicated by ID) |

### Chat UI — `ui/src/containers/Message/index.tsx`
Two additional direct socket interactions (not via RTK Query):

1. **Join room on conversation select:**
   ```ts
   socket.emit('joinRoom', { conversationId: activeConversation.id });
   ```
   Emitted inside a `useEffect` whenever `activeConversation` changes.

2. **Send message:**
   ```ts
   socket.emit('sendMessage', { conversationId, text, attachments? }, callback);
   ```
   Uses Socket.IO **acknowledgement callback** — the server handler returns
   `{ status: 'success', data: savedMessage }` or error. On success, the
   sender's UI appends the message optimistically via local state.

---

## 3. Full Event Reference

| Direction | Event | Emitter | Consumers |
|---|---|---|---|
| server → all | `userOnline` | ChatGateway on first connect | App.tsx → Redux |
| server → all | `userOffline` | ChatGateway on last disconnect | App.tsx → Redux |
| server → client | `syncOnlineUsers` | ChatGateway on connect | App.tsx → Redux |
| server → room | `newMessage` | ChatGateway `handleMessage` | chatApiSlice (x2), Message/index.tsx |
| server → user room | `newNotification` | NotificationService | notificationApiSlice |
| server → feed | `newPostInFeed` | (see postApiSlice listener) | postApiSlice |
| client → server | `joinRoom` | Message/index.tsx | ChatGateway `handleJoinRoom` |
| client → server | `sendMessage` | Message/index.tsx | ChatGateway `handleMessage` |

---

## 4. Key Patterns & Gotchas

- **Never create a new `io()` directly in a component** — always use
  `initializeSocket()` from `utils/socket.ts` to get the singleton.
- **Always clean up with `socket.off(event, listener)`** after
  `await cacheEntryRemoved` or on component unmount. Missing cleanup causes
  duplicate listeners and stale data bugs.
- **JWT in `handshake.auth.token`** — the server reads `client.handshake.auth?.token`
  (not headers). Always pass as `Bearer <token>`.
- **Personal room naming**: `user_<userId>` — used for targeted notifications.
- **Conversation room naming**: raw `conversationId` UUID — used for message broadcasts.
- **Circular dependency**: `ChatModule` ↔ `NotificationModule` requires
  `forwardRef` on both module imports AND both service/gateway injections.
- **`ScoketContext.tsx` is empty** — ignore it; the actual socket is managed
  via the utility singleton, not React context.
- **`transports: ['websocket']`** — polling is disabled on the client; the
  connection goes straight to WebSocket (no HTTP long-poll fallback).
