import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, FAB, Card, Text, Title, Paragraph, useTheme } from 'react-native-paper';
import { useLoanStore } from '../../store/useLoanStore';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

export const LoanDashboard = ({ navigation }: any) => {
    const { loans } = useLoanStore();
    const theme = useTheme();
    const { currency } = useSettingsStore();

    const renderItem = ({ item }: any) => (
        <Card style={styles.card} onPress={() => navigation.navigate('LoanDetail', { loanId: item.id })}>
            <Card.Content>
                <Title>{item.nickname}</Title>
                <Paragraph>Principal: {formatCurrency(item.principalAmount, currency)}</Paragraph>
                <Paragraph>Start Date: {format(new Date(item.startDate), 'MMM yyyy')}</Paragraph>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Loans" navigation={navigation} />

            <FlatList
                data={loans}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No loans added yet.</Text>}
            />

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddLoan')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    card: { marginBottom: 16 },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
});
