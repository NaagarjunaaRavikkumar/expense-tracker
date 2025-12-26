import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '../storage/mmkv';

interface AppState {
    theme: 'light' | 'dark' | 'system';
    token: string | null;
    onboardingCompleted: boolean;
    lastOpenedTab: string | null;

    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setToken: (token: string | null) => void;
    setOnboardingCompleted: (completed: boolean) => void;
    setLastOpenedTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            theme: 'system',
            token: null,
            onboardingCompleted: false,
            lastOpenedTab: null,

            setTheme: (theme) => set({ theme }),
            setToken: (token) => set({ token }),
            setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
            setLastOpenedTab: (tab) => set({ lastOpenedTab: tab }),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
