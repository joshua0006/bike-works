import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { addDoc, collection, updateDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BikeSelector } from './BikeSelector';
import { ClientSelector } from './ClientSelector';
import { BikeDetailsForm } from './BikeDetailsForm';
import { SaleDetailsForm } from './SaleDetailsForm';
import { SaleReview } from './SaleReview';
import { PhotoMatcher } from './PhotoMatcher';
import { PhotoUpload } from './PhotoUpload';
import type { Bike, Client, Sale, Purchase } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';

type FormStep = 'bike-details' | 'photo-upload' | 'sale-details' | 'review';

export function SalesForm() {
  const [step, setStep] = useState<FormStep>('bike-details');
  const [loading, setLoading] = useState(true);
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<Partial<Sale>>({
    isNewBike: false,
    photos: [],
    saleDate: new Date().toISOString(),
    status: 'completed',
    bikeDetails: {},
    clientDetails: {}
  });

  const steps: FormStep[] = ['bike-details', 'photo-upload', 'sale-details', 'review'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bikesSnapshot, clientsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'bikes'))),
          getDocs(query(collection(db, 'clients')))
        ]);

        const bikes = bikesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Bike))
          .filter(bike => !bike.sold);
        
        const clients = clientsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Client));

        setAvailableBikes(bikes);
        setAvailableClients(clients);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleBikeSubmit = (bike: Bike) => {
    setFormData(prev => ({
      ...prev,
      bikeId: bike.id,
      brand: bike.brand,
      model: bike.model,
      serialNumber: bike.serialNumber,
      year: bike.year,
      color: bike.color,
      type: bike.type,
      size: bike.size
    }));
    setStep('photo-upload');
  };

  const handlePhotoUpload = (photos: string[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Starting purchase submission...');

      // Basic validation
      if (!formData.bikeId || !formData.clientId) {
        Alert.alert('Error', 'Missing bike or client information');
        return;
      }

      // Prepare purchase document with required fields
      const purchaseData = {
        // Required fields
        bikeId: formData.bikeId,
        clientId: formData.clientId,
        status: 'completed' as const,
        saleDate: new Date().toISOString(),
        
        // Bike details
        brand: formData.brand || '',
        model: formData.model || '',
        serialNumber: formData.serialNumber || '',
        year: formData.year || 0,
        color: formData.color || '',
        type: formData.type || '',
        size: formData.size || '',
        
        // Client details
        clientName: formData.clientName || '',
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        
        // Sale details
        price: Number(formData.price) || 0,
        paymentMethod: formData.paymentMethod || 'cash',
        
        // Documentation
        photos: formData.photos || [],
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting purchase data:', purchaseData);

      try {
        // Add to purchases collection
        const purchaseRef = await addDoc(collection(db, 'purchases'), purchaseData);
        console.log('Purchase document created with ID:', purchaseRef.id);

        // Update bike status
        await updateDoc(doc(db, 'bikes', formData.bikeId), {
          status: 'sold',
          saleId: purchaseRef.id,
          updatedAt: new Date().toISOString()
        });
        console.log('Bike status updated');

        // Show success message and redirect
        Alert.alert(
          'Success',
          'Purchase saved successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Redirecting to sales list');
                router.replace('/');
              }
            }
          ]
        );
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        Alert.alert('Database Error', 'Failed to save purchase. Please try again.');
      }

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error',
        'Failed to process purchase. Please check all fields and try again.'
      );
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <><Pressable
    style={styles.exitButton}
    onPress={() => router.push('/')}
  >
    <Ionicons name="arrow-back" size={20} color="#64748b" />
    <Text style={styles.exitButtonText}>New Sale</Text>
  </Pressable>
    <ScrollView style={styles.container}>
      <View style={styles.navigationContainer}>
        

        {steps.indexOf(step) > 0 && (
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color="#3b82f6" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
      </View>

      {step === 'bike-details' && (
        <BikeDetailsForm
          initialData={formData}
          onSubmit={handleBikeSubmit}
          showManualEntry={true}
        />
      )}

      {step === 'photo-upload' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Documentation</Text>
          <PhotoUpload 
            photos={formData.photos || []}
            onSubmit={handlePhotoUpload}
            onNext={() => setStep('sale-details')}
          />
        </View>
      )}

      {step === 'sale-details' && (
        <SaleDetailsForm
          initialData={formData}
          onSubmit={(details) => {
            setFormData(prev => ({ ...prev, ...details }));
            setStep('review');
          }}
        />
      )}

      {step === 'review' && (
        <SaleReview
          data={formData as Sale}
          onSubmit={() => {
            console.log('SaleReview onSubmit triggered');
            handleSubmit();
          }}
        />
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  manualButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
    marginTop: 12,
  },
  manualButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  exitButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
}); 