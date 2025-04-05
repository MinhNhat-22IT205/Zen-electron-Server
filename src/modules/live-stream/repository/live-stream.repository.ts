import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { GenericRepositoryMongodb } from 'src/cores/base-repository/Base-Mongodb.Repository';
import { LiveStream } from '../entities/live-stream.entity';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { LookUpEndUserAggregate } from 'src/cores/mongodb-aggregations';
import { PopulateEndUserAggregation } from 'src/common/types/mongodbTypes';
import { LiveStreamId } from 'src/common/types/utilTypes';

export type LiveStreamAggregationArgs = {
  queryLimitSkip: QueryLimitSkip;
  queryAggregation: PipelineStage[];
};

@Injectable()
export class LiveStreamRepository extends GenericRepositoryMongodb<LiveStream> {
  constructor(
    @InjectModel(LiveStream.name)
    private readonly LiveStreamModel: Model<LiveStream>,
  ) {
    super(LiveStreamModel);
  }

  public async getActiveLiveStreamsAggregation<T>({
    queryLimitSkip,
    queryAggregation,
  }: LiveStreamAggregationArgs) {
    const liveStreamsAggregation: (PopulateEndUserAggregation<LiveStream> &
      T)[] = await this.findByAggregation([
      ...queryAggregation,
      {
        $limit: queryLimitSkip.limit,
      },
      { $skip: queryLimitSkip.skip },
      ...LookUpEndUserAggregate,
    ]);
    return liveStreamsAggregation;
  }

  public async findLiveStreamAggregation<T>({ _id }: { _id: LiveStreamId }) {
    const liveStreamsAggregation: (PopulateEndUserAggregation<LiveStream> &
      T)[] = await this.findByAggregation([
      {
        $match: { _id },
      },
      ...LookUpEndUserAggregate,
    ]);
    const liveStreamAggregation = liveStreamsAggregation[0];
    return liveStreamAggregation;
  }
}
