import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { GroupId } from 'src/common/types/utilTypes';

export class LeaveGroupDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the group to leave',
  })
  @Transform(({ value }) => {
    console.log('LeaveGroupDto groupId:', value);
    return value;
  })
  @IsString()
  groupId: string;
}
