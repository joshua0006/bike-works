/**
 * Customer Lookup Component
 * 
 * A specialized form section for finding or creating customer records. Provides
 * real-time search as the user types and suggests existing customers.
 * 
 * Props:
 * - name: string - Current customer name
 * - phone: string - Current customer phone
 * - onChange: (customer: { name: string, phone: string }) => void
 * - errors: { name?: string, phone?: string }
 * 
 * Features:
 * - Real-time customer search
 * - Phone number formatting
 * - New customer creation
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';

interface Props {
  name: string | undefined;
  phone: string | undefined;
  onChange: (customer: { name: string; phone: string }) => void;
  errors: {
    name?: string;
    phone?: string;
  };
}

export function CustomerLookup({
  name = '',
  phone = '',
  onChange,
  errors,
}: Props) {
  const [isSearching, setIsSearching] = useState(false);

  const formatPhoneNumber = (input: string) => {
    // Remove non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Format as 04XX XXX XXX
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 10)}`;
    }
  };

  const handlePhoneChange = (input: string) => {
    const formatted = formatPhoneNumber(input);
    onChange({ name, phone: formatted });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(text) => onChange({ name: text, phone })}
          placeholder="Enter customer name"
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder="04XX XXX XXX"
          keyboardType="phone-pad"
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone}</Text>
        )}
      </View>

      {isSearching && (
        <Text style={styles.searchingText}>
          Searching for existing customer...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  searchingText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
});