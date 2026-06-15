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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, RefreshCw, Landmark, User, DollarSign } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function QuoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scannedMerchant, setCurrentQuote, currentQuote, clearPayment } = usePaymentStore();

  const [amountInput, setAmountInput] = useState('');
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [quoteExpired, setQuoteExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect back if no merchant scanned
  useEffect(() => {
    if (!scannedMerchant) {
      Alert.alert('Missing Info', 'Please scan a QR code first.');
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
        throw new Error('Failed to retrieve quote details from the server');
      }
    } catch (error: any) {
      console.error('Fetch Quote Error:', error);
      Alert.alert('Quote Error', error.message || 'Could not fetch current exchange rate quote.');
    } finally {
      setIsFetchingQuote(false);
    }
  };

  const handleGetQuotePress = () => {
    const numericAmount = parseFloat(amountInput.replace(/[^0-9]/g, ''));
    if (isNaN(numericAmount) || numericAmount < 1000) {
      Alert.alert('Invalid Amount', 'Minimum transaction amount is 1,000 VND.');
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
      Alert.alert('Quote Expired', 'Please refresh to get a new quote before proceeding.');
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
    return new Intl.NumberFormat('vi-VN').format(parseInt(clean, 10)) + ' VND';
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
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { height: 56 + insets.top, paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <ArrowLeft size={24} stroke="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Merchant Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>MERCHANT DETAILS</Text>
            
            <View style={styles.merchantDetailRow}>
              <Landmark size={20} stroke="#3B82F6" style={styles.iconStyle} />
              <View>
                <Text style={styles.merchantLabel}>Beneficiary Bank</Text>
                <Text style={styles.merchantVal}>{scannedMerchant.bankName}</Text>
                <Text style={styles.merchantSubVal}>Account: {scannedMerchant.accountNumber}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.merchantDetailRow}>
              <User size={20} stroke="#3B82F6" style={styles.iconStyle} />
              <View>
                <Text style={styles.merchantLabel}>Beneficiary Name (Merchant)</Text>
                <Text style={styles.merchantVal}>{scannedMerchant.merchantName}</Text>
              </View>
            </View>
          </View>

          {/* Amount Input Section */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>PAYMENT AMOUNT (VND)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.amountInput,
                  scannedMerchant.amount !== null && styles.amountInputDisabled,
                ]}
                placeholder="Enter amount (VND)"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={
                  scannedMerchant.amount !== null
                    ? new Intl.NumberFormat('vi-VN').format(scannedMerchant.amount) + ' VND'
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
                  <Text style={styles.actionButtonText}>Get Live Quote</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Loading Quote State */}
          {isFetchingQuote && !currentQuote && (
            <View style={styles.quoteLoadingCard}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.quoteLoadingText}>Fetching latest exchange rate quote...</Text>
            </View>
          )}

          {/* Quote Details Display */}
          {currentQuote && (
            <View style={[styles.card, quoteExpired && styles.cardExpired]}>
              <View style={styles.quoteHeader}>
                <Text style={styles.cardSectionTitle}>USDT CONVERSION QUOTE</Text>
                {quoteExpired ? (
                  <View style={styles.expiredTag}>
                    <Text style={styles.expiredTagText}>Expired</Text>
                  </View>
                ) : (
                  <View style={styles.timerContainer}>
                    <Clock size={14} stroke="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={styles.timerText}>Expires in {countdown}s</Text>
                  </View>
                )}
              </View>

              {/* Exchange Rate Card */}
              <View style={styles.rateHighlightBox}>
                <DollarSign size={16} stroke="#3B82F6" />
                <Text style={styles.rateHighlightText}>
                  Current Rate: 1 USDT = {new Intl.NumberFormat('vi-VN').format(currentQuote.rate)} VND
                </Text>
              </View>

              {/* Calculations table */}
              <View style={styles.feeBreakdown}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Converted Amount (VND / Rate)</Text>
                  <Text style={styles.feeValue}>
                    {((currentQuote.amountVnd / currentQuote.rate)).toFixed(2)} USDT
                  </Text>
                </View>

                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Service Fee (1.5%)</Text>
                  <Text style={styles.feeValue}>{currentQuote.serviceFee.toFixed(4)} USDT</Text>
                </View>

                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Network Fee (TRON Blockchain)</Text>
                  <Text style={styles.feeValue}>{currentQuote.networkFee.toFixed(2)} USDT</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.feeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>TOTAL PAYMENT</Text>
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
                      <Text style={styles.refreshButtonText}>Refresh Quote</Text>
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
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
              <Text style={styles.cancelLinkText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    color: '#0F172A',
  },
  merchantSubVal: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 60,
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  amountInputDisabled: {
    color: '#64748B',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  quoteLoadingText: {
    color: '#64748B',
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
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    marginBottom: 20,
  },
  rateHighlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
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
    color: '#64748B',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRow: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    height: 48,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  refreshButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#CBD5E1',
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
