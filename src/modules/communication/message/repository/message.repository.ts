import { GenericRepositoryMongodb } from 'src/cores/base-repository/Base-Mongodb.Repository';
import { Message } from '../entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetMessagesDto } from '../dto/get-messages.dto';
import { PopulateEndUserAggregation } from 'src/common/types/mongodbTypes';
import { LookUpEndUserAggregate } from 'src/cores/mongodb-aggregations';
import { QueryLimitSkip } from 'src/cores/global-dtos';

export class MessageRepository extends GenericRepositoryMongodb<Message> {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {
    super(messageModel);
  }

  public async findMessageAggregation<T>(
    findMessageDto: GetMessagesDto & QueryLimitSkip,
  ) {
    const messagesAggregation: (PopulateEndUserAggregation<Message> & T)[] =
      await this.findByAggregation([
        {
          $match: { conversationId: findMessageDto.conversationId },
        },
        {
          $limit: findMessageDto.limit,
        },
        { $skip: findMessageDto.skip },
        ...LookUpEndUserAggregate,
      ]);
    return messagesAggregation;
  }
}
