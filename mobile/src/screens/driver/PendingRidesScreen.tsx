import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { RideCard } from '../../components/RideCard';
import { useRideStore } from '../../store/rideStore';
import { Colors } from '../../theme/colors';
import { Ride } from '../../api/ride.api';
import {
  subscribeToNewRideRequests,
  subscribeToRideStatusUpdates,
} from '../../socket/socket';

interface PendingRidesScreenProps {
  navigation: any;
}

export const PendingRidesScreen: React.FC<PendingRidesScreenProps> = ({ navigation }) => {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const {
    pendingRides,
    activeRide,
    fetchPendingRides,
    fetchMyRides,
    acceptRideById,
    isLoading,
    handleSocketNewRide,
    handleSocketRideUpdated,
  } = useRideStore();

  useEffect(() => {
    fetchPendingRides();
    fetchMyRides();

    // 1. Yeni talep geldiğinde dinle
    const unsubscribeNewRide = subscribeToNewRideRequests((newRide: Ride) => {
      handleSocketNewRide(newRide);
      Alert.alert(
        '🔔 Yeni Yolculuk Talebi!',
        `Alış: ${newRide.originAddress}\nVarış: ${newRide.destinationAddress}`
      );
    });

    // 2. Durum güncellemelerini dinle
    const unsubscribeStatus = subscribeToRideStatusUpdates((updatedRide: Ride) => {
      handleSocketRideUpdated(updatedRide);
    });

    return () => {
      unsubscribeNewRide();
      unsubscribeStatus();
    };
  }, []);

  const handleAccept = async (ride: Ride) => {
    Alert.alert(
      'Yolculuğu Kabul Et',
      `"${ride.originAddress}" noktasındaki yolcuyu almayı onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: async () => {
            setAcceptingId(ride.id);
            const success = await acceptRideById(ride.id);
            setAcceptingId(null);
            if (success) {
              Alert.alert('Harika! 🚗', 'Yolculuk kabul edildi. Yolcuya doğru hareket edebilirsiniz.', [
                {
                  text: 'Aktif Yolculuğa Git',
                  onPress: () => navigation.navigate('DriverActiveRide'),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Sürücü Paneli" subtitle="Bekleyen yolculuk talepleri" />

      {/* Eğer Sürücünün Zaten Kabul Ettiği Aktif Bir Yolculuk Varsa Banner Göster */}
      {activeRide && activeRide.status === 'ACCEPTED' && (
        <TouchableOpacity
          style={styles.activeRideBanner}
          onPress={() => navigation.navigate('DriverActiveRide')}
          activeOpacity={0.85}
        >
          <View style={styles.activeBannerContent}>
            <Text style={styles.activeBannerBadge}>DEVAM EDEN YOLCULUK</Text>
            <Text style={styles.activeBannerTitle} numberOfLines={1}>
              Yolcu: {activeRide.customer?.fullName || 'Yolcu'}
            </Text>
            <Text style={styles.activeBannerSubtext} numberOfLines={1}>
              {activeRide.originAddress} → {activeRide.destinationAddress}
            </Text>
          </View>
          <View style={styles.bannerAction}>
            <Text style={styles.bannerActionText}>Yönet →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bekleyen Talepler Bilgi Çubuğu */}
      <View style={styles.infoBar}>
        <View style={styles.liveIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>Canlı İstekler ({pendingRides.length})</Text>
        </View>
        <Text style={styles.infoHint}>Yeni talepler anlık düşer</Text>
      </View>

      {/* Bekleyen Talepler Listesi */}
      <FlatList
        data={pendingRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            userRole="DRIVER"
            onAccept={handleAccept}
            isActionLoading={acceptingId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchPendingRides}
            colors={[Colors.primaryDark]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>Şu An Bekleyen Talep Yok</Text>
            <Text style={styles.emptySubtitle}>
              Yeni bir yolcu TAG talep ettiğinde liste otomatik olarak güncellenecek ve bildirim alacaksınız.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  activeRideBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderColor: '#FCD34D',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBannerContent: {
    flex: 1,
    marginRight: 10,
  },
  activeBannerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  activeBannerSubtext: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  bannerAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  liveText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});

export default PendingRidesScreen;
