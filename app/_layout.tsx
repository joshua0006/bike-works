import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import '../lib/firebase';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Tab navigation group */}
          <Stack.Screen name="(tabs)" />
          
          {/* Auth screens */}
          <Stack.Screen
            name="auth/login"
            options={{ 
              title: 'Log In', 
              headerShown: true,
              presentation: 'modal' 
            }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{ 
              title: 'Sign Up',
              headerShown: true,
              presentation: 'modal' 
            }}
          />
          <Stack.Screen
            name="auth/profile"
            options={{ 
              title: 'My Profile',
              headerShown: true
            }}
          />
          
          {/* Stack screens (non-tab) */}
          <Stack.Screen
            name="bikes/new"
            options={{ 
              title: 'Add New Bike',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="bikes/[id]"
            options={{ 
              title: 'Bike Details',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="sales/new"
            options={{ 
              title: 'New Sale',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="jobs/new"
            options={{ 
              title: 'New Job',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="jobs/[id]"
            options={{ 
              title: 'Job Details',
              headerShown: true
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
