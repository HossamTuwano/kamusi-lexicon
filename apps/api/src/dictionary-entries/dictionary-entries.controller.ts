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
import {
  BulkModerateDto,
  CreateEntryDto,
  ModerationSearchDto,
  ReportDto,
  SearchDto,
  UpdateEntryDto,
} from './dto/entry.dto';
import {
  CreateContributionDto,
  RejectContributionDto,
  ApproveContributionDto,
} from './dto/contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Dictionary')
@Controller('entries')
export class DictionaryEntriesController {
  constructor(private readonly entriesService: DictionaryEntriesService) {}

  // Reading the Kamusi is the primary use. The global 10/min default is sized
  // for writes and would reject a reader typing a few words in the search box.
  @ApiOperation({ summary: 'Fuzzy search Swahili lemmas' })
  @Throttle({ read: { limit: 60, ttl: 60000 } })
  @Get('search')
  async search(@Query() dto: SearchDto) {
    if (!dto.q || dto.q.trim().length === 0) {
      return [];
    }
    return this.entriesService.search(dto);
  }

  @ApiOperation({
    summary: 'Moderator search includes hidden entries (Phase 1 moderation)',
    description:
      'Filter one queue with ?status=pending|hidden|reported. Omit status for all entries. ' +
      'Returns a paginated envelope: { items, total, page, limit, totalPages }.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('moderation/search')
  async moderationSearch(
    @Query() dto: ModerationSearchDto,
    @Request() req: any,
  ) {
    const role = req.user?.role;
    if (role !== 'moderator' && role !== 'admin') {
      throw new ForbiddenException('Moderator role required');
    }

    return this.entriesService.searchModeration(dto);
  }

  @ApiOperation({
    summary: 'Moderator: List contributions by status (default: pending)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('contributions')
  async listContributions(@Query('status') status?: string, @Request() req?: any) {
    const role = req?.user?.role;
    if (role !== 'moderator' && role !== 'admin') {
      throw new ForbiddenException('Moderator role required');
    }
    return this.entriesService.findContributions(status);
  }

  @ApiOperation({ summary: 'Fetch single lemma with senses, examples, history' })
  @Throttle({ read: { limit: 60, ttl: 60000 } })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.entriesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Submit new Swahili lemma (Phase 1)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @ApiOperation({
    summary: 'Bulk moderator action on multiple entries (verify | hide | restore)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('moderate/bulk')
  async bulkModerate(@Body() dto: BulkModerateDto, @Request() req: any) {
    return this.entriesService.bulkModerate(
      dto.ids,
      dto.action,
      req.user.userId,
      req.user.role,
    );
  }

  @ApiOperation({
    summary: 'Report an entry (spam, offensive, wrong, duplicate, other)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post(':id/report')
  async report(
    @Param('id') id: string,
    @Body() dto: ReportDto,
    @Request() req: any,
  ) {
    return this.entriesService.report(+id, req.user.userId, dto);
  }

  @ApiOperation({
    summary: 'Moderator: list reports for an entry (open first, newest first)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/reports')
  async findReports(@Param('id') id: string, @Request() req: any) {
    const role = req.user?.role;
    if (role !== 'moderator' && role !== 'admin') {
      throw new ForbiddenException('Unahitaji kuwa mhakiki');
    }

    return this.entriesService.findReports(+id);
  }

  @ApiOperation({ summary: 'Submit a contribution for an existing lemma' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('contribute')
  async contribute(
    @Body() dto: CreateContributionDto,
    @Request() req: any,
  ) {
    return this.entriesService.submitContribution(dto, req.user.userId);
  }

  @ApiOperation({ summary: 'Moderator: Approve a contribution' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('contributions/:id/approve')
  async approveContribution(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.entriesService.approveContribution({ contributionId: +id }, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Moderator: Reject a contribution' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('contributions/:id/reject')
  async rejectContribution(
    @Param('id') id: string,
    @Body() dto: RejectContributionDto,
    @Request() req: any,
  ) {
    return this.entriesService.rejectContribution({ contributionId: +id, ...dto }, req.user.userId, req.user.role);
  }
}
