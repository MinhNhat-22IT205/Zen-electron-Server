import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLiveStreamDto {
  @ApiProperty({
    title: "live stream's title",
    required: true,
    example: 'Today I have a lovely day!',
  })
  @MinLength(1)
  @IsString()
  title: string;

  @ApiProperty({
    title: "live stream's description",
    required: true,
    example: 'This is a live stream about coding',
  })
  @MinLength(1)
  @IsString()
  description: string;
}
