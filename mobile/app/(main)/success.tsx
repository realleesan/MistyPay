import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, Home } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function SuccessScreen() {
  const router = useRouter();
  const { activePayment, clearPayment } = usePaymentStore();

  const handleReturnHome = () => {
    clearPayment();
    router.replace('/(main)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Glow Success Icon */}
        <View style={styles.iconGlowWrapper}>
          <CheckCircle2 size={72} stroke="#10B981" />
        </View>

        <Text style={styles.title}>Payment Success!</Text>
        <Text style={styles.desc}>
          USDT transaction detected and verified successfully on the TRON blockchain.
        </Text>

        {/* Transaction Summary Card */}
        {activePayment && (
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Order Code</Text>
              <Text style={styles.receiptVal}>{activePayment.orderCode}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>USDT Transferred</Text>
              <Text style={styles.receiptValHighlight}>{activePayment.requiredUsdt.toFixed(2)} USDT</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Merchant Name</Text>
              <Text style={styles.receiptVal}>{activePayment.merchant.name}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Merchant Bank</Text>
              <Text style={styles.receiptVal}>{activePayment.merchant.bankName}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Account Number</Text>
              <Text style={styles.receiptVal}>{activePayment.merchant.accountNumber}</Text>
            </View>
          </View>
        )}

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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
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
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  receiptLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  receiptVal: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  receiptValHighlight: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
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
