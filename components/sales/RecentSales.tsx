import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity, Image, Pressable, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Linking, FlatList } from 'react-native';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ionicons } from '@expo/vector-icons';

interface SaleData {
  bikeId: string;
  clientEmail: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  dateSold: string;
  id: string;
  isNewBike: boolean;
  photos: string[];
  price: number;
  saleDate: string;
  soldBy: string;
  status: string;
}

export function RecentSales() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        console.log('🔍 Fetching recent sales...');
        const q = query(
          collection(db, 'purchases'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        
        const salesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SaleData[];
        
        console.log('✅ Recent sales:', salesData);
        setSales(salesData);
      } catch (err) {
        console.error('❌ Error fetching recent sales:', err);
        setError('Failed to load recent sales');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  const openModal = (sale: SaleData) => {
    setSelectedSale(sale);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / Dimensions.get('window').width);
      setActivePhotoIndex(index);
    });

    return () => scrollX.removeListener(listener);
  }, [scrollX]);

  const renderSaleItem = ({ item }: { item: SaleData }) => (
    <Pressable onPress={() => {
      setModalVisible(true);
      openModal(item);
    }}>
      <View style={styles.saleCard}>
        <Text style={styles.clientName}>{item.clientName}</Text>
        <Text style={styles.saleInfo}>
          Date: {new Date(item.dateSold).toLocaleDateString()}
        </Text>
        <Text style={styles.saleInfo}>Price: ${item.price}</Text>
        <Text style={styles.saleInfo}>Status: {item.status}</Text>
        <Text style={styles.saleInfo}>Sold By: {item.soldBy}</Text>
        <Text style={styles.contact}>
          📞 {item.clientPhone} | ✉️ {item.clientEmail}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
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

  return (
    <>
      <ScrollView style={styles.container}>
        {sales.map((sale) => renderSaleItem({ item: sale }))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
          <Pressable 
            style={styles.modalBackdrop}
            onPress={closeModal}
          >
            <View style={styles.modalContainer}>
              <Animated.View 
                style={[styles.modalContent, { opacity: fadeAnim }]}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.carouselContainer}>
                  <FlatList
                    horizontal
                    pagingEnabled
                    data={selectedSale?.photos}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    )}
                    keyExtractor={(item, index) => `${index}-${item}`}
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  />
                  {selectedSale?.photos?.length > 1 && (
                    <View style={styles.pagination}>
                      {selectedSale.photos.map((photo, index) => (
                        <View
                          key={`${index}-${photo}`}
                          style={[
                            styles.dot,
                            activePhotoIndex === index && styles.activeDot
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>

                <ScrollView 
                  style={styles.content}
                  contentContainerStyle={styles.contentPadding}
                >
                  <View style={styles.header}>
                    <Text style={styles.clientName}>{selectedSale?.clientName}</Text>
                    <Text style={styles.saleDate}>
                      {new Date(selectedSale?.dateSold).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>${selectedSale?.price}</Text>
                      <Text style={styles.statLabel}>Amount</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{selectedSale?.soldBy}</Text>
                      <Text style={styles.statLabel}>Sold By</Text>
                    </View>
                  </View>

                  <View style={[
                    styles.status,
                    selectedSale?.status === 'completed' 
                      ? styles.statusSuccess 
                      : styles.statusPending
                  ]}>
                    <Ionicons
                      name={selectedSale?.status === 'completed' ? 'checkmark-circle' : 'time'}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.statusText}>{selectedSale?.status}</Text>
                  </View>

                  <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Pressable
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`tel:${selectedSale?.clientPhone}`)}
                    >
                      <Ionicons name="call" size={20} color="white" />
                      <Text style={styles.contactButtonText}>{selectedSale?.clientPhone}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`mailto:${selectedSale?.clientEmail}`)}
                    >
                      <Ionicons name="mail" size={20} color="white" />
                      <Text style={styles.contactButtonText}>{selectedSale?.clientEmail}</Text>
                    </Pressable>
                  </View>
                </ScrollView>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </Pressable>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  saleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  saleInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  carouselContainer: {
    height: 240,
    backgroundColor: '#000',
  },
  carouselImage: {
    width: Dimensions.get('window').width * 0.9,
    height: 240,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
    width: 20,
  },
  content: {
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  contentPadding: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  saleDate: {
    fontSize: 14,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusSuccess: {
    backgroundColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  contactSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}); 