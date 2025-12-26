import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Portal, Modal, Button, useTheme, Text } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { DateFilterType, DateRange } from '../../utils/analyticsUtils';

interface DateFilterBarProps {
    selectedFilter: DateFilterType;
    onFilterChange: (filter: DateFilterType, customRange?: DateRange) => void;
}

export const DateFilterBar = ({ selectedFilter, onFilterChange }: DateFilterBarProps) => {
    const theme = useTheme();
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleFilterPress = (filter: DateFilterType) => {
        if (filter === 'custom') {
            setShowCustomModal(true);
        } else {
            onFilterChange(filter);
        }
    };

    const handleCustomApply = () => {
        onFilterChange('custom', { start: customStartDate, end: customEndDate });
        setShowCustomModal(false);
    };

    return (
        <View style={styles.container}>
            <Chip
                selected={selectedFilter === 'week'}
                onPress={() => handleFilterPress('week')}
                style={styles.chip}
                mode="outlined"
            >
                Week
            </Chip>
            <Chip
                selected={selectedFilter === 'month'}
                onPress={() => handleFilterPress('month')}
                style={styles.chip}
                mode="outlined"
            >
                Month
            </Chip>
            <Chip
                selected={selectedFilter === 'year'}
                onPress={() => handleFilterPress('year')}
                style={styles.chip}
                mode="outlined"
            >
                Year
            </Chip>
            <Chip
                selected={selectedFilter === 'custom'}
                onPress={() => handleFilterPress('custom')}
                style={styles.chip}
                mode="outlined"
                icon="calendar-range"
            >
                Custom
            </Chip>

            <Portal>
                <Modal
                    visible={showCustomModal}
                    onDismiss={() => setShowCustomModal(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>Select Date Range</Text>

                    <Button
                        mode="outlined"
                        onPress={() => setShowStartPicker(true)}
                        style={styles.dateButton}
                    >
                        Start: {customStartDate.toISOString().split('T')[0]}
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => setShowEndPicker(true)}
                        style={styles.dateButton}
                    >
                        End: {customEndDate.toISOString().split('T')[0]}
                    </Button>

                    <View style={styles.modalButtons}>
                        <Button onPress={() => setShowCustomModal(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleCustomApply}>Apply</Button>
                    </View>
                </Modal>
            </Portal>

            <DatePicker
                modal
                open={showStartPicker}
                date={customStartDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowStartPicker(false);
                    setCustomStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
            />

            <DatePicker
                modal
                open={showEndPicker}
                date={customEndDate}
                mode="date"
                onConfirm={(date: Date) => {
                    setShowEndPicker(false);
                    setCustomEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        flexWrap: 'wrap',
    },
    chip: {
        marginRight: 4,
    },
    modal: {
        margin: 20,
        padding: 20,
        borderRadius: 8,
    },
    dateButton: {
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
    },
});
