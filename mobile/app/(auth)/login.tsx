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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react-native';

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
      // State change in authStore will trigger RootLayout redirect automatically.
    } catch (error: any) {
      setErrorMsg(error?.message || 'Invalid email or password.');
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
            <Text style={styles.titleText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to continue.</Text>
          </View>

          {/* Form section */}
          <View style={styles.formContainer}>
            {errorMsg && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={20} stroke="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

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

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => {}}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
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

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLinkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 28,
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
  inputGroup: {
    marginBottom: 20,
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
  visibilityButton: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
