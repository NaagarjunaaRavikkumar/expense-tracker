import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';
import { Budget } from '../../types/budgetTypes';

export const BudgetRepository = {
    getAllBudgets: async (): Promise<Budget[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(`SELECT * FROM ${TABLE_NAMES.BUDGETS}`);
        const budgets: Budget[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            const item = results[0].rows.item(i);
            budgets.push({
                ...item,
                categoryIds: JSON.parse(item.categoryIds), // Parse JSON string back to array
            });
        }

        return budgets;
    },

    createBudget: async (budget: Budget): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.BUDGETS} (id, name, description, amount, color, startDate, endDate, categoryIds, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                budget.id,
                budget.name,
                budget.description || null,
                budget.amount,
                budget.color,
                budget.startDate,
                budget.endDate,
                JSON.stringify(budget.categoryIds), // Store array as JSON string
                budget.createdAt,
                budget.updatedAt,
            ]
        );
    },

    updateBudget: async (id: string, budget: Partial<Budget>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (budget.name !== undefined) {
            updates.push('name = ?');
            values.push(budget.name);
        }
        if (budget.description !== undefined) {
            updates.push('description = ?');
            values.push(budget.description);
        }
        if (budget.amount !== undefined) {
            updates.push('amount = ?');
            values.push(budget.amount);
        }
        if (budget.color !== undefined) {
            updates.push('color = ?');
            values.push(budget.color);
        }
        if (budget.startDate !== undefined) {
            updates.push('startDate = ?');
            values.push(budget.startDate);
        }
        if (budget.endDate !== undefined) {
            updates.push('endDate = ?');
            values.push(budget.endDate);
        }
        if (budget.categoryIds !== undefined) {
            updates.push('categoryIds = ?');
            values.push(JSON.stringify(budget.categoryIds));
        }
        if (budget.updatedAt !== undefined) {
            updates.push('updatedAt = ?');
            values.push(budget.updatedAt);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.BUDGETS} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteBudget: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.BUDGETS} WHERE id = ?`, [id]);
    },
};
