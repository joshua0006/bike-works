import { useAuth } from '../contexts/AuthContext';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

interface Props {
  adminOnly?: boolean;
  children: React.ReactNode;
}

export function AuthGuard({ adminOnly = false, children }: Props) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Redirect href="/" />;
  }

  return children;
} 