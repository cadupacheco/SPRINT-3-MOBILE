import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMotorcycles } from '../context/MotorcycleContext';
import MotorcycleCard from '../components/MotorcycleCard';
import LoadingSpinner from '../components/LoadingSpinner';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state, actions } = useMotorcycles();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    actions.loadMotorcycles();
  }, []);

  const filteredMotorcycles = state.motorcycles.filter(
    (motorcycle) =>
      motorcycle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motorcycle.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (state.loading) {
    return <LoadingSpinner message="Carregando motos..." />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar moto por modelo ou placa"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.headerButtons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.button}
          icon="view-dashboard"
        >
          Dashboard
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Map')}
          style={styles.button}
          icon="map"
        >
          Mapa
        </Button>
      </View>

      <Text style={styles.sectionTitle}>
        Motos no Pátio ({filteredMotorcycles.length})
      </Text>

      {filteredMotorcycles.length > 0 ? (
        <FlatList
          data={filteredMotorcycles}
          renderItem={({ item }) => (
            <MotorcycleCard
              id={item.id}
              model={item.model}
              plate={item.plate}
              status={item.status}
              onPress={(id) => navigation.navigate('MotorcycleDetails', { id })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>Nenhuma moto encontrada</Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddMotorcycle')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
