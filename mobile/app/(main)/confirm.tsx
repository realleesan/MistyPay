import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function ConfirmScreen() {
  const router = useRouter();
  const { currentQuote } = usePaymentStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <ShieldCheck size={64} stroke="#10B981" style={{ marginBottom: 24 }} />
        
        <Text style={styles.title}>Confirm Transaction</Text>
        
        <Text style={styles.desc}>
          This screen will request secure PIN authentication to complete the payment. 
          This flow will be fully implemented in Sprint 3.
        </Text>

        {currentQuote && (
          <View style={styles.summaryBox}>
            <Text style={styles.label}>Total Payment Amount:</Text>
            <Text style={styles.value}>{currentQuote.totalUsdt.toFixed(2)} USDT</Text>
            <Text style={styles.subLabel}>~ {new Intl.NumberFormat('vi-VN').format(currentQuote.amountVnd)} VND</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(main)')}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 32,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
