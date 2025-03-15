import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { createJobForUser } from '@/lib/userOperations';

type JobFormData = {
  customerName: string;
  customerPhone: string;
  bikeModel: string;
  dateIn: string;
  workRequired: string;
  laborCost: string;
  totalCost: string;
};

export default function NewJobScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, primary } = useTheme();
  
  const [formData, setFormData] = useState<JobFormData>({
    customerName: '',
    customerPhone: '',
    bikeModel: '',
    dateIn: new Date().toISOString().split('T')[0],
    workRequired: '',
    laborCost: '',
    totalCost: '',
  });
  const [loading, setLoading] = useState(false);
  
  const updateFormField = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    // Form validation
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        Alert.alert('Error', `Please enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a job');
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    try {
      const laborCost = parseFloat(formData.laborCost);
      const totalCost = parseFloat(formData.totalCost);
      
      if (isNaN(laborCost) || isNaN(totalCost)) {
        throw new Error('Costs must be valid numbers');
      }
      
      const jobId = await createJobForUser(user.id, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        bikeModel: formData.bikeModel,
        dateIn: formData.dateIn,
        workRequired: formData.workRequired,
        workDone: '', // Empty initially
        laborCost,
        totalCost,
        status: 'pending',
      });
      
      Alert.alert('Success', 'Job created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Create New Job',
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }} />
      
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Customer's full name"
            placeholderTextColor={colors.textSecondary}
            value={formData.customerName}
            onChangeText={(value) => updateFormField('customerName', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Customer's phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={formData.customerPhone}
            onChangeText={(value) => updateFormField('customerPhone', value)}
          />
          
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Bike Information</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Bike Model</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Brand and model of bike"
            placeholderTextColor={colors.textSecondary}
            value={formData.bikeModel}
            onChangeText={(value) => updateFormField('bikeModel', value)}
          />
          
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Job Details</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Work Required</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Description of work needed"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.workRequired}
            onChangeText={(value) => updateFormField('workRequired', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Labor Cost ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Cost of labor"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={formData.laborCost}
            onChangeText={(value) => updateFormField('laborCost', value)}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Total Cost ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Total cost including parts"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={formData.totalCost}
            onChangeText={(value) => updateFormField('totalCost', value)}
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Job...' : 'Create Job'}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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