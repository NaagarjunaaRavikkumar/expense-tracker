import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text, SegmentedButtons, Chip } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';

export const AddLoanTrackerScreen = ({ navigation }: any) => {
    const { createLoan, addROI } = useLoanTrackerStore();
    const theme = useTheme();

    const [name, setName] = useState('');
    const [principal, setPrincipal] = useState('');
    const [tenure, setTenure] = useState('');
    const [roi, setROI] = useState('');
    const [emi, setEMI] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [description, setDescription] = useState('');
    const [inputMode, setInputMode] = useState<'tenure' | 'emi'>('tenure');

    // Calculate EMI when principal, tenure, or ROI changes
    useEffect(() => {
        if (inputMode === 'tenure' && principal && tenure && roi) {
            const P = parseFloat(principal);
            const n = parseInt(tenure);
            const r = parseFloat(roi) / 12 / 100; // Monthly rate

            if (P > 0 && n > 0 && r > 0) {
                // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
                const emiValue = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
                setEMI(Math.round(emiValue).toString());
            }
        }
    }, [principal, tenure, roi, inputMode]);

    // Calculate tenure when principal, EMI, or ROI changes
    useEffect(() => {
        if (inputMode === 'emi' && principal && emi && roi) {
            const P = parseFloat(principal);
            const E = parseFloat(emi);
            const r = parseFloat(roi) / 12 / 100; // Monthly rate

            if (P > 0 && E > 0 && r > 0) {
                // Tenure formula: log(E / (E - P*r)) / log(1 + r)
                const tenureValue = Math.log(E / (E - P * r)) / Math.log(1 + r);
                if (tenureValue > 0 && isFinite(tenureValue)) {
                    setTenure(Math.ceil(tenureValue).toString());
                }
            }
        }
    }, [principal, emi, roi, inputMode]);

    const handleSave = async () => {
        // Validation
        if (!name) {
            Alert.alert('Error', 'Please enter loan name');
            return;
        }
        if (!principal || parseFloat(principal) <= 0) {
            Alert.alert('Error', 'Please enter valid principal amount');
            return;
        }
        if (!emi || parseFloat(emi) <= 0) {
            Alert.alert('Error', 'Please enter valid EMI amount');
            return;
        }
        if (!roi || parseFloat(roi) <= 0) {
            Alert.alert('Error', 'Please enter valid interest rate');
            return;
        }
        if (!tenure || parseInt(tenure) <= 0) {
            Alert.alert('Error', 'Please enter valid tenure');
            return;
        }

        try {
            // Create loan
            const loanId = await createLoan({
                name,
                startDate: startDate.toISOString().split('T')[0],
                initialPrincipal: parseFloat(principal),
                emi: parseFloat(emi),
                description,
                isActive: true
            });

            // Add initial ROI
            await addROI({
                loanId: loanId,
                effectiveDate: startDate.toISOString().split('T')[0],
                annualRate: parseFloat(roi)
            });

            Alert.alert('Success', 'Loan added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add loan');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="titleLarge" style={styles.title}>Add New Loan</Text>

                <TextInput
                    label="Loan Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Home Loan - HDFC"
                />

                <TextInput
                    label="Principal Amount (₹) *"
                    value={principal}
                    onChangeText={setPrincipal}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., 5000000"
                />

                <TextInput
                    label="Annual Interest Rate (%) *"
                    value={roi}
                    onChangeText={setROI}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., 8.5"
                />

                <Text variant="labelMedium" style={styles.fieldLabel}>
                    Input Mode
                </Text>
                <SegmentedButtons
                    value={inputMode}
                    onValueChange={(value) => setInputMode(value as 'tenure' | 'emi')}
                    buttons={[
                        { value: 'tenure', label: 'Enter Tenure' },
                        { value: 'emi', label: 'Enter EMI' },
                    ]}
                    style={styles.input}
                />

                {inputMode === 'tenure' ? (
                    <>
                        <TextInput
                            label="Tenure (Months) *"
                            value={tenure}
                            onChangeText={setTenure}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g., 240"
                        />
                        <View style={styles.calculatedField}>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                Calculated EMI
                            </Text>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                ₹{emi ? parseFloat(emi).toLocaleString('en-IN') : '0'}
                            </Text>
                        </View>
                    </>
                ) : (
                    <>
                        <TextInput
                            label="Monthly EMI (₹) *"
                            value={emi}
                            onChangeText={setEMI}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g., 45000"
                        />
                        <View style={styles.calculatedField}>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                Calculated Tenure
                            </Text>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                {tenure || '0'} months ({tenure ? Math.floor(parseInt(tenure) / 12) : 0} years)
                            </Text>
                        </View>
                    </>
                )}

                <Text variant="labelMedium" style={styles.fieldLabel}>
                    Loan Start Date
                </Text>
                <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    icon="calendar"
                    style={styles.input}
                >
                    {startDate.toLocaleDateString('en-IN')}
                </Button>

                <TextInput
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Add notes about this loan"
                />

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Add Loan
                </Button>

                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                    Cancel
                </Button>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={startDate}
                mode="date"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setStartDate(date);
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
        marginBottom: 24,
        fontWeight: 'bold',
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
    calculatedField: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
    },
});

