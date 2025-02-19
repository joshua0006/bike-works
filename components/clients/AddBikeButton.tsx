import { Link } from 'expo-router';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AddBikeButton({ clientId }: { clientId?: string }) {
  return (
    <Link href={`/bikes/new${clientId ? `?clientId=${clientId}` : ''}`} asChild>
      <Pressable style={styles.button}>
        <Ionicons name="add" size={20} color="#2563eb" />
        <Text style={styles.buttonText}>Add New Bike</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#2563eb',
    fontWeight: '500',
  },
}); 