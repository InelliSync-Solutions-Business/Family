import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentItem, ContentType } from '@/types/content';

interface FilterState {
  contentType?: ContentType;
  timeRange?: {
    start: Date;
    end: Date;
  };
  tags: string[];
  searchQuery: string;
}

interface UIState {
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark' | 'system';
  contentViewMode: 'grid' | 'list';
}

interface AppState {
  // Filters and Search
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  // UI State
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: UIState['currentTheme']) => void;
  setContentViewMode: (mode: UIState['contentViewMode']) => void;

  // Selected Content
  selectedContent: ContentItem | null;
  setSelectedContent: (content: ContentItem | null) => void;

  // Recent Items
  recentItems: ContentItem[];
  addRecentItem: (item: ContentItem) => void;
  clearRecentItems: () => void;
}

const initialFilters: FilterState = {
  tags: [],
  searchQuery: '',
};

const initialUI: UIState = {
  sidebarOpen: true,
  currentTheme: 'system',
  contentViewMode: 'grid',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Filters and Search
      filters: initialFilters,
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),
      resetFilters: () => set({ filters: initialFilters }),

      // UI State
      ui: initialUI,
      setSidebarOpen: (open) =>
        set((state) => ({
          ui: {
            ...state.ui,
            sidebarOpen: open,
          },
        })),
      setTheme: (theme) =>
        set((state) => ({
          ui: {
            ...state.ui,
            currentTheme: theme,
          },
        })),
      setContentViewMode: (mode) =>
        set((state) => ({
          ui: {
            ...state.ui,
            contentViewMode: mode,
          },
        })),

      // Selected Content
      selectedContent: null,
      setSelectedContent: (content) => set({ selectedContent: content }),

      // Recent Items
      recentItems: [],
      addRecentItem: (item) =>
        set((state) => ({
          recentItems: [
            item,
            ...state.recentItems.filter((i) => i.id !== item.id),
          ].slice(0, 10), // Keep only 10 most recent items
        })),
      clearRecentItems: () => set({ recentItems: [] }),
    }),
    {
      name: 'family-legacy-store',
      partialize: (state) => ({
        ui: state.ui,
        recentItems: state.recentItems,
      }),
    }
  )
);
