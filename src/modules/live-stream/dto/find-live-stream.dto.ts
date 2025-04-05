import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { LiveStreamId } from 'src/common/types/utilTypes/Brand';
import { checkToConvertToMongoIdOrThrowError } from 'src/common/utils/';

export class FindLiveStreamDto {
  @ApiProperty({
    title: 'live stream Id',
    type: String,
    required: true,
    example: '6624493e85f7bdaedf3ca88f',
  })
  @Transform((data) => {
    const id = checkToConvertToMongoIdOrThrowError<LiveStreamId>({
      id: data.value,
      returnError: true,
    });
    return id;
  })
  liveStreamId: LiveStreamId;
}
