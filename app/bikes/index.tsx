/**
 * Bikes Screen
 * 
 * Shows all bikes owned by the current user
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  Image,
  Alert 
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getUserBikes } from '@/lib/userOperations';
import type { Bike } from '@/types';

export default function BikesScreen() {
  const { colors, primary } = useTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [userBikes, setUserBikes] = useState<Bike[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const isAdmin = user?.role === 'admin';

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);
  
  // Load user bikes
  useFocusEffect(
    useCallback(() => {
      const fetchUserBikes = async () => {
        if (!user) return;
        
        try {
          setLoadingBikes(true);
          const bikes = await getUserBikes(user.id);
          setUserBikes(bikes);
        } catch (error) {
          console.error('Error fetching user bikes:', error);
          Alert.alert('Error', 'Failed to load your bikes. Please try again.');
          setUserBikes([]);
        } finally {
          setLoadingBikes(false);
        }
      };
      
      fetchUserBikes();
    }, [user])
  );

  // Don't render content until authentication check is complete
  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }
  
  const handleBikePress = (bike: Bike) => {
    // Use navigate method for dynamic routes
    router.navigate({
      pathname: '/bikes/[id]',
      params: { id: bike.id }
    });
  };

  const renderBikeItem = ({ item }: { item: Bike }) => (
    <TouchableOpacity 
      style={[styles.bikeItem, { backgroundColor: colors.surface }]}
      onPress={() => handleBikePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bikeImageContainer}>
        {item.photos && item.photos.length > 0 ? (
          <Image 
            source={{ uri: item.photos[0] }} 
            style={styles.bikeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bikePlaceholder, { backgroundColor: colors.background }]}>
            <Ionicons name="bicycle" size={40} color={colors.textSecondary} />
          </View>
        )}
        {item.status && (
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'available' ? primary : 
                            item.status === 'sold' ? '#10b981' : 
                            '#f59e0b'
          }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bikeDetails}>
        <Text style={[styles.bikeName, { color: colors.text }]}>
          {item.brand} {item.model}
        </Text>
        <Text style={[styles.bikeInfo, { color: colors.textSecondary }]}>
          {item.year} • {item.size} • {item.color}
        </Text>
        <Text style={[styles.serialNumber, { color: colors.textSecondary }]}>
          SN: {item.serialNumber}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          My Bikes
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isAdmin ? 'All bikes in the system' : 'Bikes you have purchased'}
        </Text>
      </View>

      {loadingBikes ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading bikes...</Text>
        </View>
      ) : userBikes.length > 0 ? (
        <FlatList
          data={userBikes}
          renderItem={renderBikeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bikesList}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="bicycle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bikes Found</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {isAdmin 
              ? "Add bikes to inventory to see them here" 
              : "You haven't purchased any bikes yet. Check out our available bikes for sale."}
          </Text>
          {isAdmin && (
            <TouchableOpacity 
              style={[styles.addBikeButton, { backgroundColor: primary }]}
              onPress={() => router.push('/bikes/new')}
            >
              <Text style={styles.addBikeButtonText}>Add New Bike</Text>
            </TouchableOpacity>
          )}
          {!isAdmin && (
            <TouchableOpacity 
              style={[styles.viewSalesButton, { backgroundColor: primary }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.viewSalesButtonText}>View Available Bikes</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  bikesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bikeItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bikeImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  bikeImage: {
    width: '100%',
    height: '100%',
  },
  bikePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bikeDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  bikeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bikeInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  serialNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  addBikeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  addBikeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  viewSalesButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewSalesButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
}); 