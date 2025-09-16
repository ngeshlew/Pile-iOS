import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../storage/CapacitorStorageAdapter';

export type Item = {
  id: string;
  title: string;
  createdAt: number;
  content: string;
};

type AppState = {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
};

const fsStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    try {
      return await storage.readText(`${name}.json`);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    await storage.writeText(`${name}.json`, value);
  },
  removeItem: async (name: string) => {
    await storage.remove(`${name}.json`);
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateItem: (id, patch) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
    }),
    {
      name: 'pile-state',
      storage: fsStorage,
      partialize: (s) => ({ items: s.items }),
    }
  )
);

