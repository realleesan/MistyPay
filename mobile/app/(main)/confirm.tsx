import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';
import { api } from '../../src/services/api';

export default function ConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentQuote, setActivePayment } = usePaymentStore();
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Auto-redirect if no quote is set
  useEffect(() => {
    if (!currentQuote) {
      Alert.alert('Missing Info', 'No active quote found. Please scan QR again.');
      router.replace('/(main)/scan');
    }
  }, [currentQuote]);

  // Focus the input on screen mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Submit payment order when PIN reaches 6 digits
  useEffect(() => {
    if (pin.length === 6) {
      submitPayment();
    }
  }, [pin]);

  const submitPayment = async () => {
    if (!currentQuote) return;
    setIsSubmitting(true);

    try {
      const response = (await api.post('/payments', {
        quoteId: currentQuote.quoteId,
        pin,
      })) as any;

      if (response && response.success && response.data) {
        // Save the active payment details
        setActivePayment(response.data);
        // Navigate to payment page
        router.replace('/(main)/payment');
      } else {
        throw new Error('Failed to create payment order.');
      }
    } catch (error: any) {
      // Clear PIN on error
      setPin('');
      inputRef.current?.focus();
      console.error('Payment Error:', error);
      Alert.alert('Payment Failed', error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuote) return null;

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { height: 56 + insets.top, paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft size={24} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <ShieldCheck size={48} stroke="#3B82F6" style={{ marginBottom: 12 }} />
        
        <Text style={styles.title}>Enter Transaction PIN</Text>
        <Text style={styles.desc}>Confirm payment of {currentQuote.totalUsdt.toFixed(2)} USDT to merchant</Text>

        {/* Transaction Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Merchant</Text>
            <Text style={styles.summaryVal}>{currentQuote.merchant.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bank Details</Text>
            <Text style={styles.summaryVal}>{currentQuote.merchant.bankName} - {currentQuote.merchant.accountNumber}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total USDT</Text>
            <Text style={styles.totalValue}>{currentQuote.totalUsdt.toFixed(2)} USDT</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.subLabel}>~ {new Intl.NumberFormat('vi-VN').format(currentQuote.amountVnd)} VND</Text>
          </View>
        </View>

        {/* Hidden TextInput for native keyboard */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '');
            if (cleaned.length <= 6) {
              setPin(cleaned);
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry={true}
          style={styles.hiddenTextInput}
          pointerEvents="none"
        />

        {/* PIN Dots Display */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.pinDotsContainer}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  hasDigit && styles.pinDotFilled,
                ]}
              />
            );
          })}
        </TouchableOpacity>

        {/* Loading indicator */}
        {isSubmitting ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Verifying secure payment transaction...</Text>
          </View>
        ) : (
          <View style={{ height: 40 }} />
        )}
      </View>
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
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  summaryVal: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '800',
  },
  subLabel: {
    color: '#64748B',
    fontSize: 12,
    width: '100%',
    textAlign: 'right',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    marginLeft: 8,
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
