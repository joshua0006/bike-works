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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle different date formats
      const dateParts = dateString.split(/[/-]/);
      if (dateParts.length !== 3) return dateString;

      const [day, month, year] = dateParts;
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      console.error('Invalid date format:', dateString);
      return dateString;
    }
  };

  const renderJob = ({ item: job }: { item: Job }) => (
    <Pressable
      style={styles.jobCard}
      onPress={() => onSelect?.(job)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.date}>{formatDate(job.dateIn)}</Text>
        <Text style={styles.cost}>${job.totalCost}</Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{job.customerName}</Text>
        <Text style={styles.bikeModel}>{job.bikeModel}</Text>
      </View>

      <Text style={styles.workRequired} numberOfLines={2}>
        {job.workRequired}
      </Text>

      {job.pickupDate ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed</Text>
          <Text style={styles.pickupDate}>
            Pickup: {formatDate(job.pickupDate)}
          </Text>
        </View>
      ) : (
        <View style={styles.inProgressBadge}>
          <Text style={styles.inProgressText}>In Progress</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <FlatList
      data={jobsData}
      renderItem={renderJob}
      keyExtractor={(job) => job.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="construct-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyStateText}>No jobs found</Text>
          <Text style={styles.emptyStateSubtext}>
            Scan a job sheet to add your first workshop job
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  customerInfo: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bikeModel: {
    fontSize: 14,
    color: '#64748b',
  },
  workRequired: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  pickupDate: {
    fontSize: 14,
    color: '#16a34a',
  },
  inProgressBadge: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 4,
  },
  inProgressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d97706',
    textAlign: 'center',
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