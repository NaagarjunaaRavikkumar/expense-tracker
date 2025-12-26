import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card, Title, Paragraph, Badge, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ReceiptOCRService } from '../../services/receipts/ReceiptOCRService';
import { ReceiptStorageService } from '../../services/receipts/ReceiptStorageService';
import { ParsedReceipt } from '../../services/receipts/ReceiptParserService';

type RootStackParamList = {
    OCRPreview: { imageUri: string };
};

type OCRPreviewRouteProp = RouteProp<RootStackParamList, 'OCRPreview'>;

export const OCRPreviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<OCRPreviewRouteProp>();
    const { imageUri } = route.params;

    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
    const [merchantName, setMerchantName] = useState('');
    const [date, setDate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        processImage();
    }, []);

    const processImage = async () => {
        try {
            setLoading(true);

            // Use offline ML Kit OCR + Parser
            const parsed = await ReceiptOCRService.scanReceipt(imageUri);

            setParsedData(parsed);
            setMerchantName(parsed.merchantName || '');
            setDate(parsed.date || new Date().toISOString().split('T')[0]);
            setTotalAmount(parsed.totalAmount?.toString() || '');
            setItems(parsed.items || []);
        } catch (error: any) {
            Alert.alert('OCR Failed', error.message || 'Failed to process receipt');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!merchantName || !totalAmount) {
            Alert.alert('Missing Info', 'Please enter Merchant Name and Total Amount');
            return;
        }

        try {
            if (!parsedData) {
                Alert.alert('Error', 'No receipt data to save');
                return;
            }

            // Use the new storage service
            const receiptId = await ReceiptStorageService.saveReceipt(
                imageUri,
                {
                    ...parsedData,
                    merchantName,
                    date,
                    totalAmount: parseFloat(totalAmount),
                    items,
                }
            );

            Alert.alert('Success', 'Receipt saved successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Failed to save receipt:', error);
            Alert.alert('Error', 'Failed to save receipt');
        }
    };

    const renderConfidence = (score: number) => {
        let color = 'green';
        if (score < 0.5) color = 'red';
        else if (score < 0.8) color = 'orange';

        return (
            <Badge style={{ backgroundColor: color, alignSelf: 'flex-start' }}>
                {`${Math.round(score * 100)}%`}
            </Badge>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Analyzing Receipt...</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>Using ML Kit (Offline)</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Receipt Details</Title>

                    <View style={styles.fieldRow}>
                        <TextInput
                            label="Merchant Name"
                            value={merchantName}
                            onChangeText={setMerchantName}
                            style={styles.input}
                            mode="outlined"
                        />
                        {parsedData && renderConfidence(parsedData.merchantConfidence)}
                    </View>

                    <View style={styles.fieldRow}>
                        <TextInput
                            label="Date"
                            value={date}
                            onChangeText={setDate}
                            style={styles.input}
                            mode="outlined"
                        />
                        {parsedData && renderConfidence(parsedData.dateConfidence)}
                    </View>

                    <View style={styles.fieldRow}>
                        <TextInput
                            label="Total Amount"
                            value={totalAmount}
                            onChangeText={setTotalAmount}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                            left={<TextInput.Affix text="₹" />}
                        />
                        {parsedData && renderConfidence(parsedData.totalConfidence)}
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title>Items ({items.length})</Title>
                        <IconButton icon="plus" onPress={() => { /* TODO: Add manual item */ }} />
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemMeta}>{item.quantity} x ₹{item.unitPrice}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                                {item.confidence !== undefined && renderConfidence(item.confidence)}
                            </View>
                        </View>
                    ))}
                    {items.length === 0 && <Paragraph>No items detected.</Paragraph>}
                </Card.Content>
            </Card>

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                Save Receipt
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
    },
    card: {
        margin: 16,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        marginRight: 8,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemMeta: {
        fontSize: 12,
        color: 'gray',
    },
    itemPrice: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        margin: 16,
        paddingVertical: 6,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    }
});
