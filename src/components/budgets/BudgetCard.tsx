import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { Budget, BudgetProgress } from '../../types/budgetTypes';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getProgressColor } from '../../utils/budgetUtils';

interface BudgetCardProps {
    budget: Budget;
    progress: BudgetProgress;
    onPress: () => void;
    onLongPress?: () => void;
}

export const BudgetCard = ({ budget, progress, onPress, onLongPress }: BudgetCardProps) => {
    const theme = useTheme();
    const { currency } = useSettingsStore();

    const progressColor = getProgressColor(progress.percentage);

    return (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View style={[styles.colorDot, { backgroundColor: budget.color }]} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                {budget.name}
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {budget.startDate} - {budget.endDate}
                        </Text>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.amountRow}>
                            <Text variant="bodyMedium" style={{ color: progressColor, fontWeight: 'bold' }}>
                                {formatCurrency(progress.spent, currency)}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                of {formatCurrency(budget.amount, currency)}
                            </Text>
                        </View>
                        <ProgressBar
                            progress={Math.min(progress.percentage / 100, 1)}
                            color={progressColor}
                            style={styles.progressBar}
                        />
                        <View style={styles.statsRow}>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {progress.percentage.toFixed(1)}% used
                            </Text>
                            <Text
                                variant="bodySmall"
                                style={{
                                    color: progress.isOverBudget ? theme.colors.error : theme.colors.primary,
                                    fontWeight: 'bold',
                                }}
                            >
                                {progress.isOverBudget ? 'Over' : 'Remaining'}: {formatCurrency(Math.abs(progress.remaining), currency)}
                            </Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    progressSection: {
        marginTop: 8,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
});
