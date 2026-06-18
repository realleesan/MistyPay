import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Mail, Lock, Eye, EyeOff, User, Globe, AlertTriangle, CheckCircle, Bell, UserPlus } from 'lucide-react-native';
import BottomSheet from '../../src/components/ui/BottomSheet';

const COUNTRIES = [
  { code: 'VN', name: 'Vietnam' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'KH', name: 'Cambodia' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !displayName || !password || !confirmPassword) {
      setErrorMsg('Please fill out all the fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await register(email.trim(), password, displayName.trim(), country.name);
      setSuccessMsg('Account created successfully!');
      
      // Auto redirect to login screen after 1.5 seconds
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Row (placed naturally in layout flow, avoiding notch/status bar) */}
      <View style={styles.topHeader}>
        {/* Left Logo */}
        <View style={styles.topLogoContainer}>
          <Text style={styles.topLogoText}>MistyPay</Text>
        </View>

        {/* Right Action Stack */}
        <View style={styles.topRightContainer}>
          {/* English Language UK Flag Circle */}
          <TouchableOpacity style={styles.langButton} activeOpacity={0.7}>
            <Image 
              source={{ uri: 'https://flagcdn.com/w80/gb.png' }}
              style={styles.flagImage}
            />
          </TouchableOpacity>
          
          {/* Notification Bell */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Bell size={22} stroke="#64748B" fill="none" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Rounded Rect Card */}
          <View style={styles.card}>
            {/* Card Header Row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.welcomeSubtitle}>Start paying like a local</Text>
                <Text style={styles.welcomeTitle}>Create Account</Text>
              </View>
              
              {/* Registration Icon on the Right */}
              <View style={styles.headerIconContainer}>
                <UserPlus size={26} stroke="#2563EB" />
              </View>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={18} stroke="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMsg && (
              <View style={styles.successContainer}>
                <CheckCircle size={18} stroke="#22C55E" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {/* Display Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                <User size={20} stroke={nameFocused ? '#2563EB' : '#64748B'} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={displayName}
                  onChangeText={(val) => {
                    setDisplayName(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Mail size={20} stroke={emailFocused ? '#2563EB' : '#64748B'} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Country Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country of Residence</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                activeOpacity={0.7}
                onPress={() => setShowCountryModal(true)}
              >
                <Globe size={20} stroke="#64748B" style={styles.inputIcon} />
                <Text style={styles.countryValueText}>{country.name}</Text>
                <Text style={styles.selectorArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Lock size={20} stroke={passwordFocused ? '#2563EB' : '#64748B'} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.visibilityButton}
                  activeOpacity={0.7}
                >
                  {isPasswordVisible ? (
                    <EyeOff size={20} stroke="#64748B" />
                  ) : (
                    <Eye size={20} stroke="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, confirmFocused && styles.inputWrapperFocused]}>
                <Lock size={20} stroke={confirmFocused ? '#2563EB' : '#64748B'} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  style={styles.visibilityButton}
                  activeOpacity={0.7}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff size={20} stroke="#64748B" />
                  ) : (
                    <Eye size={20} stroke="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Links / Navigation */}
            <View style={styles.linksRow}>
              <Text style={styles.loginHintText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Create Account button */}
            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.primaryButton, loading && styles.disabledButton]}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <BottomSheet
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        title="Select Country"
      >
        <FlatList
          data={COUNTRIES}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countryItem,
                country.code === item.code && styles.countryItemActive,
              ]}
              onPress={() => {
                setCountry(item);
                setShowCountryModal(false);
              }}
            >
              <Text
                style={[
                  styles.countryItemText,
                  country.code === item.code && styles.countryItemTextActive,
                ]}
              >
                {item.name}
              </Text>
              {country.code === item.code && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </BottomSheet>

      {/* App Version Footer */}
      <View style={styles.footerVersion}>
        <Text style={styles.versionText}>Version 1.0.2</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
  },
  topLogoContainer: {
    paddingTop: 4,
  },
  topLogoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  topRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
    marginVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    height: '100%',
  },
  countryValueText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#64748B',
  },
  visibilityButton: {
    padding: 4,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginHintText: {
    fontSize: 14,
    color: '#64748B',
  },
  linkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  countryItemActive: {
    backgroundColor: '#F1F5F9',
  },
  countryItemText: {
    fontSize: 16,
    color: '#0F172A',
  },
  countryItemTextActive: {
    fontWeight: '600',
    color: '#2563EB',
  },
  checkMark: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '700',
  },
  footerVersion: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
