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

// The cors object ensures your frontend can connect to the socket server
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  // Triggered when a user connects to the socket
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Triggered when a user disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Frontend emits 'joinRoom' with a JSON object
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }, // <-- CHANGED TO OBJECT
  ) {
    // Join the room using the ID from the payload
    client.join(payload.conversationId);
    console.log(`Client ${client.id} successfully joined room: ${payload.conversationId}`);
    
    return { event: 'joinedRoom', data: payload.conversationId };
  }

  // Frontend emits 'sendMessage'
//   @SubscribeMessage('sendMessage')
//   async handleMessage(
//     @ConnectedSocket() client: Socket,
//     // CHANGED: senderId is now a string to match your DB UUIDs
//     @MessageBody() payload: { conversationId: string; senderId: string; text: string },
//   ) {
    
//     // For now, keeping the mock to test the broadcast, but uncomment the real service later!
//     // const savedMessage = await this.chatService.saveMessage(payload);
    
//     const savedMessage = {
//       ...payload,
//       id: Math.floor(Math.random() * 1000),
//       createdAt: new Date(),
//     };

//     // --- DEBUGGING LOGS ---
//     console.log(`\n--- NEW MESSAGE INCOMING ---`);
//     console.log(`Attempting to broadcast to room: "${payload.conversationId}"`);
//     console.log(`Rooms this specific client is currently in:`, Array.from(client.rooms));
//     console.log(`Is client in the target room?`, client.rooms.has(payload.conversationId));
//     console.log(`----------------------------\n`);
//     // ----------------------

//     // Broadcast the message ONLY to users in that specific conversation room
//     this.server.to(payload.conversationId).emit('newMessage', savedMessage);

//     return { event: 'messageSent', data: savedMessage };
//   }

    // Frontend emits 'sendMessage'
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; senderId: string; text: string },
  ) {
    
    // 1. SAVE TO THE REAL DATABASE
    console.log(`Saving message to database for room: ${payload.conversationId}...`);
    const savedMessage = await this.chatService.saveMessage(payload);

    // --- DEBUGGING LOGS ---
    console.log(`\n--- NEW MESSAGE INCOMING ---`);
    console.log(`Attempting to broadcast to room: "${payload.conversationId}"`);
    console.log(`Rooms this specific client is currently in:`, Array.from(client.rooms));
    console.log(`Is client in the target room?`, client.rooms.has(payload.conversationId));
    console.log(`----------------------------\n`);
    // ----------------------

    // 2. Broadcast the ACTUAL database record to everyone in the room
    this.server.to(payload.conversationId).emit('newMessage', savedMessage);

    return { event: 'messageSent', data: savedMessage };
  }
}

/*
{
  "conversationId": "11111111-1111-1111-1111-111111111111",
  "senderId": "7C61AB12-9A98-4F3E-986E-545DAC62B850",
  "text": "Hello, MSSQL!"
} 
*/