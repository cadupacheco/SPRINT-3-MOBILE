import React from 'react';
import { View, Text } from 'react-native';
import { styles as componentStyles } from '../styles/components/StatusBadge.styles';

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
        return componentStyles.available;
      case 'maintenance':
        return componentStyles.maintenance;
      case 'rented':
        return componentStyles.rented;
      case 'out_of_service':
        return componentStyles.outOfService; // Adicione o novo estilo
      default:
        return {};
    }
  };

  return (
    <View style={[componentStyles.container, getStatusStyle()]}>
      <Text style={componentStyles.text}>{getStatusText()}</Text>
    </View>
  );
};

export default StatusBadge;
