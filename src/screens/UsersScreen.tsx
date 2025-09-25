import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, FAB, Button, IconButton, Menu, Dialog, Portal, TextInput, HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Copyright from "../components/Copyright";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'operator';
  isActive: boolean;
  createdAt: string;
}

export default function UsersScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  
  // Estados para o modal de criar usuário
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'operator'>('operator');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Estados para o modal de editar usuário
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'operator'>('operator');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('👥 Usuários carregados do AsyncStorage:', users);
        setUsers(users);
        return;
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
    
    // Dados iniciais apenas se não houver usuários salvos
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Carlos Admin',
        email: 'carlos@ideatec.com',
        password: '123456',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-15T10:00:00Z',
      },
      {
        id: '2', 
        name: 'Pedro Operador',
        email: 'pedro@ideatec.com',
        password: '123456',
        role: 'operator',
        isActive: true,
        createdAt: '2025-01-16T14:30:00Z',
      },
    ];
    console.log('🎭 Criando usuários iniciais:', mockUsers);
    setUsers(mockUsers);
    // Salvar os dados iniciais no AsyncStorage
    try {
      await AsyncStorage.setItem('users', JSON.stringify(mockUsers));
      console.log('💾 Usuários iniciais salvos no AsyncStorage');
    } catch (error) {
      console.error('Erro ao salvar usuários iniciais:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o usuário "${user.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedUsers = users.filter(user => user.id !== id);
              await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
              setUsers(updatedUsers);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir usuário:', error);
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          },
        },
      ]
    );
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, isActive: !user.isActive } : user
      );
      
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      const user = users.find(u => u.id === id);
      const action = user?.isActive ? 'desativado' : 'ativado';
      Alert.alert('Sucesso', `Usuário ${action} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do usuário.');
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (newUserPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Verificar se o email já existe
    if (users.some(user => user.email.toLowerCase() === newUserEmail.toLowerCase())) {
      Alert.alert('Erro', 'Este email já está em uso por outro usuário.');
      return;
    }

    setCreateUserLoading(true);
    
    try {
      // Simular criação de usuário
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword.trim(),
        role: newUserRole,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      console.log('🆕 Criando novo usuário:', {
        ...newUser,
        password: '***' + newUser.password.slice(-2) // mostrar só os 2 últimos caracteres
      });

      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('💾 Usuários salvos no AsyncStorage. Total:', updatedUsers.length);
      setUsers(updatedUsers);
      
      // Limpar formulário e fechar modal
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('operator');
      setShowCreateModal(false);
      setShowCreatePassword(false);
      
      Alert.alert('Sucesso', `Usuário criado com sucesso!\n\nEmail: ${newUser.email}\nSenha: ${newUser.password}`);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', 'Não foi possível criar o usuário. Tente novamente.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const cancelCreateUser = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('operator');
    setShowCreateModal(false);
    setShowCreatePassword(false);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword(user.password);
    setEditUserRole(user.role);
    setShowEditModal(true);
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setEditUserName('');
    setEditUserEmail('');
    setEditUserPassword('');
    setEditUserRole('operator');
    setShowEditModal(false);
    setEditUserLoading(false);
    setShowEditPassword(false);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    if (!editUserName.trim() || !editUserEmail.trim() || !editUserPassword.trim()) {
      Alert.alert('Erro', 'Nome, email e senha são obrigatórios');
      return;
    }

    if (editUserPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserEmail)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Verificar se o email já existe (exceto para o usuário atual)
    const existingUser = users.find(u => u.email.toLowerCase() === editUserEmail.toLowerCase() && u.id !== editingUser.id);
    if (existingUser) {
      Alert.alert('Erro', 'Este email já está sendo usado por outro usuário');
      return;
    }

    setEditUserLoading(true);

    try {
      // Atualizar o usuário
      const updatedUser: User = {
        ...editingUser,
        name: editUserName.trim(),
        email: editUserEmail.toLowerCase().trim(),
        password: editUserPassword.trim(),
        role: editUserRole,
      };

      // Atualizar a lista de usuários
      const updatedUsers = users.map(u => u.id === editingUser.id ? updatedUser : u);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Atualizar o estado local
      setUsers(updatedUsers);
      
      cancelEditUser();
      
      Alert.alert('Sucesso', `Usuário editado com sucesso!\n\nEmail: ${updatedUser.email}\nSenha: ${updatedUser.password}`);
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      Alert.alert('Erro', 'Não foi possível editar o usuário. Tente novamente.');
    } finally {
      setEditUserLoading(false);
    }
  };

  const debugAsyncStorage = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('🐛 DEBUG - Usuários no AsyncStorage:', users);
        Alert.alert(
          'Debug - AsyncStorage', 
          `Usuários encontrados: ${users.length}\n\n${users.map((u: any, i: number) => 
            `${i+1}. ${u.name}\nEmail: ${u.email}\nSenha: ${u.password}\nAtivo: ${u.isActive ? 'Sim' : 'Não'}`
          ).join('\n\n')}`
        );
      } else {
        Alert.alert('Debug', 'Nenhum usuário encontrado no AsyncStorage');
      }
    } catch (error) {
      console.error('Erro ao ler AsyncStorage:', error);
      Alert.alert('Erro', 'Erro ao ler dados salvos');
    }
  };

  const clearAsyncStorage = async () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os usuários salvos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('users');
              setUsers([]);
              Alert.alert('Sucesso', 'Dados limpos com sucesso!');
            } catch (error) {
              console.error('Erro ao limpar AsyncStorage:', error);
              Alert.alert('Erro', 'Erro ao limpar dados');
            }
          },
        },
      ],
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{item.name}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{item.email}</Text>
            <Text style={[styles.userRole, { color: theme.colors.primary }]}>
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
                openEditModal(item);
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
            { color: item.isActive ? '#1976d2' : '#f44336' }
          ]}>
            {item.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Gerenciar Usuários</Text>
      
      {/* Botões de Debug */}
      <View style={styles.debugContainer}>
        <Button 
          mode="outlined" 
          onPress={debugAsyncStorage}
          style={styles.debugButton}
          compact
        >
          Debug Storage
        </Button>
        <Button 
          mode="outlined" 
          onPress={clearAsyncStorage}
          style={styles.debugButton}
          compact
          buttonColor="red"
          textColor="white"
        >
          Limpar Dados
        </Button>
      </View>
      
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Nenhum usuário cadastrado</Text>
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
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="account-plus"
        label="Novo Usuário"
        onPress={() => setShowCreateModal(true)}
      />

      {/* Modal de Criar Usuário */}
      <Portal>
        <Dialog visible={showCreateModal} onDismiss={cancelCreateUser}>
          <Dialog.Title>Criar Novo Usuário</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome completo *"
              value={newUserName}
              onChangeText={setNewUserName}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Email *"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Senha *"
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showCreatePassword}
              placeholder="Mínimo 6 caracteres"
              right={
                <TextInput.Icon 
                  icon={showCreatePassword ? "eye-off" : "eye"} 
                  onPress={() => setShowCreatePassword(!showCreatePassword)}
                />
              }
            />

            <Text style={styles.roleLabel}>Tipo de usuário:</Text>
            <View style={styles.roleButtons}>
              <Button
                mode={newUserRole === 'operator' ? 'contained' : 'outlined'}
                onPress={() => setNewUserRole('operator')}
                style={styles.roleButton}
              >
                Operador
              </Button>
              <Button
                mode={newUserRole === 'admin' ? 'contained' : 'outlined'}
                onPress={() => setNewUserRole('admin')}
                style={styles.roleButton}
              >
                Administrador
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelCreateUser} disabled={createUserLoading}>
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateUser}
              loading={createUserLoading}
              disabled={createUserLoading}
              style={{ marginLeft: 8 }}
            >
              Criar Usuário
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal de Editar Usuário */}
      <Portal>
        <Dialog visible={showEditModal} onDismiss={cancelEditUser}>
          <Dialog.Title>Editar Usuário</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome completo *"
              value={editUserName}
              onChangeText={setEditUserName}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Email *"
              value={editUserEmail}
              onChangeText={setEditUserEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Senha *"
              value={editUserPassword}
              onChangeText={setEditUserPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showEditPassword}
              placeholder="Mínimo 6 caracteres"
              right={
                <TextInput.Icon 
                  icon={showEditPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowEditPassword(!showEditPassword)}
                />
              }
            />

            <Text style={styles.roleLabel}>Tipo de usuário:</Text>
            <View style={styles.roleButtons}>
              <Button
                mode={editUserRole === 'operator' ? 'contained' : 'outlined'}
                onPress={() => setEditUserRole('operator')}
                style={styles.roleButton}
              >
                Operador
              </Button>
              <Button
                mode={editUserRole === 'admin' ? 'contained' : 'outlined'}
                onPress={() => setEditUserRole('admin')}
                style={styles.roleButton}
              >
                Administrador
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelEditUser} disabled={editUserLoading}>
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleEditUser}
              loading={editUserLoading}
              disabled={editUserLoading}
              style={{ marginLeft: 8 }}
            >
              Salvar Alterações
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Copyright />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100, // Aumentado para ficar acima do copyright
  },
  input: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
  },
  debugContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  debugButton: {
    flex: 1,
  },
});