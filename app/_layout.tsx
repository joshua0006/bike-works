import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';
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
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tab navigation group */}
        <Stack.Screen name="(tabs)" />
        
        {/* Stack screens (non-tab) */}
        <Stack.Screen
          name="bikes/new"
          options={{ title: 'Add New Bike' }}
        />
        <Stack.Screen
          name="sales/new"
          options={{ title: 'New Sale' }}
        />
        <Stack.Screen
          name="jobs/new"
          options={{ title: 'New Job' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
