import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { setUserAsAdmin } from '@/lib/userOperations';
import type { User } from '@/types';

export default function ManageUsersScreen() {
  const { user, loading: authLoading } = useAuth();
  const { colors, primary } = useTheme();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  
  // Check if user is an admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      Alert.alert('Access Denied', 'You need admin privileges to access this page.');
      router.replace('/(tabs)');
    }
  }, [user, authLoading, router]);
  
  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          usersList.push({
            ...userData,
            id: doc.id
          });
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);
  
  const handleSetAsAdmin = async (userId: string) => {
    try {
      setProcessingUser(userId);
      await setUserAsAdmin(userId);
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: 'admin' } : u
        )
      );
      
      Alert.alert('Success', 'User has been set as admin');
    } catch (error) {
      console.error('Error setting user as admin:', error);
      Alert.alert('Error', 'Failed to set user as admin. Please try again.');
    } finally {
      setProcessingUser(null);
    }
  };
  
  const filteredUsers = searchQuery.trim() === ''
    ? users
    : users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.userItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: primary }]}>
          <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          <View style={styles.roleContainer}>
            <Text 
              style={[
                styles.roleTag, 
                { 
                  backgroundColor: item.role === 'admin' ? '#10b981' : '#6b7280',
                  color: '#ffffff'
                }
              ]}
            >
              {item.role === 'admin' ? 'Admin' : 'User'}
            </Text>
          </View>
        </View>
      </View>
      
      {item.role !== 'admin' && (
        <TouchableOpacity 
          style={[styles.adminButton, { backgroundColor: primary }]}
          onPress={() => handleSetAsAdmin(item.id)}
          disabled={processingUser === item.id}
        >
          {processingUser === item.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.adminButtonText}>Make Admin</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading users...</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Manage Users',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.usersList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery.length > 0 
                  ? 'No users match your search' 
                  : 'No users found'}
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 48,
  },
  usersList: {
    paddingBottom: 24,
  },
  userItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  adminButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
}); 