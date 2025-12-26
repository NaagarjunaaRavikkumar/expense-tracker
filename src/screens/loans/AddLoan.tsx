import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, List, SegmentedButtons, DataTable, IconButton, Text, Switch, Divider } from 'react-native-paper';
import { useLoanStore } from '../../store/useLoanStore';
import { VariableRate, PrePaymentConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-native-date-picker';

export const AddLoan = ({ navigation }: any) => {
    const { addLoan } = useLoanStore();
    const theme = useTheme();

    // Core Fields
    const [nickname, setNickname] = useState('');
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [openDate, setOpenDate] = useState(false);

    // Advanced Fields
    const [compoundPeriod, setCompoundPeriod] = useState('monthly');
    const [paymentFrequency, setPaymentFrequency] = useState('monthly');

    // Variable Rates
    const [variableRates, setVariableRates] = useState<VariableRate[]>([]);
    const [showVariableRates, setShowVariableRates] = useState(false);
    const [newRateDate, setNewRateDate] = useState(new Date());
    const [openRateDate, setOpenRateDate] = useState(false);
    const [newRateValue, setNewRateValue] = useState('');

    // Prepayment Config
    const [showPrepayment, setShowPrepayment] = useState(false);
    const [enablePrepayment, setEnablePrepayment] = useState(false);
    const [ppStartPayment, setPpStartPayment] = useState('1');
    const [ppAmount, setPpAmount] = useState('');
    const [ppInterval, setPpInterval] = useState('1');
    const [ppAnnualAmount, setPpAnnualAmount] = useState('');
    const [ppAnnualMonth, setPpAnnualMonth] = useState('12');

    const handleAddRate = () => {
        if (!newRateValue) {
            Alert.alert('Error', 'Please enter a rate');
            return;
        }
        const newRate: VariableRate = {
            id: uuidv4(),
            effectiveDate: newRateDate.toISOString().split('T')[0],
            rate: parseFloat(newRateValue),
        };
        setVariableRates([...variableRates, newRate].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)));
        setNewRateValue('');
    };

    const handleDeleteRate = (id: string) => {
        setVariableRates(variableRates.filter(r => r.id !== id));
    };

    const handleSave = () => {
        if (!nickname || !principal || !rate || !tenure) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const loanData: any = {
            nickname,
            principalAmount: parseFloat(principal),
            initialInterestRate: parseFloat(rate),
            tenureMonths: parseInt(tenure),
            startDate: startDate.toISOString().split('T')[0],
            type: 'reducing_balance',
            compoundPeriod,
            paymentFrequency,
            variableRates,
            prePayments: [], // Manual prepayments start empty
        };

        if (enablePrepayment) {
            loanData.prePaymentConfig = {
                startPaymentNumber: parseInt(ppStartPayment) || 1,
                amount: parseFloat(ppAmount) || 0,
                interval: parseInt(ppInterval) || 1,
                annualAmount: parseFloat(ppAnnualAmount) || 0,
                annualPaymentMonth: parseInt(ppAnnualMonth) || 12,
            };
        }

        addLoan(loanData);
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <TextInput label="Nickname *" value={nickname} onChangeText={setNickname} style={styles.input} mode="outlined" />
                <TextInput label="Principal Amount *" value={principal} onChangeText={setPrincipal} keyboardType="numeric" style={styles.input} mode="outlined" />

                <View style={styles.row}>
                    <TextInput label="Interest Rate (%) *" value={rate} onChangeText={setRate} keyboardType="numeric" style={[styles.input, { flex: 1, marginRight: 8 }]} mode="outlined" />
                    <TextInput label="Tenure (Months) *" value={tenure} onChangeText={setTenure} keyboardType="numeric" style={[styles.input, { flex: 1 }]} mode="outlined" />
                </View>

                <Button mode="outlined" onPress={() => setOpenDate(true)} style={styles.input}>
                    Start Date: {startDate.toISOString().split('T')[0]}
                </Button>
                <DatePicker
                    modal
                    open={openDate}
                    date={startDate}
                    mode="date"
                    onConfirm={(date: Date) => {
                        setOpenDate(false);
                        setStartDate(date);
                    }}
                    onCancel={() => {
                        setOpenDate(false);
                    }}
                />

                <List.Accordion
                    title="Advanced Settings"
                    left={props => <List.Icon {...props} icon="cog" />}
                    style={{ backgroundColor: theme.colors.surface }}
                >
                    <View style={styles.accordionContent}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Compound Period</Text>
                        <SegmentedButtons
                            value={compoundPeriod}
                            onValueChange={setCompoundPeriod}
                            buttons={[
                                { value: 'monthly', label: 'M' },
                                { value: 'quarterly', label: 'Q' },
                                { value: 'annually', label: 'Y' },
                            ]}
                            style={styles.input}
                        />
                        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Payment Frequency</Text>
                        <SegmentedButtons
                            value={paymentFrequency}
                            onValueChange={setPaymentFrequency}
                            buttons={[
                                { value: 'monthly', label: 'M' },
                                { value: 'quarterly', label: 'Q' },
                                { value: 'annually', label: 'Y' },
                            ]}
                            style={styles.input}
                        />
                    </View>
                </List.Accordion>

                <List.Accordion
                    title="Variable Interest Rates"
                    left={props => <List.Icon {...props} icon="chart-line" />}
                    expanded={showVariableRates}
                    onPress={() => setShowVariableRates(!showVariableRates)}
                    style={{ backgroundColor: theme.colors.surface }}
                >
                    <View style={styles.accordionContent}>
                        <View style={styles.row}>
                            <Button mode="outlined" onPress={() => setOpenRateDate(true)} style={{ flex: 1, marginRight: 8 }}>
                                {newRateDate.toISOString().split('T')[0]}
                            </Button>
                            <TextInput
                                label="New Rate (%)"
                                value={newRateValue}
                                onChangeText={setNewRateValue}
                                keyboardType="numeric"
                                style={{ flex: 1, height: 40 }}
                                mode="outlined"
                                dense
                            />
                            <IconButton icon="plus" mode="contained" onPress={handleAddRate} />
                        </View>
                        <DatePicker
                            modal
                            open={openRateDate}
                            date={newRateDate}
                            mode="date"
                            onConfirm={(date: Date) => {
                                setOpenRateDate(false);
                                setNewRateDate(date);
                            }}
                            onCancel={() => {
                                setOpenRateDate(false);
                            }}
                        />

                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Date</DataTable.Title>
                                <DataTable.Title numeric>Rate (%)</DataTable.Title>
                                <DataTable.Title numeric>Action</DataTable.Title>
                            </DataTable.Header>

                            {variableRates.map((item) => (
                                <DataTable.Row key={item.id}>
                                    <DataTable.Cell>{item.effectiveDate}</DataTable.Cell>
                                    <DataTable.Cell numeric>{item.rate}</DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <IconButton icon="delete" size={20} onPress={() => handleDeleteRate(item.id)} />
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </View>
                </List.Accordion>

                <List.Accordion
                    title="Prepayment Configuration"
                    left={props => <List.Icon {...props} icon="cash-fast" />}
                    expanded={showPrepayment}
                    onPress={() => setShowPrepayment(!showPrepayment)}
                    style={{ backgroundColor: theme.colors.surface }}
                >
                    <View style={styles.accordionContent}>
                        <View style={[styles.row, { alignItems: 'center', marginBottom: 12 }]}>
                            <Text>Enable Prepayments</Text>
                            <Switch value={enablePrepayment} onValueChange={setEnablePrepayment} />
                        </View>

                        {enablePrepayment && (
                            <>
                                <TextInput label="Start from Payment #" value={ppStartPayment} onChangeText={setPpStartPayment} keyboardType="numeric" style={styles.input} mode="outlined" dense />
                                <TextInput label="Regular Amount" value={ppAmount} onChangeText={setPpAmount} keyboardType="numeric" style={styles.input} mode="outlined" dense />
                                <TextInput label="Interval (every N months)" value={ppInterval} onChangeText={setPpInterval} keyboardType="numeric" style={styles.input} mode="outlined" dense />
                                <Divider style={{ marginVertical: 12 }} />
                                <TextInput label="Annual Lump Sum" value={ppAnnualAmount} onChangeText={setPpAnnualAmount} keyboardType="numeric" style={styles.input} mode="outlined" dense />
                                <TextInput label="Annual Payment Month (1-12)" value={ppAnnualMonth} onChangeText={setPpAnnualMonth} keyboardType="numeric" style={styles.input} mode="outlined" dense />
                            </>
                        )}
                    </View>
                </List.Accordion>

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Save Loan
                </Button>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    input: { marginBottom: 12 },
    button: { marginTop: 16, marginBottom: 32 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    accordionContent: { padding: 16, backgroundColor: '#f5f5f5' },
});
