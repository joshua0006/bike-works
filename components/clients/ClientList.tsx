/**
 * Client List Component
 * 
 * Displays a list of clients with filtering and sorting capabilities.
 * Shows client details and associated bikes at a glance.
 * 
 * Props:
 * - clients: Client[] - Array of clients to display
 * - onSelect?: (client: Client) => void - Optional callback when a client is selected
 * - filter?: (client: Client) => boolean - Optional filter function
 * 
 * Features:
 * - Search by name/phone
 * - Sort by name
 * - Quick actions menu
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, writeBatch, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Client, Bike } from '../../types';
import { BikeSelector } from './BikeSelector';
import { Button } from 'react-native';
import { AddBikeButton } from './AddBikeButton';

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Client>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsSnapshot, bikesSnapshot] = await Promise.all([
          getDocs(collection(db, 'clients')),
          getDocs(collection(db, 'bikes'))
        ]);

        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          phone: doc.data().phone,
          email: doc.data().email,
          bikeSerialNumbers: doc.data().bikeSerialNumbers || [],
        })) as Client[];

        const bikesData = bikesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bike[];

        setClients(clientsData);
        setBikes(bikesData);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteClient = async (clientId: string) => {
    try {
      setLoading(true);
      
      // 1. Get associated bikes
      const bikesQuery = query(
        collection(db, 'bikes'),
        where('clientId', '==', clientId)
      );
      const bikeSnapshots = await getDocs(bikesQuery);

      // 2. Prepare batch
      const batch = writeBatch(db);
      
      // Update bikes to remove client association
      bikeSnapshots.forEach(bikeDoc => {
        batch.update(bikeDoc.ref, {
          clientId: null,
          clientName: null
        });
      });

      // 3. Delete client document
      const clientRef = doc(db, 'clients', clientId);
      batch.delete(clientRef);

      // 4. Execute batch
      await batch.commit();

      // 5. Update UI state
      setClients(prev => prev.filter(c => c.id !== clientId));
      setSelectedClient(null); // Close modal after deletion
      
      Alert.alert('Success', 'Client deleted successfully');
    } catch (error) {
      console.error('Deletion error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const getClientBikes = (client: Client) => {
    return bikes.filter(bike => 
      client.bikeSerialNumbers.includes(bike.serialNumber)
    );
  };

  const handleSave = async () => {
    try {
      if (!selectedClient) return;
      
      await updateDoc(doc(db, 'clients', selectedClient.id), editedData);
      const updatedClients = clients.map(client => 
        client.id === selectedClient.id ? { ...client, ...editedData } : client
      );
      setClients(updatedClients);
      setSelectedClient(prev => prev ? { ...prev, ...editedData } : null);
      setEditMode(false);
      Alert.alert('Success', 'Client updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update client');
    }
  };

  useEffect(() => {
    if (selectedClient) {
      const freshClientData = clients.find(c => c.id === selectedClient.id);
      if (freshClientData) {
        setSelectedClient(freshClientData);
      }
    }
  }, [clients]);

  useEffect(() => {
    return () => {
      setLoading(false);
      setSelectedClient(null);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderClient = ({ item: client }: { item: Client }) => {
    const clientBikes = getClientBikes(client);
    
    return (
      <Pressable style={styles.clientCard} onPress={() => setSelectedClient(client)}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          
          <View style={styles.clientMeta}>
            <Ionicons name="bicycle" size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {clientBikes.length} {clientBikes.length === 1 ? 'bike' : 'bikes'}
            </Text>
            
            <Ionicons name="call" size={14} color="#64748b" />
            <Text style={styles.metaText}>{client.phone}</Text>
          </View>

          {clientBikes.slice(0, 2).map(bike => (
            <Text key={bike.id} style={styles.bikePreview}>
              {bike.brand} {bike.model}
            </Text>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </Pressable>
    );
  };

  return (
    <>
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(client) => client.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No clients found</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first client by clicking the New Client button
            </Text>
          </View>
        }
      />
      
      <Modal
        visible={!!selectedClient}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditMode(false);
          setSelectedClient(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => !editMode && setSelectedClient(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedClient && (
                <>
                  <Text style={styles.modalTitle}>
                    {editMode ? 'Edit Client' : 'Client Details'}
                  </Text>
                  
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Name:</Text>
                    {editMode ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedData.name || selectedClient?.name || ''}
                        onChangeText={(text) => setEditedData(prev => ({ ...prev, name: text }))}
                      />
                    ) : (
                      <Text style={styles.fieldValue}>{selectedClient?.name}</Text>
                    )}
                  </View>
                  
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Phone:</Text>
                    {editMode ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedData.phone || selectedClient?.phone || ''}
                        onChangeText={(text) => setEditedData(prev => ({ ...prev, phone: text }))}
                        keyboardType="phone-pad"
                      />
                    ) : (
                      <Text style={styles.fieldValue}>{selectedClient?.phone}</Text>
                    )}
                  </View>
                  
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    {editMode ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedData.email || selectedClient?.email || ''}
                        onChangeText={(text) => setEditedData(prev => ({ ...prev, email: text }))}
                        keyboardType="email-address"
                      />
                    ) : (
                      <Text style={styles.fieldValue}>{selectedClient?.email || 'N/A'}</Text>
                    )}
                  </View>
                  
                  {editMode && (
                    <View style={styles.bikeSelectorContainer}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Associated Bikes</Text>
                        <AddBikeButton clientId={selectedClient?.id} />
                      </View>
                      <BikeSelector
                        selectedBikes={editedData.bikeSerialNumbers || []}
                        onChange={(serials) => {
                          setEditedData(prev => ({
                            ...prev,
                            bikeSerialNumbers: serials
                          }));
                          
                          // Update Firestore
                          const updates = serials.map(async serial => {
                            const bike = bikes.find(b => b.serialNumber === serial);
                            if (bike) {
                              await updateDoc(doc(db, 'bikes', bike.id), {
                                clientId: selectedClient?.id,
                                clientName: selectedClient?.name
                              });
                            }
                          });
                        }}
                      />
                    </View>
                  )}
                  
                  <View style={styles.buttonGroup}>
                    {editMode ? (
                      <>
                        <Pressable
                          style={[styles.button, styles.saveButton]}
                          onPress={handleSave}
                        >
                          <Text style={styles.buttonText}>Save Changes</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.button, styles.cancelButton]}
                          onPress={() => setEditMode(false)}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable
                          style={[styles.button, styles.editButton]}
                          onPress={() => {
                            setEditMode(true);
                            setEditedData(selectedClient);
                          }}
                        >
                          <Text style={styles.buttonText}>Edit Client</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.button, styles.deleteButton]}
                          onPress={() => {
                            if (!selectedClient) return;
                            
                            Alert.alert(
                              'Confirm Delete',
                              `Permanently delete ${selectedClient.name}?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                  text: 'Delete', 
                                  async onPress() {
                                    try {
                                      await deleteClient(selectedClient.id);
                                    } catch (error) {
                                      console.error('Deletion failed:', error);
                                    }
                                  }
                                }
                              ]
                            );
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="#dc2626" />
                          ) : (
                            <Text style={styles.buttonText}>Delete Client</Text>
                          )}
                        </Pressable>
                      </>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  clientEmail: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#2563eb',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#64748b',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  bikeSelectorContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  bikePreview: {
    fontSize: 14,
    color: '#64748b',
  },
  bikeListContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  bikeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  bikeInfo: {
    flex: 1,
  },
  bikeModel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  bikeSerial: {
    fontSize: 12,
    color: '#64748b',
  },
  noBikesText: {
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
});