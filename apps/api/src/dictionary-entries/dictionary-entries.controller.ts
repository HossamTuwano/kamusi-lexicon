import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DictionaryEntriesService } from './dictionary-entries.service';
import { CreateEntryDto, SearchDto, UpdateEntryDto } from './dto/entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Dictionary')
@Controller('entries')
export class DictionaryEntriesController {
  constructor(private readonly entriesService: DictionaryEntriesService) {}

  @ApiOperation({ summary: 'Fuzzy search Swahili lemmas' })
  @Get('search')
  async search(@Query() dto: SearchDto) {
    if (!dto.q || dto.q.trim().length === 0) {
      return [];
    }
    return this.entriesService.search(dto);
  }

  @ApiOperation({
    summary: 'Moderator search includes hidden entries (Phase 1 moderation)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('moderation/search')
  async moderationSearch(@Query() dto: SearchDto, @Request() req: any) {
    const role = req.user?.role;
    if (role !== 'moderator' && role !== 'admin') {
      throw new ForbiddenException('Moderator role required');
    }

    return this.entriesService.searchModeration(dto);
  }

  @ApiOperation({ summary: 'Fetch single lemma with senses, examples, history' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.entriesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Submit new Swahili lemma (Phase 1)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateEntryDto, @Request() req: any) {
    return this.entriesService.create(dto, req.user.userId);
  }

  @ApiOperation({ summary: 'Update lemma (creator or moderator); creates a revision' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @Request() req: any,
  ) {
    return this.entriesService.update(+id, dto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Remove own unverified entry (moderators may remove any)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.entriesService.delete(+id, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Moderator action: verify | hide | restore' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/moderate')
  async moderate(
    @Param('id') id: string,
    @Body('action') action: 'verify' | 'hide' | 'restore',
    @Request() req: any,
  ) {
    return this.entriesService.moderate(+id, action, req.user.userId, req.user.role);
  }
}
