/**
 * Bike Selector Component
 * 
 * A component for selecting and managing bikes associated with a client. Shows
 * existing bikes and allows adding new ones.
 * 
 * Props:
 * - selectedBikes: string[] - Array of selected bike serial numbers
 * - onChange: (bikes: string[]) => void - Called when selection changes
 * 
 * Features:
 * - Multiple bike selection
 * - Quick bike lookup
 * - New bike creation
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { db } from '../../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

interface Props {
  selectedBikes: string[];
  onChange: (bikes: string[]) => void;
}

export function BikeSelector({ selectedBikes = [], onChange }: Props) {
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);

  useFocusEffect(() => {
    const fetchBikes = async () => {
      const q = query(collection(db, 'bikes'));
      const snapshot = await getDocs(q);
      const bikesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bike[];
      setAvailableBikes(bikesData);
    };
    fetchBikes();
  });

  const toggleBike = (serialNumber: string) => {
    const newSelection = selectedBikes.includes(serialNumber)
      ? selectedBikes.filter(sn => sn !== serialNumber)
      : [...selectedBikes, serialNumber];
    onChange(newSelection);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Associated Bikes</Text>
        <Link href="/bikes/new" asChild>
          <Pressable style={styles.addButton}>
            <Ionicons name="add" size={20} color="#2563eb" />
            <Text style={styles.addButtonText}>Add Bike</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={availableBikes}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.bikeItem,
              selectedBikes.includes(item.serialNumber) && styles.selectedBike
            ]}
            onPress={() => toggleBike(item.serialNumber)}
          >
            <Text style={styles.bikeText}>
              {item.brand} {item.model} ({item.serialNumber})
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => item.serialNumber}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  bikeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedBike: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  bikeText: {
    fontSize: 16,
    color: '#1e293b',
  },
});