import { Tryout, tryoutApi, useAuth } from 'hakgyo-expo-sdk';
import { useEffect, useState, useCallback } from 'react';

export interface ActiveTryout extends Tryout {
  isCurrentlyActive: boolean;
  timeRemaining?: string;
}

export function useActiveTryouts() {
  const { user } = useAuth();
  const [activeTryouts, setActiveTryouts] = useState<ActiveTryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterActiveTryouts = useCallback((tryouts: Tryout[]): ActiveTryout[] => {
    const now = new Date();
    
    return tryouts
      .filter((tryout) => {
        const startTime = new Date(tryout.startTime);
        const endTime = new Date(tryout.endTime);
        
        // Check if tryout is active, within time window, and not expired
        return (
          tryout.isActive &&
          now >= startTime &&
          now <= endTime
        );
      })
      .map((tryout) => {
        const endTime = new Date(tryout.endTime);
        const diffMs = endTime.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeRemaining: string | undefined;
        if (diffHours > 0) {
          timeRemaining = `${diffHours}h ${diffMinutes}m`;
        } else if (diffMinutes > 0) {
          timeRemaining = `${diffMinutes}m`;
        }
        
        return {
          ...tryout,
          isCurrentlyActive: true,
          timeRemaining,
        };
      });
  }, []);

  const fetchActiveTryouts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch tryouts from user's joined kelas
      const response = await tryoutApi.list({ 
        isActive: true, 
        userjoinedkelas: true,
        limit: 10 
      });
      
      const filtered = filterActiveTryouts(response?.data ?? []);
      setActiveTryouts(filtered);
    } catch (err) {
      setError('Failed to load active tryouts');
      console.error('Error fetching active tryouts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filterActiveTryouts]);

  useEffect(() => {
    fetchActiveTryouts();
  }, [fetchActiveTryouts]);

  return {
    activeTryouts,
    loading,
    error,
    refetch: fetchActiveTryouts,
  };
}