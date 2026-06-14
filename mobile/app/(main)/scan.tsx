import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Scan, ArrowLeft, Zap } from 'lucide-react-native';

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.flashButton}>
          <Zap size={20} stroke="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Scanner Container */}
      <View style={styles.scannerContainer}>
        <Text style={styles.instructionText}>
          Point your camera at a VietQR merchant code
        </Text>

        {/* Scan Frame Box */}
        <View style={styles.scanFrameBox}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          <Scan size={64} stroke="rgba(255, 255, 255, 0.3)" />
        </View>

        <Text style={styles.helperText}>
          MistyPay matches VietQR parameters automatically
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Premium dark mode feel for scanning
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flashButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  scanFrameBox: {
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 40,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#2563EB',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
