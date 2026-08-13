import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req) {
    this.assertAdmin(req.user?.role);
    const users = await this.usersService.findAll();
    // Strip password hashes before returning.
    return users.map(({ password_hash: _pw, ...user }) => user);
  }

  @ApiOperation({ summary: "Change a user's role (admin only)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    this.assertAdmin(req.user?.role);
    const user = await this.usersService.updateRole(
      +id,
      dto.role,
      req.user.userId,
    );
    const { password_hash: _pw, ...safeUser } = user;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data like password before returning
    const { password_hash: _pw, ...userData } = user;
    return userData;
  }

  private assertAdmin(role?: string) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
  }
}
