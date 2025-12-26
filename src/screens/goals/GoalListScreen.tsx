import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Text, useTheme, Dialog, Button, Portal, SegmentedButtons } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { GoalCard } from '../../components/goals/GoalCard';
import { useGoalStore } from '../../store/useGoalStore';
import { isGoalActive, isGoalExpired } from '../../utils/goalUtils';

export const GoalListScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { goals, deleteGoal } = useGoalStore();
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

    const handleGoalPress = (goalId: string) => {
        navigation.navigate('GoalDetail', { goalId });
    };

    const handleGoalLongPress = (goalId: string) => {
        setSelectedGoalId(goalId);
        setDeleteDialogVisible(true);
    };

    const confirmDelete = () => {
        if (selectedGoalId) {
            deleteGoal(selectedGoalId);
        }
        setDeleteDialogVisible(false);
        setSelectedGoalId(null);
    };

    // Filter goals
    const filteredGoals = goals.filter(goal => {
        if (filter === 'active') {
            return isGoalActive(goal) && goal.currentProgress < goal.targetAmount;
        }
        if (filter === 'completed') {
            return goal.currentProgress >= goal.targetAmount;
        }
        return true; // 'all'
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Goals" navigation={navigation} />

            {/* Filter */}
            <View style={styles.filterContainer}>
                <SegmentedButtons
                    value={filter}
                    onValueChange={(value) => setFilter(value as any)}
                    buttons={[
                        { value: 'active', label: 'Active' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'all', label: 'All' },
                    ]}
                />
            </View>

            <FlatList
                data={filteredGoals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <GoalCard
                        goal={item}
                        onPress={() => handleGoalPress(item.id)}
                        onLongPress={() => handleGoalLongPress(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            No goals yet
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            Tap the + button to create your first goal
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => navigation.navigate('CreateGoal')}
            />

            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Goal</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to delete this goal? This action cannot be undone.
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
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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
