/**
 * New Bike Screen
 * 
 * This screen handles adding new bikes to the system, whether they were sold by the shop
 * or are being serviced. It provides a streamlined form for entering bike details and
 * manages the creation of new bike records.
 * 
 * Related components:
 * - BikeForm: Main form for entering bike details
 * - SerialLookup: Checks if the bike already exists
 * 
 * Flow:
 * 1. Enter/scan serial number
 * 2. System checks if bike exists
 * 3. Enter bike details
 * 4. Save bike to database
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { createBikeForUser } from '@/lib/userOperations';

type BikeFormData = {
  brand: string;
  model: string;
  serialNumber: string;
  year: string;
  color: string;
  type: string;
  size: string;
};

export default function NewBikeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, primary } = useTheme();
  
  const [formData, setFormData] = useState<BikeFormData>({
    brand: '',
    model: '',
    serialNumber: '',
    year: '',
    color: '',
    type: '',
    size: '',
  });
  const [loading, setLoading] = useState(false);
  
  const updateFormField = (field: keyof BikeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    // Form validation
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        Alert.alert('Error', `Please enter a ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a bike');
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    try {
      const yearNumber = parseInt(formData.year, 10);
      if (isNaN(yearNumber)) {
        throw new Error('Year must be a valid number');
      }
      
      const bikeId = await createBikeForUser(user.id, {
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber,
        year: yearNumber,
        color: formData.color,
        type: formData.type,
        size: formData.size,
        status: 'available',
        photos: [],
      });
      
      Alert.alert('Success', 'Bike added successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Add New Bike',
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }} />
      
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Brand</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Trek, Specialized, Giant"
            placeholderTextColor={colors.textSecondary}
            value={formData.brand}
            onChangeText={(value) => updateFormField('brand', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Model</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. FX 3, Rockhopper, Defy"
            placeholderTextColor={colors.textSecondary}
            value={formData.model}
            onChangeText={(value) => updateFormField('model', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Serial Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Usually found under bottom bracket"
            placeholderTextColor={colors.textSecondary}
            value={formData.serialNumber}
            onChangeText={(value) => updateFormField('serialNumber', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. 2023"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={formData.year}
            onChangeText={(value) => updateFormField('year', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Color</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Red, Blue, Black"
            placeholderTextColor={colors.textSecondary}
            value={formData.color}
            onChangeText={(value) => updateFormField('color', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Type</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Road, Mountain, Hybrid"
            placeholderTextColor={colors.textSecondary}
            value={formData.type}
            onChangeText={(value) => updateFormField('type', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Size</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. S, M, L, XL or 52cm, 54cm"
            placeholderTextColor={colors.textSecondary}
            value={formData.size}
            onChangeText={(value) => updateFormField('size', value)}
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adding Bike...' : 'Add Bike'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});