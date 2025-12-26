import { create } from 'zustand';
import { CategoryRepository, Category } from '../database/repositories/CategoryRepository';
import { v4 as uuidv4 } from 'uuid';

interface CategoryState {
    incomeCategories: Category[];
    expenseCategories: Category[];
    isLoading: boolean;
    error: string | null;

    loadCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'is_default'>, type: 'income' | 'expense') => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>, type: 'income' | 'expense') => Promise<void>;
    deleteCategory: (id: string, type: 'income' | 'expense') => Promise<void>;
    getCategoryById: (id: string, type: 'income' | 'expense') => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    incomeCategories: [],
    expenseCategories: [],
    isLoading: false,
    error: null,

    loadCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const allCategories = await CategoryRepository.getAllCategories();
            set({
                incomeCategories: allCategories.filter(c => c.type === 'income'),
                expenseCategories: allCategories.filter(c => c.type === 'expense'),
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
            set({ error: 'Failed to load categories', isLoading: false });
        }
    },

    addCategory: async (categoryData, type) => {
        try {
            const newCategory: Category = {
                ...categoryData,
                id: uuidv4(),
                type,
                is_default: false
            };
            await CategoryRepository.createCategory(newCategory);

            set((state) => ({
                [type === 'income' ? 'incomeCategories' : 'expenseCategories']: [
                    ...state[type === 'income' ? 'incomeCategories' : 'expenseCategories'],
                    newCategory,
                ],
            }));
        } catch (error) {
            console.error('Failed to add category:', error);
            throw error;
        }
    },

    updateCategory: async (id, updates, type) => {
        try {
            await CategoryRepository.updateCategory(id, updates);

            set((state) => ({
                [type === 'income' ? 'incomeCategories' : 'expenseCategories']: state[
                    type === 'income' ? 'incomeCategories' : 'expenseCategories'
                ].map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
            }));
        } catch (error) {
            console.error('Failed to update category:', error);
            throw error;
        }
    },

    deleteCategory: async (id, type) => {
        try {
            await CategoryRepository.deleteCategory(id);

            set((state) => ({
                [type === 'income' ? 'incomeCategories' : 'expenseCategories']: state[
                    type === 'income' ? 'incomeCategories' : 'expenseCategories'
                ].filter((cat) => cat.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete category:', error);
            throw error;
        }
    },

    getCategoryById: (id, type) => {
        const categories = get()[type === 'income' ? 'incomeCategories' : 'expenseCategories'];
        return categories.find((cat) => cat.id === id);
    },
}));
