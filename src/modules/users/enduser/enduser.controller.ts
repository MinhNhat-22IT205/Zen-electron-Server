import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Inject,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SerializeDecorator } from 'src/cores/interceptors/';
import { EndUserSerializeDto, FindByIdEndUserDto } from './dto/';
import { LoggedInGuard } from 'src/modules/auth/passport/loggedIn.guard';
import { FindOneEndUserSwaggerAPIDecorators } from 'src/documents/swagger-api/endusers/';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeInformationDto } from './dto/change-information.dto';
import { RequestUser } from 'src/common/types/utilTypes/RequestUser';
import { checkToConvertToMongoIdOrThrowError } from 'src/common/utils/';
import { EndUserId } from 'src/common/types/utilTypes/';
import {
  IEndUserService,
  IEndUserServiceString,
} from './services/enduser.interface.service';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { SearchUsersDto } from './dto/search-users.dto';
import { AddStarDto } from './dto/add-star.sto';

@ApiTags('End User')
@Controller('endusers')
@SerializeDecorator(EndUserSerializeDto)
@UseGuards(LoggedInGuard)
export class EnduserController {
  constructor(
    @Inject(IEndUserServiceString)
    private readonly endUserService: IEndUserService,
  ) {}

  @Get()
  public async find(@Query() query: QueryLimitSkip) {
    const users = await this.endUserService.find(query);
    return users;
  }

  @Get('search')
  public async search(@Query() query: SearchUsersDto) {
    const users = await this.endUserService.searchByUsername(query);
    return users;
  }

  @Get('/:endUserId')
  @FindOneEndUserSwaggerAPIDecorators()
  async findOne(@Param() params: FindByIdEndUserDto) {
    return this.endUserService.findById(params.endUserId);
  }

  @Patch('/change-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestUser,
  ) {
    const userId = checkToConvertToMongoIdOrThrowError<EndUserId>({
      id: req.user._id,
      returnError: true,
    });
    console.log('avatar changed');
    return this.endUserService.changeAvatar({
      userId,
      file,
    });
  }

  @Patch('change-information')
  async changeInformation(
    @Body() changeInformationDto: ChangeInformationDto,
    @Req() req: RequestUser,
  ) {
    const userId = checkToConvertToMongoIdOrThrowError<EndUserId>({
      id: req.user._id,
      returnError: true,
    });
    console.log('infor changed');
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    console.log(
      'Information changed',
      changeInformationDto,
      'at',
      formattedDate,
    );
    return this.endUserService.changeInformation({
      changeInformationDto,
      userId,
    });
  }

  @Patch('add-star')
  async addStar(@Body() addStarDto: AddStarDto, @Req() req: RequestUser) {
    const userId = checkToConvertToMongoIdOrThrowError<EndUserId>({
      id: req.user._id,
      returnError: true,
    });
    return this.endUserService.addStar(userId, addStarDto.star);
  }
}
