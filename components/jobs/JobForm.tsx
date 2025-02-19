/**
 * Job Form Component
 * 
 * A form for reviewing and editing job details. Used after job sheet scanning
 * or for manual job entry. Includes customer lookup and bike association.
 * 
 * Props:
 * - initialData: Partial<Job> - Pre-fill form with scanned/existing data
 * - onSubmit: (data: Job) => void - Called when form is submitted
 * 
 * Features:
 * - Customer lookup/creation
 * - Bike association
 * - Cost calculation
 * - Notes and status tracking
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { CustomerLookup } from './CustomerLookup';
import type { Job } from '../../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Props {
  initialData?: Partial<Job>;
  onSubmit: (data: Job) => void;
}

export function JobForm({ initialData = {}, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Job>>({
    dateIn: new Date().toLocaleDateString(),
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Job, string>>>({});

  const updateCosts = (updates: Partial<Job>) => {
    const labor = Number(updates.laborCost ?? formData.laborCost ?? 0);
    const parts = Number(updates.partsCost ?? formData.partsCost ?? 0);
    return {
      ...updates,
      laborCost: labor,
      partsCost: parts,
      totalCost: labor + parts,
    };
  };

  const handleChange = (field: keyof Job, value: string | number) => {
    setFormData(prev => updateCosts({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Job, string>> = {};

    if (!formData.customerName) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.customerPhone) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    if (!formData.bikeModel) {
      newErrors.bikeModel = 'Bike model is required';
    }
    if (!formData.workRequired) {
      newErrors.workRequired = 'Work required is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const jobData = {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending',
        };

        const docRef = await addDoc(collection(db, 'jobs'), jobData);
        console.log('Job saved with ID: ', docRef.id);
        onSubmit(formData as Job);
      } catch (error) {
        console.error('Error saving job: ', error);
        setErrors({
          ...errors,
          firebase: 'Failed to save job. Please try again.'
        });
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CustomerLookup
        name={formData.customerName}
        phone={formData.customerPhone}
        onChange={(customer) => {
          setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.phone,
          }));
        }}
        errors={{
          name: errors.customerName,
          phone: errors.customerPhone,
        }}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Bike Model</Text>
        <TextInput
          style={[styles.input, errors.bikeModel && styles.inputError]}
          value={formData.bikeModel}
          onChangeText={(text) => handleChange('bikeModel', text)}
          placeholder="Enter bike model"
        />
        {errors.bikeModel && (
          <Text style={styles.errorText}>{errors.bikeModel}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Work Required</Text>
        <TextInput
          style={[styles.input, errors.workRequired && styles.inputError]}
          value={formData.workRequired}
          onChangeText={(text) => handleChange('workRequired', text)}
          placeholder="Enter work required"
          multiline
          numberOfLines={3}
        />
        {errors.workRequired && (
          <Text style={styles.errorText}>{errors.workRequired}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Work Done</Text>
        <TextInput
          style={styles.input}
          value={formData.workDone}
          onChangeText={(text) => handleChange('workDone', text)}
          placeholder="Enter work completed"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.costSection}>
        <View style={styles.field}>
          <Text style={styles.label}>Labor Cost</Text>
          <TextInput
            style={styles.input}
            value={formData.laborCost?.toString()}
            onChangeText={(text) => handleChange('laborCost', Number(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Parts Cost</Text>
          <TextInput
            style={styles.input}
            value={formData.partsCost?.toString()}
            onChangeText={(text) => handleChange('partsCost', Number(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.totalCost}>
          <Text style={styles.label}>Total Cost</Text>
          <Text style={styles.totalAmount}>
            ${formData.totalCost?.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={formData.notes}
          onChangeText={(text) => handleChange('notes', text)}
          placeholder="Add any additional notes"
          multiline
          numberOfLines={3}
        />
      </View>

      {errors.firebase && (
        <Text style={styles.errorText}>{errors.firebase}</Text>
      )}

      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Save Job</Text>
      </Pressable>
    </ScrollView>
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
    minHeight: 48,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  costSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalCost: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginTop: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
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
});