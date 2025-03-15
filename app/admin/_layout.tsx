import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Protect admin routes - redirect if not an admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      Alert.alert('Access Denied', 'You need admin privileges to access this section.');
      router.replace('/(tabs)');
    }
  }, [user, loading, router]);

  // Don't render anything while checking authentication
  if (loading || !user || user.role !== 'admin') {
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