import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, useTheme, Text, IconButton } from 'react-native-paper';
import { useExpenseStore, Transaction } from '../../store/useExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSubcategoryStore } from '../../store/useSubcategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PAYMENT_TYPES = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'debit_card', label: 'Debit Card', icon: 'credit-card' },
    { value: 'credit_card', label: 'Credit Card', icon: 'credit-card-outline' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'bank-transfer' },
    { value: 'voucher', label: 'Voucher', icon: 'ticket' },
    { value: 'mobile_payment', label: 'Mobile Payment', icon: 'cellphone' },
    { value: 'web_payment', label: 'Web Payment', icon: 'web' },
];

export const EditTransaction = ({ route, navigation }: any) => {
    const { transactionId } = route.params;
    const { transactions, updateTransaction } = useExpenseStore();
    const { incomeCategories, expenseCategories } = useCategoryStore();
    const { getSubcategoriesByCategory } = useSubcategoryStore();
    const { accounts } = useAccountStore();
    const theme = useTheme();

    const transaction = transactions.find(t => t.id === transactionId);

    const [amount, setAmount] = useState(transaction?.amount.toString() || '');
    const [type, setType] = useState(transaction?.type || 'expense');
    const [date, setDate] = useState(transaction?.date || '');
    const [time, setTime] = useState(transaction?.time || '');
    const [notes, setNotes] = useState(transaction?.notes || '');
    const [selectedAccountId, setSelectedAccountId] = useState(transaction?.accountId || accounts[0]?.id || '');
    const [selectedToAccountId, setSelectedToAccountId] = useState(transaction?.toAccountId || '');
    const [selectedPaymentType, setSelectedPaymentType] = useState<any>(transaction?.paymentType || 'cash');
    const [selectedCategoryId, setSelectedCategoryId] = useState(transaction?.categoryId || '');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(transaction?.subcategoryId || '');
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [subcategoryMenuVisible, setSubcategoryMenuVisible] = useState(false);
    const [accountMenuVisible, setAccountMenuVisible] = useState(false);
    const [toAccountMenuVisible, setToAccountMenuVisible] = useState(false);
    const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);

    const categories = type === 'income' ? (incomeCategories || []) : (expenseCategories || []);
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    const subcategories = selectedCategoryId ? getSubcategoriesByCategory(selectedCategoryId) : [];
    const selectedSubcategory = subcategories.find(sub => sub.id === selectedSubcategoryId);
    const selectedAccount = (accounts || []).find(acc => acc.id === selectedAccountId);
    const selectedToAccount = (accounts || []).find(acc => acc.id === selectedToAccountId);
    const selectedPayment = PAYMENT_TYPES.find(p => p.value === selectedPaymentType);

    if (!transaction) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text>Transaction not found</Text>
            </View>
        );
    }

    const handleSave = () => {
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid amount');
            return;
        }

        // Validate transfer accounts
        if (type === 'transfer') {
            if (!selectedAccountId || !selectedToAccountId) {
                Alert.alert('Validation Error', 'Please select both From and To accounts');
                return;
            }
            if (selectedAccountId === selectedToAccountId) {
                Alert.alert('Validation Error', 'From and To accounts must be different');
                return;
            }
        }


        updateTransaction(transactionId, {
            amount: parseFloat(amount),
            date: date,
            time: time,
            type: type as any,
            categoryId: type === 'transfer' ? null : selectedCategoryId,
            subcategoryId: selectedSubcategoryId || null,
            accountId: selectedAccountId,
            paymentType: selectedPaymentType,
            notes,
            toAccountId: type === 'transfer' ? selectedToAccountId : undefined,
        });
        navigation.goBack();
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');

        // Set default payment type for transfer
        if (newType === 'transfer') {
            setSelectedPaymentType('bank_transfer');
        } else if (transaction?.type === 'transfer' && newType !== 'transfer') {
            setSelectedPaymentType('cash');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <SegmentedButtons
                    value={type}
                    onValueChange={handleTypeChange}
                    buttons={[
                        { value: 'expense', label: 'Expense' },
                        { value: 'income', label: 'Income' },
                        { value: 'transfer', label: 'Transfer' },
                    ]}
                    style={styles.segment}
                />

                <TextInput
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                />

                <TextInput
                    label="Date"
                    value={date}
                    onChangeText={setDate}
                    style={styles.input}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                />

                <TextInput
                    label="Time"
                    value={time}
                    onChangeText={setTime}
                    style={styles.input}
                    mode="outlined"
                    placeholder="HH:MM"
                />

                {/* Account Picker */}
                <TouchableOpacity
                    style={[styles.picker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                    onPress={() => setAccountMenuVisible(true)}
                >
                    {selectedAccount ? (
                        <View style={styles.pickerContent}>
                            <View style={[styles.pickerIcon, { backgroundColor: selectedAccount.color }]}>
                                <Icon name={selectedAccount.icon} size={20} color="#FFFFFF" />
                            </View>
                            <Text variant="bodyLarge">{selectedAccount.name}</Text>
                        </View>
                    ) : (
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Select Account
                        </Text>
                    )}
                    <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {/* Payment Type Picker */}
                <TouchableOpacity
                    style={[styles.picker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                    onPress={() => setPaymentMenuVisible(true)}
                >
                    {selectedPayment ? (
                        <View style={styles.pickerContent}>
                            <Icon name={selectedPayment.icon} size={20} color={theme.colors.primary} />
                            <Text variant="bodyLarge" style={{ marginLeft: 12 }}>{selectedPayment.label}</Text>
                        </View>
                    ) : (
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Select Payment Type
                        </Text>
                    )}
                    <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {/* Category Picker */}
                <TouchableOpacity
                    style={[styles.picker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                    onPress={() => setCategoryMenuVisible(true)}
                >
                    {selectedCategory ? (
                        <View style={styles.pickerContent}>
                            <View style={[styles.pickerIcon, { backgroundColor: selectedCategory.color }]}>
                                <Icon name={selectedCategory.icon} size={20} color="#FFFFFF" />
                            </View>
                            <Text variant="bodyLarge">{selectedCategory.name}</Text>
                        </View>
                    ) : (
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Select Category
                        </Text>
                    )}
                    <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {/* Subcategory Picker */}
                {selectedCategory && subcategories.length > 0 && (
                    <>
                        <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant, marginTop: 12 }]}>
                            Subcategory (Optional)
                        </Text>
                        <TouchableOpacity
                            style={[styles.picker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                            onPress={() => setSubcategoryMenuVisible(true)}
                        >
                            {selectedSubcategory ? (
                                <View style={styles.pickerContent}>
                                    <View style={[styles.pickerIcon, { backgroundColor: selectedSubcategory.color || selectedCategory.color }]}>
                                        <Icon name={selectedSubcategory.icon || selectedCategory.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <Text variant="bodyLarge">{selectedSubcategory.name}</Text>
                                </View>
                            ) : (
                                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Select Subcategory
                                </Text>
                            )}
                            <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </>
                )}

                <TextInput
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                />

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Update Transaction
                </Button>
            </ScrollView>

            {/* Modals - Same as AddTransaction */}
            {accountMenuVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select Account</Text>
                            <IconButton icon="close" onPress={() => setAccountMenuVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {(accounts || []).map((acc) => (
                                <TouchableOpacity
                                    key={acc.id}
                                    style={[styles.option, { backgroundColor: theme.colors.background }]}
                                    onPress={() => {
                                        setSelectedAccountId(acc.id);
                                        setAccountMenuVisible(false);
                                    }}
                                >
                                    <View style={[styles.pickerIcon, { backgroundColor: acc.color }]}>
                                        <Icon name={acc.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <Text variant="bodyLarge">{acc.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {paymentMenuVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select Payment Type</Text>
                            <IconButton icon="close" onPress={() => setPaymentMenuVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {PAYMENT_TYPES.map((payment) => (
                                <TouchableOpacity
                                    key={payment.value}
                                    style={[styles.option, { backgroundColor: theme.colors.background }]}
                                    onPress={() => {
                                        setSelectedPaymentType(payment.value);
                                        setPaymentMenuVisible(false);
                                    }}
                                >
                                    <Icon name={payment.icon} size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                                    <Text variant="bodyLarge">{payment.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {categoryMenuVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select Category</Text>
                            <IconButton icon="close" onPress={() => setCategoryMenuVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.option, { backgroundColor: theme.colors.background }]}
                                    onPress={() => {
                                        setSelectedCategoryId(cat.id);
                                        setSelectedSubcategoryId('');
                                        setCategoryMenuVisible(false);
                                    }}
                                >
                                    <View style={[styles.pickerIcon, { backgroundColor: cat.color }]}>
                                        <Icon name={cat.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <Text variant="bodyLarge">{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {/* Subcategory Selection Modal */}
            {subcategoryMenuVisible && selectedCategory && subcategories.length > 0 && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select Subcategory</Text>
                            <IconButton icon="close" onPress={() => setSubcategoryMenuVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {subcategories.map((sub) => (
                                <TouchableOpacity
                                    key={sub.id}
                                    style={[styles.option, { backgroundColor: theme.colors.background }]}
                                    onPress={() => {
                                        setSelectedSubcategoryId(sub.id);
                                        setSubcategoryMenuVisible(false);
                                    }}
                                >
                                    <View style={[styles.pickerIcon, { backgroundColor: sub.color || selectedCategory.color }]}>
                                        <Icon name={sub.icon || selectedCategory.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <Text variant="bodyLarge">{sub.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
            {/* </ScrollView> */}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    segment: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 16,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
    },
    pickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    pickerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fieldLabel: {
        marginBottom: 8,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        borderRadius: 12,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalScroll: {
        maxHeight: 400,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
});
