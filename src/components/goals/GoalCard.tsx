import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, useTheme, Chip } from 'react-native-paper';
import { Goal } from '../../types/goalTypes';
import { calculateGoalProgress, getDaysRemaining, getProgressColor } from '../../utils/goalUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettingsStore } from '../../store/useSettingsStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GoalCardProps {
    goal: Goal;
    onPress: () => void;
    onLongPress?: () => void;
}

export const GoalCard = ({ goal, onPress, onLongPress }: GoalCardProps) => {
    const theme = useTheme();
    const { currency } = useSettingsStore();

    const progress = calculateGoalProgress(goal);
    const daysRemaining = getDaysRemaining(goal);
    const progressColor = getProgressColor(progress.percentage, goal.type);

    return (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                                <Icon name={goal.icon} size={20} color="#FFFFFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {goal.name}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {goal.type === 'savings' ? 'Savings Goal' : 'Spending Goal'}
                                </Text>
                            </View>
                        </View>
                        {daysRemaining >= 0 && (
                            <Chip
                                mode="outlined"
                                compact
                                style={{ height: 28 }}
                                textStyle={{ fontSize: 12 }}
                            >
                                {daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
                            </Chip>
                        )}
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.amountRow}>
                            <Text variant="bodyMedium" style={{ color: progressColor, fontWeight: 'bold' }}>
                                {formatCurrency(progress.progress, currency)}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                of {formatCurrency(progress.target, currency)}
                            </Text>
                        </View>
                        <ProgressBar
                            progress={Math.min(progress.percentage / 100, 1)}
                            color={progressColor}
                            style={styles.progressBar}
                        />
                        <View style={styles.statsRow}>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {progress.percentage.toFixed(1)}% {goal.type === 'savings' ? 'saved' : 'spent'}
                            </Text>
                            {progress.isComplete ? (
                                <Text
                                    variant="bodySmall"
                                    style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                                >
                                    ✓ Completed!
                                </Text>
                            ) : (
                                <Text
                                    variant="bodySmall"
                                    style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
                                >
                                    {formatCurrency(Math.abs(progress.remaining), currency)} {goal.type === 'savings' ? 'to go' : 'left'}
                                </Text>
                            )}
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    progressSection: {
        marginTop: 8,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
});
