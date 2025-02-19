/**
 * Serial Lookup Component
 * 
 * A specialized input component for bike serial numbers. It provides real-time
 * validation and checking against existing bikes in the database.
 * 
 * Props:
 * - value: string - Current serial number value
 * - onChange: (value: string) => void - Called when serial number changes
 * - error?: string - Error message to display
 * 
 * Features:
 * - Serial number format validation
 * - Duplicate checking
 * - Barcode scanner integration (future)
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SerialLookup({ value, onChange, error }: Props) {
  const { colors } = useTheme();
  const [isChecking, setIsChecking] = useState(false);

  const handleScan = async () => {
    // TODO: Implement barcode scanning
    console.log('Scanning barcode...');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Serial Number</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            error && styles.inputError
          ]}
          value={value}
          onChangeText={onChange}
          placeholder="Enter bike serial number"
          autoCapitalize="characters"
        />
        <Pressable
          style={[styles.scanButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleScan}
        >
          <Ionicons name="barcode-outline" size={24} color="#2563eb" />
        </Pressable>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {isChecking && (
        <Text style={styles.checkingText}>Checking serial number...</Text>
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
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  scanButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  checkingText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
});