import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class QrService {
  // Mapping of common Vietnamese NAPAS BIN codes to Bank Names
  private readonly bankBinMap: Record<string, string> = {
    '970422': 'MB Bank',
    '970436': 'Vietcombank',
    '970407': 'Techcombank',
    '970415': 'VietinBank',
    '970418': 'BIDV',
    '970405': 'Agribank',
    '970416': 'ACB',
    '970432': 'VPBank',
    '970403': 'Sacombank',
    '970423': 'TPBank',
    '970437': 'HDBank',
    '970441': 'VIB',
    '970443': 'SHB',
    '970426': 'MSB',
    '970428': 'Nam A Bank',
    '970425': 'ABBANK',
    '970429': 'Saigonbank',
    '970419': 'NCB',
    '970448': 'PVcomBank',
    '970452': 'Kienlongbank',
    '970454': 'BVBank',
    '970457': 'Woori Bank',
    '970458': 'Shinhan Bank',
  };

  /**
   * Helper to parse standard EMVCo tag-length-value (TLV) format.
   */
  private parseTLV(str: string): Record<string, string> {
    const result: Record<string, string> = {};
    let offset = 0;

    while (offset < str.length) {
      if (offset + 4 > str.length) break;

      const tag = str.slice(offset, offset + 2);
      const lengthStr = str.slice(offset + 2, offset + 4);
      const length = parseInt(lengthStr, 10);

      if (isNaN(length)) {
        break;
      }

      offset += 4;
      if (offset + length > str.length) {
        break;
      }

      const value = str.slice(offset, offset + length);
      result[tag] = value;
      offset += length;
    }

    return result;
  }

  /**
   * Parses VietQR EMVCo content and extracts merchant information.
   */
  parseVietQr(qrContent: string) {
    if (!qrContent || qrContent.length < 10) {
      throw new BadRequestException('Invalid QR code: Content is empty or too short');
    }

    try {
      const rootTags = this.parseTLV(qrContent);

      // 1. Validate Payload Format Indicator (Tag 00 should be "01")
      if (rootTags['00'] !== '01') {
        throw new BadRequestException('Invalid QR code: Missing payload format indicator');
      }

      // 2. Extract Merchant Account Info (Tag 38 is typically used for VietQR)
      const merchantAccountInfoStr = rootTags['38'];
      if (!merchantAccountInfoStr) {
        throw new BadRequestException('Invalid QR code: Missing merchant account information (Tag 38)');
      }

      const merchantAccountTags = this.parseTLV(merchantAccountInfoStr);

      // Check for consumer banking detail nesting (Tag 01 inside Tag 38)
      const consumerBankStr = merchantAccountTags['01'];
      if (!consumerBankStr) {
        throw new BadRequestException('Invalid QR code: Missing bank routing info (Tag 38 -> Tag 01)');
      }

      const bankInfoTags = this.parseTLV(consumerBankStr);
      
      const bankBin = bankInfoTags['00']; // Acquiring bank BIN code
      const accountNumber = bankInfoTags['01']; // Merchant Account Number

      if (!bankBin || !accountNumber) {
        throw new BadRequestException('Invalid QR code: Missing bank BIN or account number');
      }

      // Resolve bank name
      const bankName = this.bankBinMap[bankBin] || `Bank (BIN: ${bankBin})`;

      // 3. Extract Merchant Name (Tag 59)
      const merchantName = rootTags['59'] || 'Unknown Merchant';

      // 4. Extract Amount (Tag 54) if exists
      let amount: number | null = null;
      if (rootTags['54']) {
        const parsedAmount = parseFloat(rootTags['54']);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          amount = parsedAmount;
        }
      }

      return {
        merchantName,
        bankName,
        bankCode: bankBin,
        accountNumber,
        amount,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to parse QR code: ${error.message}`);
    }
  }
}
