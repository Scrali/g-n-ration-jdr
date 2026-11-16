import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRepository, type DataSnapshot } from './repository';
import { RETAILERS } from './retailers';
import type { Retailer } from './types';
import { readJSON, writeJSON } from '../lib/storage';
import { todayInZurich } from '../lib/dates';

interface DataState {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  snapshot: DataSnapshot;
  demo: boolean;
  setDemo: (on: boolean) => void;
  today: string;
  retailerById: (id: string) => Retailer | undefined;
  reload: () => void;
}

const DEMO_KEY = 'pms.demoMode.v1';
const initialSnapshot: DataSnapshot = { mode: 'empty', retailers: RETAILERS, promotions: [], lastUpdatedAt: null };

const Ctx = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState<boolean>(() => readJSON<unknown>(DEMO_KEY, false) === true);
  const [snapshot, setSnapshot] = useState<DataSnapshot>(initialSnapshot);
  const [status, setStatus] = useState<DataState['status']>('loading');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [today, setToday] = useState(() => todayInZurich());

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getRepository(demo)
      .load()
      .then((s) => {
        if (cancelled) return;
        setSnapshot(s);
        setStatus('ready');
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      });
    return () => {
      cancelled = true;
    };
  }, [demo, nonce]);

  // Changement de jour à Zurich pendant que la page est ouverte : les statuts sont recalculés.
  useEffect(() => {
    const id = window.setInterval(() => setToday(todayInZurich()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const setDemo = useCallback((on: boolean) => {
    writeJSON(DEMO_KEY, on);
    setDemoState(on);
  }, []);

  const value = useMemo<DataState>(() => {
    const map = new Map(snapshot.retailers.map((r) => [r.id, r]));
    return {
      status,
      error,
      snapshot,
      demo,
      setDemo,
      today,
      retailerById: (id) => map.get(id),
      reload: () => setNonce((n) => n + 1),
    };
  }, [status, error, snapshot, demo, setDemo, today]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): DataState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData doit être utilisé dans <DataProvider>');
  return v;
}
