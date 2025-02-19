/**
 * Client Form Component
 * 
 * A comprehensive form for entering client details. Used in both new client creation
 * and editing existing clients. Includes validation and bike association.
 * 
 * Props:
 * - initialData?: Client - Pre-fill form with existing data
 * - onSubmit: (data: Client) => void - Called when form is valid and submitted
 * 
 * Features:
 * - Contact information validation
 * - Bike association
 * - Email validation
 * - Phone number formatting
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { PhoneInput } from './PhoneInput';
import { BikeSelector } from './BikeSelector';
import type { Client, Bike } from '../../types';
import { collection, getDocs, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  initialData?: Client;
  onSubmit: (data: Client) => void;
}

export function ClientForm({ initialData = {}, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    bikeSerialNumbers: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});
  const [allBikes, setAllBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchBikes = async () => {
      const q = query(collection(db, 'bikes'));
      const snapshot = await getDocs(q);
      setAllBikes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Bike)));
    };
    fetchBikes();
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Client, string>> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone) {
      newErrors.phone = 'Mobile number is required';
    }
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    setFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (loading) return;
    
    const isValid = validate();
    if (!isValid) return;

    setLoading(true);
    try {
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        bikeSerialNumbers: formData.bikeSerialNumbers,
      };
      await onSubmit(clientData as Client);
    } finally {
      setLoading(false);
    }
  };

  const toggleBike = (serialNumber: string) => {
    setFormData(prev => ({
      ...prev,
      bikeSerialNumbers: prev.bikeSerialNumbers?.includes(serialNumber)
        ? prev.bikeSerialNumbers.filter(sn => sn !== serialNumber)
        : [...(prev.bikeSerialNumbers || []), serialNumber],
    }));
  };

  return (
    <><Pressable 
        style={[styles.backButton, { backgroundColor: '#f1f5f9' }]}
        onPress={() => router.push('/clients')}
      >
        <Ionicons name="arrow-back" size={20} color="#64748b" />
        <Text style={styles.backButtonText}>Back to Clients</Text>
      </Pressable>
    <ScrollView style={styles.container}>
      

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          placeholder="Enter client name"
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}
      </View>

      <PhoneInput
        value={formData.phone}
        onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
        error={errors.phone}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, email: text }))
          }
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Associated Bikes:</Text>
      <View style={styles.bikeList}>
        {allBikes.map(bike => (
          <Pressable
            key={bike.id}
            style={[
              styles.bikeItem,
              formData.bikeSerialNumbers.includes(bike.serialNumber) && styles.selectedBike
            ]}
            onPress={() => toggleBike(bike.serialNumber)}
          >
            <Text style={styles.bikeText}>
              {bike.brand} {bike.model} ({bike.serialNumber})
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.submitButton, (loading || !formValid) && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading || !formValid}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Client</Text>
        )}
      </Pressable>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
    color: '#1e293b',
  },
  bikeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bikeItem: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  selectedBike: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  bikeText: {
    fontSize: 14,
    color: '#1e293b',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: '#94a3b8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
});