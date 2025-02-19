/**
 * Sale Details Form Component
 * 
 * Collects sale-specific information like sale date, seller, and whether it's a new bike.
 * 
 * Props:
 * - initialData: Partial<Sale> - Pre-fill form with existing data
 * - onSubmit: (data: Partial<Sale>) => void - Called when form is submitted
 * 
 * Features:
 * - Date selection
 * - Staff member selection
 * - New/Used bike toggle
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import type { Sale, Client } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Props {
  initialData?: Partial<Sale>;
  onSubmit: (data: Partial<Sale>) => void;
}

const ClientSelector = ({ onSelect }: { onSelect: (client: Client) => void }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Client);
        setClients(clientsData);
      } catch (err) {
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <ActivityIndicator size="small" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.dropdown}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.clientItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.clientEmail}>{item.email}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export function SaleDetailsForm({ initialData = {}, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Sale>>({
    soldBy: '',
    isNewBike: true,
    dateSold: new Date().toISOString().split('T')[0],
    ...initialData,
  });
  const [showClientList, setShowClientList] = useState(false);

  const handleSubmit = () => {
    // Validate required fields
    const errors = [];
    if (!formData.price || isNaN(formData.price)) {
      errors.push('Please enter a valid sale price');
    }
    if (!formData.clientId || !formData.clientName) {
      errors.push('Please select a client');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    onSubmit(formData);
  };

  const handleClientSelect = (client: Client) => {
    console.log('Selected Client:', JSON.stringify({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    }, null, 2));

    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
    }));
    setShowClientList(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Sale Date</Text>
        <TextInput
          style={styles.input}
          value={formData.dateSold}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, dateSold: text }))
          }
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sold By</Text>
        <TextInput
          style={styles.input}
          value={formData.soldBy}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, soldBy: text }))
          }
          placeholder="Enter staff member name"
        />
      </View>

      <View style={[styles.field, styles.switchField]}>
        <Text style={styles.label}>New Bike</Text>
        <Switch
          value={formData.isNewBike}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, isNewBike: value }))
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Select Client</Text>
        <Pressable
          style={[
            styles.clientSelector,
            !formData.clientName && styles.errorInput
          ]}
          onPress={() => setShowClientList(!showClientList)}
        >
          {formData.clientName ? (
            <View>
              <Text style={styles.selectedClient}>{formData.clientName}</Text>
              <Text style={styles.clientSubtext}>{formData.clientEmail}</Text>
              <Text style={styles.clientSubtext}>{formData.clientPhone}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Tap to select client *</Text>
          )}
        </Pressable>
        
        {showClientList && (
          <ClientSelector onSelect={handleClientSelect} />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sale Price *</Text>
        <TextInput
          style={[styles.input, !formData.price && styles.errorInput]}
          value={formData.price?.toString() || ''}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, '');
            setFormData(prev => ({ 
              ...prev, 
              price: numericValue ? parseFloat(numericValue) : undefined 
            }));
          }}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </View>

      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Review Sale</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  switchField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clientSelector: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  selectedClient: {
    fontSize: 16,
    color: '#1e293b',
  },
  clientSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#ffffff',
  },
  clientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  clientName: {
    fontSize: 16,
    color: '#1e293b',
  },
  clientEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    color: '#ef4444',
    padding: 8,
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  requiredLabel: {
    color: '#ef4444',
    marginLeft: 4,
  },
});