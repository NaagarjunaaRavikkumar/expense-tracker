import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, useTheme, Button, IconButton, TextInput, Portal, Dialog } from 'react-native-paper';
import { GoalProgressCircle } from '../../components/goals/GoalProgressCircle';
import { useGoalStore } from '../../store/useGoalStore';
import { calculateGoalProgress, getDaysRemaining, getProgressColor, getGoalStatusText } from '../../utils/goalUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const GoalDetailScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const { goalId } = route.params;
    const { getGoalById, deleteGoal, addProgress, removeProgress } = useGoalStore();
    const { currency } = useSettingsStore();

    const goal = getGoalById(goalId);
    const [adjustDialogVisible, setAdjustDialogVisible] = useState(false);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

    if (!goal) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text>Goal not found</Text>
            </View>
        );
    }

    const progress = calculateGoalProgress(goal);
    const daysRemaining = getDaysRemaining(goal);
    const progressColor = getProgressColor(progress.percentage, goal.type);
    const statusText = getGoalStatusText(goal);

    const handleDelete = () => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteGoal(goalId);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleAdjustProgress = () => {
        const amount = parseFloat(adjustAmount);
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (adjustType === 'add') {
            addProgress(goalId, amount);
        } else {
            removeProgress(goalId, amount);
        }

        setAdjustDialogVisible(false);
        setAdjustAmount('');
    };

    const openAdjustDialog = (type: 'add' | 'remove') => {
        setAdjustType(type);
        setAdjustDialogVisible(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView>
                {/* Goal Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                                    <Icon name={goal.icon} size={28} color="#FFFFFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                                        {goal.name}
                                    </Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {goal.type === 'savings' ? 'Savings Goal' : 'Spending Goal'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.actions}>
                                <IconButton
                                    icon="pencil"
                                    size={24}
                                    onPress={() => navigation.navigate('EditGoal', { goalId })}
                                />
                                <IconButton
                                    icon="delete"
                                    size={24}
                                    iconColor={theme.colors.error}
                                    onPress={handleDelete}
                                />
                            </View>
                        </View>
                        {goal.description && (
                            <Text variant="bodyMedium" style={{ marginTop: 8, fontStyle: 'italic' }}>
                                {goal.description}
                            </Text>
                        )}
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            {goal.startDate} to {goal.endDate}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: progressColor, fontWeight: 'bold', marginTop: 4 }}>
                            {statusText}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Progress Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.progressContainer}>
                            <GoalProgressCircle percentage={progress.percentage} color={progressColor} />
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Target
                                    </Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        {formatCurrency(progress.target, currency)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Current
                                    </Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: progressColor }}>
                                        {formatCurrency(progress.progress, currency)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Remaining
                                    </Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        {formatCurrency(progress.remaining, currency)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Manual Adjustment Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                            Manual Adjustment
                        </Text>
                        <View style={styles.adjustButtons}>
                            <Button
                                mode="contained"
                                onPress={() => openAdjustDialog('add')}
                                style={{ flex: 1, marginRight: 8 }}
                                icon="plus"
                            >
                                Add Progress
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => openAdjustDialog('remove')}
                                style={{ flex: 1 }}
                                icon="minus"
                            >
                                Remove Progress
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Adjust Progress Dialog */}
            <Portal>
                <Dialog visible={adjustDialogVisible} onDismiss={() => setAdjustDialogVisible(false)}>
                    <Dialog.Title>{adjustType === 'add' ? 'Add' : 'Remove'} Progress</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Amount"
                            value={adjustAmount}
                            onChangeText={setAdjustAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            placeholder="0.00"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setAdjustDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleAdjustProgress}>Confirm</Button>
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
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actions: {
        flexDirection: 'row',
    },
    progressContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    adjustButtons: {
        flexDirection: 'row',
    },
});
