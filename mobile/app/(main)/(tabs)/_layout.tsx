import { Tabs, useRouter } from 'expo-router';
import { Home, Scan, History, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="scan-placeholder"
        options={{
          title: 'Scan QR',
          tabBarIcon: ({ color, size }) => <Scan size={size} stroke={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Intercept tab press and push the scan stack screen instead
            e.preventDefault();
            router.push('/(main)/scan');
          },
        })}
      />
      <Tabs.Screen
        name="history-placeholder"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History size={size} stroke={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(main)/history');
          },
        })}
      />
      <Tabs.Screen
        name="profile-placeholder"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} stroke={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(main)/profile');
          },
        })}
      />
    </Tabs>
  );
}
