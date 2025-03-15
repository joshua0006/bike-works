/**
 * Job Sheet Scanner Component
 * 
 * Handles the capture and processing of job sheet photos. Uses Google Cloud Vision
 * AI to extract text and parse it into structured job data.
 * 
 * Props:
 * - onComplete: (data: Partial<Job>) => void - Called with extracted job data
 * 
 * Features:
 * - Camera integration
 * - Image preprocessing
 * - OCR text extraction
 * - Data parsing and structuring
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { Job } from '../../types';
import { GOOGLE_API_KEY } from '../../config';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { router } from 'expo-router';

interface OCRResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface Props {
  onComplete: (data: Partial<Job>) => void;
}

export function JobSheetScanner({ onComplete }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Launch camera immediately when component mounts
  useEffect(() => {
    launchCamera();
  }, []);

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is needed to scan job sheets');
        router.back();
        return;
      }
      
      takePhoto();
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to open camera');
      setTimeout(() => router.back(), 2000);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, // Reduced quality to ensure smaller file size
        aspect: [3, 4],
        base64: true,
        allowsEditing: true, // Allow user to crop and adjust the image
      });

      if (result.canceled) {
        console.log("User cancelled camera");
        router.back();
        return;
      }

      if (!result.assets || !result.assets[0] || !result.assets[0].base64) {
        throw new Error('Failed to capture image');
      }

      // Set photo for preview
      setPhoto(result.assets[0].uri);
      setIsProcessing(true);
      
      let base64Image = result.assets[0].base64;
      
      // Check file size and compress if needed
      if (base64Image && base64Image.length > 10000000) { // ~10MB limit
        console.log("Image is too large, reducing quality");
        // The image is likely too large, we've already reduced quality in capture
        // but we could apply additional compression here if needed
      }

      try {
        // Make API request to Gemini 2.0
        const apiResponse = await fetch(
          'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GOOGLE_API_KEY,
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{
                  text: `Extract the following information from this job sheet image and return it as a JSON object:
                  - Customer Name
                  - Phone Number
                  - Bike Model
                  - Date In
                  - Work Required
                  - Work Done items with costs
                  - Labor Cost
                  - Total Cost including GST

                  Format as:
                  {
                    "customerName": string,
                    "customerPhone": string,
                    "bikeModel": string,
                    "dateIn": string,
                    "workRequired": string,
                    "workDone": string,
                    "laborCost": number,
                    "totalCost": number
                  }`
                }, {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }]
              }],
              generationConfig: {
                temperature: 0.4, // Lower temperature for more predictable results
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('API Error Response:', errorText);
          
          // Check for specific error messages
          if (errorText.includes("Invalid content")) {
            throw new Error('The image format is not supported. Please try again with a clearer photo.');
          } else if (errorText.includes("quota")) {
            throw new Error('API quota exceeded. Please try again later.');
          } else {
            throw new Error(`API error: ${apiResponse.status}. Please try again with a clearer photo.`);
          }
        }

        const data = await apiResponse.json() as OCRResponse;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error('No text was extracted from the image. Please try with a clearer photo.');
        }

        // Extract JSON from response text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse job sheet information. Please ensure the job sheet is clearly visible.');
        }

        try {
          const parsedData = JSON.parse(jsonMatch[0]);

          // Validate the parsed data with better error messages
          if (!parsedData.customerName && !parsedData.customerPhone) {
            throw new Error('Could not recognize customer information. Please ensure the job sheet is clearly visible.');
          }

          // Format the data with defaults for missing fields
          const jobData = {
            customerName: parsedData.customerName || "Unknown Customer",
            customerPhone: parsedData.customerPhone || "No Phone",
            bikeModel: parsedData.bikeModel || "Unknown Model",
            dateIn: parsedData.dateIn || new Date().toISOString().split('T')[0],
            workRequired: parsedData.workRequired || "Not specified",
            workDone: parsedData.workDone || "Not completed",
            laborCost: parsedData.laborCost || 0,
            totalCost: parsedData.totalCost || 0,
            status: 'pending' as 'pending' | 'in_progress' | 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Save to Firebase
          const docRef = await addDoc(collection(db, 'jobs'), jobData);
          console.log('Job saved with ID:', docRef.id);

          // Call onComplete if provided
          if (onComplete) {
            onComplete(jobData);
          }

          // Show success popup and navigate to jobs tab
          setIsProcessing(false);
          Alert.alert(
            "Success!", 
            "Job sheet scanned and saved successfully.",
            [
              { 
                text: "Scan Another", 
                style: "default",
                onPress: () => {
                  // Reset state and launch camera again
                  setPhoto(null);
                  setError(null);
                  setTimeout(() => takePhoto(), 500);
                }
              },
              { 
                text: "View Jobs", 
                style: "default",
                onPress: () => {
                  // Navigate directly to the jobs tab screen
                  router.push("/(tabs)/jobs");
                }
              }
            ]
          );
        } catch (parseError) {
          console.error('JSON Parse error:', parseError);
          throw new Error('Failed to parse job sheet data. Please try again with a clearer photo.');
        }
      } catch (apiError) {
        console.error('API processing error:', apiError);
        throw apiError; // Re-throw to be caught by the outer catch
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(
        'Failed to process job sheet. Please ensure the photo is clear and contains a valid job sheet. ' +
        'Error: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
      setTimeout(() => {
        router.back();
      }, 5000); // Giving more time to read the error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        // Loading state while camera is launching
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Opening camera...</Text>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo }}
            style={styles.preview}
            resizeMode="contain"
          />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.processingText}>
                Processing Job Sheet...
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Only show retake button if not processing and we have an error */}
      {error && !isProcessing && (
        <Pressable
          style={styles.retakeButton}
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={20} color="#ffffff" />
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  retakeButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});