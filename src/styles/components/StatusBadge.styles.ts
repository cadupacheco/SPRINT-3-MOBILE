import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  available: {
    backgroundColor: '#42a5f5',
  },
  maintenance: {
    backgroundColor: '#ef6c00',
  },
  rented: {
    backgroundColor: '#1565c0',
  },
  outOfService: {
    backgroundColor: '#d32f2f', // Novo estilo para 'out_of_service'
  },
});