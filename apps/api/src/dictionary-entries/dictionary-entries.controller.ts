import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
  NotFoundException,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DictionaryEntriesService } from './dictionary-entries.service';
import { CreateEntryDto, SearchDto } from './dto/entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Dictionary')
@Controller('entries')
export class DictionaryEntriesController {
  constructor(private readonly entriesService: DictionaryEntriesService) {}

  @ApiOperation({ summary: 'Bidirectional fuzzy search' })
  @Get('search')
  async search(@Query() dto: SearchDto) {
    if (!dto.q || dto.q.trim().length === 0) {
      return [];
    }
    return this.entriesService.search(dto);
  }

  @ApiOperation({ summary: 'Fetch single entry' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.entriesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Submit new entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateEntryDto, @Request() req: any) {
    return this.entriesService.create(dto, req.user.userId);
  }

  @ApiOperation({ summary: 'Remove own unverified entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.entriesService.delete(+id, req.user.userId);
  }
}
