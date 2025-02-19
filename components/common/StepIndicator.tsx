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
 * 
 * Features:
 * - Visual progress indication
 * - Step labels
 * - Completion status
 */

import { View, Text, StyleSheet } from 'react-native';

interface Props {
  steps: string[];
  currentStep: string;
  labels: Record<string, string>;
}

export function StepIndicator({ steps, currentStep, labels }: Props) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.line,
                index === 0 && styles.lineHidden,
                isCompleted && styles.lineCompleted,
              ]}
            />
            <View
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isCompleted && styles.dotCompleted,
              ]}
            />
            <View
              style={[
                styles.line,
                index === steps.length - 1 && styles.lineHidden,
                isCompleted && styles.lineCompleted,
              ]}
            />
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                isCompleted && styles.labelCompleted,
              ]}
            >
              {labels[step]}
            </Text>
          </View>
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
  },
  dotActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  dotCompleted: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
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
});