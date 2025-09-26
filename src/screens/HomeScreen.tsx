import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AuthNavigator';
import { useMotorcycles } from '../context/MotorcycleContext';
import MotorcycleCard from '../components/MotorcycleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { styles as componentStyles } from '../styles/screens/HomeScreen.styles';

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
    <View style={componentStyles.container}>
      <Searchbar
        placeholder="Buscar moto por modelo ou placa"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={componentStyles.searchBar}
      />

      <View style={componentStyles.headerButtons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard')}
          style={componentStyles.button}
          icon="view-dashboard"
        >
          Dashboard
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Map')}
          style={componentStyles.button}
          icon="map"
        >
          Mapa
        </Button>
      </View>

      <Text style={componentStyles.sectionTitle}>
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
          contentContainerStyle={componentStyles.listContainer}
        />
      ) : (
        <View style={componentStyles.emptyContainer}>
          <Text>Nenhuma moto encontrada</Text>
        </View>
      )}

      <FAB
        style={componentStyles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddMotorcycle')}
      />
    </View>
  );
}
