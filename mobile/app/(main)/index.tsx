import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Scan, History, User, CreditCard, RefreshCcw } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            <User size={24} stroke="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Exchange Rate Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Rate</Text>
            <View style={styles.rateUpdateBadge}>
              <RefreshCcw size={12} stroke="#16A34A" style={styles.rotateIcon} />
              <Text style={styles.rateUpdateText}>Live</Text>
            </View>
          </View>
          <Text style={styles.rateText}>1 USDT = 25,600 VND</Text>
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

        {/* Empty state transactions list */}
        <View style={styles.emptyContainer}>
          <CreditCard size={48} stroke="#94A3B8" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No payments yet</Text>
          <Text style={styles.emptySubtitle}>
            Your recent payments will appear here after scanning a merchant VietQR.
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 32,
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
});
