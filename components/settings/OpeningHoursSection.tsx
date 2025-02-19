/**
 * Opening Hours Section
 * 
 * Manages business operating hours for each day of the week.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function OpeningHoursSection() {
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(() => {
    const initial: Record<string, { open: string; close: string; closed: boolean }> = {};
    DAYS.forEach(day => {
      initial[day] = {
        open: '09:00',
        close: '17:00',
        closed: false,
      };
    });
    return initial;
  });

  const [showPicker, setShowPicker] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'open' | 'close' | null>(null);

  const handleTimeChange = (time: Date | null) => {
    if (time && activeDay && activeType) {
      const timeString = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      setHours(prev => ({
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          [activeType]: timeString,
        },
      }));
    }
    setShowPicker(false);
    setActiveDay(null);
    setActiveType(null);
  };

  const showTimePicker = (day: string, type: 'open' | 'close') => {
    setActiveDay(day);
    setActiveType(type);
    setShowPicker(true);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Opening Hours</Text>

      {DAYS.map(day => (
        <View key={day} style={styles.dayRow}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{day}</Text>
            <Switch
              value={!hours[day].closed}
              onValueChange={(value) =>
                setHours(prev => ({
                  ...prev,
                  [day]: { ...prev[day], closed: !value },
                }))
              }
            />
          </View>

          {!hours[day].closed && (
            <View style={styles.times}>
              <Pressable
                style={styles.timeButton}
                onPress={() => showTimePicker(day, 'open')}
              >
                <Text style={styles.timeText}>{hours[day].open}</Text>
              </Pressable>
              <Text style={styles.toText}>to</Text>
              <Pressable
                style={styles.timeButton}
                onPress={() => showTimePicker(day, 'close')}
              >
                <Text style={styles.timeText}>{hours[day].close}</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}

      {showPicker && (
        <DateTimePicker
          value={new Date(`2024-01-01T${hours[activeDay!][activeType!]}`)}
          mode="time"
          is24Hour={true}
          onChange={(_, date) => handleTimeChange(date)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  dayRow: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  toText: {
    color: '#64748b',
  },
});