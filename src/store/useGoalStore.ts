import { create } from 'zustand';
import { GoalRepository } from '../database/repositories/GoalRepository';
import { Goal } from '../types/goalTypes';
import { v4 as uuidv4 } from 'uuid';

interface GoalState {
    goals: Goal[];
    isLoading: boolean;
    error: string | null;

    loadGoals: () => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'currentProgress'>) => Promise<void>;
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addProgress: (id: string, amount: number) => Promise<void>;
    removeProgress: (id: string, amount: number) => Promise<void>;
    setProgress: (id: string, amount: number) => Promise<void>;
    getGoalById: (id: string) => Goal | undefined;
}

export const useGoalStore = create<GoalState>((set, get) => ({
    goals: [],
    isLoading: false,
    error: null,

    loadGoals: async () => {
        set({ isLoading: true, error: null });
        try {
            const goals = await GoalRepository.getAllGoals();
            set({ goals, isLoading: false });
        } catch (error) {
            console.error('Failed to load goals:', error);
            set({ error: 'Failed to load goals', isLoading: false });
        }
    },

    addGoal: async (goalData) => {
        try {
            const now = new Date().toISOString();
            const newGoal: Goal = {
                ...goalData,
                id: uuidv4(),
                currentProgress: 0,
                createdAt: now,
                updatedAt: now,
            };
            await GoalRepository.createGoal(newGoal);

            set((state) => ({
                goals: [...state.goals, newGoal],
            }));
        } catch (error) {
            console.error('Failed to add goal:', error);
            throw error;
        }
    },

    updateGoal: async (id, updates) => {
        try {
            const updatedGoal = { ...updates, updatedAt: new Date().toISOString() };
            await GoalRepository.updateGoal(id, updatedGoal);

            set((state) => ({
                goals: state.goals.map((goal) =>
                    goal.id === id
                        ? { ...goal, ...updatedGoal }
                        : goal
                ),
            }));
        } catch (error) {
            console.error('Failed to update goal:', error);
            throw error;
        }
    },

    deleteGoal: async (id) => {
        try {
            await GoalRepository.deleteGoal(id);

            set((state) => ({
                goals: state.goals.filter((goal) => goal.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete goal:', error);
            throw error;
        }
    },

    addProgress: async (id, amount) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;

        const newProgress = goal.currentProgress + amount;
        await get().updateGoal(id, { currentProgress: newProgress });
    },

    removeProgress: async (id, amount) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;

        const newProgress = Math.max(0, goal.currentProgress - amount);
        await get().updateGoal(id, { currentProgress: newProgress });
    },

    setProgress: async (id, amount) => {
        const newProgress = Math.max(0, amount);
        await get().updateGoal(id, { currentProgress: newProgress });
    },

    getGoalById: (id) => {
        return get().goals.find((goal) => goal.id === id);
    },
}));
