import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, X } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';
import { api } from '../../src/services/api';

export default function ConfirmScreen() {
  const router = useRouter();
  const { currentQuote, setActivePayment } = usePaymentStore();
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect if no quote is set
  useEffect(() => {
    if (!currentQuote) {
      Alert.alert('Missing Info', 'No active quote found. Please scan QR again.');
      router.replace('/(main)/scan');
    }
  }, [currentQuote]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

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
      console.error('Payment Error:', error);
      Alert.alert('Payment Failed', error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuote) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft size={24} stroke="#FFFFFF" />
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

        {/* PIN Dots Display */}
        <View style={styles.pinDotsContainer}>
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
        </View>

        {/* Loading indicator */}
        {isSubmitting ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Verifying secure payment transaction...</Text>
          </View>
        ) : (
          <View style={{ height: 40 }} />
        )}

        {/* Keypad Grid */}
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(num)}
                disabled={isSubmitting}
              >
                <Text style={styles.keypadText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(num)}
                disabled={isSubmitting}
              >
                <Text style={styles.keypadText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(num)}
                disabled={isSubmitting}
              >
                <Text style={styles.keypadText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            <View style={styles.keypadButtonPlaceholder} />
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleKeyPress('0')}
              disabled={isSubmitting}
            >
              <Text style={styles.keypadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={handleDelete}
              disabled={isSubmitting}
            >
              <X size={24} stroke="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  summaryVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  totalLabel: {
    color: '#FFFFFF',
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
    borderColor: '#334155',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: '#3B82F6',
    fontSize: 13,
    marginLeft: 8,
  },
  keypad: {
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 'auto',
    marginBottom: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  keypadButton: {
    flex: 1,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    marginHorizontal: 8,
    backgroundColor: '#1E293B',
  },
  keypadButtonPlaceholder: {
    flex: 1,
    marginHorizontal: 8,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
