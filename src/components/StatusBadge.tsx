import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'available' | 'maintenance' | 'rented' | 'out_of_service'; // Adicione 'out_of_service'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'maintenance':
        return 'Em Manutenção';
      case 'rented':
        return 'Alugada';
      case 'out_of_service':
        return 'Fora de Serviço'; // Adicione o novo caso
      default:
        return status;
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return styles.available;
      case 'maintenance':
        return styles.maintenance;
      case 'rented':
        return styles.rented;
      case 'out_of_service':
        return styles.outOfService; // Adicione o novo estilo
      default:
        return {};
    }
  };

  return (
    <View style={[styles.container, getStatusStyle()]}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#1976d2',
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

export default StatusBadge;
