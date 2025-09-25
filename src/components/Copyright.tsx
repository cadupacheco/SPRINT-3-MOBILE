import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { styles as componentStyles } from '../styles/components/Copyright.styles';

const Copyright = () => {
  const theme = useTheme();

  return (
    <View style={[componentStyles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[componentStyles.copyrightText, { color: theme.colors.onSurfaceVariant }]}>
        © 2025 – Trabalho acadêmico. Não destinado a uso comercial.
      </Text>
      <Text style={[componentStyles.developersText, { color: theme.colors.onSurfaceVariant }]}>
        Desenvolvido por Carlos Eduardo Pacheco e Pedro Augusto Ladeira
      </Text>
    </View>
  );
};

export default Copyright;
