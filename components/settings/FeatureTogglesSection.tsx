/**
 * Feature Toggles Section
 * 
 * Allows enabling/disabling specific features of the app.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { BusinessSettings } from '../../types';

export function FeatureTogglesSection() {
  const { colors } = useTheme();
  const [features, setFeatures] = useState<BusinessSettings['features']>({
    sales: true,
    jobs: true,
  });

  const toggleFeature = (feature: keyof BusinessSettings['features']) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
      
      <View style={styles.feature}>
        <View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Sales</Text>
          <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
            Track bike sales and manage inventory
          </Text>
        </View>
        <Switch
          value={features.sales}
          onValueChange={() => toggleFeature('sales')}
        />
      </View>

      <View style={styles.feature}>
        <View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Workshop Jobs</Text>
          <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
            Manage service jobs and repairs
          </Text>
        </View>
        <Switch
          value={features.jobs}
          onValueChange={() => toggleFeature('jobs')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
});