import { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { BusinessSettings } from '@/types';

export default function TabLayout() {
  const { primary, colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [features] = useState<BusinessSettings['features']>({
    sales: true,
    jobs: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // Don't render tabs until authentication is checked
  if (loading || !user) {
    return null;
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: primary,
      tabBarInactiveTintColor: '#64748b',
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      headerStyle: {
        backgroundColor: colors.surface,
      },
      headerTitleStyle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color }) => <Ionicons name="cart" color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="bikes"
        options={{
          title: 'Bikes',
          tabBarIcon: ({ color }) => <Ionicons name="bicycle" color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Ionicons name="construct" color={color} size={24} />
        }}
      />
      {/* Only show clients tab for admin users */}
      {user.role === 'admin' && (
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clients',
            tabBarIcon: ({ color }) => <Ionicons name="people" color={color} size={24} />
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: user ? 'Profile' : 'Login',
          tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} size={24} />
        }}
      />
    </Tabs>
  );
}