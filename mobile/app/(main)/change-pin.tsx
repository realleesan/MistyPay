import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/services/api';
import { Lock, ArrowLeft, AlertTriangle } from 'lucide-react-native';

type SetupStep = 'VERIFY_OLD' | 'ENTER' | 'CONFIRM' | 'PASSWORD';

export default function ChangePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setHasPin } = useAuthStore();
  const { action } = useLocalSearchParams<{ action?: 'change' | 'disable' }>();

  const [step, setStep] = useState<SetupStep>('ENTER');
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Initialize step based on whether user has a PIN
  useEffect(() => {
    if (user?.hasPin) {
      setStep('VERIFY_OLD');
    } else {
      setStep('ENTER');
    }
  }, [user?.hasPin]);

  // Focus standard numeric input on step transition
  useEffect(() => {
    if (step !== 'PASSWORD') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handlePinChange = async (text: string) => {
    setErrorMsg(null);
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned.length > 6) return;

    if (step === 'VERIFY_OLD') {
      setOldPin(cleaned);
      if (cleaned.length === 6) {
        setLoading(true);
        try {
          if (action === 'disable') {
            // Directly call disable endpoint if they just want to turn off the PIN
            await api.post('/users/pin/disable', { pin: cleaned });
            setHasPin(false);
            setLoading(false);
            Alert.alert(
            'Success',
            'Transaction PIN disabled successfully',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          // Standard old PIN verification for change flow
          await api.post('/users/pin/verify', { pin: cleaned });
          setTimeout(() => {
            setStep('ENTER');
            setLoading(false);
          }, 200);
        }
      } catch (err: any) {
        setTimeout(() => {
          setErrorMsg(err?.message || 'Incorrect PIN. Please try again.');
          setOldPin('');
          setLoading(false);
          inputRef.current?.focus();
        }, 300);
      }
    }
  } else if (step === 'ENTER') {
    setPin(cleaned);
    if (cleaned.length === 6) {
      // Auto transition to confirm step
      setTimeout(() => {
        setStep('CONFIRM');
      }, 200);
    }
  } else if (step === 'CONFIRM') {
    setConfirmPin(cleaned);
    if (cleaned.length === 6) {
      if (pin === cleaned) {
        // Match! Transition to password verification step
        setTimeout(() => {
          setStep('PASSWORD');
        }, 200);
      } else {
        setTimeout(() => {
          setErrorMsg('PINs do not match. Please try again.');
          setConfirmPin('');
          setPin('');
          setStep('ENTER');
          inputRef.current?.focus();
        }, 300);
      }
    }
  }
};

const handlePasswordSubmit = async () => {
  if (!password) {
    setErrorMsg('Please enter your password.');
    return;
  }

  setLoading(true);
  setErrorMsg(null);

  try {
    await api.post('/users/pin/setup', {
      pin,
      password,
    });

    // Update Zustand state
    setHasPin(true);

    Alert.alert(
      'Success',
      user?.hasPin ? 'Transaction PIN updated successfully' : 'Transaction PIN configured successfully',
      [{ text: 'OK', onPress: () => router.back() }]
    );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDots = () => {
    let currentLength = 0;
    if (step === 'VERIFY_OLD') {
      currentLength = oldPin.length;
    } else if (step === 'ENTER') {
      currentLength = pin.length;
    } else if (step === 'CONFIRM') {
      currentLength = confirmPin.length;
    }

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (step !== 'PASSWORD') {
            inputRef.current?.focus();
          }
        }}
        style={styles.dotsContainer}
      >
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const isActive = index < currentLength;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.dotActive,
              ]}
            />
          );
        })}
      </TouchableOpacity>
    );
  };

  const getHeaderTitle = () => {
    if (action === 'disable') return 'Disable PIN';
    return user?.hasPin ? 'Change PIN' : 'Setup PIN';
  };

  return (
    <View style={styles.safeArea}>
      {/* Header Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setErrorMsg(null);
            if (step === 'VERIFY_OLD') {
              router.back();
            } else if (step === 'ENTER') {
              if (user?.hasPin) {
                setOldPin('');
                setStep('VERIFY_OLD');
              } else {
                router.back();
              }
            } else if (step === 'CONFIRM') {
              setConfirmPin('');
              setStep('ENTER');
            } else if (step === 'PASSWORD') {
              setPassword('');
              setConfirmPin('');
              setStep('CONFIRM');
            }
          }}
        >
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          {errorMsg && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={20} stroke="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {loading && step === 'VERIFY_OLD' && (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginBottom: 20 }} />
          )}

          {step === 'VERIFY_OLD' && (
            <View style={styles.stepInfoContainer}>
              <Lock size={40} stroke="#2563EB" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>Verify PIN</Text>
              <Text style={styles.stepDescription}>
                Enter your current 6-digit Transaction PIN to proceed.
              </Text>
              {renderDots()}
            </View>
          )}

          {step === 'ENTER' && (
            <View style={styles.stepInfoContainer}>
              <Lock size={40} stroke="#2563EB" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>
                {user?.hasPin ? 'Enter New PIN' : 'Create Transaction PIN'}
              </Text>
              <Text style={styles.stepDescription}>
                Enter a 6-digit PIN to secure your payments.
              </Text>
              {renderDots()}
            </View>
          )}

          {step === 'CONFIRM' && (
            <View style={styles.stepInfoContainer}>
              <Lock size={40} stroke="#2563EB" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>Confirm PIN</Text>
              <Text style={styles.stepDescription}>
                Please re-enter your 6-digit PIN to confirm.
              </Text>
              {renderDots()}
            </View>
          )}

          {step === 'PASSWORD' && (
            <View style={styles.passwordContainer}>
              <Lock size={40} stroke="#2563EB" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>Confirm Password</Text>
              <Text style={styles.stepDescription}>
                Enter your login password to complete the setup.
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  autoFocus={true}
                />
              </View>
              <TouchableOpacity
                onPress={handlePasswordSubmit}
                style={[styles.primaryButton, loading && styles.disabledButton]}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {user?.hasPin ? 'Update PIN' : 'Complete Setup'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hidden TextInput for native keyboard */}
        {step !== 'PASSWORD' && (
          <TextInput
            ref={inputRef}
            value={step === 'VERIFY_OLD' ? oldPin : step === 'ENTER' ? pin : confirmPin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry={true}
            style={styles.hiddenTextInput}
            pointerEvents="none"
          />
        )}
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    alignSelf: 'center',
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  stepInfoContainer: {
    alignItems: 'center',
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  dotActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  passwordContainer: {
    alignItems: 'center',
    width: '100%',
  },
  passwordInputWrapper: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  primaryButton: {
    width: '100%',
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
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
