import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMADE_GOALS, type PreMadeGoalItem } from '../data/preMadeGoals';
import { fetchPreMadeGoals } from '../lib/api/preMadeGoalsApi';

const PREMADE_GOALS_CACHE_KEY = '@taskify/preMadeGoalsCache/v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

let memoryCache: PreMadeGoalItem[] | null = null;
let lastFetchAt = 0;
let inFlightFetch: Promise<{ data?: PreMadeGoalItem[]; error?: string }> | null = null;

function shouldFetchFreshData(): boolean {
  if (!memoryCache) return true;
  return Date.now() - lastFetchAt > CACHE_TTL_MS;
}

async function getSharedFetchResult(): Promise<{ data?: PreMadeGoalItem[]; error?: string }> {
  if (!inFlightFetch) {
    inFlightFetch = fetchPreMadeGoals().finally(() => {
      inFlightFetch = null;
    });
  }
  return inFlightFetch;
}

export function usePreMadeGoals() {
  const [preMadeGoals, setPreMadeGoals] = useState<PreMadeGoalItem[]>(
    memoryCache && memoryCache.length > 0 ? memoryCache : PREMADE_GOALS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      // Fast path: use memory cache immediately and skip network when still fresh.
      if (memoryCache && memoryCache.length > 0) {
        setPreMadeGoals(memoryCache);
        setLoading(false);
        if (!shouldFetchFreshData()) return;
      } else {
        // If app was restarted, hydrate from local cache before hitting network.
        try {
          const cached = await AsyncStorage.getItem(PREMADE_GOALS_CACHE_KEY);
          if (!alive) return;
          if (cached) {
            const parsed = JSON.parse(cached) as PreMadeGoalItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryCache = parsed;
              setPreMadeGoals(parsed);
              setLoading(false);
            }
          }
        } catch {
          // Ignore cache parse/read errors and continue with network.
        }
      }

      const { data, error: fetchError } = await getSharedFetchResult();
      if (!alive) return;

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      const nextGoals = data && data.length > 0 ? data : PREMADE_GOALS;
      memoryCache = nextGoals;
      lastFetchAt = Date.now();
      setPreMadeGoals(nextGoals);
      setError(null);
      setLoading(false);

      try {
        await AsyncStorage.setItem(PREMADE_GOALS_CACHE_KEY, JSON.stringify(nextGoals));
      } catch {
        // Ignore storage write failures.
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { preMadeGoals, loading, error };
}
