import React, { useEffect } from 'react';
import { Stack, useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function BikesLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const isAdmin = user?.role === 'admin';
  const pathname = usePathname();

  // Protect bike creation route - only admins can create bikes
  useEffect(() => {
    // Only protect the 'new' route, allow viewing bike details for all users
    const isNewBikeRoute = pathname === '/bikes/new';
    
    if (!loading && isNewBikeRoute && !isAdmin) {
      Alert.alert(
        'Access Denied', 
        'Only administrators can add new bikes. Please contact an administrator for assistance.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  }, [user, loading, router, isAdmin, pathname]);

  // Don't render anything while checking authentication
  if (loading) {
    return null;
  }

  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  );
} 