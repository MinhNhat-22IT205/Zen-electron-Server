import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { LiveStreamService } from './live-stream.service';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { RequestUser } from 'src/common/types/utilTypes';
import { FindLiveStreamDto } from './dto/find-live-stream.dto';

@Controller('live-stream')
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @Post()
  create(
    @Req() req: RequestUser,
    @Body() createLiveStreamDto: CreateLiveStreamDto,
  ) {
    return this.liveStreamService.createLiveStream(
      createLiveStreamDto,
      req.user._id,
    );
  }

  @Get()
  findAll(@Query() query: QueryLimitSkip) {
    return this.liveStreamService.getActiveLiveStreams(query);
  }

  @Get(':liveStreamId')
  findOne(@Param() param: FindLiveStreamDto) {
    return this.liveStreamService.findOne(param.liveStreamId);
  }

  @Patch(':liveStreamId')
  update(
    @Param('liveStreamId') param: FindLiveStreamDto,
    @Req() req: RequestUser,
    @Body() updateLiveStreamDto: UpdateLiveStreamDto,
  ) {
    return this.liveStreamService.update(
      param.liveStreamId,
      updateLiveStreamDto,
      req.user._id,
    );
  }

  @Delete(':liveStreamId')
  remove(
    @Param('liveStreamId') param: FindLiveStreamDto,
    @Req() req: RequestUser,
  ) {
    return this.liveStreamService.delete(param.liveStreamId, req.user._id);
  }
}
