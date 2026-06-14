import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { User, LogOut, Lock, Globe, Shield, HelpCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MistyPay?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={36} stroke="#2563EB" />
          </View>
          <Text style={styles.displayNameText}>{user?.displayName || 'Traveler'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          {/* Country Row */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Globe size={20} stroke="#64748B" style={styles.optionIcon} />
              <Text style={styles.optionText}>Country of Residence</Text>
            </View>
            <Text style={styles.optionValueText}>{user?.country || 'Not Set'}</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Security Settings</Text>

          {/* PIN Row */}
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={styles.optionLeft}>
              <Lock size={20} stroke="#64748B" style={styles.optionIcon} />
              <Text style={styles.optionText}>Transaction PIN</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={[styles.badgeText, user?.hasPin ? styles.badgeActive : styles.badgeInactive]}>
                {user?.hasPin ? 'Active' : 'Not Set'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Authentication Status Row */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Shield size={20} stroke="#64748B" style={styles.optionIcon} />
              <Text style={styles.optionText}>Security Status</Text>
            </View>
            <Text style={styles.optionValueText}>Verified</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Support</Text>

          {/* Help & Support */}
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={styles.optionLeft}>
              <HelpCircle size={20} stroke="#64748B" style={styles.optionIcon} />
              <Text style={styles.optionText}>Help Center</Text>
            </View>
            <Text style={styles.arrowText}>❯</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={20} stroke="#EF4444" style={styles.signOutIcon} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  displayNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#64748B',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  optionValueText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  arrowText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  badgeContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeActive: {
    color: '#16A34A',
  },
  badgeInactive: {
    color: '#64748B',
  },
  signOutButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
