import { getDBConnection } from '../../database';
import { TABLE_NAMES } from '../../database/tables';

export interface PriceComparison {
    itemName: string;
    currentPrice: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    lastPrice: number;
    priceChangePercentage: number;
    isHigherThanAverage: boolean;
}

export const PriceIntelligenceService = {
    checkPrice: async (itemName: string, currentPrice: number): Promise<PriceComparison | null> => {
        const db = await getDBConnection();

        // Find similar items (exact match for now, could be fuzzy)
        const [results] = await db.executeSql(
            `SELECT 
                AVG(unitPrice) as avgPrice, 
                MIN(unitPrice) as minPrice, 
                MAX(unitPrice) as maxPrice,
                (SELECT unitPrice FROM ${TABLE_NAMES.PURCHASE_ITEMS} WHERE name = ? ORDER BY rowid DESC LIMIT 1) as lastPrice
             FROM ${TABLE_NAMES.PURCHASE_ITEMS} 
             WHERE name = ?`,
            [itemName, itemName]
        );

        if (results.rows.length === 0 || !results.rows.item(0).avgPrice) {
            return null;
        }

        const stats = results.rows.item(0);
        const avgPrice = stats.avgPrice;
        const lastPrice = stats.lastPrice || avgPrice;

        const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;

        return {
            itemName,
            currentPrice,
            averagePrice: avgPrice,
            minPrice: stats.minPrice,
            maxPrice: stats.maxPrice,
            lastPrice,
            priceChangePercentage: priceChange,
            isHigherThanAverage: currentPrice > avgPrice
        };
    },

    getItemHistory: async (itemName: string): Promise<any[]> => {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT pi.*, r.transactionDate, r.merchantName 
             FROM ${TABLE_NAMES.PURCHASE_ITEMS} pi
             JOIN ${TABLE_NAMES.RECEIPTS} r ON pi.receiptId = r.id
             WHERE pi.name = ?
             ORDER BY r.transactionDate DESC`,
            [itemName]
        );

        const history = [];
        for (let i = 0; i < results.rows.length; i++) {
            history.push(results.rows.item(i));
        }
        return history;
    }
};
