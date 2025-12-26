import { create } from 'zustand';
import { AccountRepository, Account } from '../database/repositories/AccountRepository';
import { v4 as uuidv4 } from 'uuid';

interface AccountState {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;

    loadAccounts: () => Promise<void>;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    getAccountById: (id: string) => Account | undefined;
    updateBalance: (id: string, amount: number) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
    accounts: [],
    isLoading: false,
    error: null,

    loadAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
            const accounts = await AccountRepository.getAllAccounts();
            set({ accounts, isLoading: false });
        } catch (error) {
            console.error('Failed to load accounts:', error);
            set({ error: 'Failed to load accounts', isLoading: false });
        }
    },

    addAccount: async (accountData) => {
        try {
            const newAccount: Account = {
                ...accountData,
                id: uuidv4(),
            };
            await AccountRepository.createAccount(newAccount);

            set((state) => ({
                accounts: [...state.accounts, newAccount],
            }));
        } catch (error) {
            console.error('Failed to add account:', error);
            throw error;
        }
    },

    updateAccount: async (id, updates) => {
        try {
            await AccountRepository.updateAccount(id, updates);

            set((state) => ({
                accounts: state.accounts.map((acc) =>
                    acc.id === id ? { ...acc, ...updates } : acc
                ),
            }));
        } catch (error) {
            console.error('Failed to update account:', error);
            throw error;
        }
    },

    deleteAccount: async (id) => {
        // Prevent deletion of default accounts if needed, though logic should be in UI or repo
        if (id.startsWith('default-')) return;

        try {
            await AccountRepository.deleteAccount(id);

            set((state) => ({
                accounts: state.accounts.filter((acc) => acc.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete account:', error);
            throw error;
        }
    },

    getAccountById: (id) => {
        return get().accounts.find((acc) => acc.id === id);
    },

    updateBalance: async (id, amount) => {
        try {
            await AccountRepository.updateBalance(id, amount);

            set((state) => ({
                accounts: state.accounts.map((acc) =>
                    acc.id === id ? { ...acc, balance: acc.balance + amount } : acc
                ),
            }));
        } catch (error) {
            console.error('Failed to update balance:', error);
            throw error;
        }
    },
}));
