import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Card, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getDBConnection } from '../../database';
import { TABLE_NAMES } from '../../database/tables';

export const PurchaseHistoryScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const db = await getDBConnection();
            const [results] = await db.executeSql(
                `SELECT pi.*, r.transactionDate, r.merchantName 
                 FROM ${TABLE_NAMES.PURCHASE_ITEMS} pi
                 JOIN ${TABLE_NAMES.RECEIPTS} r ON pi.receiptId = r.id
                 ORDER BY r.transactionDate DESC`
            );

            const loadedItems = [];
            for (let i = 0; i < results.rows.length; i++) {
                loadedItems.push(results.rows.item(i));
            }
            setItems(loadedItems);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.merchantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ItemDetail', { itemName: item.name })}>
            <Card style={styles.card}>
                <Card.Title
                    title={item.name}
                    subtitle={`${item.merchantName} • ${item.transactionDate}`}
                    left={(props) => <Avatar.Icon {...props} icon="shopping" />}
                    right={(props) => <Text style={styles.price}>₹{item.unitPrice}</Text>}
                />
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search purchases..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchBar: {
        margin: 16,
    },
    list: {
        paddingHorizontal: 16,
    },
    card: {
        marginBottom: 12,
    },
    price: {
        marginRight: 16,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
