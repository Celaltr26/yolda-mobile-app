import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../api/auth.api';
import { Colors } from '../../theme/colors';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return;
    }
    await register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Başlık */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Girişe Dön</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Yeni Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            Yolda topluluğuna katılın, yolculuk yapın veya kazanç sağlayın
          </Text>
        </View>

        {/* Kayıt Kartı */}
        <View style={styles.card}>
          {/* Hata Kutusu */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Rol Seçimi (Yolcu / Sürücü) */}
          <View style={styles.roleContainer}>
            <Text style={styles.inputLabel}>KULLANICI TİPİ SEÇİN</Text>
            <View style={styles.roleToggleRow}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'CUSTOMER' && styles.roleOptionActive]}
                onPress={() => setRole('CUSTOMER')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleIcon}>👤</Text>
                <Text style={[styles.roleLabel, role === 'CUSTOMER' && styles.roleLabelActive]}>
                  Yolcu
                </Text>
                <Text style={styles.roleSubtext}>Yolculuk Talep Et</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleOption, role === 'DRIVER' && styles.roleOptionActive]}
                onPress={() => setRole('DRIVER')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleIcon}>🚗</Text>
                <Text style={[styles.roleLabel, role === 'DRIVER' && styles.roleLabelActive]}>
                  TAG Sürücüsü
                </Text>
                <Text style={styles.roleSubtext}>Yolcu Al & Kazan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ad Soyad */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>AD SOYAD</Text>
            <TextInput
              style={styles.input}
              placeholder="Ahmet Yılmaz"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (error) clearError();
              }}
            />
          </View>

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-POSTA</Text>
            <TextInput
              style={styles.input}
              placeholder="ahmet@ornek.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Şifre */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ŞİFRE (EN AZ 6 KARAKTER)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              secureTextEntry
            />
          </View>

          {/* Kayıt Butonu */}
          <TouchableOpacity
            style={[
              styles.registerBtn,
              (!fullName.trim() || !email.trim() || !password.trim()) && styles.registerBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim()}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.secondary} />
            ) : (
              <Text style={styles.registerBtnText}>
                {role === 'CUSTOMER' ? 'Yolcu Olarak Kaydol' : 'Sürücü Olarak Kaydol'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Giriş Yap Linki */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Zaten bir hesabınız var mı?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 8,
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  roleContainer: {
    marginBottom: 18,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: Colors.primaryDark,
    backgroundColor: '#FFFBEB',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  roleLabelActive: {
    color: Colors.secondary,
  },
  roleSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
