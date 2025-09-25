import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  emailContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  input: { marginBottom: 12 },
  button: { marginTop: 16 },
  error: { textAlign: "center", marginTop: 8 },
  
  // Estilos para sugestões dropdown
  suggestionsCard: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  suggestionsContainer: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
  
  // Estilos para chips de emails recentes
  chipsContainer: {
    marginBottom: 16,
  },
  chipsLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  emailChip: {
    marginRight: 8,
  },
});