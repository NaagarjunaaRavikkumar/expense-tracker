import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FAB, Card, Text, useTheme, IconButton, Portal, Dialog, Button, Chip, SegmentedButtons } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSubcategoryStore } from '../../store/useSubcategoryStore';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type DateFilter = 'all' | 'week' | 'month' | 'year' | 'custom';

export const ExpenseDashboard = ({ navigation }: any) => {
    const { transactions, deleteTransaction } = useExpenseStore();
    const { accounts } = useAccountStore();
    const { incomeCategories, expenseCategories } = useCategoryStore();
    const { subcategories } = useSubcategoryStore();
    const theme = useTheme();
    const { currency } = useSettingsStore();

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [customDateDialogVisible, setCustomDateDialogVisible] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const allCategories = [...incomeCategories, ...expenseCategories];

    // Filter transactions by date range
    const getFilteredTransactions = () => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (dateFilter) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'custom':
                startDate = customStartDate;
                endDate = customEndDate;
                break;
            default:
                return transactions;
        }

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    };

    const applyCustomDateRange = () => {
        setDateFilter('custom');
        setCustomDateDialogVisible(false);
    };

    const filteredTransactions = getFilteredTransactions();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const handleDeletePress = (transactionId: string) => {
        setTransactionToDelete(transactionId);
        setDeleteDialogVisible(true);
    };

    const confirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete);
        }
        setDeleteDialogVisible(false);
        setTransactionToDelete(null);
    };

    const getRelativeDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const renderTransaction = ({ item }: any) => {
        // Handle transfer transactions with default icon and name
        let category;
        let categoryName;
        let categoryIcon;
        let categoryColor;

        if (item.type === 'transfer') {
            categoryName = 'Transfer';
            categoryIcon = 'bank-transfer';
            categoryColor = '#9C27B0';
        } else {
            category = allCategories.find(cat => cat.id === item.categoryId);
            categoryName = category?.name || 'Unknown';
            categoryIcon = category?.icon || 'help';
            categoryColor = category?.color || '#9E9E9E';
        }

        // Get subcategory if exists
        const subcategory = item.subcategoryId ? subcategories.find(sub => sub.id === item.subcategoryId) : null;
        const subcategoryName = subcategory?.name;

        const account = accounts.find(acc => acc.id === item.accountId);
        const toAccount = accounts.find(acc => acc.id === item.toAccountId);

        return (
            <Card style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.transactionContent}>
                    <View style={styles.transactionLeft}>
                        {/* Category Icon */}
                        <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                            <Icon name={categoryIcon} size={24} color="#FFFFFF" />
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.transactionDetails}>
                            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                                {categoryName}{subcategoryName ? ` • ${subcategoryName}` : ''}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {item.type === 'transfer'
                                    ? `${account?.name || 'Unknown'} → ${toAccount?.name || 'Unknown'}`
                                    : account?.name || 'Unknown Account'}
                            </Text>
                            {item.notes && (
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                                    "{item.notes}"
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Amount and Date */}
                    <View style={styles.transactionRight}>
                        <Text
                            variant="titleMedium"
                            style={{
                                fontWeight: 'bold',
                                color: item.type === 'expense' ? theme.colors.error :
                                    item.type === 'income' ? '#4CAF50' :
                                        theme.colors.primary
                            }}
                        >
                            {item.type === 'expense' ? '-' : item.type === 'income' ? '+' : ''}{formatCurrency(item.amount, currency)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                            {getRelativeDate(item.date)}
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <IconButton
                                icon="pencil"
                                size={18}
                                onPress={() => navigation.navigate('EditTransaction', { transactionId: item.id })}
                                style={styles.actionButton}
                            />
                            <IconButton
                                icon="delete"
                                size={18}
                                iconColor={theme.colors.error}
                                onPress={() => handleDeletePress(item.id)}
                                style={styles.actionButton}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Expenses" navigation={navigation} />

            {/* Account Balances Section */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.accountsScroll}
                contentContainerStyle={styles.accountsContent}
            >
                {/* Total Balance Card */}
                <Card style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onPrimary, opacity: 0.9 }}>
                            Total Balance
                        </Text>
                        <Text variant="headlineMedium" style={{ color: theme.colors.onPrimary, fontWeight: 'bold', marginTop: 4 }}>
                            {formatCurrency(totalBalance, currency)}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Individual Account Cards */}
                {accounts.map((account) => (
                    <Card
                        key={account.id}
                        style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}
                    >
                        <Card.Content>
                            <View style={styles.accountHeader}>
                                <View style={[styles.accountIconSmall, { backgroundColor: account.color }]}>
                                    <Icon name={account.icon} size={16} color="#FFFFFF" />
                                </View>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                                    {account.name}
                                </Text>
                            </View>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 8 }}>
                                {formatCurrency(account.balance, account.currency)}
                            </Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>

            {/* Date Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                    <Chip
                        selected={dateFilter === 'all'}
                        onPress={() => setDateFilter('all')}
                        style={styles.chip}
                        mode={dateFilter === 'all' ? 'flat' : 'outlined'}
                    >
                        All Time
                    </Chip>
                    <Chip
                        selected={dateFilter === 'week'}
                        onPress={() => setDateFilter('week')}
                        style={styles.chip}
                        mode={dateFilter === 'week' ? 'flat' : 'outlined'}
                    >
                        Last Week
                    </Chip>
                    <Chip
                        selected={dateFilter === 'month'}
                        onPress={() => setDateFilter('month')}
                        style={styles.chip}
                        mode={dateFilter === 'month' ? 'flat' : 'outlined'}
                    >
                        Last Month
                    </Chip>
                    <Chip
                        selected={dateFilter === 'year'}
                        onPress={() => setDateFilter('year')}
                        style={styles.chip}
                        mode={dateFilter === 'year' ? 'flat' : 'outlined'}
                    >
                        Last Year
                    </Chip>
                    <Chip
                        selected={dateFilter === 'custom'}
                        onPress={() => setCustomDateDialogVisible(true)}
                        style={styles.chip}
                        mode={dateFilter === 'custom' ? 'flat' : 'outlined'}
                        icon="calendar-range"
                    >
                        Custom
                    </Chip>
                </ScrollView>
            </View>

            {/* Transactions List */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="receipt-text-outline" size={64} color={theme.colors.onSurfaceVariant} />
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                            No transactions {dateFilter !== 'all' ? `in the selected period` : 'yet'}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            {dateFilter !== 'all' ? 'Try selecting a different time period' : 'Tap + to add your first transaction'}
                        </Text>
                    </View>
                }
            />

            {/* Add Transaction FAB */}
            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => navigation.navigate('AddTransaction')}
            />

            {/* Custom Date Range Dialog */}
            <Portal>
                <Dialog visible={customDateDialogVisible} onDismiss={() => setCustomDateDialogVisible(false)}>
                    <Dialog.Title>Select Date Range</Dialog.Title>
                    <Dialog.Content>
                        <Button
                            mode="outlined"
                            onPress={() => setShowStartPicker(true)}
                            style={{ marginBottom: 12 }}
                        >
                            Start: {customStartDate.toISOString().split('T')[0]}
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => setShowEndPicker(true)}
                        >
                            End: {customEndDate.toISOString().split('T')[0]}
                        </Button>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setCustomDateDialogVisible(false)}>Cancel</Button>
                        <Button onPress={applyCustomDateRange}>Apply</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Transaction</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Are you sure you want to delete this transaction? This action cannot be undone.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button onPress={confirmDelete} textColor={theme.colors.error}>Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Date Pickers - Outside Portal */}
            <DatePicker
                modal
                open={showStartPicker}
                date={customStartDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowStartPicker(false);
                    setCustomStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
            />

            <DatePicker
                modal
                open={showEndPicker}
                date={customEndDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowEndPicker(false);
                    setCustomEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    accountsScroll: {
        maxHeight: 140,
        flexGrow: 0,
        flexShrink: 0,
    },
    accountsContent: {
        padding: 16,
        gap: 12,
    },
    balanceCard: {
        width: 200,
        elevation: 4,
    },
    accountCard: {
        width: 160,
        elevation: 2,
    },
    accountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountIconSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterChips: {
        gap: 8,
    },
    chip: {
        marginRight: 8,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 80,
        paddingTop: 8,
    },
    transactionCard: {
        marginBottom: 12,
        elevation: 1,
    },
    transactionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    transactionLeft: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    transactionRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 4,
    },
    actionButton: {
        margin: 0,
        padding: 0,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
});
