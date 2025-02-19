/**
 * New Job Screen
 * 
 * This screen handles the creation of new workshop jobs through job sheet scanning.
 * It uses AI to extract information from photos of physical job sheets and allows
 * manual editing of the extracted data.
 * 
 * Related components:
 * - JobSheetScanner: Handles photo capture and OCR processing
 * - JobForm: Allows editing of extracted/entered job details
 * - CustomerLookup: Matches or creates customer records
 * 
 * Flow:
 * 1. Scan job sheet or enter details manually
 * 2. Review and edit extracted information
 * 3. Match/create customer record
 * 4. Save job to database
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { JobSheetScanner } from './jobs/JobSheetScanner';
import { JobForm } from './jobs/JobForm';
import type { Job } from '../types';

type Step = 'scan' | 'review';

export default function NewJobScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('scan');
  const [jobData, setJobData] = useState<Partial<Job>>({});

  const handleScanComplete = (extractedData: Partial<Job>) => {
    setJobData(extractedData);
    setCurrentStep('review');
  };

  const handleSubmit = async (data: Job) => {
    try {
      // TODO: Implement Firebase storage
      // await saveJob(data);
      router.replace('/jobs');
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  return (
    <View style={styles.container}>
      {currentStep === 'scan' && (
        <JobSheetScanner onComplete={handleScanComplete} />
      )}
      
      {currentStep === 'review' && (
        <JobForm
          initialData={jobData}
          onSubmit={handleSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});