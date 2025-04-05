import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LiveStreamId } from 'src/common/types/utilTypes';

export type LiveStreamStatus = 'active' | 'ended';
export const LiveStreamStatus = {
  ACTIVE: 'active',
  ENDED: 'ended',
};

@Schema({ timestamps: true })
export class LiveStream {
  _id: LiveStreamId;

  @Prop({
    required: true,
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EndUser',
  })
  endUserId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: [LiveStreamStatus.ACTIVE, LiveStreamStatus.ENDED],
    default: LiveStreamStatus.ACTIVE,
  })
  status: LiveStreamStatus;

  @Prop({
    type: [Types.ObjectId],
    ref: 'EndUser',
  })
  viewers: Types.ObjectId[];

  createdAt: Date;

  updatedAt: Date;
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);
