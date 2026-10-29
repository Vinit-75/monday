import { create } from 'zustand';
import type { ParseResult, SmartList, ViewMode } from '../lib/types';
import { loadPublicSettings, type PublicSettings } from '../lib/settings';

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  activeList: SmartList | { kind: 'project'; id: string };
  setActiveList: (list: AppState['activeList']) => void;

  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  search: string;
  setSearch: (s: string) => void;

  agentOpen: boolean;
  setAgentOpen: (b: boolean) => void;
  toggleAgent: () => void;

  quickCaptureFocused: boolean;
  focusQuickCapture: () => void;
  blurQuickCapture: () => void;

  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;

  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;

  pending: ParseResult | null;
  pendingTranscript: string;
  setPending: (p: ParseResult | null, transcript?: string) => void;

  editingId: string | null;
  setEditingId: (id: string | null) => void;

  settings: PublicSettings;
  reloadSettings: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('hush.theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hush.theme', next);
    set({ theme: next });
  },

  activeList: 'today',
  setActiveList: (list) => set({ activeList: list, viewMode: 'list' }),

  viewMode: 'list',
  setViewMode: (v) => set({ viewMode: v }),

  search: '',
  setSearch: (s) => set({ search: s }),

  agentOpen: false,
  setAgentOpen: (b) => set({ agentOpen: b }),
  toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),

  quickCaptureFocused: false,
  focusQuickCapture: () => set({ quickCaptureFocused: true }),
  blurQuickCapture: () => set({ quickCaptureFocused: false }),

  commandOpen: false,
  setCommandOpen: (b) => set({ commandOpen: b }),

  settingsOpen: false,
  setSettingsOpen: (b) => set({ settingsOpen: b }),

  pending: null,
  pendingTranscript: '',
  setPending: (p, transcript) => set({ pending: p, pendingTranscript: transcript ?? '' }),

  editingId: null,
  setEditingId: (id) => set({ editingId: id }),

  settings: loadPublicSettings(),
  reloadSettings: () => set({ settings: loadPublicSettings() }),
}));
