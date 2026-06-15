import { useEffect, useRef, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { ActivityIndicator, View, AppState, AppStateStatus, Alert, StyleSheet, Text } from 'react-native';
import { Lock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';


export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreSession, user } = useAuthStore();
  const segments = useSegments() as string[];
  const router = useRouter();

  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false);

  // App switcher privacy blur listener
  useEffect(() => {
    const handlePrivacyState = (nextAppState: AppStateStatus) => {
      // Show blur when app is not active (inactive/background)
      setShowPrivacyOverlay(nextAppState !== 'active');
    };

    const subscription = AppState.addEventListener('change', handlePrivacyState);
    return () => {
      subscription.remove();
    };
  }, []);

  const lastActiveTime = useRef(Date.now());

  // Startup session expiration check
  useEffect(() => {
    const checkStartupTimeout = async () => {
      try {
        const lastActiveStr = await SecureStore.getItemAsync('lastActiveTime');
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (!isNaN(lastActive) && Date.now() - lastActive >= 20 * 60 * 1000) {
            // Expired! Clean up tokens first
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('lastActiveTime');
            
            // Run restoreSession to resolve loading state to false
            await restoreSession();
            
            Alert.alert(
              'Session Expired',
              'For your security, your session has expired due to 20 minutes of inactivity. Please log in again.'
            );
            return;
          }
        }
      } catch (e) {
        console.error('Error during startup session timeout check:', e);
      }
      
      // Proceed with normal session restoration
      await restoreSession();
    };

    checkStartupTimeout();
  }, []);

  // Background and Active inactivity monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    // Periodically (every 1 minute) update secure store with active interaction time
    // and check if user has been idle in foreground for > 20 mins
    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastActiveTime.current >= 20 * 60 * 1000) {
        await useAuthStore.getState().logout();
        await SecureStore.deleteItemAsync('lastActiveTime');
        Alert.alert(
          'Session Expired',
          'For your security, your session has expired due to 20 minutes of inactivity. Please log in again.'
        );
      } else {
        await SecureStore.setItemAsync('lastActiveTime', String(lastActiveTime.current));
      }
    }, 60 * 1000);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Save the latest interaction timestamp on background transition
        await SecureStore.setItemAsync('lastActiveTime', String(lastActiveTime.current));
      } else if (nextAppState === 'active') {
        // Check if elapsed time in background exceeds 20 minutes
        const lastActiveStr = await SecureStore.getItemAsync('lastActiveTime');
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (!isNaN(lastActive) && Date.now() - lastActive >= 20 * 60 * 1000) {
            await useAuthStore.getState().logout();
            await SecureStore.deleteItemAsync('lastActiveTime');
            Alert.alert(
              'Session Expired',
              'For your security, your session has expired due to 20 minutes of inactivity. Please log in again.'
            );
          } else {
            // Not expired, reset interaction time and update storage
            lastActiveTime.current = Date.now();
            await SecureStore.setItemAsync('lastActiveTime', String(lastActiveTime.current));
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onPinSetup = segments[1] === 'pin-setup';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access private screens
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!user?.hasPin && inAuthGroup && !onPinSetup) {
        // Redirect to pin setup only if authenticated and currently in onboarding/auth screens
        router.replace('/(auth)/pin-setup');
      } else if (user?.hasPin && inAuthGroup) {
        // Redirect to main dashboard if authenticated and has pin, but still in auth screens
        router.replace('/(main)');
      }
    }
  }, [isAuthenticated, isLoading, segments, user?.hasPin]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <View 
        style={{ flex: 1 }}
        onStartShouldSetResponderCapture={() => {
          // Track touch interactions to reset the idle timer
          lastActiveTime.current = Date.now();
          return false; // Let touch events bubble down to child elements
        }}
      >
        <Slot />
      </View>
      {showPrivacyOverlay && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#0F172A',
            zIndex: 99999,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 18,
                borderWidth: 1.5,
                borderColor: '#2563EB',
              }}
            >
              <Lock size={32} stroke="#2563EB" />
            </View>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: '700',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              MistyPay
            </Text>
            <Text
              style={{
                color: '#64748B',
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              Connection is secured & encrypted
            </Text>
          </View>
        </View>
      )}
    </>
  );
}
