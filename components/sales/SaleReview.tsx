/**
 * Sale Review Component
 * 
 * Displays a summary of the sale information for final review before submission.
 * Shows bike details, photos, and sale information in a clean, organized layout.
 * 
 * Props:
 * - data: Purchase - Complete sale data to review
 * - onSubmit: () => void - Called when sale is confirmed
 * 
 * Features:
 * - Photo gallery
 * - Formatted data display
 * - Confirmation button
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Purchase } from '../../types';
import { useState } from 'react';

interface Props {
  data: Purchase;
  onSubmit: () => void;
}

export function SaleReview({ data, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmitPurchase = async () => {
    setIsSubmitting(true);
    try {
      // 1. Initial log
      console.log('1. Starting submission...');

      // 2. Log and validate data
      console.log('2. Checking data:', {
        bikeId: data.bikeId || 'N/A',
        clientId: data.clientId || 'N/A',
        price: data.price || 0,
        brand: data.brand || 'N/A',
        model: data.model || 'N/A'
      });

      // 3. Prepare purchase data
      console.log('3. Preparing purchase data...');
      const purchaseData = {
        bikeId: data.bikeId || 'N/A',
        brand: data.brand || 'N/A',
        model: data.model || 'N/A',
        serialNumber: data.serialNumber || 'N/A',
        year: Number(data.year) || 0,
        color: data.color || 'N/A',
        type: data.type || 'N/A',
        size: data.size || 'N/A',
        
        clientId: data.clientId || 'N/A',
        clientName: data.clientName || 'N/A',
        clientEmail: data.clientEmail || 'N/A',
        clientPhone: data.clientPhone || 'N/A',
        
        price: Number(data.price) || 0,
        saleDate: data.saleDate || new Date().toISOString(),
        paymentMethod: data.paymentMethod || 'cash',
        status: 'completed' as const,
        
        photos: Array.isArray(data.photos) ? data.photos : [],
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 4. Log the prepared data
      console.log('4. Purchase data ready:', purchaseData);

      // 5. Save to Firestore
      console.log('5. Saving to Firestore...');
      const purchaseRef = await addDoc(collection(db, 'purchases'), purchaseData);
      console.log('6. Purchase saved with ID:', purchaseRef.id);

      // 7. Update bike status
      console.log('7. Updating bike status...');
      if (data.bikeId && data.bikeId !== 'N/A') {
        await updateDoc(doc(db, 'bikes', data.bikeId), {
          status: 'sold',
          saleId: purchaseRef.id,
          updatedAt: new Date().toISOString()
        });
        console.log('8. Bike status updated');
      } else {
        console.log('8. Skipping bike status update - no valid bikeId');
      }

      // 9. Showing success message...
      console.log('9. Showing success message...');
      
      // Navigate first
      router.push('/');
      
      // Then show success alert
      Alert.alert(
        'Success',
        'Purchase saved successfully'
      );

    } catch (error: any) {
      // Detailed error logging
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'unknown',
        stack: error?.stack || 'No stack trace'
      });
      
      Alert.alert(
        'Error',
        'Failed to save purchase. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bike Details</Text>
        <View style={styles.detailsGrid}>
          <DetailItem label="Serial Number" value={data.serialNumber} />
          <DetailItem label="Brand" value={data.brand} />
          <DetailItem label="Model" value={data.model} />
          <DetailItem label="Year" value={data.year?.toString()} />
          <DetailItem label="Size" value={data.size} />
          <DetailItem label="Color" value={data.color} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sale Information</Text>
        <View style={styles.detailsGrid}>
          <DetailItem label="Date Sold" value={data.dateSold} />
          <DetailItem label="Sold By" value={data.soldBy} />
          <DetailItem
            label="Bike Status"
            value={data.isNewBike ? 'New' : 'Used'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.detailsGrid}>
          <DetailItem label="Name" value={data.clientName} />
          <DetailItem label="Email" value={data.clientEmail} />
          <DetailItem label="Phone" value={data.clientPhone} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <ScrollView
          horizontal
          style={styles.photoList}
          contentContainerStyle={styles.photoListContent}
        >
          {data.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
            />
          ))}
        </ScrollView>
      </View>

      <Pressable
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmitPurchase}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Complete Sale</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  detailsGrid: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  photoList: {
    flexGrow: 0,
  },
  photoListContent: {
    gap: 16,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
});