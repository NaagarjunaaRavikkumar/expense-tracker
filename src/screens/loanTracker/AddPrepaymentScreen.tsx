import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';

export const AddPrepaymentScreen = ({ route, navigation }: any) => {
    const { loanId } = route.params;
    const { addPrepayment } = useLoanTrackerStore();
    const theme = useTheme();

    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter valid prepayment amount');
            return;
        }

        try {
            await addPrepayment({
                loanId,
                date: date.toISOString().split('T')[0],
                amount: parseFloat(amount),
                note: note || undefined
            });

            Alert.alert('Success', 'Prepayment added and ledger recalculated', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add prepayment');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="titleLarge" style={styles.title}>Add Prepayment</Text>

                <Text variant="bodyMedium" style={styles.description}>
                    Record a prepayment (lump sum payment) towards your loan principal. This will reduce your outstanding balance and the loan ledger will be automatically recalculated.
                </Text>

                <TextInput
                    label="Prepayment Amount (₹) *"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., 100000"
                />

                <Text variant="labelMedium" style={styles.fieldLabel}>
                    Prepayment Date
                </Text>
                <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    icon="calendar"
                    style={styles.input}
                >
                    {date.toLocaleDateString('en-IN')}
                </Button>

                <TextInput
                    label="Note (Optional)"
                    value={note}
                    onChangeText={setNote}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Add notes about this prepayment"
                />

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Add Prepayment
                </Button>

                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                    Cancel
                </Button>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={date}
                mode="date"
                onConfirm={(selectedDate) => {
                    setShowDatePicker(false);
                    setDate(selectedDate);
                }}
                onCancel={() => setShowDatePicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    description: {
        marginBottom: 24,
        opacity: 0.7,
    },
    input: {
        marginBottom: 16,
    },
    fieldLabel: {
        marginBottom: 8,
    },
    button: {
        marginTop: 8,
    },
});
