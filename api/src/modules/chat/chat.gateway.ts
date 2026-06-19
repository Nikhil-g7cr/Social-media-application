import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/AppConfig';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
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

  handleConnection(client: Socket) {
    const userId = this.extractUserIdFromSocket(client);
    console.log(`Client connected: ${client.id} | User: ${userId}`);
    if (userId) {
      client.join(`user_${userId}`);
      
      const count = this.onlineUsers.get(userId) || 0;
      this.onlineUsers.set(userId, count + 1);
      
      if (count === 0) {
        // First connection for this user
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
    @MessageBody() payload: { conversationId: string; text: string },
  ) {
    // Extract senderId from JWT — never trust the client
    const senderId = this.extractUserIdFromSocket(client);
    if (!senderId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Save to database
    const savedMessage = await this.chatService.saveMessage({
      conversationId: payload.conversationId,
      senderId,
      text: payload.text,
    });

    // Broadcast a normalized shape to all clients in the room
    this.server.to(payload.conversationId).emit('newMessage', savedMessage);

    return { event: 'messageSent', data: savedMessage };
  }
}