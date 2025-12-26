import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Subcategory {
    id: string;
    name: string;
    categoryId: string;
    icon?: string;
    color?: string;
}

export const SubcategoryRepository = {
    getAllSubcategories: async (): Promise<Subcategory[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.SUBCATEGORIES} ORDER BY name ASC`
        );
        const subcategories: Subcategory[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            subcategories.push(results[0].rows.item(i));
        }

        return subcategories;
    },

    getSubcategoriesByCategoryId: async (categoryId: string): Promise<Subcategory[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.SUBCATEGORIES} WHERE categoryId = ? ORDER BY name ASC`,
            [categoryId]
        );
        const subcategories: Subcategory[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            subcategories.push(results[0].rows.item(i));
        }

        return subcategories;
    },

    createSubcategory: async (subcategory: Subcategory): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.SUBCATEGORIES} (id, name, categoryId, icon, color) VALUES (?, ?, ?, ?, ?)`,
            [
                subcategory.id,
                subcategory.name,
                subcategory.categoryId,
                subcategory.icon || null,
                subcategory.color || null,
            ]
        );
    },

    updateSubcategory: async (id: string, subcategory: Partial<Subcategory>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (subcategory.name !== undefined) {
            updates.push('name = ?');
            values.push(subcategory.name);
        }
        if (subcategory.categoryId !== undefined) {
            updates.push('categoryId = ?');
            values.push(subcategory.categoryId);
        }
        if (subcategory.icon !== undefined) {
            updates.push('icon = ?');
            values.push(subcategory.icon);
        }
        if (subcategory.color !== undefined) {
            updates.push('color = ?');
            values.push(subcategory.color);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.SUBCATEGORIES} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteSubcategory: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.SUBCATEGORIES} WHERE id = ?`, [id]);
    },
};
