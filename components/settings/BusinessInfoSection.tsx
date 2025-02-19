/**
 * Business Info Section
 * 
 * Manages basic business information like name, contact details, and logo.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { BusinessSettings } from '../../types';

export function BusinessInfoSection() {
  const [info, setInfo] = useState<Partial<BusinessSettings>>({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    logo: undefined,
  });

  const pickLogo = async () => {
    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setInfo(prev => ({ ...prev, logo: result.assets[0].uri }));
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Business Information</Text>
      
      <Pressable style={styles.logoContainer} onPress={pickLogo}>
        {info.logo ? (
          <Image source={{ uri: info.logo }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="business" size={48} color="#94a3b8" />
            <Text style={styles.logoText}>Add Logo</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.field}>
        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={info.name}
          onChangeText={(text) => setInfo(prev => ({ ...prev, name: text }))}
          placeholder="Enter business name"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={info.email}
          onChangeText={(text) => setInfo(prev => ({ ...prev, email: text }))}
          placeholder="Enter business email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={info.phone}
          onChangeText={(text) => setInfo(prev => ({ ...prev, phone: text }))}
          placeholder="Enter business phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mobile</Text>
        <TextInput
          style={styles.input}
          value={info.mobile}
          onChangeText={(text) => setInfo(prev => ({ ...prev, mobile: text }))}
          placeholder="Enter business mobile"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={info.address}
          onChangeText={(text) => setInfo(prev => ({ ...prev, address: text }))}
          placeholder="Enter business address"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  logoText: {
    color: '#64748b',
    marginTop: 8,
    fontSize: 14,
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});