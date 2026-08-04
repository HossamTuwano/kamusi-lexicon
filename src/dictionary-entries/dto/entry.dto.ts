import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { EntryType } from '../entities/dictionary-entry.entity';

export class CreateEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 5)
  source_language: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 5)
  target_language: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  source_word: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  target_word: string;

  @ApiProperty({ enum: EntryType })
  @IsEnum(EntryType)
  @IsOptional()
  word_type: EntryType = EntryType.NOUN;

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
