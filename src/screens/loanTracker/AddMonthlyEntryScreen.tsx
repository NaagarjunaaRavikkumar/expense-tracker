import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text, SegmentedButtons, Switch, Divider } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';

export const AddMonthlyEntryScreen = ({ route, navigation }: any) => {
    const { loanId } = route.params;
    const { addROI, addPrepayment, addEMIPayment } = useLoanTrackerStore();
    const theme = useTheme();

    const [entryDate, setEntryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // EMI fields
    const [hasEMIPayment, setHasEMIPayment] = useState(true); // EMI is usually paid every month
    const [emiAmount, setEMIAmount] = useState('');

    // ROI fields
    const [hasROIChange, setHasROIChange] = useState(false);
    const [newROI, setNewROI] = useState('');

    // Prepayment fields
    const [hasPrepayment, setHasPrepayment] = useState(false);
    const [prepaymentAmount, setPrepaymentAmount] = useState('');
    const [prepaymentNote, setPrepaymentNote] = useState('');

    const handleSave = async () => {
        const dateStr = entryDate.toISOString().split('T')[0];

        try {
            let emiAdded = false;
            let roiAdded = false;
            let prepaymentAdded = false;

            // Add EMI payment
            if (hasEMIPayment) {
                if (!emiAmount || parseFloat(emiAmount) <= 0) {
                    Alert.alert('Error', 'Please enter valid EMI amount');
                    return;
                }
                await addEMIPayment({
                    loanId,
                    date: dateStr,
                    amount: parseFloat(emiAmount)
                });
                emiAdded = true;
            }

            // Add ROI if changed
            if (hasROIChange) {
                if (!newROI || parseFloat(newROI) <= 0) {
                    Alert.alert('Error', 'Please enter valid interest rate');
                    return;
                }
                await addROI({
                    loanId,
                    effectiveDate: dateStr,
                    annualRate: parseFloat(newROI)
                });
                roiAdded = true;
            }

            // Add Prepayment if made
            if (hasPrepayment) {
                if (!prepaymentAmount || parseFloat(prepaymentAmount) <= 0) {
                    Alert.alert('Error', 'Please enter valid prepayment amount');
                    return;
                }
                await addPrepayment({
                    loanId,
                    date: dateStr,
                    amount: parseFloat(prepaymentAmount),
                    note: prepaymentNote || undefined
                });
                prepaymentAdded = true;
            }

            if (!emiAdded && !roiAdded && !prepaymentAdded) {
                Alert.alert('Error', 'Please enable at least one option');
                return;
            }

            const messages = [];
            if (emiAdded) messages.push('EMI payment');
            if (roiAdded) messages.push('ROI change');
            if (prepaymentAdded) messages.push('Prepayment');

            Alert.alert('Success', `${messages.join(', ')} added successfully. Ledger recalculated.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add entry');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="titleLarge" style={styles.title}>Add Monthly Entry</Text>

                <Text variant="bodyMedium" style={styles.description}>
                    Record this month's EMI payment, any interest rate changes, and/or prepayments. The ledger will be automatically recalculated.
                </Text>

                <Text variant="labelMedium" style={styles.fieldLabel}>
                    Entry Date (Month)
                </Text>
                <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    icon="calendar"
                    style={styles.input}
                >
                    {entryDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </Button>

                <Divider style={styles.divider} />

                {/* EMI Payment Section */}
                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">EMI Payment</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Did you pay EMI this month?
                        </Text>
                    </View>
                    <Switch value={hasEMIPayment} onValueChange={setHasEMIPayment} />
                </View>

                {hasEMIPayment && (
                    <View style={styles.sectionContent}>
                        <TextInput
                            label="EMI Amount (₹) *"
                            value={emiAmount}
                            onChangeText={setEMIAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g., 45000"
                        />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Enter the actual EMI amount paid this month.
                        </Text>
                    </View>
                )}

                <Divider style={styles.divider} />

                {/* ROI Change Section */}
                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">Interest Rate Change</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Did the interest rate change?
                        </Text>
                    </View>
                    <Switch value={hasROIChange} onValueChange={setHasROIChange} />
                </View>

                {hasROIChange && (
                    <View style={styles.sectionContent}>
                        <TextInput
                            label="New Annual Interest Rate (%) *"
                            value={newROI}
                            onChangeText={setNewROI}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g., 8.75"
                        />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            This rate will apply from this month onwards.
                        </Text>
                    </View>
                )}

                <Divider style={styles.divider} />

                {/* Prepayment Section */}
                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">Prepayment</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Did you make a prepayment?
                        </Text>
                    </View>
                    <Switch value={hasPrepayment} onValueChange={setHasPrepayment} />
                </View>

                {hasPrepayment && (
                    <View style={styles.sectionContent}>
                        <TextInput
                            label="Prepayment Amount (₹) *"
                            value={prepaymentAmount}
                            onChangeText={setPrepaymentAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g., 100000"
                        />
                        <TextInput
                            label="Note (Optional)"
                            value={prepaymentNote}
                            onChangeText={setPrepaymentNote}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={2}
                            placeholder="Add notes about this prepayment"
                        />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            This amount will be deducted from your principal balance.
                        </Text>
                    </View>
                )}

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Save Entry
                </Button>

                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                    Cancel
                </Button>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={entryDate}
                mode="date"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setEntryDate(date);
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
    divider: {
        marginVertical: 24,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionContent: {
        paddingLeft: 16,
        marginBottom: 16,
    },
});
