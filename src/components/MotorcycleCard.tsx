import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import StatusBadge from './StatusBadge';

interface MotorcycleCardProps {
  id: string;
  model: string;
  plate: string;
  status: 'available' | 'maintenance' | 'rented' | 'out_of_service'; // Adicione 'out_of_service'
  onPress: (id: string) => void;
}

const MotorcycleCard: React.FC<MotorcycleCardProps> = ({ 
  id, 
  model, 
  plate, 
  status, 
  onPress 
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(id)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{model}</Title>
          <Paragraph>Placa: {plate}</Paragraph>
          <StatusBadge status={status} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
});

export default MotorcycleCard;
