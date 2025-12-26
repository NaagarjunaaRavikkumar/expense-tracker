import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../storage/mmkv';

interface UserProfile {
    name: string;
    email: string;
}

interface UserState {
    profile: UserProfile;
    pin: string | null;
    isPinEnabled: boolean;
    _hasHydrated: boolean;
    updateProfile: (profile: Partial<UserProfile>) => void;
    setPin: (pin: string) => void;
    enablePin: (enabled: boolean) => void;
    setHasHydrated: (state: boolean) => void;
}

console.log('Creating useUserStore...');

export const useUserStore = create<UserState>()(
    persist(
        (set) => {
            console.log('useUserStore: Initializing state...');
            return {
                profile: {
                    name: 'User',
                    email: '',
                },
                pin: null,
                isPinEnabled: false,
                _hasHydrated: false,
                updateProfile: (updates) => set((state) => ({
                    profile: { ...state.profile, ...updates },
                })),
                setPin: (pin) => set({ pin }),
                enablePin: (enabled) => set({ isPinEnabled: enabled }),
                setHasHydrated: (state) => {
                    console.log('useUserStore: setHasHydrated called with:', state);
                    set({ _hasHydrated: state });
                },
            };
        },
        {
            name: 'user-storage',
            storage: createJSONStorage(() => {
                console.log('useUserStore: Creating JSON storage with mmkvStorage');
                return mmkvStorage;
            }),
            onRehydrateStorage: () => {
                console.log('useUserStore: onRehydrateStorage called');
                return (state) => {
                    console.log('useUserStore: Rehydration complete, state:', state ? 'exists' : 'null');
                    state?.setHasHydrated(true);
                };
            },
        }
    )
);

console.log('useUserStore created');
