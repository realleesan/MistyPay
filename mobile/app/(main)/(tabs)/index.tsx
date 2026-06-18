import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { usePaymentStore, PaymentOrderDetails } from '../../../src/store/paymentStore';
import { Scan, History, User, CreditCard, RefreshCcw, Landmark, Clock, ScanFace } from 'lucide-react-native';
import { api } from '../../../src/services/api';
import * as SecureStore from 'expo-secure-store';
import BottomSheet from '../../../src/components/ui/BottomSheet';

interface SimplePaymentItem {
  id: string;
  orderCode: string;
  amountVnd: number;
  requiredUsdt: number;
  paymentStatus: string;
  merchant: {
    name: string;
  };
  createdAt: string;
  expiresAt: string;
  depositAddress: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { setActivePayment } = usePaymentStore();

  const [rate, setRate] = useState<number>(25600);
  const [rateLoading, setRateLoading] = useState(false);
  const [payments, setPayments] = useState<SimplePaymentItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showEkycPrompt, setShowEkycPrompt] = useState(false);

  useEffect(() => {
    const checkEkycPrompt = async () => {
      if (!user || !user.email) return;
      try {
        const safeEmail = user.email.replace(/[^a-zA-Z0-9._-]/g, '_');
        const enabled = await SecureStore.getItemAsync(`ekyc_enabled_${safeEmail}`);
        if (enabled === 'true') return;

        const snoozeUntilStr = await SecureStore.getItemAsync(`ekyc_snooze_${safeEmail}`);
        if (snoozeUntilStr) {
          const snoozeUntil = parseInt(snoozeUntilStr, 10);
          if (Date.now() < snoozeUntil) {
            return; // Prompt is currently snoozed
          }
        }

        // Show prompt if not enabled and not currently snoozed
        setShowEkycPrompt(true);
      } catch (e) {
        console.warn('Failed to check eKYC promo status:', e);
      }
    };

    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        checkEkycPrompt();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const handleSnoozeEkyc = async () => {
    if (!user || !user.email) return;
    try {
      const safeEmail = user.email.replace(/[^a-zA-Z0-9._-]/g, '_');
      const snoozeUntil = Date.now() + 5 * 24 * 60 * 60 * 1000;
      await SecureStore.setItemAsync(`ekyc_snooze_${safeEmail}`, String(snoozeUntil));
      setShowEkycPrompt(false);
    } catch (e) {
      console.error('Failed to set eKYC snooze:', e);
    }
  };

  const handleSetUpEkyc = () => {
    setShowEkycPrompt(false);
    router.push('/(main)/ekyc-setup');
  };

  const fetchCurrentRate = async () => {
    setRateLoading(true);
    try {
      const response = (await api.get('/rates/current')) as any;
      if (response && response.success && response.data) {
        setRate(response.data.rate);
      }
    } catch (error) {
      console.error('Fetch rate error on HomeScreen:', error);
    } finally {
      setRateLoading(false);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const response = (await api.get('/payments')) as any;
      if (response && response.success && response.data) {
        // Only keep the top 3 most recent
        setPayments(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Fetch recent payments error on HomeScreen:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadAllData = async () => {
    if (!isAuthenticated) return;
    await Promise.all([fetchCurrentRate(), fetchRecentPayments()]);
  };

  // Re-fetch data whenever home screen gets focused
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadAllData();
      }
    }, [isAuthenticated])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatUsdt = (num: number) => {
    return `${Number(num).toFixed(2)} USDT`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return { label: 'Completed', color: '#16A34A', bg: '#DCFCE7' };
      case 'WAITING_USDT':
        return { label: 'Pending', color: '#D97706', bg: '#FEF3C7' };
      case 'USDT_DETECTED':
      case 'USDT_CONFIRMED':
        return { label: 'Processing', color: '#2563EB', bg: '#DBEAFE' };
      case 'EXPIRED':
        return { label: 'Expired', color: '#64748B', bg: '#F1F5F9' };
      default:
        return { label: status, color: '#DC2626', bg: '#FEE2E2' };
    }
  };

  const handleTransactionPress = (item: SimplePaymentItem) => {
    if (item.paymentStatus === 'WAITING_USDT') {
      const orderDetails: PaymentOrderDetails = {
        id: item.id,
        orderCode: item.orderCode,
        requiredUsdt: item.requiredUsdt,
        depositAddress: item.depositAddress,
        expiresAt: item.expiresAt,
        paymentStatus: item.paymentStatus,
        merchant: {
          name: item.merchant.name,
          bankName: '',
          accountNumber: '',
        },
      };
      setActivePayment(orderDetails);
      router.push('/(main)/payment');
    } else {
      // Go to history screen to see details in full history
      router.push('/(main)/history');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Header section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.nameText}>{user?.displayName || 'Traveler'}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(main)/profile')}
            activeOpacity={0.7}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <User size={24} stroke="#2563EB" />
            )}
          </TouchableOpacity>
        </View>

        {/* Exchange Rate Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Rate</Text>
            <TouchableOpacity 
              style={styles.rateUpdateBadge} 
              onPress={fetchCurrentRate}
              disabled={rateLoading}
            >
              {rateLoading ? (
                <ActivityIndicator size="small" color="#16A34A" style={{ marginRight: 4 }} />
              ) : (
                <RefreshCcw size={12} stroke="#16A34A" style={styles.rotateIcon} />
              )}
              <Text style={styles.rateUpdateText}>Live</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.rateText}>1 USDT = {rate.toLocaleString('vi-VN')} VND</Text>
          <Text style={styles.rateHelper}>Updated just now • Travel exchange rate</Text>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/(main)/scan')}
          activeOpacity={0.8}
        >
          <Scan size={24} stroke="#FFFFFF" style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/history')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic transaction list */}
        {paymentsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={48} stroke="#94A3B8" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No payments yet</Text>
            <Text style={styles.emptySubtitle}>
              Your recent payments will appear here after scanning a merchant VietQR.
            </Text>
          </View>
        ) : (
          <View style={styles.paymentsListContainer}>
            {payments.map((item) => {
              const status = getStatusStyle(item.paymentStatus);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.paymentRow}
                  onPress={() => handleTransactionPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.merchantIconBg}>
                      <Landmark size={20} stroke="#2563EB" />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.merchantNameText} numberOfLines={1}>
                        {item.merchant.name}
                      </Text>
                      <Text style={styles.orderCodeText}>{item.orderCode}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.rowRight}>
                    <Text style={styles.amountText}>{formatVnd(item.amountVnd)}</Text>
                    <View style={[styles.statusMiniBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusMiniText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Biometric KYC Promotion Bottom Sheet */}
      <BottomSheet
        visible={showEkycPrompt}
        onClose={() => setShowEkycPrompt(false)}
        title="Biometric Login Setup"
      >
        <View style={styles.ekycPromptContent}>
          <View style={styles.ekycIconWrapper}>
            <ScanFace size={48} stroke="#2563EB" />
          </View>
          <Text style={styles.ekycPromptTitle}>Enable Quick Login with eKYC</Text>
          <Text style={styles.ekycPromptDesc}>
            Access your account quickly and securely using face recognition. Skip typing your password every time.
          </Text>
          
          <TouchableOpacity
            style={styles.ekycPrimaryBtn}
            onPress={handleSetUpEkyc}
            activeOpacity={0.8}
          >
            <Text style={styles.ekycPrimaryText}>Set Up Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.ekycSecondaryBtn}
            onPress={handleSnoozeEkyc}
            activeOpacity={0.7}
          >
            <Text style={styles.ekycSecondaryText}>Remind Me Later</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateUpdateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rotateIcon: {
    marginRight: 4,
  },
  rateUpdateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  rateText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  rateHelper: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scanButton: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentsListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  merchantIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  merchantNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  orderCodeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusMiniText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ekycPromptContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  ekycIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ekycPromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  ekycPromptDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  ekycPrimaryBtn: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  ekycPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ekycSecondaryBtn: {
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  ekycSecondaryText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});
