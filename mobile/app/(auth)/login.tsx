import React, { useState, useEffect } from 'react';
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
  Image,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../src/store/authStore';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Bell, ScanFace } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick login states
  const [lastUser, setLastUser] = useState<{ displayName?: string; email: string } | null>(null);
  const [isQuickLogin, setIsQuickLogin] = useState(false);



  // Check if there was a previous user logged in on this device
  useEffect(() => {
    const checkLastUser = async () => {
      try {
        const savedUserStr = await SecureStore.getItemAsync('lastUser');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          setLastUser(savedUser);
          setEmail(savedUser.email);
          setIsQuickLogin(true);
        }
      } catch (e) {
        console.warn('Failed to load last user info:', e);
      }
    };
    checkLastUser();
  }, []);

  const handleBiometricLogin = async () => {
    if (!lastUser || !lastUser.email) {
      Alert.alert(
        'Biometric Login',
        'No recent account found on this device. Please log in with email and password first.'
      );
      return;
    }

    try {
      const safeEmail = lastUser.email.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ekycEnabled = await SecureStore.getItemAsync(`ekyc_enabled_${safeEmail}`);
      if (ekycEnabled !== 'true') {
        Alert.alert(
          'Biometric Login',
          `eKYC Face ID is not enabled for ${lastUser.displayName || lastUser.email}. Please enter your password to log in first, and register Face ID in Settings.`
        );
        return;
      }

      // Check if biometric authentication is supported and enrolled
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometric Error', 'Face ID not set up or not supported on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to MistyPay with Face ID',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: true, // Force Face ID only
      });

      if (result.success) {
        // Retrieve securely stored password
        const savedPassword = await SecureStore.getItemAsync(`ekyc_password_${safeEmail}`);
        if (!savedPassword) {
          Alert.alert('Error', 'Unable to retrieve stored login credentials. Please use password.');
          return;
        }

        setLoading(true);
        try {
          await login(lastUser.email, savedPassword);
        } catch (e: any) {
          setErrorMsg(e?.message || 'Biometric login failed. Please enter your password.');
        } finally {
          setLoading(false);
        }
      } else {
        if (result.error && result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          setErrorMsg(`Face ID Error: ${result.error}`);
        } else if (result.error === 'user_cancel') {
          setErrorMsg('Face ID login was cancelled.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to retrieve biometric preferences.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
      
      // Save last user on successful login
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const safeEmail = currentUser.email.replace(/[^a-zA-Z0-9._-]/g, '_');
        await SecureStore.setItemAsync(
          'lastUser',
          JSON.stringify({
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
          })
        );
        await SecureStore.setItemAsync(`ekyc_password_${safeEmail}`, password);
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Invalid email or password.');
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
                {isQuickLogin ? (
                  <>
                    <Text style={styles.welcomeSubtitle}>Welcome back,</Text>
                    <Text style={styles.welcomeTitle} numberOfLines={1}>
                      {lastUser?.displayName || 'User'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.welcomeSubtitle}>Welcome to</Text>
                    <Text style={styles.welcomeTitle}>MistyPay</Text>
                  </>
                )}
              </View>
              
              {/* KYC/Face Auth Icon on the Right */}
              <TouchableOpacity 
                style={styles.kycButton} 
                activeOpacity={0.8}
                onPress={handleBiometricLogin}
              >
                <ScanFace size={28} stroke="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={18} stroke="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Form Fields */}
            {!isQuickLogin && (
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
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Lock size={20} stroke={passwordFocused ? '#2563EB' : '#64748B'} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
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

             {/* Bottom Links (Quick Login vs Full Login) */}
            <View style={styles.linksRow}>
              {isQuickLogin ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setIsQuickLogin(false);
                      setEmail('');
                      setPassword('');
                      setErrorMsg(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>Other Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>Create Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.primaryButton, loading && styles.disabledButton]}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  kycButton: {
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
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  scannerModalCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scannerModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  scannerModalStatus: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    height: 20,
  },
  scannerCircleFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#2563EB',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerOverlayLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  scannerProgressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  cancelScannerBtn: {
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cancelScannerText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});
