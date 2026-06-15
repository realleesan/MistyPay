import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/services/api';
import { 
  User, 
  ArrowLeft, 
  Pencil, 
  Mail, 
  Lock, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'NONE' | 'NAME' | 'EMAIL' | 'PASSWORD'>('NONE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const refreshProfile = async () => {
    try {
      const userProfile = (await api.get('/users/me')) as any;
      setUser({
        id: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.displayName,
        country: userProfile.country,
        avatar: userProfile.avatar,
        hasPin: userProfile.hasPin,
      });
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.patch('/users/profile', { displayName: newName.trim() });
      await refreshProfile();
      setModalType('NONE');
      Alert.alert('Success', 'Profile name updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      setErrorMsg('Email cannot be empty.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!passwordConfirm) {
      setErrorMsg('Please enter your password to confirm identity.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/users/profile/email', {
        email: newEmail.trim(),
        password: passwordConfirm,
      });
      await refreshProfile();
      setPasswordConfirm('');
      setModalType('NONE');
      Alert.alert('Success', 'Email address updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update email. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/users/profile/password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setModalType('NONE');
      Alert.alert('Success', 'Password updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'MistyPay needs access to your gallery to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Compress high quality photos to save database storage
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setLoading(true);
      const pickedAsset = result.assets[0];
      const base64Image = `data:image/jpeg;base64,${pickedAsset.base64}`;

      await api.patch('/users/profile', { avatar: base64Image });
      await refreshProfile();
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Change Avatar Error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'NAME':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalFormTitle}>Edit Full Name</Text>
            {errorMsg && (
              <View style={styles.modalErrorContainer}>
                <AlertTriangle size={16} stroke="#EF4444" />
                <Text style={styles.modalErrorText}>{errorMsg}</Text>
              </View>
            )}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter new full name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={newName}
                onChangeText={(val) => {
                  setNewName(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoFocus={true}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelBtn]} 
                onPress={() => setModalType('NONE')}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveBtn]} 
                onPress={handleUpdateName}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'EMAIL':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalFormTitle}>Update Email Address</Text>
            {errorMsg && (
              <View style={styles.modalErrorContainer}>
                <AlertTriangle size={16} stroke="#EF4444" />
                <Text style={styles.modalErrorText}>{errorMsg}</Text>
              </View>
            )}
            <Text style={styles.fieldLabel}>New Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter new email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={newEmail}
                onChangeText={(val) => {
                  setNewEmail(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoFocus={true}
              />
            </View>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm with your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                autoCapitalize="none"
                value={passwordConfirm}
                onChangeText={(val) => {
                  setPasswordConfirm(val);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelBtn]} 
                onPress={() => setModalType('NONE')}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveBtn]} 
                onPress={handleUpdateEmail}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'PASSWORD':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalFormTitle}>Change Password</Text>
            {errorMsg && (
              <View style={styles.modalErrorContainer}>
                <AlertTriangle size={16} stroke="#EF4444" />
                <Text style={styles.modalErrorText}>{errorMsg}</Text>
              </View>
            )}
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter current password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                autoCapitalize="none"
                value={currentPassword}
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoFocus={true}
              />
            </View>
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="At least 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                autoCapitalize="none"
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
            </View>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                autoCapitalize="none"
                value={confirmNewPassword}
                onChangeText={(val) => {
                  setConfirmNewPassword(val);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelBtn]} 
                onPress={() => setModalType('NONE')}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveBtn]} 
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Large Card */}
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            activeOpacity={0.8}
            onPress={handleAvatarPress}
          >
            <View style={styles.avatarCircle}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <User size={48} stroke="#2563EB" />
              )}
            </View>
            <View style={styles.pencilOverlay}>
              <Pencil size={14} stroke="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{user?.displayName || 'Traveler'}</Text>
          <Text style={styles.profileId} numberOfLines={1} ellipsizeMode="middle">
            ID: {user?.id || '...'}
          </Text>
        </View>

        {/* Setting options list */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          {/* Full Name Row */}
          <TouchableOpacity 
            style={styles.rowItem} 
            activeOpacity={0.7}
            onPress={() => {
              setNewName(user?.displayName || '');
              setErrorMsg(null);
              setModalType('NAME');
            }}
          >
            <View style={styles.rowLeft}>
              <User size={20} stroke="#64748B" style={styles.rowIcon} />
              <Text style={styles.rowLabelText}>Full Name</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>{user?.displayName || 'Traveler'}</Text>
              <ChevronRight size={16} stroke="#CBD5E1" />
            </View>
          </TouchableOpacity>

          {/* Email Row */}
          <TouchableOpacity 
            style={styles.rowItem} 
            activeOpacity={0.7}
            onPress={() => {
              setNewEmail(user?.email || '');
              setPasswordConfirm('');
              setErrorMsg(null);
              setModalType('EMAIL');
            }}
          >
            <View style={styles.rowLeft}>
              <Mail size={20} stroke="#64748B" style={styles.rowIcon} />
              <Text style={styles.rowLabelText}>Email Address</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText} numberOfLines={1}>{user?.email}</Text>
              <ChevronRight size={16} stroke="#CBD5E1" />
            </View>
          </TouchableOpacity>

          {/* Password Row */}
          <TouchableOpacity 
            style={styles.rowItem} 
            activeOpacity={0.7}
            onPress={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              setErrorMsg(null);
              setModalType('PASSWORD');
            }}
          >
            <View style={styles.rowLeft}>
              <Lock size={20} stroke="#64748B" style={styles.rowIcon} />
              <Text style={styles.rowLabelText}>Change Password</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>••••••••</Text>
              <ChevronRight size={16} stroke="#CBD5E1" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Editing Modal */}
      <Modal
        visible={modalType !== 'NONE'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType('NONE')}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {renderModalContent()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  cardContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  pencilOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileId: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabelText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  rowValueText: {
    fontSize: 15,
    color: '#64748B',
    marginRight: 8,
    textAlign: 'right',
  },
  warningText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: 24,
  },
  modalBody: {
    width: '100%',
  },
  modalFormTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 12,
  },
  modalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalErrorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#0F172A',
    width: '100%',
    height: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
