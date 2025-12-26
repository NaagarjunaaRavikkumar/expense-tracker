import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Text, SegmentedButtons, DataTable, useTheme, Divider } from 'react-native-paper';
import { useLoanStore } from '../../store/useLoanStore';
import { calculateAmortization, calculateSummaryMetrics } from '../../services/calculation/loanCalculator';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';

export const LoanDetail = ({ route, navigation }: any) => {
    const { loanId } = route.params;
    const { loans } = useLoanStore();
    const { currency } = useSettingsStore();
    const theme = useTheme();
    const loan = loans.find(l => l.id === loanId);
    const [tab, setTab] = useState('summary');

    const { schedule, summary, baselineSchedule, baselineSummary } = useMemo(() => {
        if (!loan) return { schedule: [], summary: null, baselineSchedule: [], baselineSummary: null };

        // 1. Actual Schedule (With Prepayments & Variable Rates)
        const actualSchedule = calculateAmortization(loan);
        const actualSummary = calculateSummaryMetrics(actualSchedule, loan);

        // 2. Baseline Schedule (Without Prepayments, With Variable Rates)
        // Clone loan and remove prepayment config and manual prepayments
        const baselineLoan = {
            ...loan,
            prePaymentConfig: undefined,
            prePayments: []
        };
        const baseSchedule = calculateAmortization(baselineLoan);
        const baseSummary = calculateSummaryMetrics(baseSchedule, baselineLoan);

        return {
            schedule: actualSchedule,
            summary: actualSummary,
            baselineSchedule: baseSchedule,
            baselineSummary: baseSummary
        };
    }, [loan]);

    if (!loan || !summary || !baselineSummary) return <View><Text>Loan not found</Text></View>;

    // Chart Data
    const balanceData = schedule.map(s => ({ value: s.closingBalance, label: s.month % 12 === 0 ? `${s.month / 12}y` : '' }));
    const baselineBalanceData = baselineSchedule.map(s => ({ value: s.closingBalance }));

    // Interest Saved
    const interestSaved = baselineSummary.totalInterest - summary.totalInterest;
    const timeSaved = baselineSummary.monthsSaved - summary.monthsSaved; // Wait, monthsSaved is relative to tenure.
    // baselineSummary.monthsSaved should be 0 (or close to it if fixed rate).
    // Actually, time saved is (baseline tenure - actual tenure).
    // Baseline tenure is schedule length.
    const monthsSaved = baselineSchedule.length - schedule.length;

    const renderSummary = () => (
        <ScrollView contentContainerStyle={styles.tabContent}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={{ color: theme.colors.primary }}>Savings Analysis</Title>
                    <View style={styles.row}>
                        <View>
                            <Paragraph>Interest Saved</Paragraph>
                            <Title style={{ color: '#4CAF50' }}>{formatCurrency(interestSaved, currency)}</Title>
                        </View>
                        <View>
                            <Paragraph>Time Saved</Paragraph>
                            <Title style={{ color: '#4CAF50' }}>{monthsSaved} Months</Title>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.row}>
                <Card style={[styles.card, { flex: 1, marginRight: 8 }]}>
                    <Card.Content>
                        <Paragraph>Initial EMI</Paragraph>
                        <Title>{formatCurrency(schedule[0]?.emi || 0, currency)}</Title>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { flex: 1 }]}>
                    <Card.Content>
                        <Paragraph>Current EMI</Paragraph>
                        <Title>{formatCurrency(schedule[schedule.length - 1]?.emi || 0, currency)}</Title>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.row}>
                <Card style={[styles.card, { flex: 1, marginRight: 8 }]}>
                    <Card.Content>
                        <Paragraph>Payoff Date</Paragraph>
                        <Title>{summary.payoffDate}</Title>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { flex: 1 }]}>
                    <Card.Content>
                        <Paragraph>Total Paid</Paragraph>
                        <Title>{formatCurrency(summary.totalPayment, currency)}</Title>
                    </Card.Content>
                </Card>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Loan Overview</Title>
                    <DataTable>
                        <DataTable.Row>
                            <DataTable.Cell>Principal</DataTable.Cell>
                            <DataTable.Cell numeric>{formatCurrency(loan.principalAmount, currency)}</DataTable.Cell>
                        </DataTable.Row>
                        <DataTable.Row>
                            <DataTable.Cell>Total Interest</DataTable.Cell>
                            <DataTable.Cell numeric>{formatCurrency(summary.totalInterest, currency)}</DataTable.Cell>
                        </DataTable.Row>
                        <DataTable.Row>
                            <DataTable.Cell>Total Payment</DataTable.Cell>
                            <DataTable.Cell numeric>{formatCurrency(summary.totalPayment, currency)}</DataTable.Cell>
                        </DataTable.Row>
                        <DataTable.Row>
                            <DataTable.Cell>Tenure</DataTable.Cell>
                            <DataTable.Cell numeric>{loan.tenureMonths} Months</DataTable.Cell>
                        </DataTable.Row>
                    </DataTable>
                </Card.Content>
            </Card>
        </ScrollView>
    );

    const renderSchedule = () => (
        <ScrollView horizontal contentContainerStyle={{ padding: 16 }}>
            <ScrollView>
                <DataTable style={{ width: 600 }}>
                    <DataTable.Header>
                        <DataTable.Title style={{ width: 50 }}>#</DataTable.Title>
                        <DataTable.Title style={{ width: 100 }}>Date</DataTable.Title>
                        <DataTable.Title numeric style={{ width: 100 }}>EMI</DataTable.Title>
                        <DataTable.Title numeric style={{ width: 100 }}>Principal</DataTable.Title>
                        <DataTable.Title numeric style={{ width: 100 }}>Interest</DataTable.Title>
                        <DataTable.Title numeric style={{ width: 100 }}>Balance</DataTable.Title>
                    </DataTable.Header>

                    {schedule.map((item) => (
                        <DataTable.Row key={item.month}>
                            <DataTable.Cell style={{ width: 50 }}>{item.month}</DataTable.Cell>
                            <DataTable.Cell style={{ width: 100 }}>{item.date}</DataTable.Cell>
                            <DataTable.Cell numeric style={{ width: 100 }}>{item.emi.toFixed(0)}</DataTable.Cell>
                            <DataTable.Cell numeric style={{ width: 100 }}>{item.principalComponent.toFixed(0)}</DataTable.Cell>
                            <DataTable.Cell numeric style={{ width: 100 }}>{item.interestComponent.toFixed(0)}</DataTable.Cell>
                            <DataTable.Cell numeric style={{ width: 100 }}>{item.closingBalance.toFixed(0)}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </ScrollView>
        </ScrollView>
    );

    const renderAnalytics = () => (
        <ScrollView contentContainerStyle={styles.tabContent}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Balance Reduction</Title>
                    <Paragraph style={{ marginBottom: 10 }}>Blue: With Prepayment | Grey: Without</Paragraph>
                    <LineChart
                        data={balanceData}
                        data2={baselineBalanceData}
                        color1="#177AD5"
                        color2="#B0B0B0"
                        height={250}
                        width={Dimensions.get('window').width - 80}
                        initialSpacing={0}
                        yAxisTextStyle={{ fontSize: 10 }}
                        noOfSections={5}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={loan.nickname} />
            </Appbar.Header>

            <View style={{ padding: 16 }}>
                <SegmentedButtons
                    value={tab}
                    onValueChange={setTab}
                    buttons={[
                        { value: 'summary', label: 'Summary' },
                        { value: 'schedule', label: 'Schedule' },
                        { value: 'analytics', label: 'Analytics' },
                    ]}
                />
            </View>

            {tab === 'summary' && renderSummary()}
            {tab === 'schedule' && renderSchedule()}
            {tab === 'analytics' && renderAnalytics()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabContent: { padding: 16 },
    card: { marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
});
