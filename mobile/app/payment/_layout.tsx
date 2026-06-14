import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quote" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
