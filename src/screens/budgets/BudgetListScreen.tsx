import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Text, useTheme, Dialog, Button, Portal } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { BudgetCard } from '../../components/budgets/BudgetCard';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateBudgetProgress, isBudgetActive } from '../../utils/budgetUtils';

export const BudgetListScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { budgets, deleteBudget } = useBudgetStore();
    const { transactions } = useExpenseStore();
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

    const handleBudgetPress = (budgetId: string) => {
        navigation.navigate('BudgetDetail', { budgetId });
    };

    const handleBudgetLongPress = (budgetId: string) => {
        setSelectedBudgetId(budgetId);
        setDeleteDialogVisible(true);
    };

    const confirmDelete = () => {
        if (selectedBudgetId) {
            deleteBudget(selectedBudgetId);
        }
        setDeleteDialogVisible(false);
        setSelectedBudgetId(null);
    };

    // Separate active and inactive budgets
    const activeBudgets = budgets.filter(isBudgetActive);
    const inactiveBudgets = budgets.filter(b => !isBudgetActive(b));

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Budgets" navigation={navigation} />

            <FlatList
                data={budgets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const progress = calculateBudgetProgress(transactions, item);
                    return (
                        <BudgetCard
                            budget={item}
                            progress={progress}
                            onPress={() => handleBudgetPress(item.id)}
                            onLongPress={() => handleBudgetLongPress(item.id)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            No budgets yet
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            Tap the + button to create your first budget
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => navigation.navigate('CreateBudget')}
            />

            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Budget</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to delete this budget? This action cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button onPress={confirmDelete} textColor={theme.colors.error}>
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
    listContent: {
        paddingVertical: 8,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});
