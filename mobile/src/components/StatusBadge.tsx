import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RideStatus } from '../api/ride.api';
import { Colors } from '../theme/colors';
import { RIDE_STATUS_LABELS } from '../config/constants';

interface StatusBadgeProps {
  status: RideStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING':
        return { bg: Colors.pendingBg, text: Colors.pending, border: '#FCD34D' };
      case 'ACCEPTED':
        return { bg: Colors.acceptedBg, text: Colors.accepted, border: '#93C5FD' };
      case 'COMPLETED':
        return { bg: Colors.completedBg, text: Colors.completed, border: '#6EE7B7' };
      case 'CANCELLED':
        return { bg: Colors.cancelledBg, text: Colors.cancelled, border: '#FCA5A5' };
      default:
        return { bg: Colors.surfaceSubtle, text: Colors.textSecondary, border: Colors.border };
    }
  };

  const style = getBadgeStyle();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
        isSmall && styles.badgeSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: style.text }]} />
      <Text style={[styles.label, { color: style.text }, isSmall && styles.labelSmall]}>
        {RIDE_STATUS_LABELS[status] || status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 11,
  },
});

export default StatusBadge;
