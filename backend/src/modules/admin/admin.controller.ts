import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Req, Query, Header } from '@nestjs/common';
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

  @Get('bankhub-link')
  @Header('Content-Type', 'text/html')
  getBankHubLinkPage() {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MistyPay - Liên Kết Ngân Hàng</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(17, 24, 39, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
            --success-color: #10b981;
            --error-color: #ef4444;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            background-color: var(--bg-color);
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 40%);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .container {
            width: 100%;
            max-width: 460px;
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 40px 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
          }

          .header {
            text-align: center;
            margin-bottom: 32px;
          }

          .logo {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .subtitle {
            font-size: 14px;
            color: var(--text-muted);
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }

          input {
            width: 100%;
            height: 48px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-main);
            padding: 0 16px;
            font-size: 15px;
            outline: none;
            transition: all 0.2s ease;
          }

          input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }

          .btn {
            width: 100%;
            height: 50px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
          }

          .btn-primary {
            background: var(--primary-color);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-primary:hover {
            background: var(--primary-hover);
          }

          .btn-danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-color);
            border: 1px solid rgba(239, 68, 68, 0.2);
          }

          .btn-danger:hover {
            background: rgba(239, 68, 68, 0.2);
          }

          .status-card {
            border-radius: 16px;
            padding: 24px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            margin-bottom: 24px;
          }

          .status-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--text-muted);
          }

          .status-dot.connected {
            background: var(--success-color);
            box-shadow: 0 0 10px var(--success-color);
          }

          .status-dot.disconnected {
            background: var(--error-color);
            box-shadow: 0 0 10px var(--error-color);
          }

          .status-title {
            font-weight: 600;
            font-size: 16px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 10px;
          }

          .info-label {
            color: var(--text-muted);
          }

          .info-val {
            font-weight: 500;
            word-break: break-all;
            text-align: right;
            max-width: 60%;
          }

          .alert {
            padding: 16px;
            border-radius: 12px;
            font-size: 14px;
            margin-bottom: 24px;
            display: none;
            line-height: 1.5;
          }

          .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
          }

          .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #fca5a5;
          }

          .alert-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: #93c5fd;
          }

          .hidden {
            display: none !important;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MistyPay Link</div>
            <div class="subtitle">Công cụ liên kết ngân hàng qua Cas/BankHub</div>
          </div>

          <div id="alertBox" class="alert"></div>

          <!-- MÀN HÌNH ĐĂNG NHẬP -->
          <div id="loginScreen" class="hidden">
            <div class="form-group">
              <label>Admin Email</label>
              <input type="email" id="email" value="admin@mistypay.com" placeholder="Nhập email admin">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="password" value="password123" placeholder="Nhập mật khẩu">
            </div>
            <button id="loginBtn" class="btn btn-primary" onclick="handleLogin()">
              Đăng Nhập
            </button>
          </div>

          <!-- MÀN HÌNH QUẢN LÝ LIÊN KẾT -->
          <div id="mainScreen" class="hidden">
            <div class="status-card">
              <div class="status-header">
                <div id="statusDot" class="status-dot"></div>
                <div id="statusText" class="status-title">Đang kiểm tra kết nối...</div>
              </div>
              
              <div id="bankDetails" class="hidden">
                <div class="info-row">
                  <span class="info-label">Grant ID</span>
                  <span id="valGrantId" class="info-val">-</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày liên kết</span>
                  <span id="valLinkedAt" class="info-val">-</span>
                </div>
              </div>
            </div>

            <button id="connectBtn" class="btn btn-primary hidden" onclick="startConnect()">
              Liên Kết Ngân Hàng (Cas)
            </button>
            
            <button id="disconnectBtn" class="btn btn-danger hidden" onclick="handleDisconnect()">
              Ngắt Kết Nối
            </button>
          </div>
        </div>

        <script>
          const API_BASE = '/api/v1';
          const alertBox = document.getElementById('alertBox');

          function showAlert(message, type = 'success') {
            alertBox.className = 'alert alert-' + type;
            alertBox.innerHTML = message;
            alertBox.style.display = 'block';
          }

          function hideAlert() {
            alertBox.style.display = 'none';
          }

          function getHeaders() {
            const token = localStorage.getItem('admin_token');
            return {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            };
          }

          async function checkConnection() {
            const token = localStorage.getItem('admin_token');
            if (!token) {
              showLogin();
              return;
            }

            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainScreen').classList.remove('hidden');

            try {
              const res = await fetch(API_BASE + '/admin/bankhub/status', {
                headers: getHeaders()
              });

              if (res.status === 401) {
                // Token hết hạn hoặc sai
                localStorage.removeItem('admin_token');
                showLogin();
                return;
              }

              const data = await res.json();
              const statusDot = document.getElementById('statusDot');
              const statusText = document.getElementById('statusText');
              const bankDetails = document.getElementById('bankDetails');
              const connectBtn = document.getElementById('connectBtn');
              const disconnectBtn = document.getElementById('disconnectBtn');

              if (data && data.connected) {
                statusDot.className = 'status-dot connected';
                statusText.innerText = 'Đã Kết Nối Ngân Hàng';
                
                document.getElementById('valGrantId').innerText = data.grantId || 'N/A';
                document.getElementById('valLinkedAt').innerText = data.linkedAt ? new Date(data.linkedAt).toLocaleString('vi-VN') : 'N/A';
                
                bankDetails.classList.remove('hidden');
                connectBtn.classList.add('hidden');
                disconnectBtn.classList.remove('hidden');
              } else {
                statusDot.className = 'status-dot disconnected';
                statusText.innerText = 'Chưa Kết Nối Ngân Hàng';
                bankDetails.classList.add('hidden');
                connectBtn.classList.remove('hidden');
                disconnectBtn.classList.add('hidden');
              }
            } catch (err) {
              showAlert('Lỗi kiểm tra kết nối: ' + err.message, 'danger');
            }
          }

          function showLogin() {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('mainScreen').classList.add('hidden');
          }

          async function handleLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Đang đăng nhập...';
            hideAlert();

            try {
              const res = await fetch(API_BASE + '/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
              }

              localStorage.setItem('admin_token', data.accessToken);
              await checkConnection();
            } catch (err) {
              showAlert(err.message, 'danger');
            } finally {
              btn.disabled = false;
              btn.innerHTML = 'Đăng Nhập';
            }
          }

          async function startConnect() {
            const btn = document.getElementById('connectBtn');
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Đang tạo liên kết...';
            hideAlert();

            try {
              const res = await fetch(API_BASE + '/admin/bankhub/grant-url', {
                method: 'POST',
                headers: getHeaders()
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.message || 'Không thể tạo link liên kết');
              }

              if (data.linkUrl) {
                window.location.href = data.linkUrl;
              } else {
                throw new Error('Không nhận được linkUrl từ Cas');
              }
            } catch (err) {
              showAlert(err.message, 'danger');
              btn.disabled = false;
              btn.innerHTML = 'Liên Kết Ngân Hàng (Cas)';
            }
          }

          async function handleDisconnect() {
            if (!confirm('Bạn có chắc chắn muốn ngắt kết nối ngân hàng không?')) return;
            
            const btn = document.getElementById('disconnectBtn');
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Đang ngắt kết nối...';
            hideAlert();

            try {
              const res = await fetch(API_BASE + '/admin/bankhub/disconnect', {
                method: 'POST',
                headers: getHeaders()
              });

              if (!res.ok) {
                throw new Error('Ngắt kết nối thất bại');
              }

              showAlert('Đã ngắt kết nối ngân hàng thành công.');
              await checkConnection();
            } catch (err) {
              showAlert(err.message, 'danger');
            } finally {
              btn.disabled = false;
              btn.innerHTML = 'Ngắt Kết Nối';
            }
          }

          // Xử lý khi nhận redirect chứa publicToken từ Cas
          async function handleOAuthCallback() {
            const params = new URLSearchParams(window.location.search);
            const publicToken = params.get('publicToken');
            
            if (publicToken) {
              // Xóa query params trên thanh địa chỉ cho đẹp
              window.history.replaceState({}, document.title, window.location.pathname);
              
              const token = localStorage.getItem('admin_token');
              if (!token) {
                showAlert('Tìm thấy Token liên kết nhưng bạn chưa đăng nhập Admin. Hãy đăng nhập để hoàn tất.', 'info');
                localStorage.setItem('pending_public_token', publicToken);
                showLogin();
                return;
              }

              showAlert('Đang hoàn tất liên kết ngân hàng của bạn...', 'info');

              try {
                const res = await fetch(API_BASE + '/admin/bankhub/exchange', {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify({ publicToken })
                });

                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.message || 'Không thể xác thực publicToken');
                }

                showAlert('🎉 Chúc mừng! Tài khoản ngân hàng của bạn đã được kết nối thành công và lưu trữ an toàn.');
              } catch (err) {
                showAlert('Lỗi đồng bộ token: ' + err.message, 'danger');
              }
            }

            // Kiểm tra xem có token đang chờ đăng nhập không
            const pendingToken = localStorage.getItem('pending_public_token');
            if (pendingToken && localStorage.getItem('admin_token')) {
              localStorage.removeItem('pending_public_token');
              showAlert('Đang hoàn tất liên kết ngân hàng của bạn...', 'info');
              try {
                const res = await fetch(API_BASE + '/admin/bankhub/exchange', {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify({ publicToken: pendingToken })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                showAlert('🎉 Chúc mừng! Tài khoản ngân hàng của bạn đã được kết nối thành công.');
              } catch (err) {
                showAlert('Lỗi đồng bộ token: ' + err.message, 'danger');
              }
            }

            await checkConnection();
          }

          window.onload = handleOAuthCallback;
        </script>
      </body>
      </html>
    `;
  }
}
