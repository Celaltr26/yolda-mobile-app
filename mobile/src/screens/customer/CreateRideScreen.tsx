import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { useRideStore } from '../../store/rideStore';
import { Colors } from '../../theme/colors';

interface CreateRideScreenProps {
  navigation: any;
}

export const CreateRideScreen: React.FC<CreateRideScreenProps> = ({ navigation }) => {
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const { createNewRide, isSubmitting, error, clearError, activeRide } = useRideStore();

  // Hızlı konum önerileri
  const quickOrigins = ['Kadıköy Rıhtım', 'Beşiktaş İskele', 'Taksim Meydanı', 'Levent Metro'];
  const quickDestinations = [
    'Sabiha Gökçen HL',
    'İstanbul Havalimanı',
    'Üsküdar Marmaray',
    'Zorlu Center',
  ];

  const handleSwapAddresses = () => {
    setOriginAddress(destinationAddress);
    setDestinationAddress(originAddress);
    if (error) clearError();
  };

  const handleSubmit = async () => {
    if (!originAddress.trim() || !destinationAddress.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen alış ve varış adreslerini giriniz.');
      return;
    }

    const created = await createNewRide({
      originAddress: originAddress.trim(),
      destinationAddress: destinationAddress.trim(),
    });

    if (created) {
      setOriginAddress('');
      setDestinationAddress('');
      Alert.alert(
        'Talep Oluşturuldu 🚗',
        'Yolculuk talebiniz yakındaki TAG sürücülerine iletildi. Sürücü kabul ettiğinde bildirim alacaksınız.',
        [
          {
            text: 'Taleplerimi Gör',
            onPress: () => navigation.navigate('CustomerRides'),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Yolculuk Başlat" subtitle="Hemen bir TAG çağırın" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Aktif Yolculuk Bildirimi Varsa */}
        {activeRide && (
          <TouchableOpacity
            style={styles.activeRideBanner}
            onPress={() => navigation.navigate('CustomerRides')}
            activeOpacity={0.85}
          >
            <View style={styles.activeBannerContent}>
              <Text style={styles.activeBannerTitle}>
                {activeRide.status === 'PENDING'
                  ? '⏳ Bekleyen bir talebiniz var'
                  : '🚗 Sürücünüz yolda!'}
              </Text>
              <Text style={styles.activeBannerSubtext} numberOfLines={1}>
                {activeRide.originAddress} → {activeRide.destinationAddress}
              </Text>
            </View>
            <Text style={styles.activeBannerArrow}>Görüntüle →</Text>
          </TouchableOpacity>
        )}

        {/* Talep Oluşturma Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>Nereye Gitmek İstiyorsunuz?</Text>
            {(originAddress.length > 0 || destinationAddress.length > 0) && (
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={handleSwapAddresses}
                activeOpacity={0.7}
              >
                <Text style={styles.swapBtnText}>⇅ Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Rota Çizgisi ve Girdiler */}
          <View style={styles.routeBox}>
            <View style={styles.timeline}>
              <View style={[styles.dot, styles.pickupDot]} />
              <View style={styles.line} />
              <View style={[styles.dot, styles.dropoffDot]} />
            </View>

            <View style={styles.inputsWrapper}>
              {/* Alış Noktası */}
              <View style={styles.inputContainer}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputMiniLabel}>NEREDEN ALINSIN?</Text>
                  {originAddress.length > 0 && (
                    <TouchableOpacity onPress={() => setOriginAddress('')}>
                      <Text style={styles.clearInputText}>Temizle</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Başlangıç adresi (örn: Kadıköy Rıhtım)"
                  placeholderTextColor={Colors.textMuted}
                  value={originAddress}
                  onChangeText={(t) => {
                    setOriginAddress(t);
                    if (error) clearError();
                  }}
                />
              </View>

              {/* Varış Noktası */}
              <View style={styles.inputContainer}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputMiniLabel}>NEREYE GİDİLECEK?</Text>
                  {destinationAddress.length > 0 && (
                    <TouchableOpacity onPress={() => setDestinationAddress('')}>
                      <Text style={styles.clearInputText}>Temizle</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Hedef adresi (örn: Beşiktaş Meydan)"
                  placeholderTextColor={Colors.textMuted}
                  value={destinationAddress}
                  onChangeText={(t) => {
                    setDestinationAddress(t);
                    if (error) clearError();
                  }}
                />
              </View>
            </View>
          </View>

          {/* Yolculuk Önizleme Bilgisi */}
          {originAddress.trim().length > 0 && destinationAddress.trim().length > 0 && (
            <View style={styles.estimateBanner}>
              <Text style={styles.estimateIcon}>⚡</Text>
              <View style={styles.estimateContent}>
                <Text style={styles.estimateTitle}>Yolda TAG Standart</Text>
                <Text style={styles.estimateSubtitle}>
                  En yakın sürücü aranacak • Ödeme doğrudan sürücüye
                </Text>
              </View>
            </View>
          )}

          {/* Hızlı Öneriler */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Hızlı Başlangıç Noktaları:</Text>
            <View style={styles.chipsRow}>
              {quickOrigins.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.chip}
                  onPress={() => setOriginAddress(loc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>📍 {loc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.quickTitle, { marginTop: 12 }]}>Popüler Varış Noktaları:</Text>
            <View style={styles.chipsRow}>
              {quickDestinations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.chip}
                  onPress={() => setDestinationAddress(loc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>🏁 {loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TAG Çağır Butonu */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!originAddress.trim() || !destinationAddress.trim()) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !originAddress.trim() || !destinationAddress.trim()}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.secondary} />
            ) : (
              <Text style={styles.submitBtnText}>🚗 TAG Yolculuğu Başlat</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Taleplerime Geçiş Düğmesi */}
        <TouchableOpacity
          style={styles.historyNavBtn}
          onPress={() => navigation.navigate('CustomerRides')}
          activeOpacity={0.8}
        >
          <Text style={styles.historyNavIcon}>📋</Text>
          <View>
            <Text style={styles.historyNavTitle}>Geçmiş ve Aktif Taleplerim</Text>
            <Text style={styles.historyNavSubtitle}>Tüm yolculuk durumlarınızı canlı takip edin</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  activeRideBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeBannerContent: {
    flex: 1,
    marginRight: 8,
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  activeBannerSubtext: {
    fontSize: 12,
    color: '#B45309',
  },
  activeBannerArrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  swapBtn: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  clearInputText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  estimateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  estimateIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  estimateContent: {
    flex: 1,
  },
  estimateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  estimateSubtitle: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 1,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  routeBox: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    paddingVertical: 18,
    marginRight: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: '#10B981',
  },
  dropoffDot: {
    backgroundColor: '#EF4444',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  inputsWrapper: {
    flex: 1,
    gap: 12,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputMiniLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  input: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    padding: 0,
  },
  quickSection: {
    marginVertical: 10,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
  },
  historyNavBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  historyNavIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  historyNavTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyNavSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default CreateRideScreen;
