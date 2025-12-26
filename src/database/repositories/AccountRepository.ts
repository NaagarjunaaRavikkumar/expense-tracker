import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';

export interface Account {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment';
    balance: number;
    currency: string;
    icon: string;
    color: string;
}

export const AccountRepository = {
    getAllAccounts: async (): Promise<Account[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(`SELECT * FROM ${TABLE_NAMES.ACCOUNTS}`);
        const accounts: Account[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            accounts.push(results[0].rows.item(i));
        }

        return accounts;
    },

    createAccount: async (account: Account): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.ACCOUNTS} (id, name, type, balance, currency, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [account.id, account.name, account.type, account.balance, account.currency, account.icon, account.color]
        );
    },

    updateAccount: async (id: string, account: Partial<Account>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (account.name !== undefined) {
            updates.push('name = ?');
            values.push(account.name);
        }
        if (account.type !== undefined) {
            updates.push('type = ?');
            values.push(account.type);
        }
        if (account.balance !== undefined) {
            updates.push('balance = ?');
            values.push(account.balance);
        }
        if (account.currency !== undefined) {
            updates.push('currency = ?');
            values.push(account.currency);
        }
        if (account.icon !== undefined) {
            updates.push('icon = ?');
            values.push(account.icon);
        }
        if (account.color !== undefined) {
            updates.push('color = ?');
            values.push(account.color);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.ACCOUNTS} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    updateBalance: async (id: string, amount: number): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.ACCOUNTS} SET balance = balance + ? WHERE id = ?`,
            [amount, id]
        );
    },

    deleteAccount: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.ACCOUNTS} WHERE id = ?`, [id]);
    },
};
