import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Expense {
    id: number;
    title: string;
    amount: number;
    category_id: number | null;
    date: string;
    note: string | null;
    account_id: number | null;
}

export const ExpenseRepository = {
    getAllExpenses: async (): Promise<Expense[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.EXPENSES} ORDER BY date DESC`
        );
        const expenses: Expense[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            expenses.push(results[0].rows.item(i));
        }

        return expenses;
    },

    createExpense: async (expense: Omit<Expense, 'id'>): Promise<number> => {
        const db = await getDBConnection();
        const result = await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.EXPENSES} (title, amount, category_id, date, note, account_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [expense.title, expense.amount, expense.category_id, expense.date, expense.note, expense.account_id]
        );
        return result[0].insertId;
    },

    updateExpense: async (id: number, expense: Partial<Omit<Expense, 'id'>>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (expense.title !== undefined) {
            updates.push('title = ?');
            values.push(expense.title);
        }
        if (expense.amount !== undefined) {
            updates.push('amount = ?');
            values.push(expense.amount);
        }
        if (expense.category_id !== undefined) {
            updates.push('category_id = ?');
            values.push(expense.category_id);
        }
        if (expense.date !== undefined) {
            updates.push('date = ?');
            values.push(expense.date);
        }
        if (expense.note !== undefined) {
            updates.push('note = ?');
            values.push(expense.note);
        }
        if (expense.account_id !== undefined) {
            updates.push('account_id = ?');
            values.push(expense.account_id);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.EXPENSES} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteExpense: async (id: number): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.EXPENSES} WHERE id = ?`, [id]);
    },
};
