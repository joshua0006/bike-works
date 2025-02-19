/**
 * Bike Details Form Component
 * 
 * A form component for collecting bike information. Can be used in both sales and
 * service contexts. Validates serial numbers and provides suggestions for existing bikes.
 * 
 * Props:
 * - initialData: Partial<Bike> - Pre-fill form with existing data
 * - onSubmit: (data: Bike) => void - Called when form is submitted
 * - showManualEntry?: boolean - Whether to show the manual entry button
 * 
 * Features:
 * - Serial number validation
 * - Existing bike lookup
 * - Brand/model suggestions
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Bike } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { PhotoUpload } from '../bikes/PhotoUpload';

interface Props {
  initialData?: Partial<Bike>;
  onSubmit: (data: Bike) => void;
  showManualEntry?: boolean;
}

export function BikeDetailsForm({ initialData = {}, onSubmit, showManualEntry }: Props) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [brand, setBrand] = useState(initialData.brand || '');
  const [model, setModel] = useState(initialData.model || '');
  const [year, setYear] = useState(initialData.year || '');
  const [color, setColor] = useState(initialData.color || '');
  const [serialNumber, setSerialNumber] = useState(initialData.serialNumber || '');
  const [type, setType] = useState(initialData.type || '');
  const [size, setSize] = useState(initialData.size || '');
  const [photos, setPhotos] = useState(initialData.photos || []);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        console.log('Fetching bikes from Firestore...');
        const q = query(collection(db, 'bikes'));
        const querySnapshot = await getDocs(q);
        console.log('Bikes snapshot:', querySnapshot.docs.length);
        
        const bikesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Bike document:', doc.id, data);
          return {
            id: doc.id,
            serialNumber: data.serialNumber,
            brand: data.brand,
            model: data.model,
            year: data.year,
            color: data.color,
            photos: data.photos || [],
            status: data.status || 'available',
            // Add other necessary fields
          } as Bike;
        });
        
        setBikes(bikesData);
      } catch (err) {
        console.error('Bike fetch error:', err);
        setError('Failed to load bikes');
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  const renderBikeItem = ({ item }: { item: Bike }) => (
    <Pressable
      style={[
        styles.bikeCard,
        selectedBike?.id === item.id && styles.selectedCard
      ]}
      onPress={() => {
        console.log('Selected bike:', item);
        setSelectedBike(item);
        onSubmit(item);
      }}
    >
      <View style={styles.imageContainer}>
        {item.photos?.[0] ? (
          <Image
            source={{ uri: item.photos[0] }}
            style={styles.bikeImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="bicycle" size={40} color="#94a3b8" />
        )}
      </View>
      
      <View style={styles.bikeInfo}>
        <Text style={styles.serialNumber}>{item.serialNumber}</Text>
        <Text style={styles.bikeTitle}>
          {item.year} {item.brand} {item.model}
        </Text>
        <Text style={styles.bikeDetails}>
          {item.type} • {item.size} • {item.color}
        </Text>
      </View>
    </Pressable>
  );

  const handleManualSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      'brand', 'model', 'serialNumber', 'type', 'size'
    ];
    
    const errors = requiredFields.filter(field => !{ brand, model, serialNumber, type, size }[field]);
    setValidationErrors(errors);

    if (errors.length > 0) return;

    try {
      // Create bike document with all details
      const bikeRef = await addDoc(collection(db, 'bikes'), {
        brand,
        model,
        serialNumber,
        year: year || new Date().getFullYear(),
        color,
        type,
        size,
        status: 'available',
        photos: photos,
        notes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      onSubmit({
        ...{ brand, model, serialNumber, year, color, type, size, photos, notes },
        id: bikeRef.id
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save bike details');
    }
  };

  const manualInputForm = (
    <View style={styles.manualForm}>
      <View style={styles.formHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => setIsManualEntry(false)}
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Back to Bike List</Text>
        </Pressable>
        <Text style={styles.formTitle}>New Bike Details</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Serial Number *</Text>
        <TextInput
          style={[styles.input, validationErrors.includes('serialNumber') && styles.errorInput]}
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Enter serial number"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Brand *</Text>
          <TextInput
            style={[styles.input, validationErrors.includes('brand') && styles.errorInput]}
            value={brand}
            onChangeText={setBrand}
            placeholder="Brand name"
          />
        </View>
        
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={[styles.input, validationErrors.includes('model') && styles.errorInput]}
            value={model}
            onChangeText={setModel}
            placeholder="Model name"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="e.g. Mountain, Road"
          />
        </View>
        
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Size</Text>
          <TextInput
            style={styles.input}
            value={size}
            onChangeText={setSize}
            placeholder="Frame size"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            placeholder="YYYY"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={setColor}
            placeholder="Color"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Photos</Text>
        <PhotoUpload
          photos={photos}
          onSubmit={(newPhotos) => setPhotos(newPhotos)}
          maxPhotos={6}
          context="bike"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes"
          multiline
          numberOfLines={4}
        />
      </View>

      {validationErrors.length > 0 && (
        <Text style={styles.errorText}>Please fill in all required fields (*)</Text>
      )}

      <Pressable
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleManualSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Bike & Continue</Text>
        )}
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading available bikes...</Text>
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
    <View style={styles.container}>
      <Text style={styles.title}>Select or Add Bike</Text>
      
      {!isManualEntry ? (
        <>
          <FlatList
            data={bikes}
            renderItem={renderBikeItem}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="bicycle-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyStateText}>No bikes available</Text>
              </View>
            }
          />
          <Pressable
            style={styles.newBikeButton}
            onPress={() => setIsManualEntry(true)}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
              <Text style={styles.newBikeButtonText}>Add New Bike Details</Text>
            </View>
            <Text style={styles.buttonSubtext}>Not in inventory</Text>
          </Pressable>
        </>
      ) : manualInputForm}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  errorText: {
    color: '#dc2626',
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  bikeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bikeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  bikeDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    marginTop: 16,
  },
  newBikeButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBikeButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 32
  },
  manualForm: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    margin: 16,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  field: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#94a3b8',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
  },
});