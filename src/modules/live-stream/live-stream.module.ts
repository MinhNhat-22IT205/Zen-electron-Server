import { Module } from '@nestjs/common';
import { LiveStreamService } from './live-stream.service';
import { LiveStreamController } from './live-stream.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveStream, LiveStreamSchema } from './entities/live-stream.entity';
import { LiveStreamRepository } from './repository/live-stream.repository';
import { LiveStreamGateway } from './live-stream.gateway';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveStream.name, schema: LiveStreamSchema },
    ]),
  ],
  controllers: [LiveStreamController],
  providers: [
    LiveStreamService,
    LiveStreamGateway,
    {
      provide: BaseRepositoryName,
      useClass: LiveStreamRepository,
    },
  ],
})
export class LiveStreamModule {}
