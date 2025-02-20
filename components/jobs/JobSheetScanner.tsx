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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { Job } from '../../types';
import { GOOGLE_API_KEY } from '../../config';

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

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission is required to scan job sheets');
      }
    })();
  }, []);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [3, 4],
        base64: true, // This will give us the base64 string directly
      });

      if (result.canceled || !result.assets[0].base64) {
        throw new Error('Failed to capture image');
      }

      const base64Image = result.assets[0].base64;

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
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error:', errorText);
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json() as OCRResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No text found in response');
      }

      // Extract JSON from response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Validate the parsed data
      if (!parsedData.customerName || !parsedData.customerPhone) {
        throw new Error('Missing required fields in response');
      }

      onComplete(parsedData);
    } catch (err) {
      console.error('Processing error:', err);
      setError(
        'Failed to process job sheet. Please ensure the photo is clear and contains a valid job sheet. ' +
        'Error: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <Pressable
          style={styles.captureButton}
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={48} color="#64748b" />
          <Text style={styles.captureText}>Take Photo of Job Sheet</Text>
          <Text style={styles.captureSubtext}>
            Position the job sheet within the frame and ensure good lighting
          </Text>
        </Pressable>
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
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  captureText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  captureSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    borderRadius: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});