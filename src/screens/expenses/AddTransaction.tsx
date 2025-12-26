import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, useTheme, Text, IconButton } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useExpenseStore } from '../../store/useExpenseStore';
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

export const AddTransaction = ({ navigation }: any) => {
    const { addTransaction } = useExpenseStore();
    const { incomeCategories, expenseCategories } = useCategoryStore();
    const { getSubcategoriesByCategory } = useSubcategoryStore();
    const { accounts } = useAccountStore();
    const theme = useTheme();

    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [date, setDate] = useState(currentDate);
    const [time, setTime] = useState(currentTime);
    const [notes, setNotes] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState((accounts && accounts[0]?.id) || '');
    const [selectedToAccountId, setSelectedToAccountId] = useState(''); // For transfers
    const [selectedPaymentType, setSelectedPaymentType] = useState<any>('cash');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [subcategoryMenuVisible, setSubcategoryMenuVisible] = useState(false);
    const [accountMenuVisible, setAccountMenuVisible] = useState(false);
    const [toAccountMenuVisible, setToAccountMenuVisible] = useState(false);
    const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(now);

    const categories = type === 'income' ? (incomeCategories || []) : (expenseCategories || []);
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    const subcategories = selectedCategoryId ? getSubcategoriesByCategory(selectedCategoryId) : [];
    const selectedSubcategory = subcategories.find(sub => sub.id === selectedSubcategoryId);
    const selectedAccount = (accounts || []).find(acc => acc.id === selectedAccountId);
    const selectedToAccount = (accounts || []).find(acc => acc.id === selectedToAccountId);
    const selectedPayment = PAYMENT_TYPES.find(p => p.value === selectedPaymentType);

    const handleSave = () => {
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid amount');
            return;
        }

        // Validate category for non-transfer transactions
        if (type !== 'transfer' && !selectedCategoryId) {
            Alert.alert('Validation Error', 'Please select a category');
            return;
        }

        // Validate account
        if (!selectedAccountId) {
            Alert.alert('Validation Error', 'Please select an account');
            return;
        }

        // Validate transfer accounts
        if (type === 'transfer') {
            if (!selectedToAccountId) {
                Alert.alert('Validation Error', 'Please select both From and To accounts');
                return;
            }
            if (selectedAccountId === selectedToAccountId) {
                Alert.alert('Validation Error', 'From and To accounts must be different');
                return;
            }
        }

        addTransaction({
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
        } else {
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
                    label="Amount *"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    error={!amount}
                />

                <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>Date & Time</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                        mode="outlined"
                        onPress={() => setShowDatePicker(true)}
                        style={{ flex: 1 }}
                        icon="calendar"
                    >
                        {date}
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => setShowTimePicker(true)}
                        style={{ flex: 1 }}
                        icon="clock-outline"
                    >
                        {time}
                    </Button>
                </View>

                {/* Account Picker - Show as "From Account" for transfers */}
                <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {type === 'transfer' ? 'From Account *' : 'Account *'}
                </Text>
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

                {/* To Account Picker - Only show for transfers */}
                {type === 'transfer' && (
                    <>
                        <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
                            To Account *
                        </Text>
                        <TouchableOpacity
                            style={[styles.picker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                            onPress={() => setToAccountMenuVisible(true)}
                        >
                            {selectedToAccount ? (
                                <View style={styles.pickerContent}>
                                    <View style={[styles.pickerIcon, { backgroundColor: selectedToAccount.color }]}>
                                        <Icon name={selectedToAccount.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <Text variant="bodyLarge">{selectedToAccount.name}</Text>
                                </View>
                            ) : (
                                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Select Destination Account
                                </Text>
                            )}
                            <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </>
                )}

                {/* Payment Type Picker - Hide for transfers (auto set to bank transfer) */}
                {type !== 'transfer' && (
                    <>
                        <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Payment Type
                        </Text>
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
                    </>
                )}

                {/* Category Picker - Hide for transfers */}
                {type !== 'transfer' && (
                    <>
                        <Text variant="labelMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Category
                        </Text>
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

                {/* Scan Receipt Button - Only for expenses */}
                {type === 'expense' && (
                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('ReceiptScan')}
                        style={styles.scanButton}
                        icon="camera"
                    >
                        Scan Receipt
                    </Button>
                )}

                <Button mode="contained" onPress={handleSave} style={styles.button}>
                    Save Transaction
                </Button>
            </ScrollView>

            {/* Account Selection Modal */}
            {accountMenuVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">{type === 'transfer' ? 'Select From Account' : 'Select Account'}</Text>
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

            {/* To Account Selection Modal */}
            {toAccountMenuVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select To Account</Text>
                            <IconButton icon="close" onPress={() => setToAccountMenuVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {(accounts || []).filter(acc => acc.id !== selectedAccountId).map((acc) => (
                                <TouchableOpacity
                                    key={acc.id}
                                    style={[styles.option, { backgroundColor: theme.colors.background }]}
                                    onPress={() => {
                                        setSelectedToAccountId(acc.id);
                                        setToAccountMenuVisible(false);
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

            {/* Payment Type Selection Modal */}
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

            {/* Category Selection Modal */}
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

            {/* Subcategory Selection Modal - Removed (not in schema) */}

            {/* Date Picker */}
            <DatePicker
                modal
                open={showDatePicker}
                date={selectedDateTime}
                mode="date"
                onConfirm={(selectedDate: Date) => {
                    setShowDatePicker(false);
                    setSelectedDateTime(selectedDate);
                    setDate(selectedDate.toISOString().split('T')[0]);
                }}
                onCancel={() => setShowDatePicker(false)}
            />

            {/* Time Picker */}
            <DatePicker
                modal
                open={showTimePicker}
                date={selectedDateTime}
                mode="time"
                onConfirm={(selectedTime: Date) => {
                    setShowTimePicker(false);
                    setSelectedDateTime(selectedTime);
                    const hours = selectedTime.getHours().toString().padStart(2, '0');
                    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                    setTime(`${hours}:${minutes}`);
                }}
                onCancel={() => setShowTimePicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    segment: { marginBottom: 16 },
    input: { marginBottom: 12 },
    scanButton: { marginTop: 8, marginBottom: 8 },
    button: { marginTop: 16 },
    fieldLabel: {
        marginBottom: 8,
        marginTop: 4,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
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
