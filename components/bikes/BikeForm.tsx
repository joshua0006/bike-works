/**
 * Bike Form Component
 * 
 * A comprehensive form for entering bike details. Used in both new bike creation
 * and editing existing bikes. Includes validation and serial number lookup.
 * 
 * Props:
 * - initialData?: Bike - Pre-fill form with existing data
 * - onSubmit: (data: Bike) => void - Called when form is valid and submitted
 * 
 * Features:
 * - Serial number validation
 * - Brand/model suggestions
 * - Year validation
 * - Size standardization
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SerialLookup } from './SerialLookup';
import { PhotoUpload } from './PhotoUpload';
import type { Bike } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  initialData?: Partial<Bike>;
  onSubmit: (data: Bike) => void;
}

export function BikeForm({ initialData = {}, onSubmit }: Props) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<Partial<Bike>>({
    serialNumber: '',
    type: '',
    brand: '',
    year: new Date().getFullYear(),
    size: '',
    model: '',
    color: '',
    photos: [],
    notes: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Bike, string>>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Bike, string>> = {};

    if (!formData.serialNumber) {
      newErrors.serialNumber = 'Serial number is required';
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model) {
      newErrors.model = 'Model is required';
    }
    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Invalid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    const isValid = validate();
    if (!isValid) return;

    setLoading(true);
    try {
      await onSubmit(formData as Bike);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <SerialLookup
        value={formData.serialNumber}
        onChange={(serialNumber) => setFormData(prev => ({ ...prev, serialNumber }))}
        error={errors.serialNumber}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Brand</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            errors.brand && styles.inputError
          ]}
          value={formData.brand}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, brand: text }))
          }
          placeholder="Enter bike brand"
        />
        {errors.brand && (
          <Text style={styles.errorText}>{errors.brand}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Model</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            errors.model && styles.inputError
          ]}
          value={formData.model}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, model: text }))
          }
          placeholder="Enter bike model"
        />
        {errors.model && (
          <Text style={styles.errorText}>{errors.model}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Type</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
          ]}
          value={formData.type}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, type: text }))
          }
          placeholder="e.g., Mountain, Road, Hybrid"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Year</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            errors.year && styles.inputError
          ]}
          value={formData.year?.toString()}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, year: parseInt(text) || 0 }))
          }
          keyboardType="numeric"
          placeholder="Enter bike year"
        />
        {errors.year && (
          <Text style={styles.errorText}>{errors.year}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Size</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
          ]}
          value={formData.size}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, size: text }))
          }
          placeholder="Enter bike size"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Color</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
          ]}
          value={formData.color}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, color: text }))
          }
          placeholder="Enter bike color"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Photos</Text>
        <PhotoUpload
          photos={formData.photos}
          onSubmit={(photos) => setFormData(prev => ({ ...prev, photos }))}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
          ]}
          value={formData.notes}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, notes: text }))
          }
          placeholder="Add any notes about the bike"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={[styles.submitButton, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {initialData?.id ? 'Update Bike' : 'Save Bike'}
          </Text>
        )}
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
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
  disabled: {
    opacity: 0.6,
    backgroundColor: '#94a3b8',
  },
});