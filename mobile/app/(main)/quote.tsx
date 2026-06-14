import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, RefreshCw, Landmark, User, DollarSign } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function QuoteScreen() {
  const router = useRouter();
  const { scannedMerchant, setCurrentQuote, currentQuote, clearPayment } = usePaymentStore();

  const [amountInput, setAmountInput] = useState('');
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [quoteExpired, setQuoteExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect back if no merchant scanned
  useEffect(() => {
    if (!scannedMerchant) {
      Alert.alert('Không có thông tin', 'Vui lòng quét mã QR trước.');
      router.replace('/(main)/scan');
      return;
    }

    // If amount is embedded in QR, pre-fill and auto-fetch quote
    if (scannedMerchant.amount) {
      const formatted = scannedMerchant.amount.toString();
      setAmountInput(formatted);
      fetchQuote(scannedMerchant.amount);
    }
  }, [scannedMerchant]);

  // Handle countdown timer
  useEffect(() => {
    if (currentQuote && countdown > 0 && !quoteExpired) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setQuoteExpired(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuote, countdown, quoteExpired]);

  // Request new quote from backend
  const fetchQuote = async (amount: number) => {
    if (!scannedMerchant) return;
    setIsFetchingQuote(true);
    setQuoteExpired(false);
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = (await api.post('/quotes', {
        merchantBankCode: scannedMerchant.bankCode,
        merchantAccountNumber: scannedMerchant.accountNumber,
        merchantName: scannedMerchant.merchantName,
        amountVnd: amount,
      })) as any;

      if (response && response.success && response.data) {
        setCurrentQuote(response.data);
      } else {
        throw new Error('Không nhận được dữ liệu báo giá từ hệ thống');
      }
    } catch (error: any) {
      console.error('Fetch Quote Error:', error);
      Alert.alert('Lỗi báo giá', error.message || 'Không thể lấy báo giá tỷ giá hiện tại.');
    } finally {
      setIsFetchingQuote(false);
    }
  };

  const handleGetQuotePress = () => {
    const numericAmount = parseFloat(amountInput.replace(/[^0-9]/g, ''));
    if (isNaN(numericAmount) || numericAmount < 1000) {
      Alert.alert('Số tiền không hợp lệ', 'Số tiền tối thiểu là 1.000 đ.');
      return;
    }
    fetchQuote(numericAmount);
  };

  const handleRefreshQuote = () => {
    const numericAmount = currentQuote ? currentQuote.amountVnd : parseFloat(amountInput.replace(/[^0-9]/g, ''));
    if (!isNaN(numericAmount)) {
      fetchQuote(numericAmount);
    }
  };

  const handleConfirmQuote = () => {
    if (quoteExpired) {
      Alert.alert('Báo giá hết hạn', 'Vui lòng cập nhật báo giá tỷ giá mới trước khi thanh toán.');
      return;
    }
    // Navigate to Confirm Screen (to be finalized in Sprint 3)
    router.push('/(main)/confirm');
  };

  const handleCancel = () => {
    clearPayment();
    router.replace('/(main)');
  };

  // Helper to format input as currency VND
  const formatVndDisplay = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(clean, 10)) + ' đ';
  };

  const handleAmountChange = (text: string) => {
    // Save clean digits to state
    const cleanDigits = text.replace(/[^0-9]/g, '');
    setAmountInput(cleanDigits);
    // Clear old quote if amount changes
    if (currentQuote) {
      setCurrentQuote(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  if (!scannedMerchant) return null;

  const displayAmount = amountInput ? formatVndDisplay(amountInput) : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <ArrowLeft size={24} stroke="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Merchant Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>THÔNG TIN CỬA HÀNG</Text>
            
            <View style={styles.merchantDetailRow}>
              <Landmark size={20} stroke="#3B82F6" style={styles.iconStyle} />
              <View>
                <Text style={styles.merchantLabel}>Ngân hàng thụ hưởng</Text>
                <Text style={styles.merchantVal}>{scannedMerchant.bankName}</Text>
                <Text style={styles.merchantSubVal}>STK: {scannedMerchant.accountNumber}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.merchantDetailRow}>
              <User size={20} stroke="#3B82F6" style={styles.iconStyle} />
              <View>
                <Text style={styles.merchantLabel}>Người thụ hưởng (Merchant)</Text>
                <Text style={styles.merchantVal}>{scannedMerchant.merchantName}</Text>
              </View>
            </View>
          </View>

          {/* Amount Input Section */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>SỐ TIỀN THANH TOÁN (VND)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.amountInput,
                  scannedMerchant.amount !== null && styles.amountInputDisabled,
                ]}
                placeholder="Nhập số tiền (VND)"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={
                  scannedMerchant.amount !== null
                    ? new Intl.NumberFormat('vi-VN').format(scannedMerchant.amount) + ' đ'
                    : displayAmount
                }
                onChangeText={handleAmountChange}
                editable={scannedMerchant.amount === null}
              />
            </View>

            {!currentQuote && scannedMerchant.amount === null && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGetQuotePress}
                disabled={isFetchingQuote || !amountInput}
              >
                {isFetchingQuote ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Xem báo giá tỷ giá</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Loading Quote State */}
          {isFetchingQuote && !currentQuote && (
            <View style={styles.quoteLoadingCard}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.quoteLoadingText}>Đang lấy báo giá tỷ giá mới nhất...</Text>
            </View>
          )}

          {/* Quote Details Display */}
          {currentQuote && (
            <View style={[styles.card, quoteExpired && styles.cardExpired]}>
              <View style={styles.quoteHeader}>
                <Text style={styles.cardSectionTitle}>BÁO GIÁ QUY ĐỔI USDT</Text>
                {quoteExpired ? (
                  <View style={styles.expiredTag}>
                    <Text style={styles.expiredTagText}>Hết hạn</Text>
                  </View>
                ) : (
                  <View style={styles.timerContainer}>
                    <Clock size={14} stroke="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={styles.timerText}>Hết hạn sau {countdown}s</Text>
                  </View>
                )}
              </View>

              {/* Exchange Rate Card */}
              <View style={styles.rateHighlightBox}>
                <DollarSign size={16} stroke="#3B82F6" />
                <Text style={styles.rateHighlightText}>
                  Tỷ giá hiện tại: 1 USDT = {new Intl.NumberFormat('vi-VN').format(currentQuote.rate)} VND
                </Text>
              </View>

              {/* Calculations table */}
              <View style={styles.feeBreakdown}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Số tiền quy đổi (VND / Rate)</Text>
                  <Text style={styles.feeValue}>
                    {((currentQuote.amountVnd / currentQuote.rate)).toFixed(2)} USDT
                  </Text>
                </View>

                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Phí dịch vụ (1.5%)</Text>
                  <Text style={styles.feeValue}>{currentQuote.serviceFee.toFixed(4)} USDT</Text>
                </View>

                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Phí Blockchain (TRON Network)</Text>
                  <Text style={styles.feeValue}>{currentQuote.networkFee.toFixed(2)} USDT</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.feeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text>
                  <Text style={styles.totalValue}>{currentQuote.totalUsdt.toFixed(2)} USDT</Text>
                </View>
              </View>

              {quoteExpired ? (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefreshQuote}
                  disabled={isFetchingQuote}
                >
                  {isFetchingQuote ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <>
                      <RefreshCw size={16} stroke="#3B82F6" style={{ marginRight: 8 }} />
                      <Text style={styles.refreshButtonText}>Cập nhật tỷ giá mới</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Floating Confirm Button at Bottom */}
        {currentQuote && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.confirmButton, quoteExpired && styles.confirmButtonDisabled]}
              onPress={handleConfirmQuote}
              disabled={quoteExpired}
            >
              <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
              <Text style={styles.cancelLinkText}>Huỷ giao dịch</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardExpired: {
    borderColor: '#EF4444',
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 16,
  },
  merchantDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  iconStyle: {
    marginRight: 16,
    marginTop: 2,
  },
  merchantLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  merchantVal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  merchantSubVal: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  inputContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
    height: 60,
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  amountInputDisabled: {
    color: '#94A3B8',
  },
  actionButton: {
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quoteLoadingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  quoteLoadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  expiredTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  rateHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 20,
  },
  rateHighlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60A5FA',
    marginLeft: 8,
  },
  feeBreakdown: {
    marginTop: 4,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  totalRow: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    height: 48,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  refreshButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  confirmButton: {
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#334155',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelLink: {
    alignItems: 'center',
    padding: 8,
  },
  cancelLinkText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});
