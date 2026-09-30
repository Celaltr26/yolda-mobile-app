import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import {
  AuthStackParamList,
  CustomerStackParamList,
  DriverStackParamList,
} from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { CreateRideScreen } from '../screens/customer/CreateRideScreen';
import { CustomerRidesScreen } from '../screens/customer/CustomerRidesScreen';
import { PendingRidesScreen } from '../screens/driver/PendingRidesScreen';
import { DriverActiveRideScreen } from '../screens/driver/DriverActiveRideScreen';
import { Colors } from '../theme/colors';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const DriverStack = createNativeStackNavigator<DriverStackParamList>();

// Kimlik Doğrulama Yığını (Giriş & Kayıt)
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Müşteri / Yolcu Yığını
const CustomerNavigator = () => (
  <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
    <CustomerStack.Screen name="CreateRide" component={CreateRideScreen} />
    <CustomerStack.Screen name="CustomerRides" component={CustomerRidesScreen} />
  </CustomerStack.Navigator>
);

// Sürücü Yığını
const DriverNavigator = () => (
  <DriverStack.Navigator screenOptions={{ headerShown: false }}>
    <DriverStack.Screen name="PendingRides" component={PendingRidesScreen} />
    <DriverStack.Screen name="DriverActiveRide" component={DriverActiveRideScreen} />
  </DriverStack.Navigator>
);

export const AppNavigator = () => {
  const { user, token, isInitializing, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isAuthenticated = !!token && !!user;

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user.role === 'DRIVER' ? (
        <DriverNavigator />
      ) : (
        <CustomerNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AppNavigator;
