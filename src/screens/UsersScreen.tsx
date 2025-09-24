import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, FAB, Button, IconButton, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  isActive: boolean;
  createdAt: string;
}

export default function UsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Dados mock para demonstração
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Carlos Admin',
        email: 'carlos@ideatec.com',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-15T10:00:00Z',
      },
      {
        id: '2', 
        name: 'Pedro Operador',
        email: 'pedro@ideatec.com',
        role: 'operator',
        isActive: true,
        createdAt: '2025-01-16T14:30:00Z',
      },
    ];
    setUsers(mockUsers);
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter(user => user.id !== id));
            Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
          },
        },
      ]
    );
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>
              {item.role === 'admin' ? 'Administrador' : 'Operador'}
            </Text>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                // Navegação para tela de edição
              }} 
              title="Editar" 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                toggleUserStatus(item.id);
              }} 
              title={item.isActive ? 'Desativar' : 'Ativar'} 
              leadingIcon={item.isActive ? 'account-off' : 'account-check'}
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleDeleteUser(item.id);
              }} 
              title="Excluir" 
              leadingIcon="delete"
            />
          </Menu>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: item.isActive ? '#4caf50' : '#f44336' }
          ]}>
            {item.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>
      
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        style={styles.fab}
        icon="account-plus"
        label="Novo Usuário"
        onPress={() => {
          Alert.alert('Info', 'Funcionalidade de adicionar usuário seria implementada aqui');
        }}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196f3',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});