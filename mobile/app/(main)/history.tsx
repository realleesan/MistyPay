import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, CreditCard, X, ChevronRight, Clock, ArrowLeft, RefreshCw, Calendar, Landmark, Hash, DollarSign } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { usePaymentStore, PaymentOrderDetails } from '../../src/store/paymentStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import BottomSheet from '../../src/components/ui/BottomSheet';

interface PaymentHistoryItem {
  id: string;
  orderCode: string;
  amountVnd: number;
  requiredUsdt: number;
  receivedUsdt: number;
  depositAddress: string;
  paymentStatus: string;
  payoutStatus: string | null;
  finalStatus: string | null;
  merchant: {
    name: string;
    bankName: string;
    accountNumber: string;
  };
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setActivePayment } = usePaymentStore();
  const { isAuthenticated } = useAuthStore();
  
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null);

  const fetchPayments = async (showLoader = true) => {
    if (!isAuthenticated) return;
    if (showLoader) setLoading(true);
    try {
      const response = (await api.get('/payments')) as any;
      if (response && response.success && response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Fetch payments history error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments(false);
  };

  const handleResumePayment = (item: PaymentHistoryItem) => {
    setSelectedPayment(null);
    const orderDetails: PaymentOrderDetails = {
      id: item.id,
      orderCode: item.orderCode,
      requiredUsdt: item.requiredUsdt,
      depositAddress: item.depositAddress,
      expiresAt: item.expiresAt,
      paymentStatus: item.paymentStatus,
      merchant: {
        name: item.merchant.name,
        bankName: item.merchant.bankName,
        accountNumber: item.merchant.accountNumber,
      },
    };
    setActivePayment(orderDetails);
    router.push('/(main)/payment');
  };

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatUsdt = (num: number) => {
    return `${Number(num).toFixed(2)} USDT`;
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return { label: 'Completed', color: '#16A34A', bg: '#DCFCE7' };
      case 'WAITING_USDT':
        return { label: 'Waiting Deposit', color: '#D97706', bg: '#FEF3C7' };
      case 'USDT_DETECTED':
        return { label: 'USDT Detected', color: '#2563EB', bg: '#DBEAFE' };
      case 'USDT_CONFIRMED':
        return { label: 'USDT Confirmed', color: '#7C3AED', bg: '#F3E8FF' };
      case 'UNDERPAID':
        return { label: 'Underpaid', color: '#DC2626', bg: '#FEE2E2' };
      case 'OVERPAID':
        return { label: 'Overpaid', color: '#4F46E5', bg: '#EEF2FF' };
      case 'EXPIRED':
        return { label: 'Expired', color: '#475569', bg: '#F1F5F9' };
      case 'FAILED':
        return { label: 'Failed', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.orderCode || '').toLowerCase().includes(query) ||
      (p.merchant?.name || '').toLowerCase().includes(query) ||
      (p.merchant?.bankName || '').toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }: { item: PaymentHistoryItem }) => {
    const status = getStatusDetails(item.paymentStatus);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => setSelectedPayment(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
          <View style={styles.itemDetails}>
            <Text style={styles.merchantName} numberOfLines={1}>
              {item.merchant.name}
            </Text>
            <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.itemOrderCode}>{item.orderCode}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.amountVndText}>{formatVnd(item.amountVnd)}</Text>
          <Text style={styles.amountUsdtText}>{formatUsdt(item.requiredUsdt)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} stroke="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant, bank or code..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} stroke="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : filteredPayments.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          <CreditCard size={64} stroke="#94A3B8" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>
            {searchQuery.length > 0 ? 'No results found' : 'No payments found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.length > 0
              ? 'Try adjusting your search queries or keywords.'
              : 'Your past travel transaction summaries will appear here.'}
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        />
      )}

      {/* Detail Modal */}
      <BottomSheet
        visible={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Transaction Details"
      >
        {selectedPayment && (
          <View style={{ maxHeight: '90%' }}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Top status card */}
              <View style={styles.modalStatusContainer}>
                <Text style={styles.modalAmountVnd}>{formatVnd(selectedPayment.amountVnd)}</Text>
                <Text style={styles.modalAmountUsdt}>{formatUsdt(selectedPayment.requiredUsdt)}</Text>
                
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusDetails(selectedPayment.paymentStatus).bg }]}>
                  <Text style={[styles.modalStatusText, { color: getStatusDetails(selectedPayment.paymentStatus).color }]}>
                    {getStatusDetails(selectedPayment.paymentStatus).label}
                  </Text>
                </View>
              </View>

              {/* Details Section */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Merchant Information</Text>
                <View style={styles.detailRow}>
                  <Landmark size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Merchant Name</Text>
                    <Text style={styles.rowValue}>{selectedPayment.merchant.name}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Landmark size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Bank</Text>
                    <Text style={styles.rowValue}>{selectedPayment.merchant.bankName}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Hash size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Account Number</Text>
                    <Text style={styles.rowValue}>{selectedPayment.merchant.accountNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <View style={styles.detailRow}>
                  <Hash size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Order Code</Text>
                    <Text style={styles.rowValue}>{selectedPayment.orderCode}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Calendar size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Created Date</Text>
                    <Text style={styles.rowValue}>{formatDate(selectedPayment.createdAt)}</Text>
                  </View>
                </View>

                {selectedPayment.completedAt && (
                  <View style={styles.detailRow}>
                    <Calendar size={18} stroke="#64748B" style={styles.rowIcon} />
                    <View>
                      <Text style={styles.rowLabel}>Completed Date</Text>
                      <Text style={styles.rowValue}>{formatDate(selectedPayment.completedAt)}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <DollarSign size={18} stroke="#64748B" style={styles.rowIcon} />
                  <View>
                    <Text style={styles.rowLabel}>Deposit Wallet Address</Text>
                    <Text style={styles.rowValueAddress} numberOfLines={1} ellipsizeMode="middle">
                      {selectedPayment.depositAddress}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Action for WAITING_USDT */}
            {selectedPayment.paymentStatus === 'WAITING_USDT' && (
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={() => handleResumePayment(selectedPayment)}
              >
                <Clock size={18} stroke="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.resumeButtonText}>Resume Payment (Send USDT)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </BottomSheet>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1.5,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  itemOrderCode: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountVndText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  amountUsdtText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    color: '#94A3B8',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeModalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    marginTop: 16,
  },
  modalStatusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalAmountVnd: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalAmountUsdt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowValueAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    width: '85%',
  },
  resumeButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
