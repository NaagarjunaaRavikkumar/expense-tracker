import { Transaction } from '../types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns';

export type DateFilterType = 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
    start: Date;
    end: Date;
}

export const getDateRangeForFilter = (filterType: DateFilterType, customRange?: DateRange): DateRange => {
    const now = new Date();

    switch (filterType) {
        case 'week':
            return {
                start: startOfWeek(now, { weekStartsOn: 1 }),
                end: endOfWeek(now, { weekStartsOn: 1 })
            };
        case 'month':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now)
            };
        case 'year':
            return {
                start: startOfYear(now),
                end: endOfYear(now)
            };
        case 'custom':
            return customRange || { start: startOfMonth(now), end: endOfMonth(now) };
        default:
            return {
                start: startOfMonth(now),
                end: endOfMonth(now)
            };
    }
};

export const filterTransactionsByDateRange = (transactions: Transaction[], dateRange: DateRange): Transaction[] => {
    return transactions.filter(t => {
        const transactionDate = parseISO(t.date);
        return isWithinInterval(transactionDate, { start: dateRange.start, end: dateRange.end });
    });
};

export interface CategoryExpense {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    color: string;
}

export const calculateExpensesByCategory = (
    transactions: Transaction[],
    categories: any[]
): CategoryExpense[] => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();

    expenses.forEach(t => {
        const current = categoryMap.get(t.categoryId) || 0;
        categoryMap.set(t.categoryId, current + t.amount);
    });

    const result: CategoryExpense[] = [];
    categoryMap.forEach((amount, categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            result.push({
                categoryId,
                categoryName: category.name,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0,
                color: category.color || '#6200ee'
            });
        }
    });

    return result.sort((a, b) => b.amount - a.amount);
};

export interface TopExpense {
    id: string;
    description: string;
    categoryName: string;
    amount: number;
    date: string;
    categoryColor: string;
}

export const getTopExpenses = (
    transactions: Transaction[],
    categories: any[],
    limit: number = 5
): TopExpense[] => {
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit);

    return expenses.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
            id: t.id,
            description: t.notes || 'Expense',
            categoryName: category?.name || 'Unknown',
            amount: t.amount,
            date: t.date,
            categoryColor: category?.color || '#6200ee'
        };
    });
};

export interface BalanceTrendPoint {
    date: string;
    balance: number;
    label: string;
}

export const calculateBalanceTrend = (
    transactions: Transaction[],
    dateRange: DateRange,
    initialBalance: number
): { trend: BalanceTrendPoint[], changePercentage: number } => {
    const sortedTransactions = [...transactions].sort((a, b) =>
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    const trend: BalanceTrendPoint[] = [];
    let currentBalance = initialBalance;

    days.forEach(day => {
        const dayTransactions = sortedTransactions.filter(t =>
            format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );

        dayTransactions.forEach(t => {
            if (t.type === 'income') {
                currentBalance += t.amount;
            } else if (t.type === 'expense') {
                currentBalance -= t.amount;
            }
        });

        trend.push({
            date: format(day, 'yyyy-MM-dd'),
            balance: currentBalance,
            label: format(day, 'dd MMM')
        });
    });

    const changePercentage = initialBalance > 0
        ? ((currentBalance - initialBalance) / initialBalance) * 100
        : 0;

    return { trend, changePercentage };
};

export interface CashFlowData {
    income: number;
    expenses: number;
    netSavings: number;
    savingsRate: number;
}

export const calculateCashFlow = (transactions: Transaction[]): CashFlowData => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

    return { income, expenses, netSavings, savingsRate };
};

export interface CashFlowTrendPoint {
    period: string;
    income: number;
    expenses: number;
    savings: number;
}

export const calculateCashFlowTrend = (
    transactions: Transaction[],
    dateRange: DateRange,
    filterType: DateFilterType
): CashFlowTrendPoint[] => {
    let periods: Date[] = [];
    let formatString = '';

    switch (filterType) {
        case 'week':
            periods = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
            formatString = 'EEE';
            break;
        case 'month':
            periods = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end });
            formatString = 'MMM dd';
            break;
        case 'year':
            periods = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
            formatString = 'MMM';
            break;
        default:
            periods = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
            formatString = 'MMM dd';
    }

    return periods.map(period => {
        const periodTransactions = transactions.filter(t => {
            const tDate = parseISO(t.date);
            if (filterType === 'month') {
                return isWithinInterval(tDate, {
                    start: period,
                    end: endOfWeek(period, { weekStartsOn: 1 })
                });
            } else if (filterType === 'year') {
                return isWithinInterval(tDate, {
                    start: startOfMonth(period),
                    end: endOfMonth(period)
                });
            } else {
                return format(tDate, 'yyyy-MM-dd') === format(period, 'yyyy-MM-dd');
            }
        });

        const income = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            period: format(period, formatString),
            income,
            expenses,
            savings: income - expenses
        };
    });
};
