import { Transform } from 'class-transformer';
import { GroupId } from 'src/common/types/utilTypes';
import { checkMongodbIdInTransformToThrowError } from 'src/common/utils';

export class FindGroupDto {
  @Transform(checkMongodbIdInTransformToThrowError)
  groupId: GroupId;
}
