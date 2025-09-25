import { StyleSheet } from 'react-native';

export const createGlobalStyles = (isDarkTheme: boolean, primaryColor: string) => {
  return StyleSheet.create({
    exampleContainer: {
      backgroundColor: isDarkTheme ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: primaryColor,
    },
    exampleTitle: {
      fontSize: 14,
      fontWeight: 'bold' as 'bold',
      color: primaryColor,
      marginBottom: 8,
    },
    exampleText: {
      fontSize: 12,
      color: isDarkTheme ? '#ccc' : '#666',
      marginBottom: 2,
      fontFamily: 'monospace',
    },
  });
};