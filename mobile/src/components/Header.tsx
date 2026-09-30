import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import { DEFAULT_API_URL } from '../config/constants';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());

  const isDriver = user?.role === 'DRIVER';

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSaveUrl = () => {
    if (!customUrl.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir API adresi girin.');
      return;
    }
    setApiBaseUrl(customUrl.trim());
    setModalVisible(false);
    Alert.alert('Başarılı', `API adresi güncellendi:\n${customUrl.trim()}`);
  };

  const handleResetUrl = () => {
    setCustomUrl(DEFAULT_API_URL);
    setApiBaseUrl(DEFAULT_API_URL);
    setModalVisible(false);
    Alert.alert('Sıfırlandı', 'API adresi varsayılan Render canlı sunucusuna ayarlandı.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>Y</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Yolda</Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>
                {isDriver ? '🚗 TAG Sürücüsü' : '👤 Yolcu'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {/* API Ayarı Butonu */}
          <TouchableOpacity
            style={styles.apiButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.apiButtonText}>⚙️ API</Text>
          </TouchableOpacity>

          {/* Çıkış Butonu */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userGreetingRow}>
        <View>
          <Text style={styles.userName}>
            {user?.fullName || 'Kullanıcı'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        {title && (
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {/* API URL Düzenleme Modalı */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend API Yapılandırması</Text>
            <Text style={styles.modalDescription}>
              Canlı Render sunucusu veya yerel bilgisayarınızdaki (örn: http://192.168.1.X:5000) backend adresini belirleyebilirsiniz.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDefault]}
                onPress={handleResetUrl}
              >
                <Text style={styles.modalBtnDefaultText}>Varsayılan Render</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveUrl}
              >
                <Text style={styles.modalBtnSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.secondary,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  roleChip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiButton: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: Colors.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  userGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSubtle,
    paddingTop: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pageTitleContainer: {
    alignItems: 'flex-end',
  },
  pageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnDefault: {
    backgroundColor: Colors.surfaceSubtle,
  },
  modalBtnDefaultText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalBtnSave: {
    backgroundColor: Colors.primary,
  },
  modalBtnSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

export default Header;
