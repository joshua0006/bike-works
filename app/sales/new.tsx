/**
 * New Sale Screen
 * 
 * This screen handles the creation of new bike sales records. It uses a multi-step form
 * process to collect bike details, photos, and sale information.
 * 
 * Related components:
 * - BikeDetailsForm: Collects basic bike information
 * - PhotoUpload: Handles bike photo capture and management
 * - SaleDetailsForm: Captures sale-specific information
 * - SaleReview: Displays the review of the sale
 * - StepIndicator: Displays the current step in the multi-step form
 * 
 * Flow:
 * 1. Enter bike details (or select existing bike)
 * 2. Add photos of the bike
 * 3. Enter sale details
 * 4. Review and submit
 */

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BikeDetailsForm } from '../../components/sales/BikeDetailsForm';
import { PhotoUpload } from '../../components/sales/PhotoUpload';
import { SaleDetailsForm } from '../../components/sales/SaleDetailsForm';
import { SaleReview } from '../../components/sales/SaleReview';
import { StepIndicator } from '../../components/common/StepIndicator';
import type { Bike, Sale } from '../../types';

type Step = 'bike' | 'photos' | 'sale' | 'review';

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

export default function NewSaleScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('bike');
  const [saleData, setSaleData] = useState<Partial<Sale>>({
    photos: [],
  });

  const steps: Step[] = ['bike', 'photos', 'sale', 'review'];

  const handleBikeSubmit = (bikeData: Bike) => {
    setSaleData(prev => ({ ...prev, ...bikeData }));
    setCurrentStep('photos');
  };

  const handlePhotosSubmit = (photos: string[]) => {
    setSaleData(prev => ({ ...prev, photos }));
  };

  const handleSaleSubmit = (saleDetails: Partial<Sale>) => {
    setSaleData(prev => ({ ...prev, ...saleDetails }));
    setCurrentStep('review');
  };

  const handleSaleComplete = async () => {
    try {
      // Validate required fields
      if (!saleData.bikeId || !saleData.clientId || !saleData.price) {
        Alert.alert('Error', 'Missing required fields: Bike, Client, or Price');
        return;
      }

      // Create sale document with full details
      const saleRef = await addDoc(collection(db, 'sales'), {
        // Core sale information
        bikeId: saleData.bikeId,
        clientId: saleData.clientId,
        price: saleData.price,
        saleDate: saleData.saleDate || new Date().toISOString(),
        paymentMethod: saleData.paymentMethod || 'cash',
        status: 'completed',
        
        // Bike details snapshot
        bikeDetails: {
          brand: saleData.brand,
          model: saleData.model,
          serialNumber: saleData.serialNumber,
          year: saleData.year,
          color: saleData.color,
          type: saleData.type,
          size: saleData.size,
          purchasePrice: saleData.purchasePrice
        },
        
        // Client details snapshot
        clientDetails: {
          name: saleData.clientName,
          email: saleData.clientEmail,
          phone: saleData.clientPhone,
          address: saleData.clientAddress
        },
        
        // Documentation
        photos: saleData.photos || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update bike status
      await updateDoc(doc(db, 'bikes', saleData.bikeId), {
        status: 'sold',
        saleId: saleRef.id,
        updatedAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Sale recorded successfully');
      router.replace('/sales');

    } catch (error) {
      console.error('Sale submission error:', error);
      Alert.alert('Error', 'Failed to record sale');
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        labels={{
          bike: 'Bike Details',
          photos: 'Photos',
          sale: 'Sale Info',
          review: 'Review',
        }}
      />
      
      <ScrollView style={styles.content}>
        {currentStep === 'bike' && (
          <BikeDetailsForm
            initialData={saleData}
            onSubmit={handleBikeSubmit}
          />
        )}
        
        {currentStep === 'photos' && (
          <PhotoUpload
            photos={saleData.photos || []}
            onSubmit={(photos) => setSaleData(prev => ({ ...prev, photos }))}
            onNext={() => setCurrentStep('sale')}
          />
        )}
        
        {currentStep === 'sale' && (
          <SaleDetailsForm
            initialData={saleData}
            onSubmit={handleSaleSubmit}
          />
        )}
        
        {currentStep === 'review' && (
          <SaleReview
            data={saleData as Sale}
            onSubmit={handleSaleComplete}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  salesContainer: {
    padding: 16,
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
});