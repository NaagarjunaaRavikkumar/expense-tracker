import SQLite from 'react-native-sqlite-storage';
import { CREATE_TABLES, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_SUBCATEGORIES, TABLE_NAMES } from './tables';

SQLite.enablePromise(true);

const DATABASE_NAME = 'FinTrackHub.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        dbInstance = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        return dbInstance;
    } catch (error) {
        console.error('Failed to open database:', error);
        throw error;
    }
};

export const initDatabase = async (): Promise<void> => {
    const db = await getDBConnection();

    try {
        // Enable foreign keys
        await db.executeSql('PRAGMA foreign_keys = ON;');

        // Create tables
        for (const [tableName, createQuery] of Object.entries(CREATE_TABLES)) {
            await db.executeSql(createQuery);
            console.log(`Table ${tableName} created or already exists.`);
        }

        // Seed default categories if empty
        const [catResults] = await db.executeSql(`SELECT count(*) as count FROM ${TABLE_NAMES.CATEGORIES}`);
        const catCount = catResults.rows.item(0).count;

        if (catCount === 0) {
            console.log('Seeding default categories...');
            for (const category of DEFAULT_CATEGORIES) {
                await db.executeSql(
                    `INSERT INTO ${TABLE_NAMES.CATEGORIES} (id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
                    [category.id, category.name, category.type, category.icon, category.color, 1]
                );
            }
        }

        // Seed default subcategories if empty
        const [subcatResults] = await db.executeSql(`SELECT count(*) as count FROM ${TABLE_NAMES.SUBCATEGORIES}`);
        const subcatCount = subcatResults.rows.item(0).count;

        if (subcatCount === 0) {
            console.log('Seeding default subcategories...');
            for (const subcategory of DEFAULT_SUBCATEGORIES) {
                await db.executeSql(
                    `INSERT INTO ${TABLE_NAMES.SUBCATEGORIES} (id, name, categoryId, icon, color) VALUES (?, ?, ?, ?, ?)`,
                    [subcategory.id, subcategory.name, subcategory.categoryId, subcategory.icon, subcategory.color]
                );
            }
        }

        // Seed default accounts if empty
        const [accResults] = await db.executeSql(`SELECT count(*) as count FROM ${TABLE_NAMES.ACCOUNTS}`);
        const accCount = accResults.rows.item(0).count;

        if (accCount === 0) {
            console.log('Seeding default accounts...');
            for (const account of DEFAULT_ACCOUNTS) {
                await db.executeSql(
                    `INSERT INTO ${TABLE_NAMES.ACCOUNTS} (id, name, type, balance, currency, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [account.id, account.name, account.type, account.balance, account.currency, account.icon, account.color]
                );
            }
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};

export const closeDatabase = async (): Promise<void> => {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
};
