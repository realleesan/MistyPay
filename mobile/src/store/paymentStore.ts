import { create } from 'zustand';

export interface ScannedMerchant {
  merchantName: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  amount: number | null;
}

export interface PaymentQuote {
  quoteId: string;
  amountVnd: number;
  rate: number;
  serviceFee: number;
  networkFee: number;
  totalUsdt: number;
  expiresAt: string; // ISO String
  merchant: {
    name: string;
    bankName: string;
    accountNumber: string;
  };
}

export interface PaymentOrderDetails {
  id: string;
  orderCode: string;
  requiredUsdt: number;
  depositAddress: string;
  expiresAt: string; // ISO string
  paymentStatus: string;
  merchant: {
    name: string;
    bankName: string;
    accountNumber: string;
  };
}

interface PaymentState {
  scannedMerchant: ScannedMerchant | null;
  currentQuote: PaymentQuote | null;
  activePayment: PaymentOrderDetails | null;
  setScannedMerchant: (merchant: ScannedMerchant | null) => void;
  setCurrentQuote: (quote: PaymentQuote | null) => void;
  setActivePayment: (payment: PaymentOrderDetails | null) => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  scannedMerchant: null,
  currentQuote: null,
  activePayment: null,
  setScannedMerchant: (scannedMerchant) => set({ scannedMerchant }),
  setCurrentQuote: (currentQuote) => set({ currentQuote }),
  setActivePayment: (activePayment) => set({ activePayment }),
  clearPayment: () => set({ scannedMerchant: null, currentQuote: null, activePayment: null }),
}));
