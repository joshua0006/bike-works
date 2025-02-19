/**
 * Bike List Component
 * 
 * Displays a list of bikes with filtering and sorting capabilities. Used in both
 * the main bikes screen and when selecting bikes for jobs or sales.
 * 
 * Props:
 * - bikes: Bike[] - Array of bikes to display
 * - onSelect?: (bike: Bike) => void - Optional callback when a bike is selected
 * - filter?: (bike: Bike) => boolean - Optional filter function
 * 
 * Features:
 * - Search/filter bikes
 * - Sort by different fields
 * - Quick actions menu
 */

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Bike } from '../../types';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter, useFocusEffect } from 'expo-router';

interface Props {
  bikes: Bike[];
  onSelect?: (bike: Bike) => void;
  filter?: (bike: Bike) => boolean;
}

export function BikeList() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchBikes = async () => {
        console.log('Starting bike fetch');
        setLoading(true);
        try {
          const q = query(collection(db, 'bikes'));
          const querySnapshot = await getDocs(q);
          
          if (!isActive) return; // Prevent state updates if unmounted
          
          console.log('Bikes fetched:', querySnapshot.size);
          const bikesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Bike[];
          
          setBikes(bikesData);
          setError('');
        } catch (err) {
          console.error('Fetch error:', err);
          if (isActive) {
            setError('Failed to fetch bikes. Pull down to refresh.');
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchBikes();

      return () => {
        isActive = false; // Cleanup on unmount
      };
    }, []) // Empty dependency array ensures it runs only once per focus
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    let isActive = true;
    setRefreshing(true);
    try {
      const q = query(collection(db, 'bikes'));
      const querySnapshot = await getDocs(q);
      
      if (isActive) {
        setBikes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Bike));
      }
    } catch (err) {
      if (isActive) {
        setError('Failed to refresh bikes');
      }
    } finally {
      if (isActive) {
        setRefreshing(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderBike = ({ item: bike }: { item: Bike }) => (
    <Pressable
      style={styles.bikeCard}
      onPress={() => setSelectedBike(bike)}
    >
      <View style={styles.imageContainer}>
        {bike.photos?.[0] ? (
          <Image
            source={{ uri: bike.photos[0] }}
            style={styles.bikeImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="bicycle" size={40} color="#94a3b8" />
        )}
      </View>
      
      <View style={styles.bikeInfo}>
        <Text style={styles.serialNumber}>{bike.serialNumber}</Text>
        <Text style={styles.bikeTitle}>
          {bike.year} {bike.brand} {bike.model}
        </Text>
        <Text style={styles.bikeDetails}>
          {bike.type} • {bike.size} • {bike.color}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
    </Pressable>
  );

  return (
    <>
      <FlatList
        data={bikes}
        renderItem={renderBike}
        keyExtractor={(bike) => bike.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateText}>No bikes found</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => router.push('/bikes/new')}
              >
                <Text style={styles.addButtonText}>Add First Bike</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
      
      <Modal
        visible={!!selectedBike}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBike(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedBike(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedBike && (
                    <>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Bike Details</Text>
                        <Ionicons 
                          name="close" 
                          size={24} 
                          color="#64748b" 
                          onPress={() => setSelectedBike(null)}
                        />
                      </View>

                      {selectedBike.photos?.[0] && (
                        <Image
                          source={{ uri: selectedBike.photos[0] }}
                          style={styles.modalImage}
                          resizeMode="contain"
                        />
                      )}

                      <View style={styles.detailsGrid}>
                        <DetailItem label="Serial" value={selectedBike.serialNumber} />
                        <DetailItem label="Brand" value={selectedBike.brand} />
                        <DetailItem label="Model" value={selectedBike.model} />
                        <DetailItem label="Year" value={selectedBike.year?.toString()} />
                        <DetailItem label="Color" value={selectedBike.color} />
                        <DetailItem label="Size" value={selectedBike.size} />
                        <DetailItem label="Type" value={selectedBike.type} />
                      </View>

                      {selectedBike.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.sectionLabel}>Additional Notes</Text>
                          <Text style={styles.notesText}>{selectedBike.notes}</Text>
                        </View>
                      )}
                    </>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function BikeCard({ bike }: { bike: Bike }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.brandModel}>{bike.brand} {bike.model}</Text>
        <Text style={styles.serial}>#{bike.serialNumber}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color="#64748b" />
          <Text style={styles.detailText}>{bike.year || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="color-palette" size={16} color="#64748b" />
          <Text style={styles.detailText}>{bike.color || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="resize" size={16} color="#64748b" />
          <Text style={styles.detailText}>{bike.size || 'N/A'}</Text>
        </View>
      </View>

      {bike.photos?.[0] && (
        <Image 
          source={{ uri: bike.photos[0] }} 
          style={styles.bikeImage} 
          resizeMode="cover"
        />
      )}
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <View style={detailStyles.container}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value || 'N/A'}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    width: '48%',
    minWidth: '48%',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
});

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  bikeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  bikeImage: {
    width: '100%',
    height: '100%',
  },
  bikeInfo: {
    flex: 1,
  },
  serialNumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  bikeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bikeDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxWidth: 375,
    maxHeight: '80%',
    padding: 0,
  },
  scrollContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandModel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  serial: {
    fontSize: 14,
    color: '#64748b',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  bikeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});