import { Tabs, useRouter } from 'expo-router';
import { Home, Scan, History, User } from 'lucide-react-native';
import { Platform, View, Text, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
function ScanTabButton({ onPress }: { onPress: () => void }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Siri-like sliding gradient loop
    Animated.loop(
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();

    // 2. Pulse wave loop
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-44, 0],
  });

  return (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: '100%',
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center', height: 48, width: 48 }}>
        {/* Pulse wave ring (Rounded Square) */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#7C3AED',
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          }}
        />

        {/* Core Button (Rounded Square) */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#2563EB',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {/* Sliding Neon Gradient */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 88,
              height: 44,
              left: 0,
              top: 0,
              transform: [{ translateX }],
            }}
          >
            <LinearGradient
              colors={['#2563EB', '#7C3AED', '#EC4899', '#06B6D4', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: 88,
                height: 44,
              }}
            />
          </Animated.View>

          {/* QR Scan Icon */}
          <Scan size={22} stroke="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          height: 68,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
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
          tabBarButton: () => (
            <ScanTabButton onPress={() => router.push('/(main)/scan')} />
          ),
        }}
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
