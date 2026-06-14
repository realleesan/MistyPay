import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Scan, ArrowLeft, Zap, Info } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { usePaymentStore } from '../../src/store/paymentStore';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setScannedMerchant } = usePaymentStore();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Handle scanned barcode data
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      // Send scanned QR content to backend for parsing
      const response = (await api.post('/qr/parse', { qrContent: data })) as any;

      if (response && response.success && response.data) {
        // Save scanned details to our payment state
        setScannedMerchant({
          merchantName: response.data.merchantName,
          bankName: response.data.bankName,
          bankCode: response.data.bankCode,
          accountNumber: response.data.accountNumber,
          amount: response.data.amount,
        });

        // Navigate to the payment quote screen
        router.push('/(main)/quote');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('QR Parse Error:', error);
      Alert.alert(
        'Lỗi quét QR',
        error.message || 'Mã VietQR không hợp lệ hoặc không được hỗ trợ bởi hệ thống.',
        [
          {
            text: 'Quét lại',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Rendering States
  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang khởi chạy camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} stroke="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quét mã QR</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <View style={styles.infoIconBox}>
            <Info size={48} stroke="#3B82F6" />
          </View>
          <Text style={styles.permissionTitle}>Quyền truy cập Camera</Text>
          <Text style={styles.permissionDesc}>
            MistyPay cần quyền sử dụng camera của bạn để quét mã QR VietQR từ các cửa hàng tiện lợi và nhà hàng.
          </Text>
          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>Cấp quyền truy cập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét mã QR</Text>
        <TouchableOpacity
          style={[styles.flashButton, torchEnabled && styles.flashButtonActive]}
          onPress={() => setTorchEnabled(!torchEnabled)}
        >
          <Zap size={20} stroke={torchEnabled ? '#F59E0B' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>

      {/* Camera Scanning View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchEnabled}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Scan Frame HUD Overlay */}
        <View style={styles.overlayMask}>
          <Text style={styles.instructionText}>
            Di chuyển camera gần mã VietQR của cửa hàng
          </Text>

          {/* Scanner View Box Frame */}
          <View style={styles.scanFrameBox}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {isProcessing ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              <Scan size={64} stroke="rgba(255, 255, 255, 0.4)" />
            )}
          </View>

          <Text style={styles.helperText}>
            Hệ thống sẽ tự động đối sánh mã ngân hàng và tài khoản
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 12,
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flashButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  overlayMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  scanFrameBox: {
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 40,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#3B82F6',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  helperText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0F172A',
  },
  infoIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  grantButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
