
import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentUser(@Request() req): Promise<UserResponseDto> {
    const user = await this.userService.findById(req.user.userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/test-history')
  async getUserTestHistory(@Param('id') id: string) {
    return this.userService.getUserTestHistory(+id);
  }
}
