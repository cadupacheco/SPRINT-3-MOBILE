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
      return {
        ...state,
        motorcycles: state.motorcycles.filter(m => m.id !== action.payload),
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
      const id = await saveMotorcycle(motorcycle);
      if (id) {
        await loadMotorcycles(); // Recarregar a lista
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar moto' });
      return false;
    }
  };

  const updateMotorcycleById = async (id: string, updates: Partial<Motorcycle>): Promise<boolean> => {
    try {
      const success = await updateMotorcycle(id, updates);
      if (success) {
        dispatch({ type: 'UPDATE_MOTORCYCLE', payload: { id, updates } });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar moto' });
      return false;
    }
  };

  const deleteMotorcycleById = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteMotorcycle(id);
      if (success) {
        dispatch({ type: 'DELETE_MOTORCYCLE', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao deletar moto' });
      return false;
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
