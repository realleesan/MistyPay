import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface BankHubTokenData {
  accessToken: string;
  grantId: string;
  linkedAt: string;
}

@Injectable()
export class BankHubService {
  private readonly logger = new Logger(BankHubService.name);
  private readonly tokenFilePath: string;
  private readonly clientId: string;
  private readonly secretKey: string;
  private readonly apiUrl: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.tokenFilePath = path.join(process.cwd(), 'bankhub_tokens.json');
    this.clientId = this.configService.get<string>('BANKHUB_CLIENT_ID') || this.configService.get<string>('VIETQR_CLIENT_ID') || '';
    this.secretKey = this.configService.get<string>('BANKHUB_SECRET_KEY') || this.configService.get<string>('VIETQR_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('BANKHUB_API_URL', 'https://sandbox.bankhub.dev');
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
  }

  /**
   * Reads token data from persistent file
   */
  private readTokenData(): BankHubTokenData | null {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const data = fs.readFileSync(this.tokenFilePath, 'utf8');
        return JSON.parse(data) as BankHubTokenData;
      }
    } catch (error) {
      this.logger.error(`Failed to read BankHub token file: ${error.message}`);
    }
    return null;
  }

  /**
   * Writes token data to persistent file
   */
  private writeTokenData(data: BankHubTokenData): void {
    try {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      this.logger.error(`Failed to write BankHub token file: ${error.message}`);
    }
  }

  /**
   * Deletes the persistent token file
   */
  private deleteTokenData(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        fs.unlinkSync(this.tokenFilePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete BankHub token file: ${error.message}`);
    }
  }

  /**
   * Checks if BankHub integration is connected
   */
  public isConnected(): boolean {
    const tokens = this.readTokenData();
    return !!(tokens && tokens.accessToken);
  }

  /**
   * Disconnects BankHub connection
   */
  public disconnect(): { success: boolean } {
    this.deleteTokenData();
    this.logger.log('Disconnected BankHub integration.');
    return { success: true };
  }

  /**
   * Returns current connection status
   */
  public getStatus(): { connected: boolean; linkedAt?: string; grantId?: string } {
    const tokens = this.readTokenData();
    if (tokens) {
      return {
        connected: true,
        linkedAt: tokens.linkedAt,
        grantId: tokens.grantId,
      };
    }
    return { connected: false };
  }

  /**
   * Generates a grant token and returns the redirect link URL
   */
  public async generateGrantUrl(): Promise<{ grantToken: string; linkUrl: string }> {
    if (!this.clientId || !this.secretKey) {
      throw new Error('BankHub Client ID and Secret Key must be configured.');
    }

    const redirectUri = this.appUrl; // Whitelisted redirect in Cas dashboard
    const url = `${this.apiUrl}/grant/token`;

    this.logger.log(`Requesting grant token from ${url} with redirect ${redirectUri}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-secret-key': this.secretKey,
        'X-BankHub-Api-Version': '2023-01-01',
      },
      body: JSON.stringify({
        scopes: 'identity',
        redirectUri,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.errorCode) {
      const errorMsg = responseData.errorMessage || responseData.errorCode || 'Failed to generate grant token';
      this.logger.error(`BankHub Grant Token Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const grantToken = responseData.grantToken;
    const isSandbox = this.apiUrl.includes('sandbox');
    const linkBaseUrl = isSandbox ? 'https://dev.link.bankhub.dev' : 'https://link.cas.so';
    const linkUrl = `${linkBaseUrl}?grantToken=${grantToken}`;

    return { grantToken, linkUrl };
  }

  /**
   * Exchanges publicToken for accessToken and saves it
   */
  public async exchangePublicToken(publicToken: string): Promise<BankHubTokenData> {
    if (!this.clientId || !this.secretKey) {
      throw new Error('BankHub Client ID and Secret Key must be configured.');
    }

    const url = `${this.apiUrl}/grant/exchange`;
    this.logger.log(`Exchanging publicToken at ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-secret-key': this.secretKey,
        'X-BankHub-Api-Version': '2023-01-01',
      },
      body: JSON.stringify({
        publicToken,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.errorCode) {
      const errorMsg = responseData.errorMessage || responseData.errorCode || 'Failed to exchange public token';
      this.logger.error(`BankHub Exchange Token Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const tokenData: BankHubTokenData = {
      accessToken: responseData.accessToken,
      grantId: responseData.grantId,
      linkedAt: new Date().toISOString(),
    };

    this.writeTokenData(tokenData);
    this.logger.log(`BankHub access token saved successfully. Grant ID: ${tokenData.grantId}`);

    return tokenData;
  }

  /**
   * Resolves beneficiary account name
   */
  public async resolveBeneficiaryName(bankCode: string, accountNumber: string): Promise<string> {
    const tokens = this.readTokenData();
    if (!tokens || !tokens.accessToken) {
      this.logger.warn('No active BankHub access token. Cannot perform name lookup.');
      throw new Error('BankHub not connected. Please link your bank account in the Admin settings first.');
    }

    const endpoints = [
      'https://api.vietqr.io/v2/lookup',
      `${this.apiUrl}/payouts/account-lookup`,
      `${this.apiUrl}/transfer/account-lookup`,
      `${this.apiUrl}/payout/account-lookup`,
    ];

    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        this.logger.debug(`Attempting account lookup via: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': this.clientId,
            'x-secret-key': this.secretKey,
            'X-BankHub-Api-Version': '2023-01-01',
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({
            bin: bankCode,
            accountNumber,
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.code === '00' && data.data && data.data.accountName) {
          const name = data.data.accountName.toUpperCase().trim();
          this.logger.log(`Successfully resolved account name: ${name} via ${url}`);
          return name;
        }

        if (data.desc || data.errorMessage || data.errorCode) {
          throw new Error(data.desc || data.errorMessage || data.errorCode);
        }
      } catch (error) {
        this.logger.warn(`Lookup failed on ${url}: ${error.message}`);
        lastError = error;
      }
    }

    throw new Error(lastError ? lastError.message : 'Could not resolve beneficiary name. Please verify bank code and account number.');
  }

  /**
   * Initiates payout transfer via Cas / bankHub
   */
  public async initiatePayout(params: {
    amount: number;
    toBin: string;
    toAccountNumber: string;
    description: string;
  }): Promise<any> {
    const tokens = this.readTokenData();
    if (!tokens || !tokens.accessToken) {
      throw new Error('BankHub not connected. Please link your bank account in the Admin settings first.');
    }

    // Try both /payment-initiation and /transfer endpoints
    const endpoints = [
      `${this.apiUrl}/payment-initiation`,
      `${this.apiUrl}/transfer`,
    ];

    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        this.logger.log(`Attempting transfer request via: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': this.clientId,
            'x-secret-key': this.secretKey,
            'X-BankHub-Api-Version': '2023-01-01',
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({
            amount: params.amount,
            toBin: params.toBin,
            toAccountNumber: params.toAccountNumber,
            description: params.description,
          }),
        });

        const data = await response.json();

        if (response.ok && !data.errorCode) {
          this.logger.log(`Transfer request succeeded via ${url}: ${JSON.stringify(data)}`);
          return data;
        }

        const errMsg = data.errorMessage || data.errorCode || 'Transfer initiation failed';
        throw new Error(errMsg);
      } catch (error) {
        this.logger.error(`Transfer failed on ${url}: ${error.message}`);
        lastError = error;
      }
    }

    throw new Error(lastError ? lastError.message : 'Failed to initiate payout via BankHub.');
  }
}
