import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { CashFlowData } from '../../utils/analyticsUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CashFlowWidgetProps {
    data: CashFlowData;
}

export const CashFlowWidget = ({ data }: CashFlowWidgetProps) => {
    const theme = useTheme();
    const { currency } = useSettingsStore();

    const barData = [
        {
            value: data.income,
            label: 'Income',
            frontColor: '#4CAF50',
        },
        {
            value: data.expenses,
            label: 'Expenses',
            frontColor: '#FF6B6B',
        },
    ];

    const isPositive = data.netSavings >= 0;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Cash Flow</Text>

                <View style={styles.chartContainer}>
                    <BarChart
                        data={barData}
                        width={250}
                        height={180}
                        barWidth={60}
                        spacing={40}
                        roundedTop
                        roundedBottom
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
                        noOfSections={4}
                    />
                </View>

                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: isPositive ? '#4CAF5020' : '#FF6B6B20' }]}>
                        <View style={styles.summaryHeader}>
                            <Icon
                                name={isPositive ? 'trending-up' : 'trending-down'}
                                size={24}
                                color={isPositive ? '#4CAF50' : '#FF6B6B'}
                            />
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                                Net Savings
                            </Text>
                        </View>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: isPositive ? '#4CAF50' : '#FF6B6B' }}>
                            {formatCurrency(Math.abs(data.netSavings), currency)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {isPositive ? 'Surplus' : 'Deficit'} • {Math.abs(data.savingsRate).toFixed(1)}%
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    summaryContainer: {
        marginTop: 16,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 12,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
});
