import { create } from 'zustand';
import { BudgetRepository } from '../database/repositories/BudgetRepository';
import { Budget } from '../types/budgetTypes';
import { v4 as uuidv4 } from 'uuid';

interface BudgetState {
    budgets: Budget[];
    isLoading: boolean;
    error: string | null;

    loadBudgets: () => Promise<void>;
    addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    getBudgetById: (id: string) => Budget | undefined;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
    budgets: [],
    isLoading: false,
    error: null,

    loadBudgets: async () => {
        set({ isLoading: true, error: null });
        try {
            const budgets = await BudgetRepository.getAllBudgets();
            set({ budgets, isLoading: false });
        } catch (error) {
            console.error('Failed to load budgets:', error);
            set({ error: 'Failed to load budgets', isLoading: false });
        }
    },

    addBudget: async (budgetData) => {
        try {
            const now = new Date().toISOString();
            const newBudget: Budget = {
                ...budgetData,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            await BudgetRepository.createBudget(newBudget);

            set((state) => ({
                budgets: [...state.budgets, newBudget],
            }));
        } catch (error) {
            console.error('Failed to add budget:', error);
            throw error;
        }
    },

    updateBudget: async (id, updates) => {
        try {
            const updatedBudget = { ...updates, updatedAt: new Date().toISOString() };
            await BudgetRepository.updateBudget(id, updatedBudget);

            set((state) => ({
                budgets: state.budgets.map((budget) =>
                    budget.id === id ? { ...budget, ...updatedBudget } : budget
                ),
            }));
        } catch (error) {
            console.error('Failed to update budget:', error);
            throw error;
        }
    },

    deleteBudget: async (id) => {
        try {
            await BudgetRepository.deleteBudget(id);

            set((state) => ({
                budgets: state.budgets.filter((budget) => budget.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete budget:', error);
            throw error;
        }
    },

    getBudgetById: (id) => {
        return get().budgets.find((budget) => budget.id === id);
    },
}));
