import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { JobList } from '../../components/jobs/JobList';

export default function JobsScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8fafc'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0'
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1e293b'
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2563eb',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8
    },
    addButtonText: {
      color: '#ffffff',
      fontWeight: '600'
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workshop Jobs</Text>
        <Link href="/jobs/new" asChild>
          <Pressable style={styles.addButton}>
            <Ionicons name="camera" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Scan Job Sheet</Text>
          </Pressable>
        </Link>
      </View>
      <JobList jobs={[]} />
    </View>
  );
}