import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/services/api';
import { Lock, Delete, ArrowLeft, AlertTriangle } from 'lucide-react-native';

type SetupStep = 'ENTER' | 'CONFIRM' | 'PASSWORD';

export default function PinSetupScreen() {
  const router = useRouter();
  const { setHasPin, logout } = useAuthStore();

  const [step, setStep] = useState<SetupStep>('ENTER');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleKeyPress = (val: string) => {
    if (step === 'PASSWORD') return; // Numpad not used for password
    setErrorMsg(null);

    if (step === 'ENTER') {
      if (pin.length < 6) {
        const nextPin = pin + val;
        setPin(nextPin);
        if (nextPin.length === 6) {
          // Auto transition to confirm step
          setTimeout(() => {
            setStep('CONFIRM');
          }, 200);
        }
      }
    } else if (step === 'CONFIRM') {
      if (confirmPin.length < 6) {
        const nextConfirm = confirmPin + val;
        setConfirmPin(nextConfirm);
        if (nextConfirm.length === 6) {
          if (pin === nextConfirm) {
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
            }, 300);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    if (step === 'ENTER') {
      setPin(pin.slice(0, -1));
    } else if (step === 'CONFIRM') {
      setConfirmPin(confirmPin.slice(0, -1));
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
      // RootLayout will automatically transition to /(main) now!
    } catch (err: any) {
      setErrorMsg(err?.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDots = () => {
    const currentLength = step === 'ENTER' ? pin.length : confirmPin.length;
    return (
      <View style={styles.dotsContainer}>
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
      </View>
    );
  };

  const renderNumpad = () => {
    if (step === 'PASSWORD') return null;

    const rows = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numpadContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numpadRow}>
            {row.map((item, colIndex) => {
              if (item === '') {
                return <View key={colIndex} style={styles.numpadButtonEmpty} />;
              }

              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.numpadButton}
                    onPress={handleBackspace}
                    activeOpacity={0.7}
                  >
                    <Delete size={24} stroke="#0F172A" />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.numpadButton}
                  onPress={() => handleKeyPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.numpadButtonText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Back Button */}
      <View style={styles.header}>
        {step !== 'ENTER' ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setErrorMsg(null);
              if (step === 'CONFIRM') {
                setConfirmPin('');
                setStep('ENTER');
              } else if (step === 'PASSWORD') {
                setPassword('');
                setConfirmPin('');
                setStep('CONFIRM');
              }
            }}
          >
            <ArrowLeft size={24} stroke="#0F172A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => logout()}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>MistyPay Security</Text>
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

          {step === 'ENTER' && (
            <View style={styles.stepInfoContainer}>
              <Lock size={40} stroke="#2563EB" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>Create Transaction PIN</Text>
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
                  <Text style={styles.primaryButtonText}>Complete Setup</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {renderNumpad()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
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
  numpadContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  numpadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonEmpty: {
    width: 72,
    height: 72,
  },
  numpadButtonText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0F172A',
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
