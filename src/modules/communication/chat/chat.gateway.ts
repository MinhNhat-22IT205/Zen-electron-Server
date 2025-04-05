import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JoinConversation } from './dto/create-chat.dto';
import { Server, Socket } from 'socket.io';
import { Conversation, ConversationService } from '../conversation';
import { IMessageServiceString, MessageService } from '../message';
import { socketOn } from './path/socket.on';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { IConversationServiceString } from '../conversation/service/conversation.interface.service';
import { SendMessageDto } from './dto/send-message.dto';
import { socketEmit } from './path/socket.emit';
import { DeleteMessageDto } from './dto/delete-message.dto';
import mongoose from 'mongoose';
import {
  ConversationId,
  EndUserId,
  MessageId,
} from 'src/common/types/utilTypes';
import { EndUser } from 'src/modules/users/enduser';
import { createImageName, createPathImage } from 'src/common/utils/files';
import { unlink, writeFile } from 'fs';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() private socketOfAll: Server;
  private users: { [userId: string]: Socket } = {};

  constructor(
    @Inject(IConversationServiceString)
    private readonly conversationService: ConversationService,

    @Inject(IMessageServiceString)
    private readonly messageService: MessageService,
  ) {}

  private getFormattedDate(): string {
    return new Date().toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId = Object.keys(this.users).find(
      (key) => this.users[key] === socket,
    );
    if (userId) {
      delete this.users[userId];
      console.log(`User ${userId} disconnected at ${this.getFormattedDate()}`);
    }
  }

  @SubscribeMessage(socketOn.endUserConnect)
  mappingSocketWithUserId(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody() { endUserId }: { endUserId: string },
  ) {
    console.log(`User ${endUserId} connected at ${this.getFormattedDate()}`);
    this.users[endUserId] = socketOfUser;
  }

  @SubscribeMessage(socketOn.joinConversation)
  joinConversation(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody() { conversationId }: JoinConversation,
  ) {
    const conversationIdString = conversationId.toString();
    if (!socketOfUser.rooms.has(conversationIdString)) {
      socketOfUser.rooms.forEach((room) => socketOfUser.leave(room));
      socketOfUser.join(conversationIdString);
    }
  }

  @SubscribeMessage(socketOn.sendFile)
  public async sendFile(
    @MessageBody() body: SendMessageDto & { file: Buffer; fileName: string },
  ) {
    const { file, fileName } = body;
    const convertedBody = this.convertToObjectIds(body);
    const newFileName = createImageName(fileName);
    const filePath = createPathImage(newFileName);
    console.log('filePath', file, typeof file);
    if (file) {
      writeFile(filePath, file, (err) => {
        if (err) {
          unlink(filePath, () => {});
          console.log('storfile error', err);
        }
      });
    }

    const conversation = await this.conversationService.getConversation(
      convertedBody.endUserId,
      convertedBody.conversationId,
    );

    if (!conversation) {
      throw new UnauthorizedException(
        'You are not allowed to add message here!',
      );
    }

    const message = await this.messageService.createMessage(
      convertedBody.endUserId,
      {
        type: 'file',
        content: newFileName,
        conversationId: convertedBody.conversationId,
        endUserId: convertedBody.endUserId,
      },
    );
    await message.populate({ path: 'endUserId', model: EndUser.name });
    this.emitToConversationMembers(
      conversation,
      socketEmit.sendMessage,
      message.toJSON(),
    );
  }

  @SubscribeMessage(socketOn.sendMessage)
  public async sendMessage(@MessageBody() body: SendMessageDto) {
    const convertedBody = this.convertToObjectIds(body);
    const conversation = await this.conversationService.getConversation(
      convertedBody.endUserId,
      convertedBody.conversationId,
    );

    if (!conversation) {
      throw new UnauthorizedException(
        'You are not allowed to add message here!',
      );
    }

    const message = await this.messageService.createMessage(
      convertedBody.endUserId,
      convertedBody,
    );
    await message.populate({ path: 'endUserId', model: EndUser.name });
    this.emitToConversationMembers(
      conversation,
      socketEmit.sendMessage,
      message.toJSON(),
    );

    console.log(
      `SENT message to conversation ${convertedBody.conversationId} at ${this.getFormattedDate()} ${message}`,
    );
  }

  @SubscribeMessage(socketOn.seenMessage)
  public async seenMessage(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: {
      messageId: MessageId;
      conversationId: ConversationId;
      endUserId: EndUserId;
    },
  ) {
    const { messageId, conversationId, endUserId } =
      this.convertToObjectIds(body);
    const conversation = await this.conversationService.getConversation(
      endUserId,
      conversationId,
    );
    const message = await this.messageService.seenMessages(messageId);

    this.emitToConversationMembers(
      conversation,
      socketEmit.seenMessage,
      message.toJSON(),
    );

    console.log(`SEEN message sent ${message} at ${this.getFormattedDate()}`);
  }

  @SubscribeMessage(socketOn.activeList)
  public async getActiveUserList(@ConnectedSocket() socketOfUser: Socket) {
    const activeUserIds = Object.keys(this.users);
    socketOfUser.emit(socketEmit.activeList, { activeList: activeUserIds });
  }

  @SubscribeMessage(socketOn.deleteMessage)
  public async deleteMessage(@MessageBody() body: DeleteMessageDto) {
    return this.messageService.deleteMessage(body.endUserId, body.messageId);
  }

  @SubscribeMessage(socketOn.requestCall)
  async handleRequestCall(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { conversationId: ConversationId; endUserId: EndUserId },
  ) {
    const { conversationId, endUserId } = this.convertToObjectIds(body);
    this.users[endUserId.toString()] = socketOfUser;
    socketOfUser.join(conversationId.toString());

    const conversation = await this.conversationService.getConversation(
      endUserId,
      conversationId,
    );

    //TODO: fix - populated endUserIds but haven't change the type
    const myEndUser = conversation.endUserIds.find(
      (user) => user._id.toString() === endUserId.toString(),
    );
    this.emitRequestCallToOtherMembers(conversation, myEndUser, conversationId);

    console.log(
      `Request call sent ${conversationId} ${endUserId} at ${this.getFormattedDate()}`,
    );
  }

  @SubscribeMessage(socketOn.requestCancel)
  handleRequestCancel(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody() data: any,
  ) {
    console.log('Request cancel received', data);
  }

  @SubscribeMessage(socketOn.requestAccept)
  handleRequestAccept(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { conversationId: ConversationId; endUserId: EndUserId },
  ) {
    const { conversationId, endUserId } = body;
    console.log(
      `Request accept received ${conversationId} ${endUserId} at ${this.getFormattedDate()}`,
    );

    this.users[endUserId.toString()] = socketOfUser;
    socketOfUser.join(conversationId.toString());
    socketOfUser
      .to(conversationId.toString())
      .emit(socketEmit.requestAccept, { endUserId });
  }

  @SubscribeMessage(socketOn.requestDeny)
  async handleRequestDeny(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { conversationId: ConversationId; fromEndUser: EndUser },
  ) {
    const { conversationId, fromEndUser } = body;
    const roomSize = this.socketOfAll.sockets.adapter.rooms.get(
      conversationId.toString(),
    )?.size;
    console.log('roomSize', roomSize);

    socketOfUser
      .to(conversationId.toString())
      .emit(socketEmit.requestDeny, { fromEndUser });

    // if has 2 pp in the conversation, Destroy the room by removing all sockets from it
    // const conversation = await this.conversationService.getConversation(
    //   fromEndUser._id,
    //   conversationId,
    // );
    // if (conversation.endUserIds.length <= 2) {
    //   this.destroyRoom(conversationId);
    // }

    console.log(
      `CALL denied ${conversationId} ${fromEndUser._id} at ${this.getFormattedDate()}`,
    );
    // }
  }

  @SubscribeMessage(socketOn.memberLeft)
  handleCallMemberLeft(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { fromEndUserId: EndUserId; conversationId: ConversationId },
  ) {
    const { fromEndUserId, conversationId } = body;

    /*FOR NOW (1-1 messaging) */
    // socketOfUser
    //   .to(conversationId.toString())
    //   .emit(socketEmit.requestDeny, { conversationId });
    // this.destroyRoom(conversationId);

    socketOfUser.to(conversationId.toString()).emit(socketEmit.memberLeft, {
      fromEndUserId,
    });
    socketOfUser.leave(conversationId.toString());

    console.log(`LEAVE action received at ${this.getFormattedDate()}`);
  }

  @SubscribeMessage(socketOn.callMessageFromPeer)
  handleCallMessageFromPeer(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: {
      type: 'offer' | 'candidate' | 'answer';
      fromEndUserId: EndUserId;
      toEndUserId: EndUserId;
      data: any;
    },
  ) {
    const { type, fromEndUserId, toEndUserId, data } = body;
    console.log('Message from peer', fromEndUserId, toEndUserId, type);

    const targetSocket = this.users[toEndUserId.toString()];
    if (targetSocket) {
      targetSocket.emit(socketEmit.callMessageFromPeer, {
        type,
        fromEndUserId,
        toEndUserId,
        data,
      });
    } else {
      console.log(`Socket for ${toEndUserId} not found`);
    }
  }

  private destroyRoom(conversationId: ConversationId) {
    const room = this.socketOfAll.sockets.adapter.rooms.get(
      conversationId.toString(),
    );
    if (room) {
      for (const socketId of room) {
        const socket = this.socketOfAll.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(conversationId.toString());
        }
      }
    }
  }

  private convertToObjectIds(body: any): any {
    const converted = { ...body };
    if (body.endUserId)
      converted.endUserId = new mongoose.Types.ObjectId(
        body.endUserId as string,
      ) as EndUserId;
    if (body.conversationId)
      converted.conversationId = new mongoose.Types.ObjectId(
        body.conversationId as string,
      ) as ConversationId;
    if (body.messageId)
      converted.messageId = new mongoose.Types.ObjectId(
        body.messageId as string,
      ) as MessageId;
    return converted;
  }

  private emitToConversationMembers(
    conversation: Conversation,
    event: string,
    data: any,
  ) {
    conversation.endUserIds.forEach((endUser: any) => {
      const userSocket = this.users[endUser._id.toString()];
      if (userSocket) {
        userSocket.emit(event, data);
      }
    });
  }

  private emitRequestCallToOtherMembers(
    conversation: Conversation,
    myEndUser: any,
    conversationId: ConversationId,
  ) {
    conversation.endUserIds.forEach((endUser: any) => {
      if (endUser._id.toString() !== myEndUser._id.toString()) {
        const userSocket = this.users[endUser._id.toString()];
        if (userSocket) {
          userSocket.emit(socketOn.requestCall, {
            conversationId,
            sender: myEndUser,
          });
        }
      }
    });
  }
}
