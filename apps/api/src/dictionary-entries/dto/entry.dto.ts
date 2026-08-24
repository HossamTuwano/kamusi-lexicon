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
import { PartOfSpeech, PartOfSpeechLabels, ReportReason } from '@kamusi/core';

export const MODERATION_ACTIONS = ['verify', 'hide', 'restore'] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

const PARTS_OF_SPEECH = Object.values(PartOfSpeech);
const REPORT_REASONS = Object.values(ReportReason);

export const PART_OF_SPEECH_MESSAGE = `Aina ya neno si sahihi. Chagua mojawapo ya: ${PARTS_OF_SPEECH.map(
  (code) => `${code} (${PartOfSpeechLabels[code]})`,
).join(', ')}`;

class ExampleDto {
  @ApiProperty({ description: 'Swahili example sentence' })
  @IsString()
  @IsNotEmpty({ message: 'Sentensi ya mfano inahitajika' })
  sentence: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}

class SenseDto {
  @ApiProperty({ description: 'Swahili definition (required for Phase 1)' })
  @IsString()
  @IsNotEmpty({ message: 'Maana inahitajika' })
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
  @IsNotEmpty({ message: 'Neno linahitajika' })
  word: string;

  @ApiProperty({ enum: PARTS_OF_SPEECH })
  @IsIn(PARTS_OF_SPEECH, { message: PART_OF_SPEECH_MESSAGE })
  partOfSpeech: PartOfSpeech;

  @ApiProperty({ type: [SenseDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Angalau maana moja (ufafanuzi) wa Kiswahili unahitajika',
  })
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
  @ArrayMinSize(1, {
    message: 'Angalau maana moja (ufafanuzi) wa Kiswahili unahitajika',
  })
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
