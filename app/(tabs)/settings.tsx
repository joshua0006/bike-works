/**
 * Settings Screen
 * 
 * Provides a comprehensive settings interface for managing business details,
 * bike metadata, and app preferences.
 * 
 * Features:
 * - Business information management
 * - Opening hours configuration
 * - Bike metadata management (brands, colors, sizes)
 * - Theme customization
 * - Profile settings
 */

import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BusinessInfoSection } from '../../components/settings/BusinessInfoSection';
import { OpeningHoursSection } from '../../components/settings/OpeningHoursSection';
import { BikeMetadataSection } from '../../components/settings/BikeMetadataSection';
import { FeatureTogglesSection } from '../../components/settings/FeatureTogglesSection';
import { ThemeSection } from '../../components/settings/ThemeSection';
import { ProfileSection } from '../../components/settings/ProfileSection';
import { StaffSection } from '../../components/settings/StaffSection';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <BusinessInfoSection />
        <StaffSection />
        <FeatureTogglesSection />
        <OpeningHoursSection />
        <BikeMetadataSection />
        <ThemeSection />
        <ProfileSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});