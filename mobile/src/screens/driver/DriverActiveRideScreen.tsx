import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { useRideStore } from '../../store/rideStore';
import { Colors } from '../../theme/colors';

interface DriverActiveRideScreenProps {
  navigation: any;
}

export const DriverActiveRideScreen: React.FC<DriverActiveRideScreenProps> = ({ navigation }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { activeRide, completeRideById } = useRideStore();

  const handleComplete = () => {
    if (!activeRide) return;

    Alert.alert(
      'Yolculuğu Tamamla',
      'Yolcuyu varış noktasına ulaştırdınız mı? Bu işlem yolculuğu sonlandıracaktır.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Tamamla',
          onPress: async () => {
            setIsCompleting(true);
            const success = await completeRideById(activeRide.id);
            setIsCompleting(false);
            if (success) {
              Alert.alert('Tebrikler! 🎉', 'Yolculuk başarıyla tamamlandı.', [
                {
                  text: 'Yeni Taleplere Dön',
                  onPress: () => navigation.navigate('PendingRides'),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  if (!activeRide || activeRide.status !== 'ACCEPTED') {
    return (
      <View style={styles.container}>
        <Header title="Aktif Yolculuk" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>Aktif Bir Yolculuğunuz Yok</Text>
          <Text style={styles.emptySubtitle}>
            Şu anda kabul edilmiş ve devam eden bir yolculuğunuz bulunmuyor. Bekleyen talepler arasından bir yolcu seçebilirsiniz.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('PendingRides')}
          >
            <Text style={styles.backBtnText}>Bekleyen Talepleri Gör</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Aktif Yolculuk" subtitle="Yolcu taşınıyor" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Durum Kartı */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusCardTitle}>YOLCULUK DURUMU</Text>
            <StatusBadge status={activeRide.status} />
          </View>
          <Text style={styles.statusMessage}>
            Yolcuyu teslim almak ve hedefe götürmek üzere yoldasınız.
          </Text>
        </View>

        {/* Yolcu Bilgileri */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>YOLCU BİLGİLERİ</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {activeRide.customer?.fullName?.charAt(0).toUpperCase() || 'Y'}
              </Text>
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>
                {activeRide.customer?.fullName || 'Misafir Yolcu'}
              </Text>
              <Text style={styles.customerEmail}>
                {activeRide.customer?.email || 'E-posta belirtilmemiş'}
              </Text>
            </View>
          </View>
        </View>

        {/* Rota Detayı */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ROTA DETAYI</Text>

          <View style={styles.routeContainer}>
            <View style={styles.timeline}>
              <View style={[styles.timelineDot, styles.pickupDot]} />
              <View style={styles.timelineLine} />
              <View style={[styles.timelineDot, styles.dropoffDot]} />
            </View>

            <View style={styles.addresses}>
              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>ALIŞ NOKTASI</Text>
                <Text style={styles.addressValue}>{activeRide.originAddress}</Text>
              </View>

              <View style={[styles.addressBlock, { marginTop: 16 }]}>
                <Text style={styles.addressLabel}>VARIŞ NOKTASI</Text>
                <Text style={styles.addressValue}>{activeRide.destinationAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Yolculuğu Tamamla Butonu */}
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={handleComplete}
          disabled={isCompleting}
          activeOpacity={0.85}
        >
          {isCompleting ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.completeBtnText}>✓ Yolculuğu Tamamla</Text>
          )}
        </TouchableOpacity>

        {/* Bekleyen Taleplere Dön */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('PendingRides')}
        >
          <Text style={styles.secondaryBtnText}>Tüm Bekleyen Talepleri Gör</Text>
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
  statusCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  statusMessage: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeContainer: {
    flexDirection: 'row',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    paddingVertical: 6,
    marginRight: 10,
  },
  timelineDot: {
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
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  addresses: {
    flex: 1,
  },
  addressBlock: {},
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  completeBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.surface,
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.secondary,
  },
});

export default DriverActiveRideScreen;
