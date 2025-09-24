import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Motorcycle, getMotorcycles, saveMotorcycle, updateMotorcycle, deleteMotorcycle } from '../utils/storage';

interface MotorcycleState {
  motorcycles: Motorcycle[];
  loading: boolean;
  error: string | null;
  selectedMotorcycle: Motorcycle | null;
}

type MotorcycleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MOTORCYCLES'; payload: Motorcycle[] }
  | { type: 'ADD_MOTORCYCLE'; payload: Motorcycle }
  | { type: 'UPDATE_MOTORCYCLE'; payload: { id: string; updates: Partial<Motorcycle> } }
  | { type: 'DELETE_MOTORCYCLE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_MOTORCYCLE'; payload: Motorcycle | null };

const initialState: MotorcycleState = {
  motorcycles: [],
  loading: false,
  error: null,
  selectedMotorcycle: null,
};

const motorcycleReducer = (state: MotorcycleState, action: MotorcycleAction): MotorcycleState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_MOTORCYCLES':
      return { ...state, motorcycles: action.payload, loading: false };
    case 'ADD_MOTORCYCLE':
      return { ...state, motorcycles: [...state.motorcycles, action.payload] };
    case 'UPDATE_MOTORCYCLE':
      return {
        ...state,
        motorcycles: state.motorcycles.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };
    case 'DELETE_MOTORCYCLE':
      console.log("REDUCER: DELETE_MOTORCYCLE - ID:", action.payload);
      console.log("REDUCER: Motos antes:", state.motorcycles.length);
      const filteredMotorcycles = state.motorcycles.filter(m => m.id !== action.payload);
      console.log("REDUCER: Motos após filtro:", filteredMotorcycles.length);
      console.log("REDUCER: IDs restantes:", filteredMotorcycles.map(m => m.id));
      return {
        ...state,
        motorcycles: filteredMotorcycles,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SELECTED_MOTORCYCLE':
      return { ...state, selectedMotorcycle: action.payload };
    default:
      return state;
  }
};

const MotorcycleContext = createContext<{
  state: MotorcycleState;
  actions: {
    loadMotorcycles: () => Promise<void>;
    addMotorcycle: (motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
    updateMotorcycleById: (id: string, updates: Partial<Motorcycle>) => Promise<boolean>;
    deleteMotorcycleById: (id: string) => Promise<boolean>;
    selectMotorcycle: (motorcycle: Motorcycle | null) => void;
  };
} | null>(null);

export const MotorcycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(motorcycleReducer, initialState);

  const loadMotorcycles = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const motorcycles = await getMotorcycles();
      dispatch({ type: 'SET_MOTORCYCLES', payload: motorcycles });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar motos' });
    }
  };

  const addMotorcycle = async (motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verificar se já existe moto com a mesma placa
      const existingMoto = state.motorcycles.find(m => 
        m.plate.toUpperCase() === motorcycle.plate.toUpperCase()
      );
      
      if (existingMoto) {
        dispatch({ type: 'SET_ERROR', payload: 'Já existe uma moto cadastrada com esta placa' });
        return false;
      }
      
      const id = await saveMotorcycle(motorcycle);
      if (id) {
        // Recarregar a lista completa para garantir consistência
        await loadMotorcycles();
        dispatch({ type: 'SET_ERROR', payload: null });
        return true;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar moto - Verifique se a placa já não está cadastrada' });
      return false;
    } catch (error) {
      console.error('Erro ao adicionar moto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar moto' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateMotorcycleById = async (id: string, updates: Partial<Motorcycle>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log("Atualizando moto ID:", id, "com updates:", updates);
      const success = await updateMotorcycle(id, updates);
      if (success) {
        dispatch({ type: 'UPDATE_MOTORCYCLE', payload: { id, updates } });
        dispatch({ type: 'SET_ERROR', payload: null });
        // Recarregar lista para garantir consistência
        await loadMotorcycles();
        return true;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar moto' });
      return false;
    } catch (error) {
      console.error('Erro ao atualizar moto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar moto' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteMotorcycleById = async (id: string): Promise<boolean> => {
    try {
      console.log("=== CONTEXT: Iniciando exclusão ===");
      console.log("ID para excluir no Context:", id);
      console.log("Motos no estado antes da exclusão:", state.motorcycles.length);
      console.log("IDs no estado:", state.motorcycles.map(m => `${m.id} (${m.plate})`));
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verificar se a moto existe no estado
      const motoNoEstado = state.motorcycles.find(m => m.id === id);
      if (!motoNoEstado) {
        console.error("CONTEXT: Moto não encontrada no estado!");
        dispatch({ type: 'SET_ERROR', payload: 'Moto não encontrada no estado' });
        return false;
      }
      
      console.log("CONTEXT: Moto encontrada no estado:", motoNoEstado.plate);
      
      const success = await deleteMotorcycle(id);
      console.log("CONTEXT: Resultado do storage:", success);
      
      if (success) {
        console.log("CONTEXT: Storage confirmou sucesso - Atualizando estado");
        
        // Primeiro atualizar o estado local
        dispatch({ type: 'DELETE_MOTORCYCLE', payload: id });
        
        // Aguardar um pouco para o estado ser processado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Depois recarregar para garantir consistência
        console.log("CONTEXT: Recarregando lista após exclusão...");
        await loadMotorcycles();
        
        // Verificar se realmente foi removido
        const motosAtuais = state.motorcycles.filter(m => m.id !== id);
        console.log("CONTEXT: Motos restantes após exclusão:", motosAtuais.length);
        
        dispatch({ type: 'SET_ERROR', payload: null });
        return true;
      } else {
        console.log("CONTEXT: Storage retornou falha");
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao deletar moto no storage' });
        return false;
      }
    } catch (error) {
      console.error('CONTEXT: Erro ao deletar moto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao deletar moto' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectMotorcycle = (motorcycle: Motorcycle | null) => {
    dispatch({ type: 'SET_SELECTED_MOTORCYCLE', payload: motorcycle });
  };

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const actions = {
    loadMotorcycles,
    addMotorcycle,
    updateMotorcycleById,
    deleteMotorcycleById,
    selectMotorcycle,
  };

  return (
    <MotorcycleContext.Provider value={{ state, actions }}>
      {children}
    </MotorcycleContext.Provider>
  );
};

export const useMotorcycles = () => {
  const context = useContext(MotorcycleContext);
  if (!context) {
    throw new Error('useMotorcycles deve ser usado dentro de um MotorcycleProvider');
  }
  return context;
};
