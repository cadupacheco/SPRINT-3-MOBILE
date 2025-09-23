import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    if (percentage > 70) return '#4caf50';
    if (percentage > 30) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage}%`, backgroundColor: getBarColor() }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ProgressBar;
