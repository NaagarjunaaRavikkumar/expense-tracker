import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { PriceIntelligenceService, PriceComparison } from '../../services/receipts/priceIntelligence';

type RootStackParamList = {
    ItemDetail: { itemName: string };
};

type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;

export const ItemDetailScreen = () => {
    const route = useRoute<ItemDetailRouteProp>();
    const { itemName } = route.params;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<PriceComparison | null>(null);

    useEffect(() => {
        loadData();
    }, [itemName]);

    const loadData = async () => {
        try {
            const historyData = await PriceIntelligenceService.getItemHistory(itemName);
            setHistory(historyData);

            if (historyData.length > 0) {
                // Calculate stats based on history
                // Note: checkPrice usually compares a NEW price, here we just want stats
                // So we can reuse the logic or just calculate manually.
                // For simplicity, let's just use the latest price to get stats
                const latestPrice = historyData[0].unitPrice;
                const comparison = await PriceIntelligenceService.checkPrice(itemName, latestPrice);
                setStats(comparison);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator /></View>;
    }

    const chartData = history
        .slice()
        .reverse()
        .map(item => ({
            value: item.unitPrice,
            label: new Date(item.transactionDate).getDate().toString(), // Simple label
            dataPointText: item.unitPrice.toString(),
        }));

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.headerTitle}>{itemName}</Title>

            {stats && (
                <View style={styles.statsContainer}>
                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Paragraph>Average</Paragraph>
                            <Title>₹{stats.averagePrice.toFixed(2)}</Title>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Paragraph>Lowest</Paragraph>
                            <Title>₹{stats.minPrice.toFixed(2)}</Title>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Paragraph>Highest</Paragraph>
                            <Title>₹{stats.maxPrice.toFixed(2)}</Title>
                        </Card.Content>
                    </Card>
                </View>
            )}

            <Card style={styles.chartCard}>
                <Card.Content>
                    <Title>Price Trend</Title>
                    <View style={{ height: 20, }} />
                    {chartData.length > 1 ? (
                        <LineChart
                            data={chartData}
                            height={200}
                            width={Dimensions.get('window').width - 80}
                            spacing={40}
                            initialSpacing={20}
                            color="#007AFF"
                            thickness={3}
                            startFillColor="rgba(0, 122, 255, 0.3)"
                            endFillColor="rgba(0, 122, 255, 0.01)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            areaChart
                        />
                    ) : (
                        <Text>Not enough data for chart</Text>
                    )}
                </Card.Content>
            </Card>

            <Title style={styles.sectionTitle}>History</Title>
            {history.map((item, index) => (
                <Card key={index} style={styles.historyCard}>
                    <Card.Title
                        title={item.merchantName}
                        subtitle={item.transactionDate}
                        right={(props) => <Text style={styles.price}>₹{item.unitPrice}</Text>}
                    />
                </Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 4,
    },
    chartCard: {
        marginBottom: 16,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 8,
    },
    historyCard: {
        marginBottom: 8,
    },
    price: {
        marginRight: 16,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
