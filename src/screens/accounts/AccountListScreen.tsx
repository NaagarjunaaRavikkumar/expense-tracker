import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, Card } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useAccountStore } from '../../store/useAccountStore';
import { formatCurrency } from '../../utils/currency';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AccountListScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { accounts } = useAccountStore();

    const handleAccountPress = (accountId: string) => {
        navigation.navigate('AccountDetail', { accountId });
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Accounts" navigation={navigation} />

            <ScrollView style={styles.content}>
                {/* Total Balance Card */}
                <Card style={styles.totalCard}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Total Balance
                        </Text>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 }}>
                            {formatCurrency(totalBalance, 'INR')}
                        </Text>
                    </Card.Content>
                </Card>

                <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                    ALL ACCOUNTS
                </Text>

                {accounts.map((account) => (
                    <TouchableOpacity
                        key={account.id}
                        style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}
                        onPress={() => handleAccountPress(account.id)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: account.color }]}>
                            <Icon name={account.icon} size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.accountInfo}>
                            <Text variant="titleMedium">{account.name}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textTransform: 'capitalize' }}>
                                {account.type.replace('_', ' ')}
                            </Text>
                        </View>
                        <View style={styles.balanceContainer}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                {formatCurrency(account.balance, account.currency)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => navigation.navigate('AccountDetail', { isNew: true })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 16 },
    totalCard: {
        marginBottom: 24,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    accountInfo: {
        flex: 1,
    },
    balanceContainer: {
        alignItems: 'flex-end',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
