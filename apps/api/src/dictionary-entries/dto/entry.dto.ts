import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { EntryType } from '../entities/dictionary-entry.entity';

export class CreateEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lemma: string;

  @ApiProperty({ enum: EntryType })
  @IsEnum(EntryType)
  @IsOptional()
  word_type: EntryType = EntryType.NOUN;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  definition: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  example_sentence: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  context_note: string;
}

export class SearchDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  target?: string;

  @ApiProperty()
  @IsOptional()
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  limit?: number = 20;
}
