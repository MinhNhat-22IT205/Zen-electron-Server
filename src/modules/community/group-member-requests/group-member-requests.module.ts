import { Module } from '@nestjs/common';
import { GroupMemberRequestsService } from './service/group-member-requests.service';
import { GroupMemberRequestsController } from './group-member-requests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GroupMemberRequest,
  GroupMemberRequestSchema,
} from './entities/group-member-request.entity';
import { GroupMemberRequestRepository } from './repository/group-member-request.repository';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';
import { IGroupMemberRequestsString } from './service/group-member-requests.interface';
import { GroupModule } from '../group/group.module';
import { GroupMembersModule, GroupMembersService } from '../group-members';

@Module({
  controllers: [GroupMemberRequestsController],
  providers: [
    {
      provide: IGroupMemberRequestsString,
      useClass: GroupMemberRequestsService,
    },
    { provide: BaseRepositoryName, useClass: GroupMemberRequestRepository },
    { provide: GroupMembersService, useClass: GroupMembersService },
  ],
  imports: [
    MongooseModule.forFeature([
      { name: GroupMemberRequest.name, schema: GroupMemberRequestSchema },
    ]),
    GroupModule,
    GroupMembersModule,
  ],
})
export class GroupMemberRequestsModule {}
