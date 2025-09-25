import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalText: {
    marginHorizontal: 8,
  },
  dangerZone: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dangerButton: {
  },
  versionContainer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
  copyrightText: {
    fontSize: 12,
    marginTop: 4,
  },
});