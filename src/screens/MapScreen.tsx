import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Chip, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AuthNavigator';

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;

interface Motorcycle {
  id: string;
  model: string;
  plate: string;
  status: 'available' | 'maintenance' | 'rented';
  location: { x: number; y: number };
  lastUpdate?: string;
}

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);
  const [mapZoom, setMapZoom] = useState(1);

  useEffect(() => {
    const loadMotorcycles = async () => {
      try {
        const storedMotorcycles = await AsyncStorage.getItem('motorcycles');
        if (storedMotorcycles) {
          setMotorcycles(JSON.parse(storedMotorcycles));
        }
      } catch (error) {
        console.error('Erro ao carregar motos:', error);
      }
    };

    loadMotorcycles();
  }, []);

  const filteredMotorcycles = selectedFilter 
    ? motorcycles.filter(m => m.status === selectedFilter)
    : motorcycles;

  const handleMotorcyclePress = (motorcycle: Motorcycle) => {
    setSelectedMotorcycle(motorcycle);
  };

  const handleDetailPress = (id: string) => {
    navigation.navigate('MotorcycleDetails', { id });
  };

  // Criando linhas horizontais para a grade
  const renderHorizontalLines = () => {
    const lines = [];
    // Número de linhas horizontais baseado no tamanho do container
    const lineCount = 20;
    
    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <View 
          key={`h-${i}`} 
          style={{
            position: 'absolute',
            left: 0,
            top: i * 20,
            right: 0,
            height: 1,
            backgroundColor: '#ccc',
          }} 
        />
      );
    }
    return lines;
  };

  // Criando linhas verticais para a grade
  const renderVerticalLines = () => {
    const lines = [];
    // Número de linhas verticais baseado no tamanho do container
    const lineCount = 20;
    
    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <View 
          key={`v-${i}`} 
          style={{
            position: 'absolute',
            top: 0,
            left: i * 20,
            bottom: 0,
            width: 1,
            backgroundColor: '#ccc',
          }} 
        />
      );
    }
    return lines;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip 
            selected={selectedFilter === null} 
            onPress={() => setSelectedFilter(null)}
            style={styles.chip}
          >
            Todas
          </Chip>
          <Chip 
            selected={selectedFilter === 'available'} 
            onPress={() => setSelectedFilter('available')}
            style={styles.chip}
          >
            Disponíveis
          </Chip>
          <Chip 
            selected={selectedFilter === 'maintenance'} 
            onPress={() => setSelectedFilter('maintenance')}
            style={styles.chip}
          >
            Em Manutenção
          </Chip>
          <Chip 
            selected={selectedFilter === 'rented'} 
            onPress={() => setSelectedFilter('rented')}
            style={styles.chip}
          >
            Alugadas
          </Chip>
        </ScrollView>
      </View>

      <View style={styles.zoomControls}>
        <Button 
          mode="contained" 
          onPress={() => setMapZoom(prev => Math.min(prev + 0.2, 2))}
          icon="plus"
          compact
        >
          Zoom In
        </Button>
        <Button 
          mode="contained" 
          onPress={() => setMapZoom(prev => Math.max(prev - 0.2, 0.5))}
          icon="minus"
          compact
          style={{ marginLeft: 8 }}
        >
          Zoom Out
        </Button>
      </View>

      <View style={styles.mapContainer}>
        <View style={[styles.mapBackground, { transform: [{ scale: mapZoom }] }]}>
          {/* Grid criado usando Views no lugar de background-image */}
          <View style={styles.grid}>
            {renderHorizontalLines()}
            {renderVerticalLines()}
          </View>
        </View>
        
        {/* Marcadores das motos no mapa */}
        {filteredMotorcycles.map((motorcycle) => (
          <TouchableOpacity
            key={motorcycle.id}
            style={[
              styles.motorcycleMarker,
              {
                left: motorcycle.location.x,
                top: motorcycle.location.y,
                backgroundColor: 
                  motorcycle.status === 'available' ? '#1976d2' :
                  motorcycle.status === 'maintenance' ? '#ff9800' : '#2196f3'
              }
            ]}
            onPress={() => handleMotorcyclePress(motorcycle)}
          >
            <Text style={styles.markerText}>{motorcycle.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMotorcycle && (
        <Card style={styles.motorcycleInfoCard}>
          <Card.Content>
            <Title>{selectedMotorcycle.model}</Title>
            <Paragraph>Placa: {selectedMotorcycle.plate}</Paragraph>
            <Paragraph>Status: {
              selectedMotorcycle.status === 'available' ? 'Disponível' :
              selectedMotorcycle.status === 'maintenance' ? 'Em Manutenção' : 'Alugada'
            }</Paragraph>
            <Button 
              mode="contained" 
              onPress={() => handleDetailPress(selectedMotorcycle.id)}
              style={{ marginTop: 8 }}
            >
              Ver Detalhes
            </Button>
          </Card.Content>
        </Card>
      )}

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legenda:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#1976d2' }]} />
          <Text>Disponível</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff9800' }]} />
          <Text>Em Manutenção</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196f3' }]} />
          <Text>Alugada</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  grid: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  motorcycleMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  motorcycleInfoCard: {
    marginBottom: 16,
  },
  legendContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
});