import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ConversationId, EndUserId } from 'src/common/types/utilTypes';
import { checkToConvertToMongoIdOrThrowError } from 'src/common/utils';
import { MessageType } from '../../message/entities/message.entity';

export class SendMessageDto {
  @IsString()
  content: string;

  @Transform((opts) =>
    checkToConvertToMongoIdOrThrowError({ id: opts.value, returnError: true }),
  )
  endUserId: EndUserId;

  @Transform((opts) =>
    checkToConvertToMongoIdOrThrowError({ id: opts.value, returnError: true }),
  )
  conversationId: ConversationId;

  @IsString()
  @IsOptional()
  type: MessageType;
}
