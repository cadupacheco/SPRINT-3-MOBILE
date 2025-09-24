import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Motorcycle {
  id: string;
  model: string;
  plate: string;
  status: 'available' | 'maintenance' | 'rented' | 'out_of_service';
  location: { x: number; y: number };
  lastUpdate: string;
  batteryLevel: number;
  fuelLevel: number;
  mileage: number;
  nextMaintenanceDate: string;
  assignedBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  darkMode: boolean;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  defaultBranch: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  isActive: boolean;
}

// Funcao para validar dados antes de salvar
const validateMotorcycle = (motorcycle: Partial<Motorcycle>): boolean => {
  return !!(
    motorcycle.model &&
    motorcycle.plate &&
    motorcycle.status &&
    motorcycle.location &&
    motorcycle.location.x !== undefined &&
    motorcycle.location.y !== undefined
  );
};

// Funcoes melhoradas com tratamento de erro
export const getMotorcycles = async (): Promise<Motorcycle[]> => {
  try {
    const data = await AsyncStorage.getItem('motorcycles');
    if (!data) return [];
    
    const motorcycles = JSON.parse(data);
    return Array.isArray(motorcycles) ? motorcycles : [];
  } catch (error) {
    console.error('Erro ao obter motos:', error);
    return [];
  }
};

export const saveMotorcycle = async (motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    console.log("=== STORAGE: Iniciando criação ===");
    console.log("Dados da moto:", motorcycle);
    
    if (!validateMotorcycle(motorcycle)) {
      console.error('STORAGE: Dados da moto inválidos');
      throw new Error('Dados da moto inválidos');
    }

    const motorcycles = await getMotorcycles();
    console.log("STORAGE: Motos existentes:", motorcycles.length);
    
    // Verificar se já existe uma moto com a mesma placa
    const existingMoto = motorcycles.find(m => 
      m.plate.toUpperCase() === motorcycle.plate.toUpperCase()
    );
    
    if (existingMoto) {
      console.warn('STORAGE: Moto com esta placa já existe:', motorcycle.plate);
      return null;
    }

    const now = new Date().toISOString();
    
    const newMotorcycle: Motorcycle = {
      ...motorcycle,
      id: `moto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      lastUpdate: now,
    };

    console.log("STORAGE: Nova moto criada com ID:", newMotorcycle.id);

    motorcycles.push(newMotorcycle);
    await AsyncStorage.setItem('motorcycles', JSON.stringify(motorcycles));
    
    console.log('STORAGE: Moto salva com sucesso. Total de motos:', motorcycles.length);
    return newMotorcycle.id;
  } catch (error) {
    console.error('STORAGE: Erro ao salvar moto:', error);
    return null;
  }
};

export const updateMotorcycle = async (id: string, updates: Partial<Motorcycle>): Promise<boolean> => {
  try {
    const motorcycles = await getMotorcycles();
    const index = motorcycles.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error('Moto não encontrada');
    }

    motorcycles[index] = {
      ...motorcycles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };

    await AsyncStorage.setItem('motorcycles', JSON.stringify(motorcycles));
    return true;
  } catch (error) {
    console.error('Erro ao atualizar moto:', error);
    return false;
  }
};

export const deleteMotorcycle = async (id: string): Promise<boolean> => {
  try {
    console.log("=== STORAGE: Iniciando exclusão ===");
    console.log("ID para excluir:", id);
    
    // Verificar se o AsyncStorage está acessível
    const testItem = await AsyncStorage.getItem('test');
    console.log("AsyncStorage acessível:", testItem !== null || testItem === null);
    
    const motorcycles = await getMotorcycles();
    console.log("Motos antes da exclusão:", motorcycles.length);
    console.log("Lista de IDs:", motorcycles.map(m => `${m.id} (${m.plate})`));
    
    // Verificar se a moto existe
    const motoToDelete = motorcycles.find(m => m.id === id);
    if (!motoToDelete) {
      console.warn('STORAGE: Moto não encontrada para exclusão:', id);
      console.warn('STORAGE: IDs disponíveis:', motorcycles.map(m => m.id));
      return false;
    }
    
    console.log('STORAGE: Moto encontrada:', motoToDelete.plate, motoToDelete.model);
    
    const initialLength = motorcycles.length;
    const filteredMotorcycles = motorcycles.filter(m => m.id !== id);
    
    console.log("Motos após filtro:", filteredMotorcycles.length);
    console.log("Diferença:", initialLength - filteredMotorcycles.length);
    
    if (filteredMotorcycles.length === initialLength) {
      console.error('STORAGE: ERRO - Filtro não funcionou!');
      return false;
    }
    
    // Fazer backup antes de salvar
    const backupKey = `motorcycles_backup_${Date.now()}`;
    await AsyncStorage.setItem(backupKey, JSON.stringify(motorcycles));
    console.log('STORAGE: Backup criado:', backupKey);
    
    // Salvar nova lista
    await AsyncStorage.setItem('motorcycles', JSON.stringify(filteredMotorcycles));
    console.log('STORAGE: Nova lista salva');
    
    // Verificar se foi salvo corretamente
    const verification = await AsyncStorage.getItem('motorcycles');
    const verifiedMotorcycles = verification ? JSON.parse(verification) : [];
    console.log('STORAGE: Verificação - motos após save:', verifiedMotorcycles.length);
    console.log('STORAGE: Verificação - IDs restantes:', verifiedMotorcycles.map((m: any) => m.id));
    
    const success = verifiedMotorcycles.length === filteredMotorcycles.length;
    console.log('STORAGE: Verificação de sucesso:', success);
    
    return success;
  } catch (error) {
    console.error('STORAGE: Erro ao deletar moto:', error);
    return false;
  }
};

// Funcoes para relatorios e estatsticas
export const getMotorcycleStatistics = async () => {
  try {
    const motorcycles = await getMotorcycles();
    
    return {
      total: motorcycles.length,
      available: motorcycles.filter(m => m.status === 'available').length,
      rented: motorcycles.filter(m => m.status === 'rented').length,
      maintenance: motorcycles.filter(m => m.status === 'maintenance').length,
      outOfService: motorcycles.filter(m => m.status === 'out_of_service').length,
      averageBattery: motorcycles.reduce((sum, m) => sum + m.batteryLevel, 0) / motorcycles.length || 0,
      averageFuel: motorcycles.reduce((sum, m) => sum + m.fuelLevel, 0) / motorcycles.length || 0,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return null;
  }
};
