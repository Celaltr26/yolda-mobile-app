import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ride } from '../api/ride.api';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../theme/colors';

interface RideCardProps {
  ride: Ride;
  userRole: 'CUSTOMER' | 'DRIVER';
  onAccept?: (ride: Ride) => void;
  onComplete?: (ride: Ride) => void;
  onCancel?: (ride: Ride) => void;
  isActionLoading?: boolean;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  userRole,
  onAccept,
  onComplete,
  onCancel,
  isActionLoading = false,
}) => {
  const isCustomer = userRole === 'CUSTOMER';
  const isDriver = userRole === 'DRIVER';

  // Tarih biçimlendirme
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.card}>
      {/* Kart Başlığı: Durum ve Tarih */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <StatusBadge status={ride.status} size="small" />
          <View style={styles.rideTypeBadge}>
            <Text style={styles.rideTypeBadgeText}>TAG</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatDate(ride.createdAt)}</Text>
      </View>

      {/* Adres Rotası Görselleştirmesi */}
      <View style={styles.routeContainer}>
        <View style={styles.routeTimeline}>
          <View style={[styles.timelineDot, styles.pickupDot]} />
          <View style={styles.timelineLine} />
          <View style={[styles.timelineDot, styles.dropoffDot]} />
        </View>

        <View style={styles.routeAddresses}>
          {/* Nereden */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>ALIŞ NOKTASI</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {ride.originAddress}
            </Text>
          </View>

          {/* Nereye */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>VARIŞ NOKTASI</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {ride.destinationAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* İlgili Kullanıcı Bilgisi (Sürücü veya Müşteri) */}
      <View style={styles.personRow}>
        {isCustomer && ride.driver && (
          <View style={styles.personBadge}>
            <Text style={styles.personRole}>Sürücü:</Text>
            <Text style={styles.personName}>{ride.driver.fullName}</Text>
          </View>
        )}

        {isDriver && ride.customer && (
          <View style={styles.personBadge}>
            <Text style={styles.personRole}>Yolcu:</Text>
            <Text style={styles.personName}>{ride.customer.fullName}</Text>
          </View>
        )}

        {isCustomer && ride.status === 'PENDING' && (
          <Text style={styles.pendingHint}>Yakındaki TAG sürücüleri aranıyor...</Text>
        )}
      </View>

      {/* Eylem Butonları */}
      {/* 1. Müşteri İptal Butonu (Sadece PENDING ise) */}
      {isCustomer && ride.status === 'PENDING' && onCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(ride)}
          disabled={isActionLoading}
          activeOpacity={0.8}
        >
          {isActionLoading ? (
            <ActivityIndicator size="small" color={Colors.danger} />
          ) : (
            <Text style={styles.cancelButtonText}>Talebi İptal Et</Text>
          )}
        </TouchableOpacity>
      )}

      {/* 2. Sürücü Kabul Butonu (Sadece PENDING ise) */}
      {isDriver && ride.status === 'PENDING' && onAccept && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onAccept(ride)}
          disabled={isActionLoading}
          activeOpacity={0.8}
        >
          {isActionLoading ? (
            <ActivityIndicator size="small" color={Colors.secondary} />
          ) : (
            <Text style={styles.acceptButtonText}>Yolculuğu Kabul Et</Text>
          )}
        </TouchableOpacity>
      )}

      {/* 3. Sürücü Tamamla Butonu (Sadece ACCEPTED ise) */}
      {isDriver && ride.status === 'ACCEPTED' && onComplete && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete(ride)}
          disabled={isActionLoading}
          activeOpacity={0.8}
        >
          {isActionLoading ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <Text style={styles.completeButtonText}>✓ Yolculuğu Tamamla</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rideTypeBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  rideTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeTimeline: {
    width: 24,
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickupDot: {
    backgroundColor: '#10B981', // Yeşil
  },
  dropoffDot: {
    backgroundColor: '#EF4444', // Kırmızı
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  routeAddresses: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 8,
  },
  addressBlock: {
    minHeight: 34,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSubtle,
    marginBottom: 10,
  },
  personBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  personName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pendingHint: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.pending,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.secondary,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.surface,
  },
  cancelButton: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
  },
});

export default RideCard;
