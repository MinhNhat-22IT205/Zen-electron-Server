import { PipelineStage } from 'mongoose';
import { nameOfCollections } from '../../../common/constants/name-of-collections';

export const LookUpFromEndUserAggregate: PipelineStage[] = [
  {
    $lookup: {
      from: nameOfCollections.EndUser,
      localField: 'fromEndUserId',
      foreignField: '_id',
      as: 'userFull',
    },
  },
  {
    $unwind: '$userFull',
  },
  {
    $set: {
      fromEndUser: {
        _id: '$userFull._id',
        username: '$userFull.username',
        avatar: '$userFull.avatar',
      },
    },
  },
  {
    $unset: ['userFull'],
  },
] as const;
