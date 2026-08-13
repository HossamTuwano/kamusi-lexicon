import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  ArrayUnique,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartOfSpeech, ReportReason } from '@kamusi/core';

export const MODERATION_ACTIONS = ['verify', 'hide', 'restore'] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

const PARTS_OF_SPEECH = Object.values(PartOfSpeech);
const REPORT_REASONS = Object.values(ReportReason);

class ExampleDto {
  @ApiProperty({ description: 'Swahili example sentence' })
  @IsString()
  @IsNotEmpty()
  sentence: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}

class SenseDto {
  @ApiProperty({ description: 'Swahili definition (required for Phase 1)' })
  @IsString()
  @IsNotEmpty()
  definition: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  usageNote?: string;

  @ApiPropertyOptional({ type: [ExampleDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  examples?: ExampleDto[];
}

export class CreateEntryDto {
  @ApiProperty({ example: 'gari' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ enum: PARTS_OF_SPEECH })
  @IsIn(PARTS_OF_SPEECH)
  partOfSpeech: PartOfSpeech;

  @ApiProperty({ type: [SenseDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one Swahili sense (definition) is required' })
  @ValidateNested({ each: true })
  @Type(() => SenseDto)
  senses: SenseDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plural?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayUnique()
  synonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayUnique()
  antonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayUnique()
  derivedWords?: string[];

  @ApiPropertyOptional({ example: 'Kiswahili sanifu' })
  @IsString()
  @IsOptional()
  dialect?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;
}

export class UpdateEntryDto {
  @ApiPropertyOptional({ type: [SenseDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SenseDto)
  senses?: SenseDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plural?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  antonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  derivedWords?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dialect?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;
}

export class SearchDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number = 20;
}

export class BulkModerateDto {
  @ApiProperty({ description: 'Entry ids to moderate' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one entry id is required' })
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ enum: MODERATION_ACTIONS })
  @IsIn(MODERATION_ACTIONS)
  action: ModerationAction;
}

export class ReportDto {
  @ApiProperty({ enum: REPORT_REASONS })
  @IsIn(REPORT_REASONS)
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'Optional detail about the problem' })
  @IsString()
  @IsOptional()
  note?: string;
}
