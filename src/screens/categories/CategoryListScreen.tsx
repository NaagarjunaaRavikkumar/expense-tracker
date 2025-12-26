import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, SegmentedButtons, Avatar } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useCategoryStore } from '../../store/useCategoryStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CategoryListScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { incomeCategories, expenseCategories } = useCategoryStore();
    const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

    const categories = categoryType === 'income' ? incomeCategories : expenseCategories;

    const handleCategoryPress = (categoryId: string) => {
        navigation.navigate('CategoryDetail', { categoryId, categoryType });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Categories" navigation={navigation} />

            <View style={styles.content}>
                {/* Type Selector */}
                <SegmentedButtons
                    value={categoryType}
                    onValueChange={(value) => setCategoryType(value as 'income' | 'expense')}
                    buttons={[
                        { value: 'expense', label: 'Expense' },
                        { value: 'income', label: 'Income' },
                    ]}
                    style={styles.segmentedButtons}
                />

                {/* Category List */}
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                        ALL CATEGORIES
                    </Text>

                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}
                            onPress={() => handleCategoryPress(category.id)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                                <Icon name={category.icon} size={24} color="#FFFFFF" />
                            </View>
                            <Text variant="bodyLarge" style={styles.categoryName}>
                                {category.name}
                            </Text>
                            <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => navigation.navigate('CategoryDetail', { categoryType, isNew: true })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 16 },
    segmentedButtons: { marginBottom: 16 },
    scrollView: { flex: 1 },
    sectionTitle: {
        marginBottom: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryName: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
