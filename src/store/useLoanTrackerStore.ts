import { create } from 'zustand';
import { LoanTrackerRepository, LoanTracker, LoanROI, LoanPrepayment, LoanEMIPayment } from '../database/repositories/LoanTrackerRepository';
import { LedgerEntry } from '../services/loanTracker/ledgerEngine';

interface LoanTrackerState {
    loans: LoanTracker[];
    selectedLoan: LoanTracker | null;
    selectedLoanLedger: LedgerEntry[];
    selectedLoanROI: LoanROI[];
    selectedLoanPrepayments: LoanPrepayment[];
    selectedLoanEMIPayments: LoanEMIPayment[];
    isLoading: boolean;

    // Actions
    loadLoans: () => Promise<void>;
    selectLoan: (loanId: string) => Promise<void>;
    createLoan: (loan: Omit<LoanTracker, 'id' | 'createdAt'>) => Promise<string>;
    updateLoan: (id: string, updates: Partial<Omit<LoanTracker, 'id' | 'createdAt'>>) => Promise<void>;
    deleteLoan: (id: string) => Promise<void>;

    addROI: (roi: Omit<LoanROI, 'id'>) => Promise<void>;
    deleteROI: (id: string, loanId: string) => Promise<void>;

    addPrepayment: (prepayment: Omit<LoanPrepayment, 'id'>) => Promise<void>;
    deletePrepayment: (id: string, loanId: string) => Promise<void>;

    addEMIPayment: (payment: Omit<LoanEMIPayment, 'id'>) => Promise<void>;
    deleteEMIPayment: (id: string, loanId: string) => Promise<void>;

    refreshSelectedLoan: () => Promise<void>;
}

export const useLoanTrackerStore = create<LoanTrackerState>((set, get) => ({
    loans: [],
    selectedLoan: null,
    selectedLoanLedger: [],
    selectedLoanROI: [],
    selectedLoanPrepayments: [],
    selectedLoanEMIPayments: [],
    isLoading: false,

    loadLoans: async () => {
        set({ isLoading: true });
        try {
            const loans = await LoanTrackerRepository.getAllLoans();
            set({ loans, isLoading: false });
        } catch (error) {
            console.error('Failed to load loans:', error);
            set({ isLoading: false });
        }
    },

    selectLoan: async (loanId: string) => {
        set({ isLoading: true });
        try {
            const loan = await LoanTrackerRepository.getLoan(loanId);
            const ledger = await LoanTrackerRepository.getLedger(loanId);
            const roi = await LoanTrackerRepository.getROIHistory(loanId);
            const prepayments = await LoanTrackerRepository.getPrepayments(loanId);
            const emiPayments = await LoanTrackerRepository.getEMIPayments(loanId);

            set({
                selectedLoan: loan,
                selectedLoanLedger: ledger,
                selectedLoanROI: roi,
                selectedLoanPrepayments: prepayments,
                selectedLoanEMIPayments: emiPayments,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to select loan:', error);
            set({ isLoading: false });
        }
    },

    createLoan: async (loan) => {
        try {
            const id = await LoanTrackerRepository.createLoan(loan);
            await get().loadLoans();
            return id;
        } catch (error) {
            console.error('Failed to create loan:', error);
            throw error;
        }
    },

    updateLoan: async (id, updates) => {
        try {
            await LoanTrackerRepository.updateLoan(id, updates);
            await get().loadLoans();

            // Refresh selected loan if it's the one being updated
            if (get().selectedLoan?.id === id) {
                await get().selectLoan(id);
            }
        } catch (error) {
            console.error('Failed to update loan:', error);
            throw error;
        }
    },

    deleteLoan: async (id) => {
        try {
            await LoanTrackerRepository.deleteLoan(id);
            await get().loadLoans();

            // Clear selected loan if it was deleted
            if (get().selectedLoan?.id === id) {
                set({ selectedLoan: null, selectedLoanLedger: [], selectedLoanROI: [], selectedLoanPrepayments: [] });
            }
        } catch (error) {
            console.error('Failed to delete loan:', error);
            throw error;
        }
    },

    addROI: async (roi) => {
        try {
            await LoanTrackerRepository.addROI(roi);

            // Refresh selected loan data
            if (get().selectedLoan?.id === roi.loanId) {
                await get().selectLoan(roi.loanId);
            }
        } catch (error) {
            console.error('Failed to add ROI:', error);
            throw error;
        }
    },

    deleteROI: async (id, loanId) => {
        try {
            await LoanTrackerRepository.deleteROI(id, loanId);

            // Refresh selected loan data
            if (get().selectedLoan?.id === loanId) {
                await get().selectLoan(loanId);
            }
        } catch (error) {
            console.error('Failed to delete ROI:', error);
            throw error;
        }
    },

    addPrepayment: async (prepayment) => {
        try {
            await LoanTrackerRepository.addPrepayment(prepayment);

            // Refresh selected loan data
            if (get().selectedLoan?.id === prepayment.loanId) {
                await get().selectLoan(prepayment.loanId);
            }
        } catch (error) {
            console.error('Failed to add prepayment:', error);
            throw error;
        }
    },

    deletePrepayment: async (id, loanId) => {
        try {
            await LoanTrackerRepository.deletePrepayment(id, loanId);

            // Refresh selected loan data
            if (get().selectedLoan?.id === loanId) {
                await get().selectLoan(loanId);
            }
        } catch (error) {
            console.error('Failed to delete prepayment:', error);
            throw error;
        }
    },

    addEMIPayment: async (payment) => {
        try {
            await LoanTrackerRepository.addEMIPayment(payment);

            // Refresh selected loan data
            if (get().selectedLoan?.id === payment.loanId) {
                await get().selectLoan(payment.loanId);
            }
        } catch (error) {
            console.error('Failed to add EMI payment:', error);
            throw error;
        }
    },

    deleteEMIPayment: async (id, loanId) => {
        try {
            await LoanTrackerRepository.deleteEMIPayment(id, loanId);

            // Refresh selected loan data
            if (get().selectedLoan?.id === loanId) {
                await get().selectLoan(loanId);
            }
        } catch (error) {
            console.error('Failed to delete EMI payment:', error);
            throw error;
        }
    },

    refreshSelectedLoan: async () => {
        const selectedLoanId = get().selectedLoan?.id;
        if (selectedLoanId) {
            await get().selectLoan(selectedLoanId);
        }
    }
}));
