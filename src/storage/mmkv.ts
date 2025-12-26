import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

console.log('Initializing MMKV...');
export const storage = createMMKV();
console.log('MMKV initialized successfully');

export const mmkvStorage: StateStorage = {
    getItem: (name) => {
        try {
            console.log(`MMKV: Getting item ${name}`);
            const value = storage.getString(name);
            console.log(`MMKV: Got item ${name}:`, value ? 'found' : 'null');
            return value ?? null;
        } catch (error) {
            console.error(`MMKV: Failed to get item ${name}:`, error);
            return null;
        }
    },
    setItem: (name, value) => {
        try {
            console.log(`MMKV: Setting item ${name}`);
            storage.set(name, value);
            console.log(`MMKV: Set item ${name} successfully`);
        } catch (error) {
            console.error(`MMKV: Failed to set item ${name}:`, error);
        }
    },
    removeItem: (name) => {
        try {
            console.log(`MMKV: Removing item ${name}`);
            storage.delete(name);
            console.log(`MMKV: Removed item ${name}`);
        } catch (error) {
            console.error(`MMKV: Failed to remove item ${name}:`, error);
        }
    },
};

// Typed helper functions for direct MMKV usage (non-Zustand)
export const MMKVKeys = {
    THEME: 'app.theme',
    AUTH_TOKEN: 'auth.token',
    ONBOARDING_COMPLETED: 'app.onboarding_completed',
    LAST_OPENED_TAB: 'app.last_opened_tab',
};

export const getMMKVString = (key: string): string | undefined => {
    return storage.getString(key);
};

export const setMMKVString = (key: string, value: string) => {
    storage.set(key, value);
};

export const getMMKVBoolean = (key: string): boolean => {
    return storage.getBoolean(key) ?? false;
};

export const setMMKVBoolean = (key: string, value: boolean) => {
    storage.set(key, value);
};

export const getMMKVNumber = (key: string): number => {
    return storage.getNumber(key) ?? 0;
};

export const setMMKVNumber = (key: string, value: number) => {
    storage.set(key, value);
};

export const clearMMKV = () => {
    storage.clearAll();
};
