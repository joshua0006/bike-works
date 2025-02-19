/**
 * Theme Section
 * 
 * Allows customization of app colors and appearance.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const COLORS = {
  blue: '#2563eb',
  purple: '#7c3aed',
  pink: '#db2777',
  red: '#dc2626',
  green: '#16a34a',
  black: '#000000',
};

export function ThemeSection() {
  const { primary, colors, setPrimary } = useTheme();

  const [customColors, setCustomColors] = useState({
    primary: '',
  });

  const [activeCustomPicker, setActiveCustomPicker] = useState<keyof typeof customColors | null>(null);

  const updateColor = (type: keyof typeof theme, color: string) => {
    setPrimary(color);
  };

  const validateHexColor = (hex: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const handleCustomColorChange = (type: keyof typeof customColors, hex: string) => {
    if (validateHexColor(hex)) {
      setCustomColors(prev => ({ ...prev, [type]: hex }));
      updateColor(type, hex);
    }
  };

  const toggleCustomPicker = (type: keyof typeof customColors | null) => {
    setActiveCustomPicker(prev => prev === type ? null : type);
  };

  const renderColorPicker = (title: string, type: keyof typeof customColors) => (
    <View style={styles.colorPicker}>
      <View style={styles.colorHeader}>
        <Text style={styles.colorTitle}>{title}</Text>
        <Pressable
          onPress={() => toggleCustomPicker(type)}
          style={styles.customColorToggle}
        >
          <View style={[styles.customColorPreview, { backgroundColor: primary }]} />
          <Text style={styles.customColorText}>
            {activeCustomPicker === type ? 'Hide Custom' : 'Custom Color'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.colorGrid}>
        {Object.entries(COLORS).map(([name, value]) => (
          <Pressable
            key={name}
            style={[
              styles.colorOption,
              { backgroundColor: value },
              primary === value && styles.colorSelected,
            ]}
            onPress={() => updateColor(type, value)}
          />
        ))}
      </View>

      {activeCustomPicker === type && (
        <View style={styles.customColorPicker}>
          <TextInput
            style={styles.customColorInput}
            value={customColors[type]}
            onChangeText={(text) => handleCustomColorChange(type, text)}
            placeholder="#000000"
            maxLength={7}
            autoCapitalize="characters"
          />
          <Text style={styles.customColorHelp}>
            Enter a valid hex color (e.g., #FF0000)
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>

      {renderColorPicker('App Color', 'primary')}
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
  colorPicker: {
    marginBottom: 24,
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customColorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customColorText: {
    fontSize: 14,
    color: '#2563eb',
  },
  customColorPicker: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
  },
  customColorInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  customColorHelp: {
    fontSize: 12,
    color: '#64748b',
  },
});