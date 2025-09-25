import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const Copyright = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.copyrightText, { color: theme.colors.onSurfaceVariant }]}>
        © 2025 – Trabalho acadêmico. Não destinado a uso comercial.
      </Text>
      <Text style={[styles.developersText, { color: theme.colors.onSurfaceVariant }]}>
        Desenvolvido por Carlos Eduardo Pacheco e Pedro Augusto Ladeira
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 24,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  developersText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Copyright;