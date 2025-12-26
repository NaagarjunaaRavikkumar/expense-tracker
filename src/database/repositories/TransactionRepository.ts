import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Transaction {
    id: string;
    amount: number;
    date: string; // ISO format date
    time: string; // HH:mm format
    type: 'income' | 'expense' | 'transfer';
    categoryId: string | null; // Nullable for transfers
    subcategoryId?: string | null; // Optional subcategory
    accountId: string;
    paymentType: 'cash' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'voucher' | 'mobile_payment' | 'web_payment';
    notes?: string;
    toAccountId?: string; // For transfers
}

export const TransactionRepository = {
    getAllTransactions: async (): Promise<Transaction[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.TRANSACTIONS} ORDER BY date DESC, time DESC`
        );
        const transactions: Transaction[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            transactions.push(results[0].rows.item(i));
        }

        return transactions;
    },

    createTransaction: async (transaction: Transaction): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.TRANSACTIONS} (id, amount, date, time, type, categoryId, subcategoryId, accountId, paymentType, notes, toAccountId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transaction.id,
                transaction.amount,
                transaction.date,
                transaction.time,
                transaction.type,
                transaction.categoryId,
                transaction.subcategoryId || null,
                transaction.accountId,
                transaction.paymentType,
                transaction.notes || null,
                transaction.toAccountId || null,
            ]
        );
    },

    updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (transaction.amount !== undefined) {
            updates.push('amount = ?');
            values.push(transaction.amount);
        }
        if (transaction.date !== undefined) {
            updates.push('date = ?');
            values.push(transaction.date);
        }
        if (transaction.time !== undefined) {
            updates.push('time = ?');
            values.push(transaction.time);
        }
        if (transaction.type !== undefined) {
            updates.push('type = ?');
            values.push(transaction.type);
        }
        if (transaction.categoryId !== undefined) {
            updates.push('categoryId = ?');
            values.push(transaction.categoryId);
        }
        if (transaction.subcategoryId !== undefined) {
            updates.push('subcategoryId = ?');
            values.push(transaction.subcategoryId);
        }
        if (transaction.accountId !== undefined) {
            updates.push('accountId = ?');
            values.push(transaction.accountId);
        }
        if (transaction.paymentType !== undefined) {
            updates.push('paymentType = ?');
            values.push(transaction.paymentType);
        }
        if (transaction.notes !== undefined) {
            updates.push('notes = ?');
            values.push(transaction.notes);
        }
        if (transaction.toAccountId !== undefined) {
            updates.push('toAccountId = ?');
            values.push(transaction.toAccountId);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.TRANSACTIONS} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteTransaction: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.TRANSACTIONS} WHERE id = ?`, [id]);
    },
};
