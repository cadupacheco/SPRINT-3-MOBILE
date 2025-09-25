import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { styles as componentStyles } from '../styles/components/ProgressBar.styles';

interface ProgressBarProps {
  value: number;
  label: string;
  maxValue?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  label, 
  maxValue = 100 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  const getBarColor = () => {
    if (percentage > 70) return '#1976d2';
    if (percentage > 30) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={componentStyles.container}>
      <View style={componentStyles.labelContainer}>
        <Text style={componentStyles.label}>{label}</Text>
        <Text style={componentStyles.value}>{value}%</Text>
      </View>
      <View style={componentStyles.barBackground}>
        <View 
          style={[
            componentStyles.barFill, 
            { width: `${percentage}%`, backgroundColor: getBarColor() }
          ]} 
        />
      </View>
    </View>
  );
};

export default ProgressBar;
