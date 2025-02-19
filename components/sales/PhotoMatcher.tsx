import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onNext: () => void;
  onPhotosUpdate: (photos: string[]) => void;
}

export function PhotoMatcher({ onNext, onPhotosUpdate }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [validationError, setValidationError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleUpload = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newPhotos = [...photos, result.assets[0].uri];
        setPhotos(newPhotos);
        onPhotosUpdate(newPhotos);
        setValidationError(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleNext = () => {
    if (photos.length === 0) {
      setValidationError(true);
      return;
    }
    onNext();
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.uploadButton, validationError && styles.errorBorder]}
        onPress={handleUpload}
        disabled={processing}
      >
        {photos.length > 0 ? (
          <Image source={{ uri: photos[photos.length - 1] }} style={styles.previewImage} />
        ) : processing ? (
          <ActivityIndicator color="#64748b" size="large" />
        ) : (
          <View style={styles.uploadContent}>
            <Ionicons name="cloud-upload" size={48} color="#3b82f6" />
            <Text style={styles.uploadText}>Tap to Upload Photo</Text>
            <Text style={styles.subText}>JPEG or PNG, max 5MB</Text>
          </View>
        )}
      </Pressable>

      {validationError && (
        <Text style={styles.errorText}>Please upload a photo before continuing</Text>
      )}

      <Pressable
        style={[styles.nextButton, photos.length === 0 && styles.disabledButton]}
        onPress={handleNext}
        disabled={photos.length === 0}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  uploadButton: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '500',
  },
  subText: {
    color: '#64748b',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
}); 