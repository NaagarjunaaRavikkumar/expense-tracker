import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { TopExpense } from '../../utils/analyticsUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';

interface TopExpensesWidgetProps {
    data: TopExpense[];
}

export const TopExpensesWidget = ({ data }: TopExpensesWidgetProps) => {
    const theme = useTheme();
    const { currency } = useSettingsStore();

    if (data.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 12 }}>Top 5 Expenses</Text>
                    <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onSurfaceVariant }}>
                        No expenses to display
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    const maxAmount = Math.max(...data.map(e => e.amount));

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Top 5 Expenses</Text>

                {data.map((expense, index) => (
                    <View key={expense.id} style={styles.expenseItem}>
                        <View style={styles.expenseHeader}>
                            <View style={styles.expenseInfo}>
                                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                                    {expense.description}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {expense.categoryName}
                                </Text>
                            </View>
                            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                {formatCurrency(expense.amount, currency)}
                            </Text>
                        </View>

                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        width: `${(expense.amount / maxAmount) * 100}%`,
                                        backgroundColor: expense.categoryColor,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    expenseItem: {
        marginBottom: 16,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    expenseInfo: {
        flex: 1,
    },
    barContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 4,
    },
});
