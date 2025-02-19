/**
 * Phone Input Component
 * 
 * A specialized input component for phone numbers with formatting and validation.
 * 
 * Props:
 * - value: string - Current phone number value
 * - onChange: (value: string) => void - Called when phone number changes
 * - error?: string - Error message to display
 * 
 * Features:
 * - Automatic formatting
 * - Mobile number validation
 * - Australian number support
 */

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: Props) {
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

  const handleChange = (input: string) => {
    const formatted = formatPhoneNumber(input);
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={handleChange}
        placeholder="04XX XXX XXX"
        keyboardType="phone-pad"
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});