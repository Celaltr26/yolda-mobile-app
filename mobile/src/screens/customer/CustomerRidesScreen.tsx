import React, { useEffect, useState, useMemo } from 'react';
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
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { Ride } from '../../api/ride.api';
import { subscribeToRideStatusUpdates } from '../../socket/socket';

interface CustomerRidesScreenProps {
  navigation: any;
}

type TabType = 'ALL' | 'ACTIVE' | 'PAST';

export const CustomerRidesScreen: React.FC<CustomerRidesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { myRides, fetchMyRides, cancelRideById, isLoading, handleSocketRideUpdated } =
    useRideStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyRides();

    // Socket.io ile canlı durum güncellemelerini dinle
    const unsubscribe = subscribeToRideStatusUpdates((updatedRide: Ride) => {
      handleSocketRideUpdated(updatedRide);

      // Eğer güncellenen talep bu müşteriye aitse bildirim göster
      if (updatedRide.customerId === user?.id) {
        if (updatedRide.status === 'ACCEPTED') {
          Alert.alert(
            '🎉 Sürücü Bulundu!',
            `${updatedRide.driver?.fullName || 'Bir sürücü'} yolculuk talebinizi kabul etti ve size doğru yola çıktı.`
          );
        } else if (updatedRide.status === 'COMPLETED') {
          Alert.alert('✅ Yolculuk Tamamlandı', 'TAG yolculuğunuz başarıyla tamamlandı. Teşekkürler!');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCancel = (ride: Ride) => {
    Alert.alert(
      'Talebi İptal Et',
      'Yolculuk talebini iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(ride.id);
            const success = await cancelRideById(ride.id);
            setCancellingId(null);
            if (success) {
              Alert.alert('Bilgi', 'Yolculuk talebiniz iptal edildi.');
            }
          },
        },
      ]
    );
  };

  // Filtreleme
  const filteredRides = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return myRides.filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED');
    }
    if (activeTab === 'PAST') {
      return myRides.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED');
    }
    return myRides;
  }, [myRides, activeTab]);

  return (
    <View style={styles.container}>
      <Header title="Taleplerim" subtitle="Yolculuk geçmişiniz ve durumlar" />

      {/* Filtre Sekmeleri */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            Tümü ({myRides.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
            Aktif (
            {myRides.filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'PAST' && styles.tabBtnActive]}
          onPress={() => setActiveTab('PAST')}
        >
          <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>
            Geçmiş (
            {myRides.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Yolculuk Listesi */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            userRole="CUSTOMER"
            onCancel={handleCancel}
            isActionLoading={cancellingId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMyRides}
            colors={[Colors.primaryDark]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>Henüz Yolculuk Talebi Yok</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'ACTIVE'
                ? 'Şu anda beklemede veya devam eden bir yolculuğunuz bulunmuyor.'
                : 'Yeni bir yolculuk başlatarak TAG çağırabilirsiniz.'}
            </Text>
            <TouchableOpacity
              style={styles.newRideBtn}
              onPress={() => navigation.navigate('CreateRide')}
              activeOpacity={0.8}
            >
              <Text style={styles.newRideBtnText}>+ Yeni Talep Oluştur</Text>
            </TouchableOpacity>
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
  },
  tabBtnActive: {
    backgroundColor: Colors.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  newRideBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  newRideBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.secondary,
  },
});

export default CustomerRidesScreen;
