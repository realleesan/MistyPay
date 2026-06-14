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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Mail, Lock, Eye, EyeOff, User, Globe, AlertTriangle, CheckCircle } from 'lucide-react-native';

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
      
      // Auto redirect to login screen after 2 seconds
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View style={styles.headerContainer}>
            <Text style={styles.brandText}>MistyPay</Text>
            <Text style={styles.titleText}>Create Your Account</Text>
            <Text style={styles.subtitleText}>Start paying like a local.</Text>
          </View>

          {/* Form section */}
          <View style={styles.formContainer}>
            {errorMsg && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={20} stroke="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {successMsg && (
              <View style={styles.successContainer}>
                <CheckCircle size={20} stroke="#22C55E" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {/* Display Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  nameFocused && styles.inputWrapperFocused,
                ]}
              >
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
              <View
                style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                ]}
              >
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
              <View
                style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                ]}
              >
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
              <View
                style={[
                  styles.inputWrapper,
                  confirmFocused && styles.inputWrapperFocused,
                ]}
              >
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

            {/* Back to Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
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
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
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
    marginBottom: 20,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
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
  primaryButton: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 12,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
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
});
