import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Clipboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Copy, Check, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { usePaymentStore } from '../../src/store/paymentStore';
import { api } from '../../src/services/api';

export default function PaymentScreen() {
  const router = useRouter();
  const { activePayment, clearPayment } = usePaymentStore();
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize countdown timer and status polling
  useEffect(() => {
    if (!activePayment) {
      Alert.alert('Error', 'No active payment found.');
      router.replace('/(main)');
      return;
    }

    // Calculate initial remaining seconds
    const expiry = new Date(activePayment.expiresAt).getTime();
    const now = new Date().getTime();
    const diffSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
    setTimeLeft(diffSeconds);

    // 1. Countdown timer interval
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handlePaymentExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Poll payment status interval (every 5 seconds)
    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    // Initial check
    checkPaymentStatus();

    return () => {
      cleanupIntervals();
    };
  }, [activePayment]);

  const cleanupIntervals = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handlePaymentExpired = () => {
    cleanupIntervals();
    router.replace('/(main)/failed');
  };

  const checkPaymentStatus = async () => {
    if (!activePayment || isCheckingStatus) return;
    setIsCheckingStatus(true);

    try {
      const response = (await api.get(`/payments/${activePayment.id}/status`)) as any;
      if (response && response.success && response.data) {
        const status = response.data.paymentStatus;
        if (status === 'USDT_DETECTED' || status === 'USDT_CONFIRMED' || status === 'SUCCESS') {
          cleanupIntervals();
          router.replace('/(main)/success');
        } else if (status === 'EXPIRED') {
          handlePaymentExpired();
        }
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyAddress = () => {
    if (!activePayment) return;
    Clipboard.setString(activePayment.depositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyAmount = () => {
    if (!activePayment) return;
    Clipboard.setString(activePayment.requiredUsdt.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'If you have already sent USDT, please wait on this screen. Cancelling will discard this session. Are you sure?',
      [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            cleanupIntervals();
            clearPayment();
            router.replace('/(main)');
          },
        },
      ]
    );
  };

  if (!activePayment) return null;

  // Format time remaining MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate QR Code image link
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    activePayment.depositAddress
  )}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <ArrowLeft size={24} stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>USDT Deposit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Network Banner */}
        <View style={styles.networkBanner}>
          <Text style={styles.networkBannerText}>TRON Network (TRC-20) only</Text>
          <Text style={styles.networkBannerSub}>Sending other tokens or on other networks will result in permanent loss.</Text>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Clock size={20} stroke="#F59E0B" style={{ marginRight: 8 }} />
          <Text style={styles.timerLabel}>Time remaining: </Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
          </View>
          <Text style={styles.qrHelperText}>Scan this QR code from your crypto wallet to pay</Text>
        </View>

        {/* Payment Details Box */}
        <View style={styles.detailsCard}>
          {/* Amount Row */}
          <View style={styles.detailRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>USDT AMOUNT TO SEND</Text>
              <Text style={styles.amountText}>{activePayment.requiredUsdt.toFixed(2)} USDT</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyAmount}>
              {copiedAmount ? (
                <Check size={20} stroke="#10B981" />
              ) : (
                <Copy size={20} stroke="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Address Row */}
          <View style={styles.detailRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.detailLabel}>DEPOSIT ADDRESS (TRC-20)</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {activePayment.depositAddress}
              </Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
              {copiedAddress ? (
                <Check size={20} stroke="#10B981" />
              ) : (
                <Copy size={20} stroke="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Polling Indicator */}
        <View style={styles.pollingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 10 }} />
          <Text style={styles.pollingText}>Waiting for blockchain transaction detection...</Text>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel & Return Home</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  networkBanner: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  networkBannerText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  networkBannerSub: {
    color: '#FCA5A5',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  timerLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  timerText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrHelperText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  amountText: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '800',
  },
  addressText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  pollingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pollingText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '500',
  },
  cancelButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
