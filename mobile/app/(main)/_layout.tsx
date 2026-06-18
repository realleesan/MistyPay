import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // Smooth native slide transition
        gestureEnabled: true,          // Enable swipe to go back natively
        gestureDirection: 'horizontal',
      }}
    >
      {/* Root screen is the tab navigator containing Home, History, Profile */}
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      
      {/* Stack screens for the transaction flow */}
      <Stack.Screen name="scan" options={{ gestureEnabled: true }} />
      <Stack.Screen name="quote" options={{ gestureEnabled: true }} />
      <Stack.Screen name="history" options={{ gestureEnabled: true }} />
      <Stack.Screen name="profile" options={{ gestureEnabled: true }} />
      <Stack.Screen name="edit-profile" options={{ gestureEnabled: true }} />
      <Stack.Screen name="change-pin" options={{ gestureEnabled: true }} />
      <Stack.Screen name="ekyc-setup" options={{ gestureEnabled: true }} />
      <Stack.Screen name="confirm" options={{ gestureEnabled: false }} />
      <Stack.Screen name="payment" options={{ gestureEnabled: false }} />
      <Stack.Screen name="success" options={{ gestureEnabled: false }} />
      <Stack.Screen name="failed" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
