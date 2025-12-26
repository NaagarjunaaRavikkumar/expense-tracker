import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, useTheme, FAB, Portal, Dialog, Button, Divider, DataTable, Chip, Menu } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useLoanTrackerStore } from '../../store/useLoanTrackerStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calculateMetrics } from '../../services/loanTracker/ledgerEngine';
import { LoanTrackerRepository } from '../../database/repositories/LoanTrackerRepository';

export const LoanTrackerDetailScreen = ({ route, navigation }: any) => {
    const { loanId } = route.params;
    const { selectLoan, selectedLoan, selectedLoanLedger, selectedLoanROI, selectedLoanPrepayments, selectedLoanEMIPayments, deleteROI, deletePrepayment, deleteEMIPayment, deleteLoan } = useLoanTrackerStore();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState<any>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        selectLoan(loanId);
    }, [loanId]);

    useEffect(() => {
        if (selectedLoan) {
            LoanTrackerRepository.getSummary(loanId).then(setSummary);
        }
    }, [selectedLoan, selectedLoanLedger]);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateStr: string) => {
        const [year, month] = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const handleDeleteROI = async () => {
        if (itemToDelete) {
            try {
                await deleteROI(itemToDelete.id, loanId);
                setShowDeleteDialog(false);
                setItemToDelete(null);
                Alert.alert('Success', 'ROI deleted and ledger recalculated');
            } catch (error) {
                Alert.alert('Error', 'Failed to delete ROI');
            }
        }
    };

    const handleDeletePrepayment = async () => {
        if (itemToDelete) {
            try {
                await deletePrepayment(itemToDelete.id, loanId);
                setShowDeleteDialog(false);
                setItemToDelete(null);
                Alert.alert('Success', 'Prepayment deleted and ledger recalculated');
            } catch (error) {
                Alert.alert('Error', 'Failed to delete prepayment');
            }
        }
    };

    const handleDeleteEMIPayment = async () => {
        if (itemToDelete) {
            try {
                await deleteEMIPayment(itemToDelete.id, loanId);
                setShowDeleteDialog(false);
                setItemToDelete(null);
                Alert.alert('Success', 'EMI payment deleted and ledger recalculated');
            } catch (error) {
                Alert.alert('Error', 'Failed to delete EMI payment');
            }
        }
    };

    const handleDeleteLoan = async () => {
        Alert.alert(
            'Delete Loan',
            'Are you sure you want to delete this loan? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLoan(loanId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete loan');
                        }
                    }
                }
            ]
        );
    };

    if (!selectedLoan || !summary) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <CustomHeader title="Loan Details" navigation={navigation} />
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </View>
        );
    }

    const metrics = summary.metrics;
    const progress = metrics.outstandingPrincipal > 0
        ? ((selectedLoan.initialPrincipal - metrics.outstandingPrincipal) / selectedLoan.initialPrincipal) * 100
        : 100;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text variant="titleLarge" style={styles.headerTitle}>{selectedLoan.name}</Text>
                <Menu
                    visible={showMenu}
                    onDismiss={() => setShowMenu(false)}
                    anchor={
                        <TouchableOpacity onPress={() => setShowMenu(true)}>
                            <Icon name="dots-vertical" size={24} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item onPress={() => { setShowMenu(false); handleDeleteLoan(); }} title="Delete Loan" leadingIcon="delete" />
                </Menu>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && { color: theme.colors.primary }]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'emi' && styles.activeTab]}
                        onPress={() => setActiveTab('emi')}
                    >
                        <Text style={[styles.tabText, activeTab === 'emi' && { color: theme.colors.primary }]}>
                            EMI History
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'roi' && styles.activeTab]}
                        onPress={() => setActiveTab('roi')}
                    >
                        <Text style={[styles.tabText, activeTab === 'roi' && { color: theme.colors.primary }]}>
                            ROI
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'prepayments' && styles.activeTab]}
                        onPress={() => setActiveTab('prepayments')}
                    >
                        <Text style={[styles.tabText, activeTab === 'prepayments' && { color: theme.colors.primary }]}>
                            Prepayments
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ledger' && styles.activeTab]}
                        onPress={() => setActiveTab('ledger')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ledger' && { color: theme.colors.primary }]}>
                            Ledger
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                    Loan Summary
                                </Text>
                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            Principal Amount
                                        </Text>
                                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                            {formatCurrency(selectedLoan.initialPrincipal)}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            Monthly EMI
                                        </Text>
                                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(selectedLoan.emi)}
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                    Outstanding Balance
                                </Text>
                                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                    {formatCurrency(metrics.outstandingPrincipal)}
                                </Text>
                                <View style={{ marginTop: 8 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text variant="bodySmall">{progress.toFixed(1)}% Paid</Text>
                                        {metrics.completionMonth && (
                                            <Text variant="bodySmall">ETA: {formatDate(metrics.completionMonth)}</Text>
                                        )}
                                    </View>
                                    <View style={{ height: 8, backgroundColor: theme.colors.surfaceVariant, borderRadius: 4 }}>
                                        <View
                                            style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: theme.colors.primary,
                                                borderRadius: 4
                                            }}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                    Analytics
                                </Text>
                                <View style={styles.analyticsRow}>
                                    <View style={styles.analyticItem}>
                                        <Icon name="cash-multiple" size={24} color={theme.colors.primary} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Total Paid
                                        </Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(selectedLoan.initialPrincipal - metrics.outstandingPrincipal)}
                                        </Text>
                                    </View>
                                    <View style={styles.analyticItem}>
                                        <Icon name="percent" size={24} color={theme.colors.error} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Interest Paid
                                        </Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(metrics.totalInterestPaid)}
                                        </Text>
                                    </View>
                                    <View style={styles.analyticItem}>
                                        <Icon name="lightning-bolt" size={24} color={theme.colors.tertiary} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Prepayments
                                        </Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(metrics.totalPrepayments)}
                                        </Text>
                                    </View>
                                </View>
                                <Divider style={{ marginVertical: 16 }} />
                                <View style={styles.analyticsRow}>
                                    <View style={styles.analyticItem}>
                                        <Icon name="calendar-month" size={24} color={theme.colors.secondary} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Tenure
                                        </Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {metrics.tenure} months
                                        </Text>
                                    </View>
                                    <View style={styles.analyticItem}>
                                        <Icon name="chart-line" size={24} color={theme.colors.primary} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Total Payable
                                        </Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(metrics.totalEMIPaid + metrics.totalPrepayments)}
                                        </Text>
                                    </View>
                                    <View style={styles.analyticItem}>
                                        <Icon name="calendar-start" size={24} color={theme.colors.onSurfaceVariant} />
                                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                                            Start Date
                                        </Text>
                                        <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                            {formatDate(selectedLoan.startDate)}
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>
                )}

                {/* EMI History Tab */}
                {activeTab === 'emi' && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                Monthly EMI Payments
                            </Text>
                            {(!selectedLoanEMIPayments || selectedLoanEMIPayments.length === 0) ? (
                                <Text style={{ textAlign: 'center', padding: 32, color: theme.colors.onSurfaceVariant }}>
                                    No manual EMI payments recorded. Using default EMI.
                                </Text>
                            ) : (
                                selectedLoanEMIPayments.map((payment) => (
                                    <View key={payment.id} style={styles.listItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                                {formatCurrency(payment.amount)}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                Paid on: {new Date(payment.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setItemToDelete({ ...payment, type: 'emi' });
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Icon name="delete" size={24} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* ROI History Tab */}
                {activeTab === 'roi' && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                Interest Rate Changes
                            </Text>
                            {selectedLoanROI.length === 0 ? (
                                <Text style={{ textAlign: 'center', padding: 32, color: theme.colors.onSurfaceVariant }}>
                                    No ROI history
                                </Text>
                            ) : (
                                selectedLoanROI.map((roi, index) => (
                                    <View key={roi.id} style={styles.listItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                                {roi.annualRate}% per annum
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                Effective from: {new Date(roi.effectiveDate).toLocaleDateString('en-IN')}
                                            </Text>
                                        </View>
                                        {selectedLoanROI.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setItemToDelete({ ...roi, type: 'roi' });
                                                    setShowDeleteDialog(true);
                                                }}
                                            >
                                                <Icon name="delete" size={24} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Prepayments Tab */}
                {activeTab === 'prepayments' && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                Prepayment History
                            </Text>
                            {selectedLoanPrepayments.length === 0 ? (
                                <Text style={{ textAlign: 'center', padding: 32, color: theme.colors.onSurfaceVariant }}>
                                    No prepayments yet
                                </Text>
                            ) : (
                                selectedLoanPrepayments.map((prepayment) => (
                                    <View key={prepayment.id} style={styles.listItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                                {formatCurrency(prepayment.amount)}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                {new Date(prepayment.date).toLocaleDateString('en-IN')}
                                            </Text>
                                            {prepayment.note && (
                                                <Text variant="bodySmall" style={{ marginTop: 4 }}>
                                                    {prepayment.note}
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setItemToDelete({ ...prepayment, type: 'prepayment' });
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Icon name="delete" size={24} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Ledger Tab */}
                {activeTab === 'ledger' && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                                Month-by-Month Ledger
                            </Text>
                            <ScrollView horizontal>
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title style={{ width: 100 }}>Month</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 100 }}>Opening</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 80 }}>EMI</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 100 }}>Interest</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 100 }}>Principal</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 100 }}>Prepay</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 100 }}>Closing</DataTable.Title>
                                        <DataTable.Title numeric style={{ width: 60 }}>ROI%</DataTable.Title>
                                    </DataTable.Header>

                                    {selectedLoanLedger.slice(0, 50).map((entry, index) => (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell style={{ width: 100 }}>{formatDate(entry.month)}</DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 100 }}>
                                                {(entry.openingPrincipal / 100000).toFixed(1)}L
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 80 }}>
                                                {(entry.emiPaid / 1000).toFixed(0)}K
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 100 }}>
                                                {(entry.interestPaid / 1000).toFixed(0)}K
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 100 }}>
                                                {(entry.principalPaid / 1000).toFixed(0)}K
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 100 }}>
                                                {entry.prepayment > 0 ? `${(entry.prepayment / 1000).toFixed(0)}K` : '-'}
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 100 }}>
                                                {(entry.closingPrincipal / 100000).toFixed(1)}L
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric style={{ width: 60 }}>
                                                {entry.roi.toFixed(1)}
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                </DataTable>
                            </ScrollView>
                            {selectedLoanLedger.length > 50 && (
                                <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                                    Showing first 50 of {selectedLoanLedger.length} months
                                </Text>
                            )}
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>

            {/* FAB for Add actions */}
            {activeTab === 'overview' && (
                <FAB
                    icon="plus"
                    label="Add Entry"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddMonthlyEntry', { loanId })}
                />
            )}
            {activeTab === 'roi' && (
                <FAB
                    icon="plus"
                    label="Add ROI"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddROI', { loanId })}
                />
            )}
            {activeTab === 'prepayments' && (
                <FAB
                    icon="plus"
                    label="Add Prepayment"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddPrepayment', { loanId })}
                />
            )}
            {activeTab === 'emi' && (
                <FAB
                    icon="plus"
                    label="Add Entry"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddMonthlyEntry', { loanId })}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Portal>
                <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
                    <Dialog.Title>Confirm Delete</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Are you sure you want to delete this {itemToDelete?.type === 'emi' ? 'EMI payment' : itemToDelete?.type}? The ledger will be recalculated.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button
                            onPress={() => {
                                if (itemToDelete?.type === 'roi') handleDeleteROI();
                                else if (itemToDelete?.type === 'prepayment') handleDeletePrepayment();
                                else if (itemToDelete?.type === 'emi') handleDeleteEMIPayment();
                            }}
                            textColor={theme.colors.error}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        elevation: 2,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        flex: 1,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        minWidth: 100,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6200ea',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    summaryItem: {
        flex: 1,
    },
    analyticsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    analyticItem: {
        alignItems: 'center',
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
