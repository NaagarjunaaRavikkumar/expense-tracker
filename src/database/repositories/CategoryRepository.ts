import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    is_default: boolean;
}

export const CategoryRepository = {
    getAllCategories: async (): Promise<Category[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(`SELECT * FROM ${TABLE_NAMES.CATEGORIES}`);
        const categories: Category[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            categories.push(results[0].rows.item(i));
        }

        return categories;
    },

    createCategory: async (category: Category): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.CATEGORIES} (id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
            [category.id, category.name, category.type, category.icon, category.color, category.is_default ? 1 : 0]
        );
    },

    updateCategory: async (id: string, category: Partial<Category>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (category.name) {
            updates.push('name = ?');
            values.push(category.name);
        }
        if (category.type) {
            updates.push('type = ?');
            values.push(category.type);
        }
        if (category.icon) {
            updates.push('icon = ?');
            values.push(category.icon);
        }
        if (category.color) {
            updates.push('color = ?');
            values.push(category.color);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.CATEGORIES} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteCategory: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.CATEGORIES} WHERE id = ?`, [id]);
    },
};
