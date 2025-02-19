/**
 * Staff Section
 * 
 * Manages staff member accounts and their permissions. Only accessible to owners
 * and managers with appropriate permissions.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StaffMember } from '../../types';

const DEFAULT_PERMISSIONS: StaffMember['permissions'] = {
  settings: {
    business: false,
    openingHours: true,
    bikeOptions: true,
    theme: false,
    staff: false,
  },
  sales: true,
  bikes: true,
  jobs: true,
  clients: true,
};

export function StaffSection() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    name: '',
    role: 'staff' as StaffMember['role'],
  });

  const handleAddStaff = () => {
    if (!newStaff.email || !newStaff.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const staffMember: StaffMember = {
      id: Date.now().toString(),
      email: newStaff.email,
      name: newStaff.name,
      role: newStaff.role,
      permissions: DEFAULT_PERMISSIONS,
      active: true,
    };

    setStaff(prev => [...prev, staffMember]);
    setShowAddForm(false);
    setNewStaff({ email: '', name: '', role: 'staff' });

    // TODO: Implement Firebase auth creation
    Alert.alert(
      'Success',
      'Staff member added. They will receive an email to set their password.'
    );
  };

  const togglePermission = (
    staffId: string,
    category: keyof StaffMember['permissions'],
    setting?: keyof StaffMember['permissions']['settings']
  ) => {
    setStaff(prev => prev.map(member => {
      if (member.id !== staffId) return member;

      if (setting) {
        return {
          ...member,
          permissions: {
            ...member.permissions,
            settings: {
              ...member.permissions.settings,
              [setting]: !member.permissions.settings[setting],
            },
          },
        };
      }

      return {
        ...member,
        permissions: {
          ...member.permissions,
          [category]: !member.permissions[category],
        },
      };
    }));
  };

  const toggleActive = (staffId: string) => {
    setStaff(prev => prev.map(member => 
      member.id === staffId
        ? { ...member, active: !member.active }
        : member
    ));
  };

  const renderStaffMember = ({ item: member }: { item: StaffMember }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffHeader}>
        <View>
          <Text style={styles.staffName}>{member.name}</Text>
          <Text style={styles.staffEmail}>{member.email}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{member.role}</Text>
          </View>
        </View>
        <Switch
          value={member.active}
          onValueChange={() => toggleActive(member.id)}
        />
      </View>

      <View style={styles.permissionsSection}>
        <Text style={styles.permissionsTitle}>Permissions</Text>
        
        <View style={styles.permissionGroup}>
          <Text style={styles.groupTitle}>Settings Access</Text>
          {Object.entries(member.permissions.settings).map(([key, value]) => (
            <View key={key} style={styles.permission}>
              <Text style={styles.permissionLabel}>
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Text>
              <Switch
                value={value}
                onValueChange={() => togglePermission(member.id, 'settings', key as any)}
              />
            </View>
          ))}
        </View>

        <View style={styles.permissionGroup}>
          <Text style={styles.groupTitle}>Feature Access</Text>
          {Object.entries(member.permissions).map(([key, value]) => {
            if (key === 'settings') return null;
            return (
              <View key={key} style={styles.permission}>
                <Text style={styles.permissionLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() => togglePermission(member.id, key as any)}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Staff Management</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Staff</Text>
        </Pressable>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={newStaff.name}
              onChangeText={(text) => setNewStaff(prev => ({ ...prev, name: text }))}
              placeholder="Enter staff member's name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={newStaff.email}
              onChangeText={(text) => setNewStaff(prev => ({ ...prev, email: text }))}
              placeholder="Enter staff member's email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleButtons}>
              {(['staff', 'manager'] as const).map(role => (
                <Pressable
                  key={role}
                  style={[
                    styles.roleButton,
                    newStaff.role === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewStaff(prev => ({ ...prev, role }))}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newStaff.role === role && styles.roleButtonTextActive,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.formButtons}>
            <Pressable
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.formButton, styles.saveButton]}
              onPress={handleAddStaff}
            >
              <Text style={styles.saveButtonText}>Add Staff Member</Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={staff}
        renderItem={renderStaffMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No staff members yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add staff members to give them access to the system
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 16,
  },
  staffCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  staffEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '500',
  },
  permissionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  permissionGroup: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  permission: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#1e293b',
    textTransform: 'capitalize',
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
});