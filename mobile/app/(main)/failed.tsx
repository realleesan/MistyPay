import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XCircle, Home } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function FailedScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason: string }>();
  const { clearPayment } = usePaymentStore();

  const handleReturnHome = () => {
    clearPayment();
    router.replace('/(main)');
  };

  let title = 'Transaction Failed';
  let desc = 'The payment process was cancelled or an error occurred during verification.';

  if (reason === 'EXPIRED') {
    title = 'Transaction Expired';
    desc = 'The 15-minute payment window has expired or this deposit request was cancelled. No USDT transfer was detected in time.';
  } else if (reason === 'UNDERPAID') {
    title = 'Payment Underpaid';
    desc = 'We detected your transaction, but the USDT amount sent was lower than required. This order is queued for manual review.';
  } else if (reason === 'OVERPAID') {
    title = 'Payment Overpaid';
    desc = 'We detected your transaction, but the USDT amount sent was higher than required. This order is queued for manual review.';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Glow Failed Icon */}
        <View style={styles.iconGlowWrapper}>
          <XCircle size={72} stroke="#EF4444" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            If you have already sent USDT, please verify your transaction hash on the TRON network, or contact support with your order code.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.button} onPress={handleReturnHome}>
          <Home size={18} stroke="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconGlowWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
