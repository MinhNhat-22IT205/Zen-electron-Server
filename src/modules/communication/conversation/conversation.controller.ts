import {
  Controller,
  UseGuards,
  Inject,
  Req,
  Body,
  Post,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/modules/auth';
import {
  IConversationService,
  IConversationServiceString,
} from './service/conversation.interface.service';
import { CreateConversationDto } from './dto';
import { EndUserId, RequestUser } from 'src/common/types/utilTypes';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { FindConversationDto } from './dto/find-conversation.dto';
import mongoose from 'mongoose';
import AddMembersToConversationDto from './dto/add-members-to-conversation.dto';

@ApiTags('Conversations')
@UseGuards(LoggedInGuard)
@Controller('conversation')
export class ConversationController {
  constructor(
    @Inject(IConversationServiceString)
    private readonly conversationService: IConversationService,
  ) {}

  @Post()
  public async createConversation(
    @Req() req: RequestUser,
    @Body() body: CreateConversationDto,
  ) {
    body.userIds = body.userIds.map(
      (userId) => new mongoose.Types.ObjectId(userId) as EndUserId,
    );
    const conversation = await this.conversationService.createConversation(
      req.user._id,
      body.userIds,
    );
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    console.log('Conversation created', conversation, 'at', formattedDate);
    return conversation;
  }

  @Get()
  public async getConversations(
    @Req() req: RequestUser,
    @Query() query: QueryLimitSkip,
  ) {
    const conversations = await this.conversationService.getConversations(
      req.user._id,
      query,
    );

    return conversations;
  }

  @Get(':conversationId')
  public async getConversation(
    @Req() req: RequestUser,
    @Param() param: FindConversationDto,
  ) {
    console.log(param);
    const conversation = await this.conversationService.getConversation(
      req.user._id,
      param.conversationId,
    );
    return conversation;
  }

  @Patch(':conversationId/add-members')
  public async addMembersToConversation(
    @Param() param: FindConversationDto,
    @Req() req: RequestUser,
    @Body() body: AddMembersToConversationDto,
  ) {
    const conversation =
      await this.conversationService.addMembersToConversation(
        req.user._id,
        param.conversationId,
        body.userIds,
      );
    return conversation;
  }
}
