import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSubcategoryStore } from '../../store/useSubcategoryStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AVAILABLE_COLORS = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
    '#FF9800', '#FF5722', '#795548', '#607D8B', '#9E9E9E',
];

const AVAILABLE_ICONS = [
    'food', 'cart', 'home', 'car', 'briefcase', 'hospital', 'school',
    'gift', 'movie', 'flash', 'bank', 'cash', 'wallet', 'account',
    'heart', 'star', 'shopping', 'airplane', 'phone', 'laptop',
];

export const CategoryDetailScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const { categoryId, categoryType, isNew } = route.params;
    const { getCategoryById, addCategory, updateCategory, deleteCategory } = useCategoryStore();
    const { subcategories, getSubcategoriesByCategory, addSubcategory, deleteSubcategory } = useSubcategoryStore();

    const existingCategory = !isNew ? getCategoryById(categoryId, categoryType) : null;

    const [name, setName] = useState(existingCategory?.name || '');
    const [selectedIcon, setSelectedIcon] = useState(existingCategory?.icon || 'shape');
    const [selectedColor, setSelectedColor] = useState(existingCategory?.color || '#2196F3');
    const [newSubcategoryName, setNewSubcategoryName] = useState('');

    // Get subcategories for this category from the database
    const categorySubcategories = !isNew && categoryId ? getSubcategoriesByCategory(categoryId) : [];

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        const categoryData = {
            id: isNew ? `custom_${Date.now()}` : categoryId,
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            type: categoryType,
        };

        if (isNew) {
            addCategory(categoryData, categoryType);
        } else {
            updateCategory(categoryId, categoryData, categoryType);
        }

        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteCategory(categoryId, categoryType);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleAddSubcategory = async () => {
        if (!newSubcategoryName.trim()) return;
        if (isNew) {
            Alert.alert('Error', 'Please save the category first before adding subcategories');
            return;
        }

        try {
            await addSubcategory({
                name: newSubcategoryName.trim(),
                categoryId: categoryId,
                icon: selectedIcon,
                color: selectedColor,
            });
            setNewSubcategoryName('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add subcategory');
        }
    };

    const handleDeleteSubcategory = async (subId: string) => {
        try {
            await deleteSubcategory(subId);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete subcategory');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader
                title={isNew ? 'New Category' : 'Edit Category'}
                navigation={navigation}
                back={true}
            />

            <ScrollView style={styles.content}>
                {/* Icon & Color Selection */}
                <View style={styles.iconSection}>
                    <View style={[styles.largeIconContainer, { backgroundColor: selectedColor }]}>
                        <Icon name={selectedIcon} size={48} color="#FFFFFF" />
                    </View>
                </View>

                {/* Name Input */}
                <TextInput
                    label="Category Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />

                {/* Icon Picker */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Select Icon
                </Text>
                <View style={styles.iconGrid}>
                    {AVAILABLE_ICONS.map((icon) => (
                        <TouchableOpacity
                            key={icon}
                            style={[
                                styles.iconOption,
                                { backgroundColor: theme.colors.surfaceVariant },
                                selectedIcon === icon && { borderColor: theme.colors.primary, borderWidth: 2 },
                            ]}
                            onPress={() => setSelectedIcon(icon)}
                        >
                            <Icon name={icon} size={24} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Color Picker */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Select Color
                </Text>
                <View style={styles.colorGrid}>
                    {AVAILABLE_COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedColor,
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>

                <Divider style={styles.divider} />

                {/* Subcategories */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Subcategories
                </Text>

                {categorySubcategories.map((sub) => (
                    <View key={sub.id} style={[styles.subcategoryItem, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.subcategoryIcon, { backgroundColor: selectedColor }]}>
                            <Icon name={selectedIcon} size={20} color="#FFFFFF" />
                        </View>
                        <Text variant="bodyMedium" style={styles.subcategoryName}>
                            {sub.name}
                        </Text>
                        <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteSubcategory(sub.id)}
                        />
                    </View>
                ))}

                {/* Add Subcategory */}
                <View style={styles.addSubcategoryContainer}>
                    <TextInput
                        label="New Subcategory"
                        value={newSubcategoryName}
                        onChangeText={setNewSubcategoryName}
                        mode="outlined"
                        style={styles.subcategoryInput}
                        onSubmitEditing={handleAddSubcategory}
                    />
                    <IconButton
                        icon="plus-circle"
                        size={32}
                        iconColor={theme.colors.primary}
                        onPress={handleAddSubcategory}
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.saveButton}
                    >
                        Save Category
                    </Button>

                    {!isNew && (
                        <Button
                            mode="outlined"
                            onPress={handleDelete}
                            textColor={theme.colors.error}
                            style={styles.deleteButton}
                        >
                            Delete Category
                        </Button>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 16 },
    iconSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    largeIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: { marginBottom: 16 },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 12,
        fontWeight: '600',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
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
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    divider: { marginVertical: 16 },
    subcategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
    },
    subcategoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subcategoryName: { flex: 1 },
    addSubcategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    subcategoryInput: { flex: 1, marginRight: 8 },
    buttonContainer: { marginTop: 16, marginBottom: 32 },
    saveButton: { marginBottom: 12 },
    deleteButton: { borderColor: '#EF4444' },
});
