import { Controller, Post, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Votes')
@Controller('entries')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @ApiOperation({ summary: 'Cast a vote on an entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  async vote(@Param('id') id: string, @Request() req: any, @Body('vote') vote: number) {
    return this.votesService.vote(+id, req.user.userId, vote);
  }

  @ApiOperation({ summary: 'Retract a vote' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/vote')
  async removeVote(@Param('id') id: string, @Request() req: any) {
    return this.votesService.removeVote(+id, req.user.userId);
  }
}
