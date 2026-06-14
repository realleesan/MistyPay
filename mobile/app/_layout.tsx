import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreSession, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onPinSetup = segments[1] === 'pin-setup';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access private screens
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!user?.hasPin && !onPinSetup) {
        // Redirect to pin setup if authenticated but has no pin configured
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

  return <Slot />;
}
