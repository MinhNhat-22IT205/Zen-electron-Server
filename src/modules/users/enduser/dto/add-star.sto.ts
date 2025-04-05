import { IsNumber } from 'class-validator';

export class AddStarDto {
  @IsNumber()
  star: number;
}
