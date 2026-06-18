'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PendingAction {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER';
  payload: unknown;
  createdAt: number;
  retries: number;
}

const STORAGE_KEY = 'crpf_offline_queue';
const MAX_RETRIES = 5;

function loadQueue(): PendingAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingAction[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function useOfflineSync() {
  const [queue, setQueue] = useState<PendingAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setQueue(loadQueue());
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enqueue = useCallback((type: PendingAction['type'], payload: unknown) => {
    const action: PendingAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      createdAt: Date.now(),
      retries: 0,
    };
    setQueue(prev => {
      const next = [...prev, action];
      saveQueue(next);
      return next;
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || isSyncing || queue.length === 0) return;
    setIsSyncing(true);

    const remaining: PendingAction[] = [];

    for (const action of queue) {
      try {
        // TODO: Replace with actual API calls to the API Gateway
        const endpoint = action.type === 'CREATE_ORDER' ? '/api/v1/orders' : '/api/v1/orders/update';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // Success — action is not re-added to remaining
      } catch (error) {
        if (action.retries < MAX_RETRIES) {
          remaining.push({ ...action, retries: action.retries + 1 });
        }
        // Exceeded retries — drop the action
      }
    }

    setQueue(remaining);
    saveQueue(remaining);
    setIsSyncing(false);
  }, [isOnline, isSyncing, queue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timeout = setTimeout(processQueue, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, queue.length, processQueue]);

  return { queue, isOnline, isSyncing, enqueue, processQueue };
}

/**
 * Visual indicator component showing offline/sync status
 */
export function OrderSyncQueue() {
  const { queue, isOnline, isSyncing, processQueue } = useOfflineSync();

  if (isOnline && queue.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm">
      {!isOnline && (
        <div className="bg-[#191920] border border-[#ff6b6b]/30 rounded-xl p-4 mb-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ff6b6b]">wifi_off</span>
            <div>
              <p className="text-xs font-black text-[#ff6b6b] uppercase tracking-widest">Offline Mode</p>
              <p className="text-[10px] text-[#aaaab7] mt-1">Orders will sync when connection returns</p>
            </div>
          </div>
        </div>
      )}

      {queue.length > 0 && (
        <div className="bg-[#191920] border border-[#ffb690]/20 rounded-xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb690] text-lg">sync</span>
              <p className="text-xs font-black text-[#ffb690] uppercase tracking-widest">Pending Sync</p>
            </div>
            <span className="text-[10px] font-black text-white bg-[#ffb690]/20 px-2 py-0.5 rounded">{queue.length}</span>
          </div>

          {isOnline && (
            <button
              onClick={processQueue}
              disabled={isSyncing}
              className="w-full py-2 rounded-lg bg-[#ffb690] text-[#131318] font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
