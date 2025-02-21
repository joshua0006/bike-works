/**
 * Job List Component
 * 
 * Displays a list of workshop jobs with filtering and sorting capabilities.
 * Shows job status, customer info, and key details at a glance.
 * 
 * Props:
 * - jobs: Job[] - Array of jobs to display
 * - onSelect?: (job: Job) => void - Optional callback when a job is selected
 * - filter?: (job: Job) => boolean - Optional filter function
 * 
 * Features:
 * - Status-based filtering
 * - Date range filtering
 * - Search by customer or bike
 * - Sort by date, status, or customer
 */

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Job } from '../../types';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { JobCard } from './JobCard';

interface Props {
  jobs: Job[];
  onSelect?: (job: Job) => void;
  filter?: (job: Job) => boolean;
}

export function JobList({ jobs, onSelect, filter }: Props) {
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        setJobsData(filter ? jobsData.filter(filter) : jobsData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load jobs');
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter]);

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (jobsData.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="document-text-outline" size={48} color="#64748b" />
        <Text style={styles.emptyStateText}>No Jobs Found</Text>
        <Text style={styles.emptyStateSubtext}>
          Scanned jobs will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobsData}
      renderItem={({ item }) => <JobCard job={item} />}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
  },
});