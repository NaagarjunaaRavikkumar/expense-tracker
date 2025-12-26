import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import { BalanceTrendPoint } from '../../utils/analyticsUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BalanceTrendChartProps {
    data: BalanceTrendPoint[];
    changePercentage: number;
}

export const BalanceTrendChart = ({ data, changePercentage }: BalanceTrendChartProps) => {
    const theme = useTheme();
    const { currency } = useSettingsStore();

    if (data.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 12 }}>Balance Trend</Text>
                    <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onSurfaceVariant }}>
                        No data available
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    const lineData = data.map(point => ({
        value: point.balance,
        label: point.label,
    }));

    const isPositive = changePercentage >= 0;
    const currentBalance = data[data.length - 1]?.balance || 0;
    const previousBalance = data[0]?.balance || 0;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium">Balance Trend</Text>
                    <View style={[styles.badge, { backgroundColor: isPositive ? '#4CAF5020' : '#FF6B6B20' }]}>
                        <Icon
                            name={isPositive ? 'arrow-up' : 'arrow-down'}
                            size={16}
                            color={isPositive ? '#4CAF50' : '#FF6B6B'}
                        />
                        <Text
                            variant="bodySmall"
                            style={{ color: isPositive ? '#4CAF50' : '#FF6B6B', marginLeft: 4, fontWeight: 'bold' }}
                        >
                            {Math.abs(changePercentage).toFixed(1)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.balanceInfo}>
                    <View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Current Balance
                        </Text>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                            {formatCurrency(currentBalance, currency)}
                        </Text>
                    </View>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {isPositive ? 'More' : 'Less'} than before
                    </Text>
                </View>

                <View style={styles.chartContainer}>
                    <LineChart
                        data={lineData}
                        width={300}
                        height={180}
                        color={isPositive ? '#4CAF50' : '#FF6B6B'}
                        thickness={3}
                        startFillColor={isPositive ? '#4CAF5040' : '#FF6B6B40'}
                        endFillColor={isPositive ? '#4CAF5010' : '#FF6B6B10'}
                        areaChart
                        curved
                        hideDataPoints
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                        noOfSections={4}
                    />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    balanceInfo: {
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
});
