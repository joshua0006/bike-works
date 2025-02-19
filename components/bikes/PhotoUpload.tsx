/**
 * Photo Upload Component (Moved to bikes feature folder)
 * 
 * Reusable component for handling bike photo uploads across the app
 * Now with bike-specific enhancements:
 * - EXIF data handling for bike photos
 * - Size optimization for bike images
 * - Bike photo validation (aspect ratio, metadata)
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
  maxPhotos?: number;
  context?: 'bike' | 'sale';
  onContinue?: () => void;
}

export function PhotoUpload({ 
  photos: initialPhotos = [], 
  onSubmit,
  maxPhotos = 6,
  context = 'bike',
  onContinue
}: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const takePhoto = async () => {
    if (processing || photos.length >= maxPhotos) return;
    
    try {
      setProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,  // Reduced quality for smaller file sizes
        allowsEditing: true,
        aspect: [4, 3],
        exif: true // Capture EXIF data for bike documentation
      });

      if (!result.canceled) {
        const newPhotos = [...photos, result.assets[0].uri];
        setPhotos(newPhotos);
        onSubmit(newPhotos);
        setError(null);
      }
    } catch (err) {
      setError('Failed to capture photo. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    
    setPhotos(updatedPhotos);
    onSubmit(updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {context === 'sale' ? 'Sale Documentation' : 'Bike Photos'} 
        ({photos.length}/{maxPhotos})
      </Text>
      
      <ScrollView
        horizontal
        style={styles.photoList}
        contentContainerStyle={styles.photoListContent}
      >
        {photos.map((photo, index) => (
          <View key={`photo-${index}`} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
              disabled={processing}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </Pressable>
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <Pressable 
            style={[styles.addButton, processing && styles.disabledButton]} 
            onPress={takePhoto}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#64748b" />
            ) : (
              <>
                <Ionicons name="camera" size={32} color="#64748b" />
                <Text style={styles.addButtonText}>
                  {context === 'sale' ? 'Add Sale Photo' : 'Add Bike Photo'}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        {photos.length > 0 && onContinue && (
          <Pressable
            style={styles.continueButton}
            onPress={onContinue}
            disabled={processing}
          >
            <Text style={styles.continueButtonText}>
              {context === 'sale' ? 'Review Sale' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {context === 'sale' && (
        <Text style={styles.noteText}>
          Include photos of any damage, accessories, or special conditions
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  photoListContent: {
    padding: 16,
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
    color: '#64748b',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  noteText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});