import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text, Chip } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { BUDGET_COLORS } from '../../types/budgetTypes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CreateBudgetScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { addBudget } = useBudgetStore();
    const { expenseCategories } = useCategoryStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedColor, setSelectedColor] = useState(BUDGET_COLORS[0]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter a budget name');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid amount');
            return;
        }

        if (endDate <= startDate) {
            Alert.alert('Validation Error', 'End date must be after start date');
            return;
        }

        addBudget({
            name: name.trim(),
            description: description.trim() || undefined,
            amount: parseFloat(amount),
            color: selectedColor,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            categoryIds: selectedCategoryIds,
        });

        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <TextInput
                    label="Budget Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Monthly Groceries"
                />

                <TextInput
                    label="Amount *"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="0.00"
                />

                <TextInput
                    label="Description (optional)"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Budget for groceries and household items"
                    multiline
                    numberOfLines={2}
                />

                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Color
                </Text>
                <View style={styles.colorGrid}>
                    {BUDGET_COLORS.map((color) => (
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
                    Budget Period
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

                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Categories to Track
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                    Tap to select/deselect categories. Leave all unselected to track all expenses.
                </Text>
                <View style={styles.categoryChips}>
                    {expenseCategories.map((category) => {
                        const isSelected = selectedCategoryIds.includes(category.id);
                        return (
                            <Chip
                                key={category.id}
                                selected={isSelected}
                                onPress={() => handleCategoryToggle(category.id)}
                                style={[
                                    styles.chip,
                                    isSelected && { backgroundColor: theme.colors.primaryContainer }
                                ]}
                                textStyle={isSelected ? { fontWeight: 'bold', color: theme.colors.onPrimaryContainer } : {}}
                                icon={category.icon}
                                showSelectedCheck={isSelected}
                            >
                                {category.name}
                            </Chip>
                        );
                    })}
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                >
                    Create Budget
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
    input: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        marginTop: 8,
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
    categoryChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    chip: {
        marginRight: 4,
        marginBottom: 4,
    },
    saveButton: {
        marginTop: 16,
    },
});
