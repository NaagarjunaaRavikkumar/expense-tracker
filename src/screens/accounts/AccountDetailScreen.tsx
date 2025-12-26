import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, TextInput, Button } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useAccountStore, Account } from '../../store/useAccountStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'savings', label: 'Savings' },
    { value: 'investment', label: 'Investment' },
];

const ACCOUNT_ICONS = [
    'cash', 'bank', 'credit-card', 'wallet', 'piggy-bank',
    'safe', 'cash-multiple', 'credit-card-outline', 'account-cash',
];

const ACCOUNT_COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
    '#00BCD4', '#FF5722', '#3F51B5', '#009688', '#FFC107',
];

export const AccountDetailScreen = ({ route, navigation }: any) => {
    const theme = useTheme();
    const { accountId, isNew } = route.params || {};
    const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();

    const existingAccount = accounts.find(acc => acc.id === accountId);

    const [name, setName] = useState(existingAccount?.name || '');
    const [type, setType] = useState<Account['type']>(existingAccount?.type || 'cash');
    const [balance, setBalance] = useState(existingAccount?.balance.toString() || '0');
    const [currency, setCurrency] = useState(existingAccount?.currency || 'INR');
    const [icon, setIcon] = useState(existingAccount?.icon || 'cash');
    const [color, setColor] = useState(existingAccount?.color || '#4CAF50');

    const handleSave = () => {
        if (isNew) {
            addAccount({
                name,
                type,
                balance: parseFloat(balance),
                currency,
                icon,
                color,
            });
        } else if (accountId) {
            updateAccount(accountId, {
                name,
                type,
                balance: parseFloat(balance),
                currency,
                icon,
                color,
            });
        }
        navigation.goBack();
    };

    const handleDelete = () => {
        if (accountId) {
            deleteAccount(accountId);
            navigation.goBack();
        }
    };

    const canDelete = accountId && !accountId.startsWith('default-');

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader
                title={isNew ? 'Add Account' : 'Edit Account'}
                navigation={navigation}
                back={true}
                showThemeToggle={false}
            />

            <ScrollView style={styles.content}>
                <TextInput
                    label="Account Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                />

                {/* Account Type Selector */}
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Account Type
                </Text>
                <View style={styles.typeGrid}>
                    {ACCOUNT_TYPES.map((accountType) => (
                        <TouchableOpacity
                            key={accountType.value}
                            style={[
                                styles.typeButton,
                                {
                                    backgroundColor: type === accountType.value ? theme.colors.primary : theme.colors.surface,
                                    borderColor: theme.colors.outline,
                                }
                            ]}
                            onPress={() => setType(accountType.value as Account['type'])}
                        >
                            <Text
                                variant="bodyMedium"
                                style={{
                                    color: type === accountType.value ? theme.colors.onPrimary : theme.colors.onSurface
                                }}
                            >
                                {accountType.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    label="Initial Balance"
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                />

                <TextInput
                    label="Currency"
                    value={currency}
                    onChangeText={setCurrency}
                    style={styles.input}
                    mode="outlined"
                />

                {/* Icon Selector */}
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Icon
                </Text>
                <View style={styles.iconGrid}>
                    {ACCOUNT_ICONS.map((iconName) => (
                        <TouchableOpacity
                            key={iconName}
                            style={[
                                styles.iconButton,
                                {
                                    backgroundColor: icon === iconName ? color : theme.colors.surface,
                                    borderColor: theme.colors.outline,
                                }
                            ]}
                            onPress={() => setIcon(iconName)}
                        >
                            <Icon
                                name={iconName}
                                size={24}
                                color={icon === iconName ? '#FFFFFF' : theme.colors.onSurface}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Color Selector */}
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Color
                </Text>
                <View style={styles.colorGrid}>
                    {ACCOUNT_COLORS.map((colorValue) => (
                        <TouchableOpacity
                            key={colorValue}
                            style={[
                                styles.colorButton,
                                { backgroundColor: colorValue },
                                color === colorValue && styles.selectedColor,
                            ]}
                            onPress={() => setColor(colorValue)}
                        >
                            {color === colorValue && (
                                <Icon name="check" size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                    Save Account
                </Button>

                {canDelete && (
                    <Button
                        mode="outlined"
                        onPress={handleDelete}
                        style={styles.deleteButton}
                        textColor={theme.colors.error}
                    >
                        Delete Account
                    </Button>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 16 },
    input: { marginBottom: 16 },
    label: {
        marginBottom: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    colorButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    saveButton: {
        marginTop: 8,
        marginBottom: 12,
    },
    deleteButton: {
        marginBottom: 24,
    },
});
