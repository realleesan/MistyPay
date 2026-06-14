import { Controller, Get, Patch, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { SetupPinDto } from './dtos/setup-pin.dto';
import { VerifyPinDto } from './dtos/verify-pin.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Post('pin/setup')
  @HttpCode(HttpStatus.OK)
  async setupPin(
    @GetUser('id') userId: string,
    @Body() setupPinDto: SetupPinDto,
  ) {
    return this.usersService.setupPin(userId, setupPinDto);
  }

  @Post('pin/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPin(
    @GetUser('id') userId: string,
    @Body() verifyPinDto: VerifyPinDto,
  ) {
    return this.usersService.verifyPin(userId, verifyPinDto);
  }
}
