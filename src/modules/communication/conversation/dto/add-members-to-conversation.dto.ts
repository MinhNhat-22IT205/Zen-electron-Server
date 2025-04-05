import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray } from 'class-validator';
import { EndUserId } from 'src/common/types/utilTypes';
import { checkToConvertToMongoIdOrThrowError } from 'src/common/utils';
import { isArray } from 'src/common/utils';

class AddMembersToConversationDto {
  @ApiProperty({
    title: 'user ids',
    name: 'userIds',
    required: true,
  })
  @IsArray()
  @Transform((opts) => {
    const array = opts.value;
    if (isArray<string>(array)) {
      array.map((endUserId) =>
        checkToConvertToMongoIdOrThrowError({
          id: endUserId,
          returnError: true,
        }),
      );
    }
    return array;
  })
  userIds: EndUserId[];
}

export default AddMembersToConversationDto;
