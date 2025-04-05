import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';
import { LiveStreamRepository } from './repository/live-stream.repository';
import { TryCatchDecorator } from 'src/cores/decorators';
import { LiveStream } from './entities/live-stream.entity';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { PopulateEndUserAggregation } from 'src/common/types/mongodbTypes';
import { isIdsEqual } from 'src/common/utils/index';
import { LiveStreamId, EndUserId } from 'src/common/types/utilTypes';

@Injectable()
@TryCatchDecorator()
export class LiveStreamService {
  constructor(
    @Inject(BaseRepositoryName)
    private readonly liveStreamRepository: LiveStreamRepository,
  ) {}

  async createLiveStream(
    createLiveStreamDto: CreateLiveStreamDto,
    endUserId: EndUserId,
  ) {
    const createdLiveStream = await this.liveStreamRepository.create({
      ...createLiveStreamDto,
      endUserId,
      status: 'active',
    });
    return createdLiveStream;
  }

  async getActiveLiveStreams<T>(
    queryLimitSkip: QueryLimitSkip,
  ): Promise<PopulateEndUserAggregation<LiveStream>[]> {
    const livestreams =
      this.liveStreamRepository.getActiveLiveStreamsAggregation<T>({
        queryLimitSkip,
        queryAggregation: [
          { $match: { status: 'active' } },
          { $sort: { createdAt: -1 } },
        ],
      });
    return livestreams;
  }

  async findOne<T>(
    id: LiveStreamId,
  ): Promise<PopulateEndUserAggregation<LiveStream> & T> {
    const liveStream =
      await this.liveStreamRepository.findLiveStreamAggregation<T>({ _id: id });
    if (!liveStream) {
      throw new BadRequestException('Live stream does not exist!');
    }
    return liveStream;
  }

  async update(
    id: LiveStreamId,
    updateLiveStreamDto: UpdateLiveStreamDto,
    streamerId: EndUserId,
  ) {
    const liveStream = await this.liveStreamRepository.findById(id);
    if (!liveStream) {
      throw new BadRequestException('Live stream does not exist!');
    }

    if (!isIdsEqual(liveStream.endUserId, streamerId)) {
      throw new UnauthorizedException(
        'You are not authorized to update this live stream!',
      );
    }

    Object.assign(liveStream, updateLiveStreamDto);
    await liveStream.save();
    return liveStream;
  }

  async delete(id: LiveStreamId, streamerId: EndUserId) {
    const liveStream = await this.liveStreamRepository.findById(id);
    if (!liveStream) {
      throw new BadRequestException('Live stream does not exist!');
    }

    if (!isIdsEqual(liveStream.endUserId, streamerId)) {
      throw new UnauthorizedException(
        'You are not authorized to end this live stream!',
      );
    }

    liveStream.status = 'ended';
    await liveStream.save();
    return liveStream;
  }

  async getLiveStreamsFromStreamer<T>(
    streamerId: EndUserId,
    queryLimitSkip: QueryLimitSkip,
  ) {
    return this.liveStreamRepository.getActiveLiveStreamsAggregation<T>({
      queryLimitSkip,
      queryAggregation: [
        { $match: { endUserId: streamerId, status: 'active' } },
        { $sort: { createdAt: -1 } },
      ],
    });
  }

  async addViewer(liveStreamId: LiveStreamId, viewerId: EndUserId) {
    const liveStream = await this.liveStreamRepository.findById(liveStreamId);
    if (!liveStream) {
      throw new BadRequestException('Live stream does not exist!');
    }

    if (liveStream.status !== 'active') {
      throw new BadRequestException('This live stream has ended!');
    }

    if (!liveStream.viewers.includes(viewerId)) {
      liveStream.viewers.push(viewerId);
      await liveStream.save();
    }

    return liveStream;
  }

  async removeViewer(liveStreamId: LiveStreamId, viewerId: EndUserId) {
    const liveStream = await this.liveStreamRepository.findById(liveStreamId);
    if (!liveStream) {
      throw new BadRequestException('Live stream does not exist!');
    }

    liveStream.viewers = liveStream.viewers.filter(
      (viewer) => !isIdsEqual(viewer, viewerId),
    );
    await liveStream.save();

    return liveStream;
  }
}
