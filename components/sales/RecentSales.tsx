import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity, Image, Pressable, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Linking, FlatList, Platform } from 'react-native';
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

// Full-screen photo viewer modal component
const FullScreenPhotoViewer = ({ 
  photos, 
  initialIndex = 0, 
  visible, 
  onClose 
}: { 
  photos: string[], 
  initialIndex?: number, 
  visible: boolean, 
  onClose: () => void 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [fadeAnim] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      // When opening, animate fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Scroll to initial photo
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const renderPhoto = ({ item }: { item: string }) => (
    <View style={{ width, height: height * 0.8, padding: 0 }}>
      <Image
        source={{ uri: item }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.fullscreenModalBackdrop, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={renderPhoto}
          keyExtractor={(_, index) => `fullscreen-photo-${index}`}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          decelerationRate="fast"
          removeClippedSubviews={true}
        />
        
        {/* Photo counter */}
        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.fullscreenCloseButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// Component for the photo grid in sale cards
const SalePhotoGrid = ({ photos }: { photos: string[] }) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const gridWidth = width * 0.9 - 32; // 90% of screen width minus card padding
  
  // Calculate thumbnail dimensions to fit nicely in a grid
  const numColumns = photos.length === 1 ? 1 : Math.min(photos.length, 3);
  const gap = 4;
  const thumbnailSize = photos.length === 1 
    ? gridWidth 
    : (gridWidth - (gap * (numColumns - 1))) / numColumns;
  
  // For single images, use a more pleasing aspect ratio (16:9)
  const singleImageHeight = photos.length === 1 ? gridWidth * 0.6 : thumbnailSize;
  
  if (photos.length === 0) {
    return (
      <View style={[styles.photoGridContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#94a3b8' }}>No photos available</Text>
      </View>
    );
  }

  const openFullscreen = (index: number = 0) => {
    setSelectedPhotoIndex(index);
    setFullscreenVisible(true);
  };

  return (
    <>
      <View style={styles.photoGridContainer}>
        <View style={styles.photoGrid}>
          {photos.slice(0, 6).map((photo, index) => (
            <View
              key={`photo-${index}`}
              style={[
                styles.gridItem,
                {
                  width: thumbnailSize,
                  height: index === 0 && photos.length === 1 ? singleImageHeight : thumbnailSize,
                  marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
                  marginBottom: index < photos.length - numColumns ? gap : 0
                }
              ]}
            >
              <Image
                source={{ uri: photo }}
                style={styles.gridImage}
                resizeMode={photos.length === 1 ? "contain" : "cover"}
              />
              {index === 5 && photos.length > 6 && (
                <View style={styles.morePhotosOverlay}>
                  <Text style={styles.morePhotosText}>+{photos.length - 6}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        
      </View>
      
      <FullScreenPhotoViewer
        photos={photos}
        initialIndex={selectedPhotoIndex}
        visible={fullscreenVisible}
        onClose={() => setFullscreenVisible(false)}
      />
    </>
  );
};

export function RecentSales() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [fullscreenPhotosVisible, setFullscreenPhotosVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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

  const openFullscreenFromModal = (index: number) => {
    if (selectedSale?.photos) {
      setSelectedPhotoIndex(index);
      setFullscreenPhotosVisible(true);
    }
  };

  const renderSaleItem = ({ item }: { item: SaleData }) => (
    <Pressable onPress={() => openModal(item)}>
      <View style={styles.saleCard}>
        {/* Photo Grid */}
        <SalePhotoGrid photos={item.photos || []} />
        
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
      <ScrollView contentContainerStyle={styles.container}>
        {sales.map((item) => (
          <Pressable 
            key={`sale-${item.id}`} 
            onPress={() => openModal(item)}
          >
            <View style={styles.saleCard}>
              <SalePhotoGrid photos={item.photos || []} />
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
        ))}
      </ScrollView>

      {/* Sale Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
          <Pressable 
            style={styles.modalBackdrop}
            onPress={closeModal}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalContainer}
              onPress={(e) => e.stopPropagation()}
            >
              <Animated.View 
                style={[styles.modalContent, { opacity: fadeAnim }]}
              >
                <View style={styles.carouselContainer}>
                  <View style={styles.modalPhotoGridContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
                      snapToInterval={(selectedSale?.photos?.length === 1) ? Dimensions.get('window').width - 32 : 276}
                      decelerationRate="fast"
                    >
                      {(selectedSale?.photos || []).map((photo, index) => (
                        <TouchableOpacity
                          key={`modal-thumb-${index}`}
                          style={[
                            styles.modalThumb,
                            selectedSale?.photos?.length === 1 && {
                              width: Dimensions.get('window').width - 32,
                              height: 260,
                              marginHorizontal: 0
                            }
                          ]}
                          onPress={() => openFullscreenFromModal(index)}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.modalThumbImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <ScrollView 
                  style={styles.content}
                  contentContainerStyle={styles.contentPadding}
                  nestedScrollEnabled={true}
                >
                  <View style={styles.header}>
                    <Text style={styles.clientName}>{selectedSale?.clientName || ''}</Text>
                    <Text style={styles.saleDate}>
                      {selectedSale?.dateSold ? new Date(selectedSale.dateSold).toLocaleDateString() : ''}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>${selectedSale?.price || 0}</Text>
                      <Text style={styles.statLabel}>Amount</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{selectedSale?.soldBy || 'Unknown'}</Text>
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
                    <Text style={styles.statusText}>{selectedSale?.status || 'Pending'}</Text>
                  </View>

                  <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Pressable
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`tel:${selectedSale?.clientPhone || ''}`)}
                    >
                      <Ionicons name="call" size={20} color="white" />
                      <Text style={styles.contactButtonText}>{selectedSale?.clientPhone || 'N/A'}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`mailto:${selectedSale?.clientEmail || ''}`)}
                    >
                      <Ionicons name="mail" size={20} color="white" />
                      <Text style={styles.contactButtonText}>{selectedSale?.clientEmail || 'N/A'}</Text>
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
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Modal>

      {/* Fullscreen Photos Modal from Modal View */}
      {selectedSale && (
        <FullScreenPhotoViewer
          photos={selectedSale.photos || []}
          initialIndex={selectedPhotoIndex}
          visible={fullscreenPhotosVisible}
          onClose={() => setFullscreenPhotosVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
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
  // Photo Grid Styles
  photoGridContainer: {
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  viewAllButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  carouselContainer: {
    height: 280,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  modalPhotoGridContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  modalThumb: {
    height: 260,
    width: 260,
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  modalThumbImage: {
    height: '100%',
    width: '100%',
  },
  content: {
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  contentPadding: {
    padding: 24,
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
    top: Platform.OS === 'ios' ? 48 : 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  // Fullscreen Photo Viewer
  fullscreenModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
  },
  photoCounterText: {
    color: 'white',
    fontWeight: '600',
  },
}); 