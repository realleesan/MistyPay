import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        country: dto.country,
        status: 'ACTIVE',
      },
    });

    return {
      success: true,
      userId: user.id,
      message: 'Registration successful',
    };
  }

  async login(dto: LoginDto, ipAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // Save session in database
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');
    const expiresAt = new Date();
    const days = parseInt(refreshExpiresIn.replace('d', ''), 10) || 30;
    expiresAt.setDate(expiresAt.getDate() + days);

    const tokenHash = this.hashToken(tokens.refreshToken);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshDashToken: tokenHash,
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
        ipAddress,
        expiresAt,
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
      ...tokens,
    };
  }

  async refresh(refreshToken: string, ipAddress: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: payload.sub,
        refreshDashToken: tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or token reused');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    const newTokens = await this.generateTokens(user.id, user.email);
    const newHash = this.hashToken(newTokens.refreshToken);

    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');
    const expiresAt = new Date();
    const days = parseInt(refreshExpiresIn.replace('d', ''), 10) || 30;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshDashToken: newHash,
        expiresAt,
        ipAddress,
      },
    });

    return {
      success: true,
      ...newTokens,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    try {
      await this.prisma.userSession.deleteMany({
        where: { refreshDashToken: tokenHash },
      });
    } catch {
      // Ignore
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<any>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<any>('JWT_REFRESH_EXPIRES_IN', '30d'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
