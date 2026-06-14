import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Req, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { GetAdmin } from './decorators/get-admin.decorator';
import { Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    const { email, password } = body;
    return this.adminService.login(email, password);
  }

  @Get('dashboard/stats')
  @UseGuards(AdminAuthGuard)
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/payout-queue')
  @UseGuards(AdminAuthGuard)
  async getPayoutQueue() {
    return this.adminService.getManualReviewQueue();
  }

  @Get('dashboard/treasury')
  @UseGuards(AdminAuthGuard)
  async getTreasury() {
    return this.adminService.getTreasuryStatus();
  }

  @Post('payouts/:id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async approvePayout(
    @Param('id', ParseUUIDPipe) id: string,
    @GetAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.approvePayout(id, adminId, ip);
  }

  @Post('payouts/:id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async rejectPayout(
    @Param('id', ParseUUIDPipe) id: string,
    @GetAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.rejectPayout(id, adminId, ip);
  }

  @Post('reconciliation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async runReconciliation(
    @Query('date') date: string,
    @GetAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.runManualReconciliation(date, adminId, ip);
  }
}
