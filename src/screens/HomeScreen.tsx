import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { CustomHeader } from '../components/ui/CustomHeader';
import { useUserStore } from '../store/useUserStore';
import { useAccountStore } from '../store/useAccountStore';
import { useExpenseStore } from '../store/useExpenseStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSubcategoryStore } from '../store/useSubcategoryStore';
import { useGoalStore } from '../store/useGoalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatCurrency } from '../utils/currency';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Analytics Components
import { DateFilterBar } from '../components/analytics/DateFilterBar';
import { ExpensesByCategoryChart } from '../components/analytics/ExpensesByCategoryChart';
import { TopExpensesWidget } from '../components/analytics/TopExpensesWidget';
import { BalanceTrendChart } from '../components/analytics/BalanceTrendChart';
import { CashFlowWidget } from '../components/analytics/CashFlowWidget';
import { CashFlowTrendChart } from '../components/analytics/CashFlowTrendChart';

// Analytics Utils
import {
    DateFilterType,
    DateRange,
    getDateRangeForFilter,
    filterTransactionsByDateRange,
    calculateExpensesByCategory,
    getTopExpenses,
    calculateBalanceTrend,
    calculateCashFlow,
    calculateCashFlowTrend,
} from '../utils/analyticsUtils';

export const HomeScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { profile } = useUserStore();
    const { accounts } = useAccountStore();
    const { transactions } = useExpenseStore();
    const { incomeCategories, expenseCategories } = useCategoryStore();
    const { subcategories } = useSubcategoryStore();
    const { goals } = useGoalStore();
    const { currency } = useSettingsStore();

    // Date Filter State
    const [selectedFilter, setSelectedFilter] = useState<DateFilterType>('month');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

    // Calculate date range
    const dateRange = useMemo(() => {
        return getDateRangeForFilter(selectedFilter, customDateRange);
    }, [selectedFilter, customDateRange]);

    // Filter transactions by date range
    const filteredTransactions = useMemo(() => {
        return filterTransactionsByDateRange(transactions, dateRange);
    }, [transactions, dateRange]);

    // Calculate analytics data
    const allCategories = [...incomeCategories, ...expenseCategories];

    const expensesByCategory = useMemo(() => {
        return calculateExpensesByCategory(filteredTransactions, allCategories);
    }, [filteredTransactions, allCategories]);

    const topExpenses = useMemo(() => {
        return getTopExpenses(filteredTransactions, allCategories, 5);
    }, [filteredTransactions, allCategories]);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const balanceTrend = useMemo(() => {
        return calculateBalanceTrend(filteredTransactions, dateRange, totalBalance);
    }, [filteredTransactions, dateRange, totalBalance]);

    const cashFlow = useMemo(() => {
        return calculateCashFlow(filteredTransactions);
    }, [filteredTransactions]);

    const cashFlowTrend = useMemo(() => {
        return calculateCashFlowTrend(filteredTransactions, dateRange, selectedFilter);
    }, [filteredTransactions, dateRange, selectedFilter]);

    // Calculate totals for quick stats
    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const trend = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Get recent transactions (last 5)
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
        .slice(0, 5);

    const getRelativeTime = (dateString: string, timeString: string) => {
        const date = new Date(dateString + ' ' + timeString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const handleFilterChange = (filter: DateFilterType, customRange?: DateRange) => {
        setSelectedFilter(filter);
        if (customRange) {
            setCustomDateRange(customRange);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="FinTrack" navigation={navigation} />

            <ScrollView style={styles.content}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        Hello, {profile.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Welcome back to your dashboard
                    </Text>
                </View>

                {/* Total Balance Card */}
                <Card style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onPrimary, opacity: 0.9 }}>
                            Total Balance
                        </Text>
                        <Text variant="displaySmall" style={{ color: theme.colors.onPrimary, fontWeight: 'bold', marginTop: 8 }}>
                            {formatCurrency(totalBalance, 'INR')}
                        </Text>
                        {trend !== 0 && (
                            <View style={styles.trendContainer}>
                                <Icon
                                    name={trend > 0 ? 'trending-up' : 'trending-down'}
                                    size={16}
                                    color={theme.colors.onPrimary}
                                />
                                <Text variant="bodySmall" style={{ color: theme.colors.onPrimary, marginLeft: 4 }}>
                                    {trend > 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses, 'INR')} ({trend.toFixed(1)}%)
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Date Filter */}
                <DateFilterBar
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                />

                {/* Analytics Widgets */}
                <CashFlowWidget data={cashFlow} />
                <ExpensesByCategoryChart data={expensesByCategory} />
                <BalanceTrendChart data={balanceTrend.trend} changePercentage={balanceTrend.changePercentage} />
                <CashFlowTrendChart data={cashFlowTrend} />
                <TopExpensesWidget data={topExpenses} />

                {/* Recent Transactions */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleMedium">Recent Transactions</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
                                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                                    See All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {recentTransactions.length === 0 ? (
                            <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onSurfaceVariant }}>
                                No transactions yet
                            </Text>
                        ) : (
                            recentTransactions.map((transaction) => {
                                const category = allCategories.find(c => c.id === transaction.categoryId);
                                const subcategory = transaction.subcategoryId ? subcategories.find(s => s.id === transaction.subcategoryId) : null;
                                const isTransfer = transaction.type === 'transfer';
                                const account = accounts.find(a => a.id === transaction.accountId);
                                const toAccount = transaction.toAccountId ? accounts.find(a => a.id === transaction.toAccountId) : null;

                                return (
                                    <View key={transaction.id} style={styles.transactionItem}>
                                        <View style={[
                                            styles.transactionIcon,
                                            {
                                                backgroundColor: isTransfer
                                                    ? '#9C27B020'
                                                    : transaction.type === 'income'
                                                        ? '#4CAF5020'
                                                        : '#F4433620'
                                            }
                                        ]}>
                                            <Icon
                                                name={isTransfer ? 'bank-transfer' : (category?.icon || 'help')}
                                                size={20}
                                                color={isTransfer ? '#9C27B0' : (transaction.type === 'income' ? '#4CAF50' : '#F44336')}
                                            />
                                        </View>
                                        <View style={styles.transactionDetails}>
                                            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                                                {isTransfer ? 'Transfer' : (category?.name || 'Unknown')}{subcategory ? ` • ${subcategory.name}` : ''}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                {isTransfer && toAccount
                                                    ? `${account?.name} → ${toAccount.name}`
                                                    : getRelativeTime(transaction.date, transaction.time)
                                                }
                                            </Text>
                                        </View>
                                        <Text
                                            variant="titleMedium"
                                            style={{
                                                fontWeight: 'bold',
                                                color: isTransfer
                                                    ? '#9C27B0'
                                                    : transaction.type === 'income'
                                                        ? '#4CAF50'
                                                        : '#FF6B6B'
                                            }}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, 'INR')}
                                        </Text>
                                    </View>
                                );
                            })
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    welcomeSection: {
        padding: 16,
    },
    balanceCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        elevation: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
});
