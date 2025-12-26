import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';

export const AddROIScreen = ({ route, navigation }: any) => {
    const { loanId } = route.params;
    const { addROI } = useLoanTrackerStore();
    const theme = useTheme();

    const [annualRate, setAnnualRate] = useState('');
    const [effectiveDate, setEffectiveDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!annualRate || parseFloat(annualRate) <= 0) {
            Alert.alert('Error', 'Please enter valid interest rate');
            return;
        }

        try {
            await addROI({
                loanId,
                effectiveDate: effectiveDate.toISOString().split('T')[0],
                annualRate: parseFloat(annualRate)
            });

            Alert.alert('Success', 'ROI added and ledger recalculated', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add ROI');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="titleLarge" style={styles.title}>Add Interest Rate Change</Text>

                <Text variant="bodyMedium" style={styles.description}>
                    Add a new interest rate that will apply from the specified date. The loan ledger will be automatically recalculated.
                </Text>

                <TextInput
                    label="Annual Interest Rate (%) *"
                    value={annualRate}
                    onChangeText={setAnnualRate}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., 8.5"
                />

                <Text variant="labelMedium" style={styles.fieldLabel}>
                    Effective From Date
                </Text>
                <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    icon="calendar"
                    style={styles.input}
                >
                    {effectiveDate.toLocaleDateString('en-IN')}
                </Button>

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Add ROI Change
                </Button>

                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                    Cancel
                </Button>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={effectiveDate}
                mode="date"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setEffectiveDate(date);
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
