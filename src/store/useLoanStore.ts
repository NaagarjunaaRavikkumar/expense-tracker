import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Loan, VariableRate, PrePayment } from '../types';
import { mmkvStorage } from '../storage/mmkv';
import { v4 as uuidv4 } from 'uuid';

interface LoanState {
    loans: Loan[];
    addLoan: (loan: Omit<Loan, 'id'>) => void;
    updateLoan: (id: string, updates: Partial<Loan>) => void;
    deleteLoan: (id: string) => void;
    addVariableRate: (loanId: string, rate: Omit<VariableRate, 'id'>) => void;
    addPrePayment: (loanId: string, payment: Omit<PrePayment, 'id'>) => void;
}

export const useLoanStore = create<LoanState>()(
    persist(
        (set) => ({
            loans: [],
            addLoan: (loanData) => set((state) => ({
                loans: [...state.loans, {
                    ...loanData,
                    id: uuidv4(),
                    variableRates: loanData.variableRates || [],
                    prePayments: loanData.prePayments || []
                }]
            })),
            updateLoan: (id, updates) => set((state) => ({
                loans: state.loans.map((loan) =>
                    loan.id === id ? { ...loan, ...updates } : loan
                )
            })),
            deleteLoan: (id) => set((state) => ({
                loans: state.loans.filter((loan) => loan.id !== id)
            })),
            addVariableRate: (loanId, rateData) => set((state) => ({
                loans: state.loans.map((loan) =>
                    loan.id === loanId
                        ? { ...loan, variableRates: [...loan.variableRates, { ...rateData, id: uuidv4() }] }
                        : loan
                )
            })),
            addPrePayment: (loanId, paymentData) => set((state) => ({
                loans: state.loans.map((loan) =>
                    loan.id === loanId
                        ? { ...loan, prePayments: [...loan.prePayments, { ...paymentData, id: uuidv4() }] }
                        : loan
                )
            })),
        }),
        {
            name: 'loan-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
