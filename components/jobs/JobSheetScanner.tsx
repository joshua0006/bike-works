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

import { useState } from 'react';
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
import { encode as base64Encode } from 'base-64';

interface Props {
  onComplete: (data: Partial<Job>) => void;
}

export function JobSheetScanner({ onComplete }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        processJobSheet(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to take photo. Please try again.');
    }
  };

  const processJobSheet = async (imageUri: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
          } else {
            reject(new Error('Failed to read image data'));
          }
        };
        reader.readAsDataURL(blob);
      });

      // 2. Prepare the Gemini API request
      const requestBody = {
        contents: [{
          parts: [{
            text: `Analyze this Breakaway Cycles workshop job sheet and extract the following information in JSON format:
            {
              "customerName": string (from "Customer" field),
              "customerPhone": string (from "Phone" field, format as 04XX XXX XXX),
              "bikeModel": string (from "Bike Model" field),
              "dateIn": string (from "Date In" field, format as DD/MM/YYYY),
              "workRequired": string (from "WORK REQUIRED" section),
              "workDone": string (combine all items from "WORK DONE / PARTS SUPPLIED" section),
              "laborCost": number (from "plus Labour" field),
              "partsCost": number (sum of all parts/work costs before labour),
              "totalCost": number (from "TOTAL incl. GST" field),
              "notes": string (from "NOTES" field)
            }

            Important details:
            - Phone numbers should maintain their exact format
            - Preserve all work items exactly as written
            - Include all costs as numbers without the $ symbol
            - Combine all work done items into a single string, separated by newlines
            
            Example of expected format for this job sheet:
            {
              "customerName": "John Jerrime",
              "customerPhone": "0411 056 876",
              "bikeModel": "Trek Marlin 7",
              "dateIn": "14/6/2023",
              "workRequired": "Fork service - check over bike",
              "workDone": "Prepaid work done on gearing\nFork Service\nHub clean Regress (looking for free hub)\nTighten head set Adjusted gears\nChecked brakes/pads",
              "laborCost": 80,
              "partsCost": 210,
              "totalCost": 290,
              "notes": "S/T 27/6/2023"
            }`
          }, {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64String
            }
          }]
        }]
      };

      // 3. Make API request to Gemini
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const responseData = await apiResponse.json();
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error('No text found in response');
      }

      // 4. Parse the JSON response
      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}') + 1;
      const jsonString = textResponse.slice(jsonStart, jsonEnd);
      const parsedData = JSON.parse(jsonString);

      // 5. Validate required fields
      const requiredFields = ['customerName', 'customerPhone', 'bikeModel', 'workRequired'];
      const missingFields = requiredFields.filter(field => !parsedData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // 6. Format phone number
      if (parsedData.customerPhone) {
        parsedData.customerPhone = parsedData.customerPhone.replace(/\D/g, '');
        if (parsedData.customerPhone.length === 10) {
          parsedData.customerPhone = parsedData.customerPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        }
      }

      // 7. Pass data to parent component
      onComplete(parsedData);

    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process job sheet. Please ensure the photo is clear and contains a valid job sheet. Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
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