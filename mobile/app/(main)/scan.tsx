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
import { Scan, ArrowLeft, Zap, Info, Image as GalleryIcon } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { usePaymentStore } from '../../src/store/paymentStore';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setScannedMerchant } = usePaymentStore();

  // Reset scan state when screen is refocused
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setIsProcessing(false);
    }
  }, [isFocused]);

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
        router.replace('/(main)/quote');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('QR Parse Error:', error);
      Alert.alert(
        'QR Scan Error',
        error.message || 'Invalid VietQR code or not supported by the system.',
        [
          {
            text: 'Scan Again',
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

  // Handle photo library image selection and upload
  const handleSelectImage = async () => {
    if (scanned || isProcessing) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'MistyPay needs access to your gallery to upload QR images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setScanned(true);
      setIsProcessing(true);

      const pickedAsset = result.assets[0];
      const localUri = pickedAsset.uri;
      const filename = localUri.split('/').pop() || 'photo.jpg';

      // Infer image mime type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      // @ts-ignore - React Native FormData expects an object with uri, name, type
      formData.append('image', {
        uri: localUri,
        name: filename,
        type,
      });

      // Send the image to the backend to parse the QR code
      const response = (await api.post('/qr/scan-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })) as any;

      if (response && response.success && response.data) {
        setScannedMerchant({
          merchantName: response.data.merchantName,
          bankName: response.data.bankName,
          bankCode: response.data.bankCode,
          accountNumber: response.data.accountNumber,
          amount: response.data.amount,
        });

        router.replace('/(main)/quote');
      } else {
        throw new Error('No QR code detected in the selected image.');
      }
    } catch (error: any) {
      console.error('Image Scan Error:', error);
      Alert.alert(
        'QR Scan Error',
        error.message || 'Could not parse QR code from the selected image. Please try again or scan directly.',
        [
          {
            text: 'Try Again',
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
        <Text style={styles.loadingText}>Launching camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} stroke="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <View style={styles.infoIconBox}>
            <Info size={48} stroke="#3B82F6" />
          </View>
          <Text style={styles.permissionTitle}>Camera Permission</Text>
          <Text style={styles.permissionDesc}>
            MistyPay needs access to your camera to scan VietQR codes at merchants.
          </Text>
          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>Grant Permission</Text>
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
          <ArrowLeft size={24} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity
          style={[styles.flashButton, torchEnabled && styles.flashButtonActive]}
          onPress={() => setTorchEnabled(!torchEnabled)}
        >
          <Zap size={20} stroke={torchEnabled ? '#F59E0B' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      {/* Camera Scanning View */}
      <View style={styles.cameraContainer}>
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}

        {/* Scan Frame HUD Overlay */}
        <View style={styles.overlayMask}>
          <Text style={styles.instructionText}>
            Align the VietQR code within the frame
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
            We will automatically parse merchant banking info
          </Text>

          {/* Import from Gallery button */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleSelectImage}
            disabled={isProcessing}
          >
            <GalleryIcon size={20} stroke="#FFFFFF" style={styles.galleryIcon} />
            <Text style={styles.galleryButtonText}>Import from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
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
    color: '#0F172A',
  },
  flashButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  flashButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
    backgroundColor: '#F8FAFC',
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
    color: '#0F172A',
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 14,
    color: '#64748B',
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
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 32,
  },
  galleryIcon: {
    marginRight: 8,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
