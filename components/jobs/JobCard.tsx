import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Job } from '../../types';

interface Props {
  job: Job;
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export function JobCard({ job }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id!), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <>
      <Pressable
        style={styles.card}
        onPress={showModal}
      >
        <View style={styles.header}>
          <Text style={styles.customerName}>{job.customerName}</Text>
          <Text style={styles.date}>{job.dateIn}</Text>
        </View>

        <View style={styles.bikeInfo}>
          <Text style={styles.bikeModel}>{job.bikeModel}</Text>
          <Text style={styles.phone}>{job.customerPhone}</Text>
        </View>

        <View style={styles.workInfo}>
          <Text style={styles.label}>Required:</Text>
          <Text style={styles.workText} numberOfLines={2}>
            {job.workRequired}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.status}>
            Status: {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
          </Text>
          <Text style={styles.total}>
            Total: ${job.totalCost}
          </Text>
        </View>
      </Pressable>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={hideModal}
          >
            <Pressable 
              style={styles.modalContent}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Job Details</Text>
                <Pressable
                  onPress={hideModal}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{job.customerName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{job.customerPhone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bike Model</Text>
                  <Text style={styles.detailValue}>{job.bikeModel}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date In</Text>
                  <Text style={styles.detailValue}>{job.dateIn}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Work Required</Text>
                  <Text style={styles.detailValue}>{job.workRequired}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Work Done</Text>
                  <Text style={styles.detailValue}>{job.workDone}</Text>
                </View>

                <View style={styles.costSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Labor Cost</Text>
                    <Text style={styles.detailValue}>${job.laborCost}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Cost</Text>
                    <Text style={[styles.detailValue, styles.totalCost]}>
                      ${job.totalCost}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View>
                    <Pressable
                      style={styles.statusButton}
                      onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                    >
                      <Text style={styles.statusText}>
                        {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                      </Text>
                    </Pressable>
                    
                    {showStatusDropdown && (
                      <View style={styles.dropdown}>
                        {STATUS_OPTIONS.map((option) => (
                          <Pressable
                            key={option.value}
                            style={styles.dropdownItem}
                            onPress={() => updateStatus(option.value)}
                          >
                            <Text style={styles.dropdownText}>{option.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  date: {
    fontSize: 14,
    color: '#64748b',
  },
  bikeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bikeModel: {
    fontSize: 16,
    color: '#334155',
  },
  phone: {
    fontSize: 14,
    color: '#64748b',
  },
  workInfo: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  workText: {
    fontSize: 14,
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748b',
    lineHeight: 24,
  },
  modalBody: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailSection: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  costSection: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalCost: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 4,
    minWidth: 150,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
  },
}); 