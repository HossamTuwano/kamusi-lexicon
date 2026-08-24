import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class UserContributionsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
