import React from 'react';
import { View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { styles as componentStyles } from '../styles/components/LoadingSpinner.styles';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  size = 'large' 
}) => {
  return (
    <View style={componentStyles.container}>
      <ActivityIndicator size={size} color="#6200ee" />
      <Text style={componentStyles.message}>{message}</Text>
    </View>
  );
};

export default LoadingSpinner;
