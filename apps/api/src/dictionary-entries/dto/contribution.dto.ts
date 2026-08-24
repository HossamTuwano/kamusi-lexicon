import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContributionAction } from '@kamusi/core';
import { ContributionStatus } from '@kamusi/database';

export class ProposedSenseDto {
  @IsNotEmpty({ message: 'Maana pendekezwa inahitajika' })
  @IsString()
  definition: string;

  @IsOptional()
  @IsString()
  usageNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  examples?: ProposedExampleDto[];
}

export class ProposedExampleDto {
  @IsNotEmpty({ message: 'Sentensi ya mfano inahitajika' })
  @IsString()
  sentence: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateContributionDto {
  @IsNotEmpty({ message: 'Kitambulisho cha neno (lemmaId) kinahitajika' })
  @IsNumber()
  lemmaId: number;

  @IsNotEmpty({ message: 'Aina ya mchango inahitajika' })
  @IsEnum(ContributionAction, { message: 'Aina ya mchango si sahihi' })
  action: ContributionAction;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposedSenseDto)
  proposedSenses?: ProposedSenseDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposedExampleDto)
  proposedExamples?: ProposedExampleDto[];

  @IsOptional()
  @IsString()
  proposedText?: string; // For simple corrections or notes
}

export class ApproveContributionDto {
  @IsNotEmpty()
  @IsNumber()
  contributionId: number;
}

export class RejectContributionDto {
  @IsNotEmpty({ message: 'Kitambulisho cha mchango kinahitajika' })
  @IsNumber()
  contributionId: number;

  @IsNotEmpty({ message: 'Sababu ya kukataa inahitajika' })
  @IsString()
  reason: string;
}
