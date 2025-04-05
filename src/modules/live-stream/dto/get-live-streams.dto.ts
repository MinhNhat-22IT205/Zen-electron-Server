import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class GetLiveStreamsDto {
  @ApiProperty({
    title: 'limit for queries',
    required: true,
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({
    title: 'offset for queries',
    required: true,
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  skip: number;
}
