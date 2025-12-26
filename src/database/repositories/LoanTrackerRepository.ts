import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';
import { v4 as uuidv4 } from 'uuid';
import { calculateLedger, calculateMetrics, LoanData, ROIEntry, Prepayment, LedgerEntry } from '../../services/loanTracker/ledgerEngine';

export interface LoanTracker {
    id: string;
    name: string;
    startDate: string;
    initialPrincipal: number;
    emi: number;
    description?: string;
    createdAt: string;
    isActive: boolean;
}

export interface LoanROI {
    id: string;
    loanId: string;
    effectiveDate: string;
    annualRate: number;
}

export interface LoanPrepayment {
    id: string;
    loanId: string;
    date: string;
    amount: number;
    note?: string;
}

export interface LoanEMIPayment {
    id: string;
    loanId: string;
    date: string;
    amount: number;
}

export const LoanTrackerRepository = {
    // ==================== LOAN CRUD ====================

    async createLoan(loan: Omit<LoanTracker, 'id' | 'createdAt'>): Promise<string> {
        const db = await getDBConnection();
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.LOAN_TRACKER} (id, name, startDate, initialPrincipal, emi, description, createdAt, isActive) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, loan.name, loan.startDate, loan.initialPrincipal, loan.emi, loan.description || null, createdAt, loan.isActive ? 1 : 0]
        );

        return id;
    },

    async updateLoan(id: string, updates: Partial<Omit<LoanTracker, 'id' | 'createdAt'>>): Promise<void> {
        const db = await getDBConnection();
        const fields = [];
        const values = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.startDate !== undefined) { fields.push('startDate = ?'); values.push(updates.startDate); }
        if (updates.initialPrincipal !== undefined) { fields.push('initialPrincipal = ?'); values.push(updates.initialPrincipal); }
        if (updates.emi !== undefined) { fields.push('emi = ?'); values.push(updates.emi); }
        if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
        if (updates.isActive !== undefined) { fields.push('isActive = ?'); values.push(updates.isActive ? 1 : 0); }

        if (fields.length === 0) return;

        await db.executeSql(
            `UPDATE ${TABLE_NAMES.LOAN_TRACKER} SET ${fields.join(', ')} WHERE id = ?`,
            [...values, id]
        );

        // Regenerate ledger after update
        await this.regenerateLedger(id);
    },

    async deleteLoan(id: string): Promise<void> {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.LOAN_TRACKER} WHERE id = ?`, [id]);
        // Cascade deletes ROI, prepayments, and ledger automatically
    },

    async getLoan(id: string): Promise<LoanTracker | null> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_TRACKER} WHERE id = ?`,
            [id]
        );

        if (results.rows.length === 0) return null;
        const row = results.rows.item(0);
        return {
            ...row,
            isActive: row.isActive === 1
        };
    },

    async getAllLoans(): Promise<LoanTracker[]> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_TRACKER} ORDER BY createdAt DESC`
        );

        const loans: LoanTracker[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            loans.push({
                ...row,
                isActive: row.isActive === 1
            });
        }
        return loans;
    },

    // ==================== ROI CRUD ====================

    async addROI(roi: Omit<LoanROI, 'id'>): Promise<string> {
        const db = await getDBConnection();
        const id = uuidv4();

        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.LOAN_ROI} (id, loanId, effectiveDate, annualRate) VALUES (?, ?, ?, ?)`,
            [id, roi.loanId, roi.effectiveDate, roi.annualRate]
        );

        // Regenerate ledger after adding ROI
        await this.regenerateLedger(roi.loanId);
        return id;
    },

    async deleteROI(id: string, loanId: string): Promise<void> {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.LOAN_ROI} WHERE id = ?`, [id]);
        await this.regenerateLedger(loanId);
    },

    async getROIHistory(loanId: string): Promise<LoanROI[]> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_ROI} WHERE loanId = ? ORDER BY effectiveDate ASC`,
            [loanId]
        );

        const rois: LoanROI[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            rois.push(results.rows.item(i));
        }
        return rois;
    },

    // ==================== PREPAYMENT CRUD ====================

    async addPrepayment(prepayment: Omit<LoanPrepayment, 'id'>): Promise<string> {
        const db = await getDBConnection();
        const id = uuidv4();

        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.LOAN_PREPAYMENTS} (id, loanId, date, amount, note) VALUES (?, ?, ?, ?, ?)`,
            [id, prepayment.loanId, prepayment.date, prepayment.amount, prepayment.note || null]
        );

        // Regenerate ledger after adding prepayment
        await this.regenerateLedger(prepayment.loanId);
        return id;
    },

    async deletePrepayment(id: string, loanId: string): Promise<void> {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.LOAN_PREPAYMENTS} WHERE id = ?`, [id]);
        await this.regenerateLedger(loanId);
    },

    async getPrepayments(loanId: string): Promise<LoanPrepayment[]> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_PREPAYMENTS} WHERE loanId = ? ORDER BY date ASC`,
            [loanId]
        );

        const prepayments: LoanPrepayment[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            prepayments.push(results.rows.item(i));
        }
        return prepayments;
    },

    // ==================== EMI PAYMENT CRUD ====================

    async addEMIPayment(payment: Omit<LoanEMIPayment, 'id'>): Promise<string> {
        const db = await getDBConnection();
        const id = uuidv4();

        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.LOAN_EMI_PAYMENTS} (id, loanId, date, amount) VALUES (?, ?, ?, ?)`,
            [id, payment.loanId, payment.date, payment.amount]
        );

        // Regenerate ledger after adding EMI payment
        await this.regenerateLedger(payment.loanId);
        return id;
    },

    async deleteEMIPayment(id: string, loanId: string): Promise<void> {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.LOAN_EMI_PAYMENTS} WHERE id = ?`, [id]);
        await this.regenerateLedger(loanId);
    },

    async getEMIPayments(loanId: string): Promise<LoanEMIPayment[]> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_EMI_PAYMENTS} WHERE loanId = ? ORDER BY date ASC`,
            [loanId]
        );

        const payments: LoanEMIPayment[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            payments.push(results.rows.item(i));
        }
        return payments;
    },

    // ==================== LEDGER ====================

    async regenerateLedger(loanId: string): Promise<void> {
        const db = await getDBConnection();

        // Get loan details
        const loan = await this.getLoan(loanId);
        if (!loan) return;

        // Get ROI history
        const roiHistory = await this.getROIHistory(loanId);

        // Get prepayments
        const prepayments = await this.getPrepayments(loanId);

        // Get EMI payments
        const emiPayments = await this.getEMIPayments(loanId);
        console.log(`[RegenerateLedger] Found ${emiPayments.length} EMI payments for loan ${loanId}`);

        // Calculate ledger using engine
        const loanData: LoanData = {
            startDate: loan.startDate,
            initialPrincipal: loan.initialPrincipal,
            emi: loan.emi, // Fallback default EMI
            roiHistory: roiHistory.map(r => ({ effectiveDate: r.effectiveDate, annualRate: r.annualRate })),
            prepayments: prepayments.map(p => ({ date: p.date, amount: p.amount })),
            emiPayments: emiPayments.map(e => ({ date: e.date, amount: e.amount }))
        };

        console.log('[RegenerateLedger] Calculating ledger with data:', JSON.stringify(loanData, null, 2));

        const ledger = calculateLedger(loanData);
        console.log(`[RegenerateLedger] Generated ${ledger.length} ledger entries`);

        // Clear existing ledger
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.LOAN_LEDGER} WHERE loanId = ?`, [loanId]);

        // Insert new ledger entries
        for (const entry of ledger) {
            await db.executeSql(
                `INSERT INTO ${TABLE_NAMES.LOAN_LEDGER} 
                 (id, loanId, month, openingPrincipal, emiPaid, interestPaid, principalPaid, prepayment, closingPrincipal, roi) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuidv4(),
                    loanId,
                    entry.month,
                    entry.openingPrincipal,
                    entry.emiPaid,
                    entry.interestPaid,
                    entry.principalPaid,
                    entry.prepayment,
                    entry.closingPrincipal,
                    entry.roi
                ]
            );
        }
    },

    async getLedger(loanId: string): Promise<LedgerEntry[]> {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_NAMES.LOAN_LEDGER} WHERE loanId = ? ORDER BY month ASC`,
            [loanId]
        );

        const ledger: LedgerEntry[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            ledger.push({
                month: row.month,
                openingPrincipal: row.openingPrincipal,
                emiPaid: row.emiPaid,
                interestPaid: row.interestPaid,
                principalPaid: row.principalPaid,
                prepayment: row.prepayment,
                closingPrincipal: row.closingPrincipal,
                roi: row.roi
            });
        }
        return ledger;
    },

    async getSummary(loanId: string) {
        const loan = await this.getLoan(loanId);
        if (!loan) return null;

        const ledger = await this.getLedger(loanId);
        const metrics = calculateMetrics(ledger, loan.initialPrincipal);

        return {
            loan,
            metrics,
            ledgerEntryCount: ledger.length
        };
    }
};
