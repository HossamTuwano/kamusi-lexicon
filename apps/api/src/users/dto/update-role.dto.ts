import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserRole } from '@kamusi/core';

const ROLES: UserRole[] = ['contributor', 'moderator', 'admin'];

export class UpdateRoleDto {
  @ApiProperty({ enum: ROLES, description: 'Target role for the user' })
  @IsIn(ROLES)
  role: UserRole;
}
