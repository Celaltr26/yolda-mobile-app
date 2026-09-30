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
import { Colors } from '../../theme/colors';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    await login({ email: email.trim(), password });
  };

  const handleDemoLogin = async (role: 'CUSTOMER' | 'DRIVER') => {
    if (role === 'CUSTOMER') {
      setEmail('yolcu@yolda.com');
      setPassword('123456');
      await login({ email: 'yolcu@yolda.com', password: '123456' });
    } else {
      setEmail('surucu@yolda.com');
      setPassword('123456');
      await login({ email: 'surucu@yolda.com', password: '123456' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo ve Başlık */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>Y</Text>
          </View>
          <Text style={styles.brandTitle}>Yolda</Text>
          <Text style={styles.brandSubtitle}>Martı TAG Benzeri Yolculuk Talep Platformu</Text>
        </View>

        {/* Giriş Kartı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>
          <Text style={styles.cardSubtitle}>
            Yolculuk başlatmak veya yolcu almak için hesabınıza erişin
          </Text>

          {/* Hata Mesajı */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-POSTA ADRESİ</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@yolda.com"
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
            <Text style={styles.inputLabel}>ŞİFRE</Text>
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

          {/* Giriş Butonu */}
          <TouchableOpacity
            style={[styles.loginBtn, (!email.trim() || !password.trim()) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.secondary} />
            ) : (
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          {/* Hızlı Demo Test Düğmeleri */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>HIZLI TEST İÇİN DEMO GİRİŞİ:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnCustomer]}
                onPress={() => handleDemoLogin('CUSTOMER')}
                disabled={isLoading}
              >
                <Text style={styles.demoBtnCustomerText}>👤 Yolcu Olarak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnDriver]}
                onPress={() => handleDemoLogin('DRIVER')}
                disabled={isLoading}
              >
                <Text style={styles.demoBtnDriverText}>🚗 Sürücü Olarak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kayıt Ol Bağlantısı */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Henüz bir hesabınız yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Kayıt Ol</Text>
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
    paddingVertical: 32,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.secondary,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
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
  loginBtn: {
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
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoBtnCustomer: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  demoBtnCustomerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  demoBtnDriver: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  demoBtnDriverText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
