import { create } from 'zustand';
import { TransactionRepository, Transaction } from '../database/repositories/TransactionRepository';
import { CategoryRepository, Category } from '../database/repositories/CategoryRepository';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseState {
    transactions: Transaction[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadData: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'is_default'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    transactions: [],
    categories: [],
    isLoading: false,
    error: null,

    loadData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [transactions, categories] = await Promise.all([
                TransactionRepository.getAllTransactions(),
                CategoryRepository.getAllCategories(),
            ]);
            set({ transactions, categories, isLoading: false });
        } catch (error) {
            console.error('Failed to load expense data:', error);
            set({ error: 'Failed to load data', isLoading: false });
        }
    },

    addTransaction: async (transactionData) => {
        try {
            const newTransaction: Transaction = { ...transactionData, id: uuidv4() };
            await TransactionRepository.createTransaction(newTransaction);

            // Update local state
            set((state) => ({
                transactions: [newTransaction, ...state.transactions],
            }));

            // Update account balance
            import('./useAccountStore').then(({ useAccountStore }) => {
                const { updateBalance } = useAccountStore.getState();

                if (transactionData.type === 'expense') {
                    updateBalance(transactionData.accountId, -transactionData.amount);
                } else if (transactionData.type === 'income') {
                    updateBalance(transactionData.accountId, transactionData.amount);
                } else if (transactionData.type === 'transfer' && transactionData.toAccountId) {
                    updateBalance(transactionData.accountId, -transactionData.amount);
                    updateBalance(transactionData.toAccountId, transactionData.amount);
                }
            });
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    },

    updateTransaction: async (id, updates) => {
        try {
            const oldTransaction = get().transactions.find(t => t.id === id);
            if (!oldTransaction) return;

            await TransactionRepository.updateTransaction(id, updates);

            // Update local state
            set((state) => ({
                transactions: state.transactions.map((tx) =>
                    tx.id === id ? { ...tx, ...updates } : tx
                ),
            }));

            // Update account balances
            import('./useAccountStore').then(({ useAccountStore }) => {
                const { updateBalance } = useAccountStore.getState();
                const balanceUpdates = new Map<string, number>();

                const addToBalance = (accId: string, amount: number) => {
                    balanceUpdates.set(accId, (balanceUpdates.get(accId) || 0) + amount);
                };

                // 1. Revert old transaction
                if (oldTransaction.type === 'expense') {
                    addToBalance(oldTransaction.accountId, oldTransaction.amount);
                } else if (oldTransaction.type === 'income') {
                    addToBalance(oldTransaction.accountId, -oldTransaction.amount);
                } else if (oldTransaction.type === 'transfer' && oldTransaction.toAccountId) {
                    addToBalance(oldTransaction.accountId, oldTransaction.amount);
                    addToBalance(oldTransaction.toAccountId, -oldTransaction.amount);
                }

                // 2. Apply new transaction
                const newTransaction = { ...oldTransaction, ...updates };

                if (newTransaction.type === 'expense') {
                    addToBalance(newTransaction.accountId, -newTransaction.amount);
                } else if (newTransaction.type === 'income') {
                    addToBalance(newTransaction.accountId, newTransaction.amount);
                } else if (newTransaction.type === 'transfer' && newTransaction.toAccountId) {
                    addToBalance(newTransaction.accountId, -newTransaction.amount);
                    addToBalance(newTransaction.toAccountId, newTransaction.amount);
                }

                // 3. Apply updates
                for (const [accId, amount] of balanceUpdates) {
                    if (Math.abs(amount) > 0.001) { // Float safety check
                        updateBalance(accId, amount);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to update transaction:', error);
            throw error;
        }
    },

    deleteTransaction: async (id) => {
        try {
            const tx = get().transactions.find(t => t.id === id);
            if (!tx) return;

            await TransactionRepository.deleteTransaction(id);

            // Revert balance changes
            import('./useAccountStore').then(({ useAccountStore }) => {
                const { updateBalance } = useAccountStore.getState();

                if (tx.type === 'expense') {
                    updateBalance(tx.accountId, tx.amount);
                } else if (tx.type === 'income') {
                    updateBalance(tx.accountId, -tx.amount);
                } else if (tx.type === 'transfer' && tx.toAccountId) {
                    updateBalance(tx.accountId, tx.amount);
                    updateBalance(tx.toAccountId, -tx.amount);
                }
            });

            set((state) => ({
                transactions: state.transactions.filter(t => t.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            throw error;
        }
    },

    addCategory: async (categoryData) => {
        try {
            const newCategory: Category = {
                ...categoryData,
                id: uuidv4(),
                is_default: false
            };
            await CategoryRepository.createCategory(newCategory);

            set((state) => ({
                categories: [...state.categories, newCategory],
            }));
        } catch (error) {
            console.error('Failed to add category:', error);
            throw error;
        }
    },

    updateCategory: async (id, updates) => {
        try {
            await CategoryRepository.updateCategory(id, updates);

            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat.id === id ? { ...cat, ...updates } : cat
                ),
            }));
        } catch (error) {
            console.error('Failed to update category:', error);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            await CategoryRepository.deleteCategory(id);

            set((state) => ({
                categories: state.categories.filter((cat) => cat.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete category:', error);
            throw error;
        }
    },
}));
