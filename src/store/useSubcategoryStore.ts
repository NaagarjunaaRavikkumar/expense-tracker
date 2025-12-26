import { create } from 'zustand';
import { SubcategoryRepository, Subcategory } from '../database/repositories/SubcategoryRepository';
import { v4 as uuidv4 } from 'uuid';

interface SubcategoryState {
    subcategories: Subcategory[];
    isLoading: boolean;
    error: string | null;

    loadSubcategories: () => Promise<void>;
    getSubcategoriesByCategory: (categoryId: string) => Subcategory[];
    addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<void>;
    updateSubcategory: (id: string, updates: Partial<Subcategory>) => Promise<void>;
    deleteSubcategory: (id: string) => Promise<void>;
}

export const useSubcategoryStore = create<SubcategoryState>((set, get) => ({
    subcategories: [],
    isLoading: false,
    error: null,

    loadSubcategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const subcategories = await SubcategoryRepository.getAllSubcategories();
            set({ subcategories, isLoading: false });
        } catch (error) {
            console.error('Failed to load subcategories:', error);
            set({ error: 'Failed to load subcategories', isLoading: false });
        }
    },

    getSubcategoriesByCategory: (categoryId: string) => {
        return get().subcategories.filter(sub => sub.categoryId === categoryId);
    },

    addSubcategory: async (subcategoryData) => {
        try {
            const newSubcategory: Subcategory = {
                ...subcategoryData,
                id: uuidv4(),
            };
            await SubcategoryRepository.createSubcategory(newSubcategory);

            set((state) => ({
                subcategories: [...state.subcategories, newSubcategory],
            }));
        } catch (error) {
            console.error('Failed to add subcategory:', error);
            throw error;
        }
    },

    updateSubcategory: async (id, updates) => {
        try {
            await SubcategoryRepository.updateSubcategory(id, updates);

            set((state) => ({
                subcategories: state.subcategories.map((sub) =>
                    sub.id === id ? { ...sub, ...updates } : sub
                ),
            }));
        } catch (error) {
            console.error('Failed to update subcategory:', error);
            throw error;
        }
    },

    deleteSubcategory: async (id) => {
        try {
            await SubcategoryRepository.deleteSubcategory(id);

            set((state) => ({
                subcategories: state.subcategories.filter((sub) => sub.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete subcategory:', error);
            throw error;
        }
    },
}));
