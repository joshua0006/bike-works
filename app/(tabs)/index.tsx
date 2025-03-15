/**
 * Sales Screen (Main Dashboard)
 * 
 * Shows available bikes for sale with popup details and buy option
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Modal,
  Image,
  Pressable,
  Animated
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableBikes, purchaseBikeForUser } from '@/lib/userOperations';
import type { Bike } from '@/types';
import { BikeCard } from '@/components/bikes/BikeCard';

export default function SalesScreen() {
  const { colors, primary } = useTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isAdmin = user?.role === 'admin';
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);
  
  // Load available bikes
  useEffect(() => {
    const fetchAvailableBikes = async () => {
      if (!user) return;
      
      try {
        setLoadingBikes(true);
        const bikes = await getAvailableBikes();
        
        // Make sure each bike has a status field set to 'available'
        const bikesWithStatus = bikes.map(bike => ({
          ...bike,
          status: bike.status || 'available'
        }));
        
        setAvailableBikes(bikesWithStatus);
      } catch (error) {
        console.error('Error fetching available bikes:', error);
        // More detailed error message based on the specific error
        if (error instanceof Error && error.message.includes('permission')) {
          Alert.alert(
            'Permission Error', 
            'You don\'t have permission to access available bikes. Please contact your administrator or check the Firebase rules.'
          );
        } else {
          Alert.alert('Error', 'Failed to load available bikes. Please try again.');
        }
        setAvailableBikes([]); // Set empty array on error
      } finally {
        setLoadingBikes(false);
      }
    };
    
    fetchAvailableBikes();
  }, [user]);

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
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      // Set selected bike and show modal
      setSelectedBike(bike);
      setModalVisible(true);
      
      // Fade back in after modal is shown
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();
    });
  };

  const handleBikeOrder = async (bike: Bike) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to purchase a bike");
      return;
    }
    
    try {
      // Show loading dialog
      Alert.alert(
        "Processing Purchase",
        "Please wait while we process your purchase...",
        [{ text: "OK" }]
      );
      
      // Purchase the bike
      await purchaseBikeForUser(user.id, bike.id);
      
      // Refresh the list of available bikes
      setLoadingBikes(true);
      const bikes = await getAvailableBikes();
      const bikesWithStatus = bikes.map(bike => ({
        ...bike,
        status: bike.status || 'available'
      }));
      setAvailableBikes(bikesWithStatus);
      setLoadingBikes(false);
      
      // Close the modal
      setModalVisible(false);
      
      // Show success message
      Alert.alert(
        "Order Confirmed",
        `Thank you for your order! Your new ${bike.brand} ${bike.model} is now in your collection.`,
        [
          { 
            text: "View My Bikes", 
            onPress: () => router.push('/bikes')
          },
          {
            text: "OK",
            style: "default"
          }
        ]
      );
    } catch (error) {
      console.error('Error purchasing bike:', error);
      let errorMessage = "Failed to complete your purchase. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('not available')) {
          errorMessage = "This bike is no longer available for purchase.";
        } else if (error.message.includes('permission')) {
          errorMessage = "You don't have permission to purchase this bike.";
        }
      }
      
      Alert.alert("Purchase Error", errorMessage);
    }
  };

  const handleViewAllBikes = () => {
    router.push('/bikes');
  };

  const renderBikeItem = ({ item }: { item: Bike }) => (
    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
      <TouchableOpacity 
        style={[styles.bikeListItem, { backgroundColor: colors.surface }]}
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
            <View style={[styles.statusBadge, { backgroundColor: primary }]}>
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
          <View style={styles.priceContainer}>
            <Text style={[styles.bikePrice, { color: primary }]}>
              ${item.purchasePrice?.toFixed(2) || "N/A"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Available Bikes for Sale
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find your perfect ride
        </Text>
      </View>

      {/* Available Bikes Grid */}
      <View style={styles.bikesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Collection</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.viewAllButton, { borderColor: primary }]}
              onPress={handleViewAllBikes}
            >
              <Text style={[styles.viewAllButtonText, { color: primary }]}>View All</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: primary }]}
                onPress={() => router.push('/bikes/new')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Bike</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {loadingBikes ? (
          <View style={[styles.loadingContainer, { height: 200, backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading bikes...</Text>
          </View>
        ) : availableBikes.length > 0 ? (
          <FlatList
            data={availableBikes}
            renderItem={renderBikeItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.bikesList}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          />
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bikes Available</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isAdmin 
                ? "Add bikes to inventory with status 'available' to see them here" 
                : "There are currently no bikes available for sale. Please check back later."}
            </Text>
            {isAdmin && (
              <TouchableOpacity 
                style={[styles.addBikeButton, { backgroundColor: primary }]}
                onPress={() => router.push('/bikes/new')}
              >
                <Text style={styles.addBikeButtonText}>Add New Bike</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {/* Bike Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedBike && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedBike.brand} {selectedBike.model}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {/* Bike Image */}
                <View style={[styles.modalImageContainer, { backgroundColor: colors.background }]}>
                  {selectedBike.photos && selectedBike.photos.length > 0 ? (
                    <Image 
                      source={{ uri: selectedBike.photos[0] }} 
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="bicycle" size={100} color={colors.textSecondary} />
                  )}
                </View>

                {/* Price Tag */}
                <View style={[styles.modalPriceTag, { backgroundColor: primary }]}>
                  <Text style={styles.modalPriceText}>
                    ${selectedBike.purchasePrice?.toFixed(2) || "N/A"}
                  </Text>
                </View>

                {/* Bike Specifications */}
                <View style={styles.modalSpecsContainer}>
                  <View style={styles.modalSpecRow}>
                    <View style={styles.modalSpecItem}>
                      <Ionicons name="calendar-outline" size={20} color={primary} />
                      <Text style={[styles.modalSpecLabel, { color: colors.textSecondary }]}>Year</Text>
                      <Text style={[styles.modalSpecValue, { color: colors.text }]}>{selectedBike.year}</Text>
                    </View>
                    <View style={styles.modalSpecItem}>
                      <Ionicons name="color-palette-outline" size={20} color={primary} />
                      <Text style={[styles.modalSpecLabel, { color: colors.textSecondary }]}>Color</Text>
                      <Text style={[styles.modalSpecValue, { color: colors.text }]}>{selectedBike.color}</Text>
                    </View>
                  </View>
                  <View style={styles.modalSpecRow}>
                    <View style={styles.modalSpecItem}>
                      <Ionicons name="bicycle-outline" size={20} color={primary} />
                      <Text style={[styles.modalSpecLabel, { color: colors.textSecondary }]}>Type</Text>
                      <Text style={[styles.modalSpecValue, { color: colors.text }]}>{selectedBike.type}</Text>
                    </View>
                    <View style={styles.modalSpecItem}>
                      <Ionicons name="resize-outline" size={20} color={primary} />
                      <Text style={[styles.modalSpecLabel, { color: colors.textSecondary }]}>Size</Text>
                      <Text style={[styles.modalSpecValue, { color: colors.text }]}>{selectedBike.size}</Text>
                    </View>
                  </View>
                  <View style={styles.modalSerialContainer}>
                    <Ionicons name="barcode-outline" size={20} color={primary} />
                    <Text style={[styles.modalSerialLabel, { color: colors.textSecondary }]}>Serial Number:</Text>
                    <Text style={[styles.modalSerialValue, { color: colors.text }]}>{selectedBike.serialNumber}</Text>
                  </View>
                  
                  {selectedBike.notes && (
                    <View style={styles.modalNotesContainer}>
                      <Ionicons name="document-text-outline" size={20} color={primary} />
                      <Text style={[styles.modalNotesLabel, { color: colors.textSecondary }]}>Notes:</Text>
                      <Text style={[styles.modalNotesValue, { color: colors.text }]}>{selectedBike.notes}</Text>
                    </View>
                  )}
                </View>

                {/* Buy Button */}
                <TouchableOpacity
                  style={[styles.buyButton, { backgroundColor: primary }]}
                  onPress={() => handleBikeOrder(selectedBike)}
                >
                  <Ionicons name="cart" size={24} color="#FFFFFF" />
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 8,
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
  bikesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllButtonText: {
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bikesList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
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
  },
  addBikeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalImageContainer: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalPriceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalPriceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalSpecsContainer: {
    marginBottom: 20,
  },
  modalSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSpecItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalSpecLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  modalSpecValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSerialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalSerialLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalSerialValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  modalNotesContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginBottom: 4,
  },
  modalNotesValue: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  bikeListItem: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 8,
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
    justifyContent: 'space-between',
  },
  bikeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bikeInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bikePrice: {
    fontSize: 18,
    fontWeight: 'bold',
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
  separator: {
    height: 1,
    width: '100%',
  },
});