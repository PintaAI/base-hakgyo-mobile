import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi, Kelas, useSession } from 'hakgyo-expo-sdk';

const SELECTED_KELAS_KEY = 'hakgyo_selected_kelas';

interface KelasContextValue {
  /** List of kelas the user has joined */
  joinedKelas: Kelas[];
  /** Currently selected/active kelas */
  selectedKelas: Kelas | null;
  /** Loading state for fetching joined kelas */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Set the active kelas */
  setSelectedKelas: (kelas: Kelas | null) => void;
  /** Refresh the joined kelas list */
  refreshJoinedKelas: () => Promise<void>;
  /** Clear selected kelas */
  clearSelectedKelas: () => void;
}

const KelasContext = createContext<KelasContextValue | undefined>(undefined);

interface KelasProviderProps {
  children: ReactNode;
}

export function KelasProvider({ children }: KelasProviderProps) {
  const { user, loading: sessionLoading } = useSession();
  const [joinedKelas, setJoinedKelas] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelasState] = useState<Kelas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted selected kelas from storage
  const loadPersistedKelas = useCallback(async (kelasList: Kelas[]) => {
    try {
      const persistedId = await AsyncStorage.getItem(SELECTED_KELAS_KEY);
      if (persistedId && kelasList.length > 0) {
        const kelasId = parseInt(persistedId, 10);
        const found = kelasList.find(k => k.id === kelasId);
        if (found) {
          setSelectedKelasState(found);
          return found;
        }
      }
      // If no persisted selection or not found, select the first kelas
      if (kelasList.length > 0) {
        setSelectedKelasState(kelasList[0]);
        await AsyncStorage.setItem(SELECTED_KELAS_KEY, String(kelasList[0].id));
        return kelasList[0];
      }
    } catch (err) {
      console.error('Failed to load persisted kelas:', err);
    }
    return null;
  }, []);

  // Fetch joined kelas from API
  const refreshJoinedKelas = useCallback(async () => {
    if (!user?.id) {
      setJoinedKelas([]);
      setSelectedKelasState(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userApi.getClasses(user.id);
      if (response.success && response.data) {
        setJoinedKelas(response.data);
        // Load persisted selection after fetching
        await loadPersistedKelas(response.data);
      } else {
        setJoinedKelas([]);
        setSelectedKelasState(null);
      }
    } catch (err) {
      console.error('Failed to fetch joined kelas:', err);
      setError('Failed to load classes');
      setJoinedKelas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadPersistedKelas]);

  // Set selected kelas and persist to storage
  const setSelectedKelas = useCallback(async (kelas: Kelas | null) => {
    setSelectedKelasState(kelas);
    if (kelas) {
      await AsyncStorage.setItem(SELECTED_KELAS_KEY, String(kelas.id));
    } else {
      await AsyncStorage.removeItem(SELECTED_KELAS_KEY);
    }
  }, []);

  // Clear selected kelas
  const clearSelectedKelas = useCallback(async () => {
    setSelectedKelasState(null);
    await AsyncStorage.removeItem(SELECTED_KELAS_KEY);
  }, []);

  // Fetch joined kelas when user authenticates
  useEffect(() => {
    if (user?.id && !sessionLoading) {
      refreshJoinedKelas();
    } else if (!sessionLoading && !user) {
      setJoinedKelas([]);
      setSelectedKelasState(null);
    }
  }, [user?.id, sessionLoading, refreshJoinedKelas]);

  const value: KelasContextValue = {
    joinedKelas,
    selectedKelas,
    isLoading,
    error,
    setSelectedKelas,
    refreshJoinedKelas,
    clearSelectedKelas,
  };

  return (
    <KelasContext.Provider value={value}>
      {children}
    </KelasContext.Provider>
  );
}

/**
 * Hook to access the kelas context
 * @returns KelasContextValue
 * @throws Error if used outside of KelasProvider
 */
export function useKelas(): KelasContextValue {
  const context = useContext(KelasContext);
  if (!context) {
    throw new Error('useKelas must be used within a KelasProvider');
  }
  return context;
}

export { KelasContext };