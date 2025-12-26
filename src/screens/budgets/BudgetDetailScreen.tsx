import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Text, useTheme, Button, IconButton } from 'react-native-paper';
import { BudgetProgressCircle } from '../../components/budgets/BudgetProgressCircle';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { calculateBudgetProgress, getIncludedTransactions } from '../../utils/budgetUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const BudgetDetailScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const { budgetId } = route.params;
    const { getBudgetById, deleteBudget } = useBudgetStore();
    const { transactions } = useExpenseStore();
    const { expenseCategories } = useCategoryStore();
    const { accounts } = useAccountStore();
    const { currency } = useSettingsStore();

    const budget = getBudgetById(budgetId);

    if (!budget) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text>Budget not found</Text>
            </View>
        );
    }

    const progress = calculateBudgetProgress(transactions, budget);
    const includedTransactions = getIncludedTransactions(transactions, budget);

    const handleDelete = () => {
        deleteBudget(budgetId);
        navigation.goBack();
    };

    const getCategoryName = (categoryId: string) => {
        const category = expenseCategories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };

    const getAccountName = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        return account?.name || 'Unknown';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView>
                {/* Budget Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <View style={[styles.colorDot, { backgroundColor: budget.color }]} />
                                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                                    {budget.name}
                                </Text>
                            </View>
                            <View style={styles.actions}>
                                <IconButton
                                    icon="pencil"
                                    size={24}
                                    onPress={() => navigation.navigate('EditBudget', { budgetId })}
                                />
                                <IconButton
                                    icon="delete"
                                    size={24}
                                    iconColor={theme.colors.error}
                                    onPress={handleDelete}
                                />
                            </View>
                        </View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {budget.startDate} to {budget.endDate}
                        </Text>
                        {budget.description && (
                            <Text variant="bodyMedium" style={{ marginTop: 8, fontStyle: 'italic' }}>
                                {budget.description}
                            </Text>
                        )}
                    </Card.Content>
                </Card>

                {/* Progress Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.progressContainer}>
                            <BudgetProgressCircle percentage={progress.percentage} />
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Budget
                                    </Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        {formatCurrency(budget.amount, currency)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Spent
                                    </Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                        {formatCurrency(progress.spent, currency)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Remaining
                                    </Text>
                                    <Text
                                        variant="titleMedium"
                                        style={{
                                            fontWeight: 'bold',
                                            color: progress.isOverBudget ? theme.colors.error : theme.colors.primary,
                                        }}
                                    >
                                        {formatCurrency(progress.remaining, currency)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Tracked Categories */}
                {budget.categoryIds.length > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                                Tracked Categories
                            </Text>
                            <View style={styles.categoryList}>
                                {budget.categoryIds.map(catId => {
                                    const category = expenseCategories.find(c => c.id === catId);
                                    return category ? (
                                        <View key={catId} style={styles.categoryItem}>
                                            <Icon name={category.icon} size={20} color={category.color} />
                                            <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                                                {category.name}
                                            </Text>
                                        </View>
                                    ) : null;
                                })}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Transactions */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                            Transactions ({includedTransactions.length})
                        </Text>
                        {includedTransactions.length === 0 ? (
                            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 16 }}>
                                No transactions in this budget period
                            </Text>
                        ) : (
                            includedTransactions.map(transaction => (
                                <View key={transaction.id} style={styles.transactionItem}>
                                    <View style={styles.transactionInfo}>
                                        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                                            {getCategoryName(transaction.categoryId)}
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            {transaction.date} • {getAccountName(transaction.accountId)}
                                        </Text>
                                    </View>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                        {formatCurrency(transaction.amount, currency)}
                                    </Text>
                                </View>
                            ))
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
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    actions: {
        flexDirection: 'row',
    },
    progressContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    categoryList: {
        gap: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    transactionInfo: {
        flex: 1,
    },
});
