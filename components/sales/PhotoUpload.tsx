/**
 * Sales Photo Upload Component
 * 
 * Handles photo documentation for sales transactions with explicit proof requirements
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  photos: string[];
  onSubmit: (photos: string[]) => void;
  onNext: () => void;
}

export function PhotoUpload({ photos: initialPhotos = [], onSubmit, onNext }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const takePhoto = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newPhotos = [...photos, result.assets[0].uri];
        setPhotos(newPhotos);
        onSubmit(newPhotos);
        setError(null);
      }
    } catch (err) {
      setError('Failed to take photo. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onSubmit(newPhotos);
  };

  const hasProof = photos.length >= 1;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Proof of Sale Documentation</Text>
      
      <ScrollView
        horizontal
        style={styles.photoList}
        contentContainerStyle={styles.photoListContent}
      >
        {photos.map((photo, index) => (
          <View key={photo} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <Pressable
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
              disabled={processing}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </Pressable>
          </View>
        ))}
        
        <Pressable 
          style={[styles.addButton, processing && styles.disabledButton]} 
          onPress={takePhoto}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#64748b" />
          ) : (
            <>
              <Ionicons name="camera" size={32} color="#3b82f6" />
              <Text style={styles.addButtonText}>
                {photos.length === 0 ? 'Take Proof Photo' : 'Add Another'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <Text style={styles.helperText}>
        Required: At least one clear photo showing:
        {photos.length < 1 && '\n• Sold item\n• Payment receipt\n• Customer signature'}
      </Text>

      <Pressable
        style={[styles.nextButton, !hasProof && styles.disabledButton]}
        onPress={() => {
          onSubmit(photos); // Final photo state update
          onNext(); // Explicit step progression
        }}
        disabled={!hasProof}
      >
        <Text style={styles.nextButtonText}>Continue to Review</Text>
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  photoList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  photoListContent: {
    padding: 8,
    gap: 16,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  addButton: {
    width: 200,
    height: 150,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    marginVertical: 12,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
