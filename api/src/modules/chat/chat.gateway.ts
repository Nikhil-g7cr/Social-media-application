import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/AppConfig';
import { CP } from '../../databse/mssql/models';
import { corsOptions } from 'src/core/cors.config';


@WebSocketGateway({ cors: { origin: corsOptions.origin, credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
  ) {}

  private extractUserIdFromSocket(client: Socket): string | null {
    try {
      const rawToken = client.handshake.auth?.token as string;
      if (!rawToken) return null;
      const token = rawToken.replace('Bearer ', '');
      const jwtConfig = this.appConfig.get('jwt');
      const payload = this.jwtService.verify(token, { secret: jwtConfig.appAXTSecret });
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  // Track online users: userId -> count of active connections
  private onlineUsers = new Map<string, number>();

  async handleConnection(client: Socket) {
  const userId = this.extractUserIdFromSocket(client);
  console.log(`Client connected: ${client.id} | User: ${userId}`);
  if (userId) {
    client.join(`user_${userId}`);

    // Join all conversation rooms this user is part of, so they receive
    // live 'newMessage' updates even for chats they don't currently have open
    const userConversations = await CP.findAll({
      where: { UserID: userId },
      attributes: ['ConversationID'],
    });
    userConversations.forEach(cp => client.join(cp.ConversationID));

    // Online presence tracking (independent of conversation rooms)
    const existingConnectionCount = this.onlineUsers.get(userId) || 0;
    this.onlineUsers.set(userId, existingConnectionCount + 1);

    if (existingConnectionCount === 0) {
      // First connection for this user — broadcast that they're now online
      this.server.emit('userOnline', userId);
    }

    // Sync currently online users to this newly connected client
    client.emit('syncOnlineUsers', Array.from(this.onlineUsers.keys()));
  }
}

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = this.extractUserIdFromSocket(client);
    if (userId) {
      const count = this.onlineUsers.get(userId) || 0;
      if (count > 1) {
        this.onlineUsers.set(userId, count - 1);
      } else {
        this.onlineUsers.delete(userId);
        this.server.emit('userOffline', userId);
      }
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.join(payload.conversationId);
    console.log(`Client ${client.id} joined room: ${payload.conversationId}`);
    return { event: 'joinedRoom', data: payload.conversationId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; text: string; attachments?: any[] },
  ) {
    // Extract senderId from JWT — never trust the client
    const senderId = this.extractUserIdFromSocket(client);
    if (!senderId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    if (payload.text && payload.text.length > 4000) {
      client.emit('error', { message: 'Message cannot exceed 4,000 characters.' });
      return { status: 'error', error: 'Message cannot exceed 4,000 characters.' };
    }

    // Save to database
    const savedMessage = await this.chatService.saveMessage({
      conversationId: payload.conversationId,
      senderId,
      text: payload.text,
      attachments: payload.attachments,
    });

    // Broadcast a normalized shape to all clients in the room
    this.server.to(payload.conversationId).emit('newMessage', savedMessage);

    return { status: 'success', data: savedMessage };
  }
}