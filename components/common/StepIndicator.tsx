/**
 * Step Indicator Component
 * 
 * A reusable component that shows progress through a multi-step process.
 * Used in various workflows like sales, job creation, etc.
 * 
 * Props:
 * - steps: string[] - Array of step identifiers
 * - currentStep: string - Current active step
 * - labels: Record<string, string> - Human-readable labels for steps
 * - onStepPress?: (step: string) => void - Optional function to handle step presses
 * 
 * Features:
 * - Visual progress indication
 * - Step labels
 * - Completion status
 * - Navigation to previous steps
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  steps: string[];
  currentStep: string;
  labels: Record<string, string>;
  onStepPress?: (step: string) => void;
}

export function StepIndicator({ steps, currentStep, labels, onStepPress }: Props) {
  const currentIndex = steps.indexOf(currentStep);

  const handleStepPress = (step: string) => {
    const stepIndex = steps.indexOf(step);
    const isNavigable = stepIndex <= currentIndex;
    
    console.log('Step pressed:', step);
    console.log('Current step:', currentStep);
    console.log('Is step navigable:', isNavigable);
    
    if (isNavigable && onStepPress) {
      onStepPress(step);
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isNavigable = index <= currentIndex;

        return (
          <TouchableOpacity
            key={step}
            style={[
              styles.stepContainer,
              isNavigable && onStepPress && styles.navigableStep
            ]}
            onPress={() => handleStepPress(step)}
            disabled={!onStepPress || !isNavigable}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.line,
                index === 0 && styles.lineHidden,
                (isCompleted || isActive) && styles.lineCompleted,
              ]}
            />
            <View
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isCompleted && styles.dotCompleted,
                isNavigable && onStepPress && styles.navigableDot
              ]}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
              {isNavigable && !isCompleted && !isActive && onStepPress && (
                <Ionicons name="arrow-back" size={14} color="#2563eb" />
              )}
            </View>
            <View
              style={[
                styles.line,
                index === steps.length - 1 && styles.lineHidden,
                (isCompleted || isActive) && styles.lineCompleted,
              ]}
            />
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                (isCompleted || isActive) && styles.labelCompleted,
                isNavigable && onStepPress && styles.navigableLabel,
              ]}
            >
              {labels[step]}
            </Text>
            {isNavigable && !isActive && onStepPress && (
              <Text style={styles.editHint}>Tap to edit</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  navigableStep: {
    // Subtle background to indicate the step is clickable
    backgroundColor: 'rgba(237, 242, 247, 0.5)',
    borderRadius: 8,
  },
  line: {
    position: 'absolute',
    top: 12,
    height: 2,
    width: '100%',
    backgroundColor: '#e2e8f0',
  },
  lineHidden: {
    opacity: 0,
  },
  lineCompleted: {
    backgroundColor: '#2563eb',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  dotCompleted: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  navigableDot: {
    // Special styling for navigable dots
    borderColor: '#2563eb',
    transform: [{scale: 1.1}], // Make it slightly larger
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  labelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  labelCompleted: {
    color: '#2563eb',
  },
  navigableLabel: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    marginLeft: 16,
    marginTop: 16,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  editHint: {
    fontSize: 10,
    color: '#2563eb',
    marginTop: 2,
    opacity: 0.8,
  },
});