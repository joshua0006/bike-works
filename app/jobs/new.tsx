import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { JobList } from '../../components/jobs/JobList';
import { db } from '../../lib/firebase';
import { Job } from '../../types';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { JobSheetScanner } from '../../components/jobs/JobSheetScanner';
export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
        setJobs(jobsData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load jobs');
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <JobSheetScanner onComplete={handleScanComplete} />
    </View>
  );
}

const handleScanComplete = (job: Partial<Job>) => {
  console.log('Job scanned:', job);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  }
}); 