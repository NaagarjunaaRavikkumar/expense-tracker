import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { PieChart } from 'react-native-gifted-charts';
import { CategoryExpense } from '../../utils/analyticsUtils';

interface ExpensesByCategoryChartProps {
    data: CategoryExpense[];
}

export const ExpensesByCategoryChart = ({ data }: ExpensesByCategoryChartProps) => {
    const theme = useTheme();

    if (data.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 12 }}>Expenses by Category</Text>
                    <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onSurfaceVariant }}>
                        No expense data available
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    const pieData = data.map(item => ({
        value: item.amount,
        color: item.color,
        text: `${item.percentage.toFixed(1)}%`,
    }));

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Expenses by Category</Text>

                <View style={styles.chartContainer}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={80}
                        innerRadius={50}
                        centerLabelComponent={() => (
                            <View style={styles.centerLabel}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Total
                                </Text>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {data.reduce((sum, item) => sum + item.amount, 0).toFixed(0)}
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <View style={styles.legend}>
                    {data.slice(0, 5).map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text variant="bodySmall" style={{ flex: 1 }}>{item.categoryName}</Text>
                            <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                                {item.amount.toFixed(0)}
                            </Text>
                        </View>
                    ))}
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
    centerLabel: {
        alignItems: 'center',
    },
    legend: {
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
    },
});
