import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark', // default to premium dark mode

  setThemeMode: (themeMode) => {
    set({ themeMode });
  },

  getEffectiveTheme: () => {
    const { themeMode } = get();
    if (themeMode === 'system') {
      const colorScheme = Appearance.getColorScheme();
      return colorScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }
}));
