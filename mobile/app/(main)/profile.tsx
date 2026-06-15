import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { User, LogOut, Lock, Globe, Shield, HelpCircle, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const handlePinPress = () => {
    if (!user?.hasPin) {
      router.push({ pathname: '/(main)/change-pin', params: { action: 'change' } });
      return;
    }

    Alert.alert(
      'Transaction PIN Settings',
      'Choose an action for your Transaction PIN:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable PIN', 
          style: 'destructive',
          onPress: () => router.push({ pathname: '/(main)/change-pin', params: { action: 'disable' } }) 
        },
        { 
          text: 'Change PIN', 
          onPress: () => router.push({ pathname: '/(main)/change-pin', params: { action: 'change' } }) 
        },
      ]
    );
  };

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
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <User size={28} stroke="#2563EB" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayNameText}>{user?.displayName || 'Traveler'}</Text>
            <Text style={styles.emailText} numberOfLines={1} ellipsizeMode="middle">
              ID: {user?.id || '...'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/edit-profile')}
          >
            <Text style={styles.arrowText}>❯</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={handlePinPress}
          >
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
          <TouchableOpacity 
            style={styles.optionRow} 
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/help-center')}
          >
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: '#64748B',
  },
  settingsButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
