import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Req, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { GetAdmin } from './decorators/get-admin.decorator';
import { Request } from 'express';
import { BankHubService } from '../bankhub/bankhub.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly bankHubService: BankHubService,
  ) {}

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

  // BankHub (Cas) Integration Endpoints
  @Get('bankhub/status')
  @UseGuards(AdminAuthGuard)
  async getBankHubStatus() {
    return this.bankHubService.getStatus();
  }

  @Post('bankhub/grant-url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async getBankHubGrantUrl() {
    return this.bankHubService.generateGrantUrl();
  }

  @Post('bankhub/exchange')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async exchangeBankHubToken(@Body() body: { publicToken: string }) {
    return this.bankHubService.exchangePublicToken(body.publicToken);
  }

  @Post('bankhub/disconnect')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async disconnectBankHub() {
    return this.bankHubService.disconnect();
  }
}
