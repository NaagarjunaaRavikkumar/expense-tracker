import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Income {
    id: number;
    title: string;
    amount: number;
    category_id: number | null;
    date: string;
    note: string | null;
    account_id: number | null;
}

export const IncomeRepository = {
    getAllIncome: async (): Promise<Income[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.INCOME} ORDER BY date DESC`
        );
        const incomeList: Income[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            incomeList.push(results[0].rows.item(i));
        }

        return incomeList;
    },

    createIncome: async (income: Omit<Income, 'id'>): Promise<number> => {
        const db = await getDBConnection();
        const result = await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.INCOME} (title, amount, category_id, date, note, account_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [income.title, income.amount, income.category_id, income.date, income.note, income.account_id]
        );
        return result[0].insertId;
    },

    updateIncome: async (id: number, income: Partial<Omit<Income, 'id'>>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (income.title !== undefined) {
            updates.push('title = ?');
            values.push(income.title);
        }
        if (income.amount !== undefined) {
            updates.push('amount = ?');
            values.push(income.amount);
        }
        if (income.category_id !== undefined) {
            updates.push('category_id = ?');
            values.push(income.category_id);
        }
        if (income.date !== undefined) {
            updates.push('date = ?');
            values.push(income.date);
        }
        if (income.note !== undefined) {
            updates.push('note = ?');
            values.push(income.note);
        }
        if (income.account_id !== undefined) {
            updates.push('account_id = ?');
            values.push(income.account_id);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.INCOME} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteIncome: async (id: number): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.INCOME} WHERE id = ?`, [id]);
    },
};
