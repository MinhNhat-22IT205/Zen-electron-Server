import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EndUserId } from 'src/common/types/utilTypes/';
import { BaseUser } from 'src/cores/base-user/entity/';
@Schema({ timestamps: true })
export class EndUser extends BaseUser {
  _id: EndUserId;

  @Prop({ required: true, type: String, index: 'text' })
  username: string;

  @Prop({ required: true, type: String, index: { unique: true } })
  email: string;

  @Prop({ required: false, type: String, default: '' })
  avatar: string;

  @Prop({ required: true, type: String })
  gender: string;

  createdAt: Date;

  updatedAt: Date;
  //Token for activate the account when first try to login
  @Prop({ required: false, type: String })
  activationToken: string;

  //Token for changing any credentials like password, email, or anything else.
  @Prop({ required: false, type: String })
  modifyToken: string;

  @Prop({ required: false, type: Date })
  expireTimeForModifyToken: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isOnline: boolean;

  @Prop({ required: true, type: Date, default: Date.now() })
  offlineTime: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ required: true, type: [String], default: [] })
  restrict: string[];

  @Prop({ required: false, type: String })
  description: string;

  @Prop({ required: true, type: Number, default: 0 })
  star: number;
}

export const EndUserSchema = SchemaFactory.createForClass(EndUser);
