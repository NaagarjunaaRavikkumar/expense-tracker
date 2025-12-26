import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Text, useTheme, List, Divider } from 'react-native-paper';
import { CustomHeader } from '../components/ui/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AboutScreen = ({ navigation }: any) => {
    const theme = useTheme();

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="About" navigation={navigation} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* App Info Card */}
                <Card style={styles.card}>
                    <Card.Content style={styles.appInfo}>
                        <Icon name="finance" size={64} color={theme.colors.primary} />
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginTop: 16 }}>
                            FinTrack Hub
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            Version 1.0.0
                        </Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 16 }}>
                            Your complete personal finance management solution
                        </Text>
                    </Card.Content>
                </Card>

                {/* Features Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Features
                        </Text>
                        <List.Item
                            title="Multi-Home Loan Tracker"
                            description="Track multiple loans with variable rates and prepayments"
                            left={props => <List.Icon {...props} icon="bank" />}
                        />
                        <Divider />
                        <List.Item
                            title="Expense Management"
                            description="Track expenses with categories and accounts"
                            left={props => <List.Icon {...props} icon="wallet" />}
                        />
                        <Divider />
                        <List.Item
                            title="Budget Planning"
                            description="Create and monitor budgets for better control"
                            left={props => <List.Icon {...props} icon="chart-donut" />}
                        />
                        <Divider />
                        <List.Item
                            title="Goal Setting"
                            description="Set and track savings and spending goals"
                            left={props => <List.Icon {...props} icon="flag" />}
                        />
                        <Divider />
                        <List.Item
                            title="Offline-First"
                            description="Works offline with optional Google Drive backup"
                            left={props => <List.Icon {...props} icon="cloud-sync" />}
                        />
                    </Card.Content>
                </Card>

                {/* Developer Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Developer
                        </Text>
                        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                            Built with ❤️ using React Native
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            © 2025 FinTrack Hub. All rights reserved.
                        </Text>
                    </Card.Content>
                </Card>

                {/* Legal Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Legal
                        </Text>
                        <List.Item
                            title="Privacy Policy"
                            left={props => <List.Icon {...props} icon="shield-check" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => { }}
                        />
                        <Divider />
                        <List.Item
                            title="Terms of Service"
                            left={props => <List.Icon {...props} icon="file-document" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => { }}
                        />
                    </Card.Content>
                </Card>
            </ScrollView>
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
    card: {
        marginBottom: 16,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 16,
    },
});
