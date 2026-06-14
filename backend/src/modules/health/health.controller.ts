import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('blockchain') private readonly blockchainQueue: Queue,
  ) {}

  @Get()
  async getHealth() {
    let databaseStatus = 'down';
    let redisStatus = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      databaseStatus = `down: ${error.message}`;
    }

    try {
      const client = await this.blockchainQueue.client;
      const pong = await (client as any).ping();
      if (pong === 'PONG') {
        redisStatus = 'up';
      }
    } catch (error) {
      redisStatus = `down: ${error.message}`;
    }

    const isOk = databaseStatus === 'up' && redisStatus === 'up';

    return {
      status: isOk ? 'ok' : 'error',
      database: databaseStatus,
      redis: redisStatus,
    };
  }
}
