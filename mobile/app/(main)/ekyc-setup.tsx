import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { AlertTriangle, CheckCircle, ScanFace, ArrowLeft } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export default function EkycSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'SETUP' | 'SUCCESS'>('SETUP');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStartSetup = async () => {
    setErrorMsg(null);
    setIsAuthenticating(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware) {
        setErrorMsg('FaceID/TouchID is not supported on this device.');
        setIsAuthenticating(false);
        return;
      }

      if (!isEnrolled) {
        setErrorMsg('Please set up FaceID/TouchID in your iPhone Settings first.');
        setIsAuthenticating(false);
        return;
      }

      // Trigger native iOS biometric verification
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Register Face ID for MistyPay',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: true, // Force FaceID only, do not fallback to passcode
      });

      if (result.success) {
        if (user && user.email) {
          const safeEmail = user.email.replace(/[^a-zA-Z0-9._-]/g, '_');
          await SecureStore.setItemAsync(`ekyc_enabled_${safeEmail}`, 'true');
        }
        setStep('SUCCESS');
      } else {
        if (result.error && result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          setErrorMsg(`Face ID Error: ${result.error}. Please try again.`);
        } else if (result.error === 'user_cancel') {
          setErrorMsg('Face ID setup was cancelled.');
        } else {
          setErrorMsg('Face ID authentication failed. Please try again.');
        }
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'An error occurred during Face ID setup.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFinish = () => {
    router.replace('/(main)');
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric eKYC</Text>
        <View style={{ width: 40 }} />
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
          {step === 'SETUP' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.welcomeSubtitle}>Security</Text>
                  <Text style={styles.welcomeTitle}>Setup Face ID</Text>
                </View>
                <View style={styles.headerIconContainer}>
                  <ScanFace size={24} stroke="#2563EB" />
                </View>
              </View>

              <Text style={styles.descriptionText}>
                Activate Face ID biometric security to log in to your account quickly and securely.
              </Text>

              {errorMsg && (
                <View style={styles.errorContainer}>
                  <AlertTriangle size={18} stroke="#EF4444" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isAuthenticating && styles.disabledButton]}
                onPress={handleStartSetup}
                activeOpacity={0.8}
                disabled={isAuthenticating}
              >
                <Text style={styles.primaryButtonText}>
                  {isAuthenticating ? 'Authenticating...' : 'Enable Face ID'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'SUCCESS' && (
            <View style={styles.card}>
              <View style={styles.successWrapper}>
                <CheckCircle size={64} stroke="#22C55E" style={styles.successIcon} />
                <Text style={styles.successTitle}>eKYC Registered!</Text>
                <Text style={styles.successDesc}>
                  Your Face ID has been successfully registered. You can now use Face ID for Quick Login.
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'center',
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
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
  descriptionText: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 24,
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
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  // Success page
  successWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
