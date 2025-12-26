import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB, Card, ProgressBar, useTheme, ActivityIndicator } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calculateMetrics } from '../../services/loanTracker/ledgerEngine';
import { LoanTrackerRepository } from '../../database/repositories/LoanTrackerRepository';

export const LoanTrackerListScreen = ({ navigation }: any) => {
    const { loans, isLoading, loadLoans } = useLoanTrackerStore();
    const theme = useTheme();

    useEffect(() => {
        loadLoans();
    }, []);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const LoanCard = ({ loan }: any) => {
        const [summary, setSummary] = React.useState<any>(null);

        React.useEffect(() => {
            LoanTrackerRepository.getSummary(loan.id).then(setSummary);
        }, [loan.id]);

        if (!summary) {
            return (
                <Card style={styles.card}>
                    <Card.Content>
                        <ActivityIndicator size="small" />
                    </Card.Content>
                </Card>
            );
        }

        const progress = summary.metrics.outstandingPrincipal > 0
            ? (loan.initialPrincipal - summary.metrics.outstandingPrincipal) / loan.initialPrincipal
            : 1;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('LoanTrackerDetail', { loanId: loan.id })}
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {loan.name}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    EMI: {formatCurrency(loan.emi)}/month
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: summary.metrics.outstandingPrincipal > 0 ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]}>
                                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                                    {summary.metrics.outstandingPrincipal > 0 ? 'ACTIVE' : 'PAID'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Outstanding
                                </Text>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(summary.metrics.outstandingPrincipal)}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Paid
                                </Text>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(loan.initialPrincipal - summary.metrics.outstandingPrincipal)}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Total Interest
                                </Text>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(summary.metrics.totalInterestPaid)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {(progress * 100).toFixed(1)}% Complete
                                </Text>
                                {summary.metrics.completionMonth && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        ETA: {summary.metrics.completionMonth}
                                    </Text>
                                )}
                            </View>
                            <ProgressBar progress={progress} color={theme.colors.primary} />
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Loan Tracker" navigation={navigation} />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : loans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="bank-off" size={64} color={theme.colors.onSurfaceVariant} />
                    <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                        No loans tracked yet
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        Track your home loans with variable interest rates and prepayments
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {loans.map((loan) => (
                        <LoanCard key={loan.id} loan={loan} />
                    ))}
                </ScrollView>
            )}

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('AddLoanTracker')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
    },
    progressSection: {
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
