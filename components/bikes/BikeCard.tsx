import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Bike } from '@/types';

interface BikeCardProps {
  bike: Bike;
  onPress?: (bike: Bike) => void;
  compact?: boolean;
}

export function BikeCard({ bike, onPress, compact = false }: BikeCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(bike);
    }
  };

  // Format price to 2 decimal places or show "N/A"
  const formattedPrice = bike.purchasePrice 
    ? `$${bike.purchasePrice.toFixed(2)}` 
    : "N/A";

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        compact ? styles.compactContainer : null
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Bike Image */}
      <View style={styles.imageContainer}>
        {bike.photos && bike.photos.length > 0 ? (
          <Image 
            source={{ uri: bike.photos[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="bicycle" size={compact ? 40 : 60} color="#94a3b8" />
          </View>
        )}
        
        {/* Price Tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
        </View>
        
        {/* Status Badge */}
        {bike.status === 'available' && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
            <Text style={styles.statusText}>Available</Text>
          </View>
        )}
      </View>
      
      {/* Bike Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {bike.brand} {bike.model}
        </Text>
        
        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.specText}>{bike.year}</Text>
          </View>
          
          <View style={styles.specItem}>
            <Ionicons name="color-palette-outline" size={14} color="#64748b" />
            <Text style={styles.specText}>{bike.color}</Text>
          </View>
        </View>
        
        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <Ionicons name="resize-outline" size={14} color="#64748b" />
            <Text style={styles.specText}>{bike.size}</Text>
          </View>
          
          <View style={styles.specItem}>
            <Ionicons name="bicycle-outline" size={14} color="#64748b" />
            <Text style={styles.specText}>{bike.type}</Text>
          </View>
        </View>
        
        <View style={styles.serialContainer}>
          <Ionicons name="barcode-outline" size={14} color="#64748b" />
          <Text style={styles.serialText}>SN: {bike.serialNumber}</Text>
        </View>
        
        {!compact && bike.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText} numberOfLines={2}>{bike.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // Two cards per row with padding

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  compactContainer: {
    width: cardWidth,
    marginHorizontal: 4,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  priceText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  },
  detailsContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  serialText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
}); 