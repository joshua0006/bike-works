import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserBikes, getUserJobs, updateUserProfile } from '@/lib/userOperations';
import type { Bike, Job } from '@/types';

export default function ProfileScreen() {
  const { user, loading: authLoading } = useAuth();
  const { colors, primary } = useTheme();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      
      // Load bikes and jobs
      const loadUserData = async () => {
        try {
          setLoadingBikes(true);
          setLoadingJobs(true);
          
          const userBikes = await getUserBikes(user.id);
          const userJobs = await getUserJobs(user.id);
          
          setBikes(userBikes);
          setJobs(userJobs);
        } catch (error) {
          console.error('Error loading user data:', error);
          Alert.alert('Error', 'Failed to load your data. Please try again.');
        } finally {
          setLoadingBikes(false);
          setLoadingJobs(false);
        }
      };
      
      loadUserData();
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    try {
      setLoadingProfile(true);
      
      await updateUserProfile(user.id, {
        name,
        phone,
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  };
  
  // Show login screen if not authenticated
  if (!user && !authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={primary} />
          <Text style={[styles.promptTitle, { color: colors.text }]}>
            Sign in to access your profile
          </Text>
          <Text style={[styles.promptText, { color: colors.textSecondary }]}>
            Create an account or sign in to track your bikes and jobs.
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.registerButton, { borderColor: primary }]}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={[styles.registerButtonText, { color: primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Show loading state
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: primary }]}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          {isEditing ? (
            <TextInput
              style={[styles.nameInput, { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }]}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          ) : (
            <Text style={styles.userName}>{user?.name}</Text>
          )}
          
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bikes.length}</Text>
              <Text style={styles.statLabel}>Bikes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobs.length}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
          {isEditing ? (
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: primary }]}
              onPress={handleSaveProfile}
              disabled={loadingProfile}
            >
              {loadingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.editButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.profileItem}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.profileInput, { color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.profileValue, { color: colors.text }]}>{user?.name}</Text>
            )}
          </View>
          
          <View style={styles.profileItem}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>{user?.email}</Text>
          </View>
          
          <View style={styles.profileItem}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={[styles.profileInput, { color: colors.text, borderColor: colors.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {user?.phone || 'No phone number added'}
              </Text>
            )}
          </View>
          
          <View style={styles.profileItem}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* My Bikes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Bikes</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: primary }]}
            onPress={() => router.push('/bikes/new')}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Bike</Text>
          </TouchableOpacity>
        </View>
        
        {loadingBikes ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator color={primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading bikes...</Text>
          </View>
        ) : bikes.length > 0 ? (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bikesContainer}
          >
            {bikes.map(bike => (
              <TouchableOpacity 
                key={bike.id} 
                style={[styles.bikeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  // @ts-ignore - Suppressing TS error for now
                  router.push(`/bikes/${bike.id}`);
                }}
              >
                <View style={[styles.bikeImageContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="bicycle" size={32} color={primary} />
                </View>
                <Text style={[styles.bikeName, { color: colors.text }]}>
                  {bike.brand} {bike.model}
                </Text>
                <Text style={[styles.bikeDetails, { color: colors.textSecondary }]}>
                  {bike.year} • {bike.color}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Bikes Added</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Add your bikes to keep track of service history and details.
            </Text>
          </View>
        )}
      </View>
      
      {/* My Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Jobs</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: primary }]}
            onPress={() => router.push('/jobs/new')}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Job</Text>
          </TouchableOpacity>
        </View>
        
        {loadingJobs ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator color={primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading jobs...</Text>
          </View>
        ) : jobs.length > 0 ? (
          <View style={styles.jobsContainer}>
            {jobs.slice(0, 3).map(job => (
              <TouchableOpacity 
                key={job.id} 
                style={[styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  // @ts-ignore - Suppressing TS error for now
                  router.push(`/jobs/${job.id}`);
                }}
              >
                <View style={styles.jobCardContent}>
                  <View style={styles.jobCardHeader}>
                    <Ionicons 
                      name="construct" 
                      size={18} 
                      color={
                        job.status === 'completed' ? '#10b981' :
                        job.status === 'in_progress' ? '#f59e0b' : '#64748b'
                      } 
                    />
                    <Text style={[styles.jobStatus, { 
                      color: job.status === 'completed' ? '#10b981' :
                             job.status === 'in_progress' ? '#f59e0b' : '#64748b'
                    }]}>
                      {job.status === 'completed' ? 'Completed' : 
                       job.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </Text>
                  </View>
                  
                  <Text style={[styles.jobBikeModel, { color: colors.text }]}>{job.bikeModel}</Text>
                  <Text style={[styles.jobDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {job.workRequired}
                  </Text>
                  
                  <View style={styles.jobFooter}>
                    <Text style={[styles.jobDate, { color: colors.textSecondary }]}>
                      {new Date(job.dateIn).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.jobCost, { color: primary }]}>${job.totalCost.toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {jobs.length > 3 && (
              <TouchableOpacity 
                style={[styles.viewAllButton, { borderColor: colors.border }]}
                onPress={() => router.push('/jobs')}
              >
                <Text style={[styles.viewAllText, { color: primary }]}>View All Jobs</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Jobs Added</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Add jobs to track repairs and maintenance for your bikes.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: '100%',
    textAlign: 'center',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 16,
    marginTop: -40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  profileItem: {
    marginBottom: 16,
  },
  profileLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileInput: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  bikesContainer: {
    flexDirection: 'row',
  },
  bikeCard: {
    width: 150,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  bikeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  bikeDetails: {
    fontSize: 14,
    textAlign: 'center',
  },
  jobsContainer: {
    marginBottom: 16,
  },
  jobCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  jobCardContent: {
    padding: 16,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobStatus: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  jobBikeModel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  jobDate: {
    fontSize: 12,
  },
  jobCost: {
    fontWeight: 'bold',
  },
  viewAllButton: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 