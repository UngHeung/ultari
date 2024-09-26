import { IsNumber } from 'class-validator';

export class UpdateLeaderDto {
  @IsNumber()
  teamId: number;

  @IsNumber()
  userId: number;
}
