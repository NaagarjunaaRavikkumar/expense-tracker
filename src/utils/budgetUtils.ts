import { Transaction } from '../types';
import { Budget, BudgetProgress } from '../types/budgetTypes';
import { parseISO, isWithinInterval } from 'date-fns';

/**
 * Get transactions that are included in a budget
 */
export const getIncludedTransactions = (
    transactions: Transaction[],
    budget: Budget
): Transaction[] => {
    const startDate = parseISO(budget.startDate);
    const endDate = parseISO(budget.endDate);

    return transactions.filter(transaction => {
        // Only include expenses (not income or transfers)
        if (transaction.type !== 'expense') {
            return false;
        }

        // Check if transaction date is within budget period
        const transactionDate = parseISO(transaction.date);
        if (!isWithinInterval(transactionDate, { start: startDate, end: endDate })) {
            return false;
        }

        // Check if transaction category is in budget's tracked categories
        // If no categories selected, include all
        if (budget.categoryIds.length === 0) {
            return true;
        }

        return budget.categoryIds.includes(transaction.categoryId);
    });
};

/**
 * Calculate budget progress
 */
export const calculateBudgetProgress = (
    transactions: Transaction[],
    budget: Budget
): BudgetProgress => {
    const includedTransactions = getIncludedTransactions(transactions, budget);
    const spent = includedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isOverBudget = spent > budget.amount;

    return {
        budgetId: budget.id,
        spent,
        remaining,
        percentage,
        isOverBudget,
    };
};

/**
 * Check if a budget is currently active (current date is within budget period)
 */
export const isBudgetActive = (budget: Budget): boolean => {
    const now = new Date();
    const startDate = parseISO(budget.startDate);
    const endDate = parseISO(budget.endDate);

    return isWithinInterval(now, { start: startDate, end: endDate });
};

/**
 * Get color for progress based on percentage
 */
export const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return '#4CAF50'; // Green
    if (percentage < 75) return '#FFA726'; // Orange
    if (percentage < 100) return '#FF9800'; // Dark Orange
    return '#F44336'; // Red
};
