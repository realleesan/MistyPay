import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { SetupPinDto } from './dtos/setup-pin.dto';
import { VerifyPinDto } from './dtos/verify-pin.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('blockchain') private readonly queue: Queue,
  ) {}

  private async getRedisClient(): Promise<any> {
    return this.queue.client;
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      country: user.country,
      status: user.status,
      hasPin: !!user.pinHash,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.country && { country: dto.country }),
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        country: user.country,
        hasPin: !!user.pinHash,
      },
    };
  }

  async setupPin(userId: string, dto: SetupPinDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const pinHash = await bcrypt.hash(dto.pin, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    return {
      success: true,
      message: 'Transaction PIN configured successfully',
    };
  }

  async disablePin(userId: string, dto: VerifyPinDto) {
    await this.verifyPin(userId, dto);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash: null },
    });

    return {
      success: true,
      message: 'Transaction PIN disabled successfully',
    };
  }

  async verifyPin(userId: string, dto: VerifyPinDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.pinHash) {
      throw new BadRequestException('Transaction PIN is not configured yet');
    }

    const redis = await this.getRedisClient();
    const lockoutKey = `pin_lockout:locked:${userId}`;
    const attemptsKey = `pin_lockout:attempts:${userId}`;

    // Check if locked out
    const isLocked = await redis.get(lockoutKey);
    if (isLocked) {
      const ttl = await redis.ttl(lockoutKey);
      throw new BadRequestException(
        `PIN verification is locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    const isPinValid = await bcrypt.compare(dto.pin, user.pinHash);

    if (!isPinValid) {
      // Increment failed attempts
      const attemptsVal = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 86400); // 1 day expire

      const maxAttempts = this.configService.get<number>('PIN_MAX_ATTEMPTS', 5);
      const lockMinutes = this.configService.get<number>('PIN_LOCK_DURATION_MINUTES', 15);

      if (attemptsVal >= maxAttempts) {
        await redis.set(lockoutKey, 'true', 'EX', lockMinutes * 60);
        await redis.del(attemptsKey);
        throw new BadRequestException(
          `Incorrect PIN. Too many failed attempts. PIN locked for ${lockMinutes} minutes.`
        );
      }

      const remaining = maxAttempts - attemptsVal;
      throw new BadRequestException(
        `Incorrect PIN. You have ${remaining} attempts remaining.`
      );
    }

    // Success: Reset attempts
    await redis.del(attemptsKey);

    return {
      success: true,
      message: 'PIN verified successfully',
    };
  }

  async changeEmail(userId: string, dto: { email: string; password?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email },
    });

    return {
      success: true,
      message: 'Email updated successfully',
    };
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }
}
