import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import { CashFlowTrendPoint } from '../../utils/analyticsUtils';

interface CashFlowTrendChartProps {
    data: CashFlowTrendPoint[];
}

export const CashFlowTrendChart = ({ data }: CashFlowTrendChartProps) => {
    const theme = useTheme();

    if (data.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 12 }}>Cash Flow Trend</Text>
                    <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onSurfaceVariant }}>
                        No data available
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    const savingsData = data.map(point => ({
        value: point.savings,
        label: point.period,
    }));

    const avgSavings = data.reduce((sum, p) => sum + p.savings, 0) / data.length;
    const bestPeriod = data.reduce((max, p) => p.savings > max.savings ? p : max, data[0]);
    const worstPeriod = data.reduce((min, p) => p.savings < min.savings ? p : min, data[0]);

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Cash Flow Trend</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Best Period
                        </Text>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                            {bestPeriod.period}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                            +{bestPeriod.savings.toFixed(0)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Worst Period
                        </Text>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#FF6B6B' }}>
                            {worstPeriod.period}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#FF6B6B' }}>
                            {worstPeriod.savings.toFixed(0)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Average
                        </Text>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                            {avgSavings.toFixed(0)}
                        </Text>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <LineChart
                        data={savingsData}
                        width={300}
                        height={180}
                        color="#6200ee"
                        thickness={3}
                        startFillColor="#6200ee40"
                        endFillColor="#6200ee10"
                        areaChart
                        curved
                        hideDataPoints={false}
                        dataPointsColor="#6200ee"
                        dataPointsRadius={4}
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                        noOfSections={4}
                    />
                </View>

                <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                    Positive values indicate savings, negative values indicate deficit
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
});
