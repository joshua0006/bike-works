import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../types';

export function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>User Management</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name} ({item.email})</Text>
            <Text>Role: {item.role}</Text>
          </View>
        )}
      />
    </View>
  );
} 