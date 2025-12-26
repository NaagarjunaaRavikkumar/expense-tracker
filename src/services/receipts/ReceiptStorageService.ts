import { getDBConnection } from '../../database/index';
import { TABLE_NAMES } from '../../database/tables';
import { ParsedReceipt, ParsedItem } from './ReceiptParserService';

export interface Receipt {
    id: string;
    imagePath: string;
    merchantName?: string;
    transactionDate?: string;
    totalAmount?: number;
    taxAmount?: number;
    currency: string;
    createdAt: string;
    expenseId?: string;
}

export interface PurchaseItem {
    id: string;
    receiptId: string;
    name: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    category?: string;
}

/**
 * Receipt Storage Service
 * Handles SQLite persistence for receipts and line items
 */
export const ReceiptStorageService = {
    /**
     * Save receipt and its line items to database
     */
    saveReceipt: async (
        imagePath: string,
        parsedReceipt: ParsedReceipt,
        expenseId?: string
    ): Promise<string> => {
        const db = await getDBConnection();

        try {
            // Generate receipt ID
            const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const createdAt = new Date().toISOString();

            // Insert receipt
            await db.executeSql(
                `INSERT INTO ${TABLE_NAMES.RECEIPTS} 
                (id, imagePath, merchantName, transactionDate, totalAmount, taxAmount, currency, createdAt, expenseId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    receiptId,
                    imagePath,
                    parsedReceipt.merchantName || null,
                    parsedReceipt.date || null,
                    parsedReceipt.totalAmount || null,
                    parsedReceipt.taxAmount || null,
                    'INR',
                    createdAt,
                    expenseId || null,
                ]
            );

            // Insert line items
            if (parsedReceipt.items && parsedReceipt.items.length > 0) {
                for (const item of parsedReceipt.items) {
                    await ReceiptStorageService.savePurchaseItem(receiptId, item);
                }
            }

            return receiptId;
        } catch (error) {
            console.error('[ReceiptStorage] Failed to save receipt:', error);
            throw error;
        }
    },

    /**
     * Save a single purchase item
     */
    savePurchaseItem: async (receiptId: string, item: ParsedItem): Promise<string> => {
        const db = await getDBConnection();

        try {
            const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await db.executeSql(
                `INSERT INTO ${TABLE_NAMES.PURCHASE_ITEMS} 
                (id, receiptId, name, quantity, unitPrice, totalPrice, category) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemId,
                    receiptId,
                    item.name,
                    item.quantity,
                    item.unitPrice || null,
                    item.totalPrice || null,
                    null, // category can be set later
                ]
            );

            return itemId;
        } catch (error) {
            console.error('[ReceiptStorage] Failed to save purchase item:', error);
            throw error;
        }
    },

    /**
     * Get receipt by ID with its items
     */
    getReceiptById: async (receiptId: string): Promise<{ receipt: Receipt; items: PurchaseItem[] } | null> => {
        const db = await getDBConnection();

        try {
            // Get receipt
            const receiptResult = await db.executeSql(
                `SELECT * FROM ${TABLE_NAMES.RECEIPTS} WHERE id = ?`,
                [receiptId]
            );

            if (receiptResult[0].rows.length === 0) {
                return null;
            }

            const receipt = receiptResult[0].rows.item(0) as Receipt;

            // Get items
            const itemsResult = await db.executeSql(
                `SELECT * FROM ${TABLE_NAMES.PURCHASE_ITEMS} WHERE receiptId = ?`,
                [receiptId]
            );

            const items: PurchaseItem[] = [];
            for (let i = 0; i < itemsResult[0].rows.length; i++) {
                items.push(itemsResult[0].rows.item(i));
            }

            return { receipt, items };
        } catch (error) {
            console.error('[ReceiptStorage] Failed to get receipt:', error);
            throw error;
        }
    },

    /**
     * Get all receipts (without items)
     */
    getAllReceipts: async (): Promise<Receipt[]> => {
        const db = await getDBConnection();

        try {
            const result = await db.executeSql(
                `SELECT * FROM ${TABLE_NAMES.RECEIPTS} ORDER BY createdAt DESC`
            );

            const receipts: Receipt[] = [];
            for (let i = 0; i < result[0].rows.length; i++) {
                receipts.push(result[0].rows.item(i));
            }

            return receipts;
        } catch (error) {
            console.error('[ReceiptStorage] Failed to get receipts:', error);
            throw error;
        }
    },

    /**
     * Get receipts by expense ID
     */
    getReceiptsByExpenseId: async (expenseId: string): Promise<Receipt[]> => {
        const db = await getDBConnection();

        try {
            const result = await db.executeSql(
                `SELECT * FROM ${TABLE_NAMES.RECEIPTS} WHERE expenseId = ? ORDER BY createdAt DESC`,
                [expenseId]
            );

            const receipts: Receipt[] = [];
            for (let i = 0; i < result[0].rows.length; i++) {
                receipts.push(result[0].rows.item(i));
            }

            return receipts;
        } catch (error) {
            console.error('[ReceiptStorage] Failed to get receipts by expense:', error);
            throw error;
        }
    },

    /**
     * Delete receipt and its items
     */
    deleteReceipt: async (receiptId: string): Promise<void> => {
        const db = await getDBConnection();

        try {
            // Items will be deleted automatically due to CASCADE
            await db.executeSql(`DELETE FROM ${TABLE_NAMES.RECEIPTS} WHERE id = ?`, [receiptId]);
        } catch (error) {
            console.error('[ReceiptStorage] Failed to delete receipt:', error);
            throw error;
        }
    },

    /**
     * Update receipt metadata
     */
    updateReceipt: async (
        receiptId: string,
        updates: Partial<Omit<Receipt, 'id' | 'createdAt'>>
    ): Promise<void> => {
        const db = await getDBConnection();

        try {
            const fields: string[] = [];
            const values: any[] = [];

            if (updates.merchantName !== undefined) {
                fields.push('merchantName = ?');
                values.push(updates.merchantName);
            }
            if (updates.transactionDate !== undefined) {
                fields.push('transactionDate = ?');
                values.push(updates.transactionDate);
            }
            if (updates.totalAmount !== undefined) {
                fields.push('totalAmount = ?');
                values.push(updates.totalAmount);
            }
            if (updates.taxAmount !== undefined) {
                fields.push('taxAmount = ?');
                values.push(updates.taxAmount);
            }
            if (updates.expenseId !== undefined) {
                fields.push('expenseId = ?');
                values.push(updates.expenseId);
            }

            if (fields.length === 0) return;

            values.push(receiptId);

            await db.executeSql(
                `UPDATE ${TABLE_NAMES.RECEIPTS} SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        } catch (error) {
            console.error('[ReceiptStorage] Failed to update receipt:', error);
            throw error;
        }
    },
};
