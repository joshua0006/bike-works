/**
 * Bike Metadata Section
 * 
 * Manages lists of bike brands, colors, and sizes for use in autocomplete fields
 * throughout the app.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BikeMetadata } from '../../types';

export function BikeMetadataSection() {
  const [metadata, setMetadata] = useState<BikeMetadata>({
    brands: [],
    colors: [],
    sizes: [],
  });
  const [newItem, setNewItem] = useState<Record<keyof BikeMetadata, string>>({
    brands: '',
    colors: '',
    sizes: '',
  });

  const addItem = (category: keyof BikeMetadata) => {
    if (newItem[category].trim()) {
      setMetadata(prev => ({
        ...prev,
        [category]: [...prev[category], newItem[category].trim()],
      }));
      setNewItem(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeItem = (category: keyof BikeMetadata, item: string) => {
    setMetadata(prev => ({
      ...prev,
      [category]: prev[category].filter(i => i !== item),
    }));
  };

  const renderCategory = (title: string, category: keyof BikeMetadata) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newItem[category]}
          onChangeText={(text) => setNewItem(prev => ({ ...prev, [category]: text }))}
          placeholder={`Add new ${category.slice(0, -1)}`}
        />
        <Pressable
          style={styles.addButton}
          onPress={() => addItem(category)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
      >
        {metadata[category].map(item => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
            <Pressable
              onPress={() => removeItem(category, item)}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bike Options</Text>
      {renderCategory('Brands', 'brands')}
      {renderCategory('Colors', 'colors')}
      {renderCategory('Sizes', 'sizes')}
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
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#1e293b',
  },
});