import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, DataTable, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getMotorcycleStatistics } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Statistics {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  outOfService: number;
  averageBattery: number;
  averageFuel: number;
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatistics = async () => {
    try {
      const stats = await getMotorcycleStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadStatistics();
  }, []);

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Carregando dashboard..." />;
  }

  if (!statistics) {
    return (
      <View style={styles.errorContainer}>
        <Text>Erro ao carregar estatísticas</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard - IdeaTec Tecnologia</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Resumo Operacional</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.total}</Text>
              <Text style={styles.statLabel}>Total de Motos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>
                {statistics.available}
              </Text>
              <Text style={styles.statLabel}>Disponíveis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196f3' }]}>
                {statistics.rented}
              </Text>
              <Text style={styles.statLabel}>Alugadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>
                {statistics.maintenance}
              </Text>
              <Text style={styles.statLabel}>Manutenção</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Indicadores de Performance</Title>
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Nível Médio de Bateria</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${statistics.averageBattery}%`,
                      backgroundColor: statistics.averageBattery > 50 ? '#4caf50' : '#ff9800'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.performanceValue}>
                {statistics.averageBattery.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Nível Médio de Combustível</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${statistics.averageFuel}%`,
                      backgroundColor: statistics.averageFuel > 50 ? '#4caf50' : '#ff9800'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.performanceValue}>
                {statistics.averageFuel.toFixed(1)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Status das Motos</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title numeric>Quantidade</DataTable.Title>
              <DataTable.Title numeric>Percentual</DataTable.Title>
            </DataTable.Header>

            <DataTable.Row>
              <DataTable.Cell>
                <Chip icon="check-circle" style={{ backgroundColor: '#e8f5e8' }}>
                  Disponível
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>{statistics.available}</DataTable.Cell>
              <DataTable.Cell numeric>
                {((statistics.available / statistics.total) * 100).toFixed(1)}%
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>
                <Chip icon="account" style={{ backgroundColor: '#e3f2fd' }}>
                  Alugada
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>{statistics.rented}</DataTable.Cell>
              <DataTable.Cell numeric>
                {((statistics.rented / statistics.total) * 100).toFixed(1)}%
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>
                <Chip icon="wrench" style={{ backgroundColor: '#fff3e0' }}>
                  Manutenção
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>{statistics.maintenance}</DataTable.Cell>
              <DataTable.Cell numeric>
                {((statistics.maintenance / statistics.total) * 100).toFixed(1)}%
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      <View style={styles.lastUpdate}>
        <Text style={styles.lastUpdateText}>
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  performanceContainer: {
    marginTop: 16,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastUpdate: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
