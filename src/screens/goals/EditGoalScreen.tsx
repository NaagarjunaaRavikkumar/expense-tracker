import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text, SegmentedButtons } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useGoalStore } from '../../store/useGoalStore';
import { GOAL_COLORS, GOAL_ICONS, GoalType } from '../../types/goalTypes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const EditGoalScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const { goalId } = route.params;
    const { getGoalById, updateGoal } = useGoalStore();

    const goal = getGoalById(goalId);

    const [type, setType] = useState<GoalType>(goal?.type || 'savings');
    const [name, setName] = useState(goal?.name || '');
    const [description, setDescription] = useState(goal?.description || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount.toString() || '');
    const [selectedColor, setSelectedColor] = useState(goal?.color || GOAL_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(goal?.icon || GOAL_ICONS[0]);
    const [startDate, setStartDate] = useState(goal ? new Date(goal.startDate) : new Date());
    const [endDate, setEndDate] = useState(goal ? new Date(goal.endDate) : new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    if (!goal) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text>Goal not found</Text>
            </View>
        );
    }

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter a goal name');
            return;
        }

        if (!targetAmount || parseFloat(targetAmount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid target amount');
            return;
        }

        if (endDate <= startDate) {
            Alert.alert('Validation Error', 'End date must be after start date');
            return;
        }

        updateGoal(goalId, {
            type,
            name: name.trim(),
            description: description.trim() || undefined,
            targetAmount: parseFloat(targetAmount),
            color: selectedColor,
            icon: selectedIcon,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        });

        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Goal Type *
                </Text>
                <SegmentedButtons
                    value={type}
                    onValueChange={(value) => setType(value as GoalType)}
                    buttons={[
                        { value: 'savings', label: 'Savings', icon: 'piggy-bank' },
                        { value: 'spending', label: 'Spending', icon: 'wallet' },
                    ]}
                    style={styles.segment}
                />

                <TextInput
                    label="Goal Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Description (optional)"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={2}
                />

                <TextInput
                    label="Target Amount *"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                />

                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Icon
                </Text>
                <View style={styles.iconGrid}>
                    {GOAL_ICONS.map((iconName) => (
                        <TouchableOpacity
                            key={iconName}
                            style={[
                                styles.iconOption,
                                { backgroundColor: selectedIcon === iconName ? selectedColor : theme.colors.surfaceVariant },
                            ]}
                            onPress={() => setSelectedIcon(iconName)}
                        >
                            <Icon
                                name={iconName}
                                size={24}
                                color={selectedIcon === iconName ? '#FFFFFF' : theme.colors.onSurfaceVariant}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Color
                </Text>
                <View style={styles.colorGrid}>
                    {GOAL_COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedColor,
                            ]}
                            onPress={() => setSelectedColor(color)}
                        >
                            {selectedColor === color && (
                                <Icon name="check" size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Goal Period
                </Text>
                <View style={styles.dateRow}>
                    <Button
                        mode="outlined"
                        onPress={() => setShowStartPicker(true)}
                        style={styles.dateButton}
                        icon="calendar"
                    >
                        Start: {startDate.toISOString().split('T')[0]}
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => setShowEndPicker(true)}
                        style={styles.dateButton}
                        icon="calendar"
                    >
                        End: {endDate.toISOString().split('T')[0]}
                    </Button>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                >
                    Save Changes
                </Button>
            </ScrollView>

            <DatePicker
                modal
                open={showStartPicker}
                date={startDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowStartPicker(false);
                    setStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
            />

            <DatePicker
                modal
                open={showEndPicker}
                date={endDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowEndPicker(false);
                    setEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
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
    label: {
        marginBottom: 8,
        marginTop: 8,
    },
    segment: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 4,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    dateButton: {
        flex: 1,
    },
    saveButton: {
        marginTop: 16,
    },
});
