import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { List, Switch, Button, Text, Divider, Appbar, TextInput, useTheme } from 'react-native-paper';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUserStore } from '../../store/useUserStore';
import { signIn, signOut, getCurrentUser, signInSilently } from '../../services/auth/googleAuth';
import { uploadDatabase, restoreDatabase } from '../../services/backup/driveService';
import { User } from '@react-native-google-signin/google-signin';

interface GoogleUser {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
}

export const SettingsScreen = ({ navigation }: any) => {
    const { theme: appTheme, setTheme, currency, setCurrency } = useSettingsStore();
    const { profile, updateProfile, isPinEnabled } = useUserStore();
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        console.log('Checking user status...');
        let response: any = await getCurrentUser();
        console.log('getCurrentUser response:', JSON.stringify(response, null, 2));

        if (!response) {
            console.log('Attempting silent sign-in...');
            response = await signInSilently();
            console.log('signInSilently response:', JSON.stringify(response, null, 2));
        }

        // Check for nested user object (from signIn) or direct user object (from getCurrentUser)
        if (response) {
            if (response.data && response.data.user) {
                console.log('Setting user state from response.data.user');
                setUser(response.data.user);
            } else if (response.user) {
                console.log('Setting user state from response.user');
                setUser(response.user);
            } else {
                console.log('Response found but no user object structure matched');
            }
        } else {
            console.log('No user found after checks');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            if (user) {
                await signOut();
                setUser(null);
            } else {
                const response: any = await signIn();
                if (response.data && response.data.user) {
                    setUser(response.data.user);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Google Sign-In failed');
        }
    };

    const handleBackup = async () => {
        if (!user) return;
        setIsBackingUp(true);
        try {
            await uploadDatabase();
            Alert.alert('Success', 'Backup completed successfully');
        } catch (error: any) {
            Alert.alert('Backup Failed', error.message || 'Unknown error');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        if (!user) return;

        Alert.alert(
            'Restore Data',
            'This will overwrite your current data with the latest backup from Google Drive. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        setIsRestoring(true);
                        try {
                            await restoreDatabase();
                            Alert.alert(
                                'Success',
                                'Data restored successfully. Please restart the app to apply changes.',
                                [{ text: 'OK' }] // Ideally we should restart or reload stores here
                            );
                        } catch (error: any) {
                            Alert.alert('Restore Failed', error.message || 'Unknown error');
                        } finally {
                            setIsRestoring(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CustomHeader title="Settings" navigation={navigation} />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <List.Section>
                    <List.Subheader>Profile</List.Subheader>
                    <View style={styles.profileContainer}>
                        <TextInput
                            label="Your Name"
                            value={profile.name}
                            onChangeText={(text) => updateProfile({ name: text })}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Appearance</List.Subheader>
                    <List.Item
                        title="Dark Mode"
                        right={() => (
                            <Switch
                                value={appTheme === 'dark'}
                                onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                            />
                        )}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>General</List.Subheader>
                    <List.Item
                        title="Currency"
                        description={currency === 'INR' ? 'Indian Rupee (₹)' : currency === 'USD' ? 'US Dollar ($)' : currency}
                        left={(props) => <List.Icon {...props} icon="currency-usd" />}
                        onPress={() => {
                            // Cycle through currencies: INR -> USD -> EUR -> GBP -> INR
                            const currencies = ['INR', 'USD', 'EUR', 'GBP'];
                            const currentIndex = currencies.indexOf(currency);
                            const nextIndex = (currentIndex + 1) % currencies.length;
                            setCurrency(currencies[nextIndex]);
                        }}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Quick Actions</List.Subheader>
                    <List.Item
                        title="Loan Tracker"
                        description="Track loans with variable rates"
                        left={(props) => <List.Icon {...props} icon="bank-transfer" />}
                        onPress={() => navigation.navigate('LoanTrackerList')}
                    />
                    <List.Item
                        title="Accounts"
                        description="Manage your accounts"
                        left={(props) => <List.Icon {...props} icon="bank" />}
                        onPress={() => navigation.navigate('Accounts')}
                    />
                    <List.Item
                        title="Categories"
                        description="Manage categories"
                        left={(props) => <List.Icon {...props} icon="shape" />}
                        onPress={() => navigation.navigate('Categories')}
                    />
                    <List.Item
                        title="Budgets"
                        description="View and manage budgets"
                        left={(props) => <List.Icon {...props} icon="chart-box" />}
                        onPress={() => navigation.navigate('Budgets')}
                    />
                    <List.Item
                        title="Goals"
                        description="Track your financial goals"
                        left={(props) => <List.Icon {...props} icon="target" />}
                        onPress={() => navigation.navigate('Goals')}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Receipt Scanner</List.Subheader>
                    <List.Item
                        title="Purchase History"
                        description="View scanned receipts and price trends"
                        left={(props) => <List.Icon {...props} icon="receipt" />}
                        onPress={() => navigation.navigate('PurchaseHistory')}
                    />
                    <List.Item
                        title="Scan New Receipt"
                        description="Capture and analyze receipt"
                        left={(props) => <List.Icon {...props} icon="camera" />}
                        onPress={() => navigation.navigate('ReceiptScan')}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Security</List.Subheader>
                    <List.Item
                        title="App Lock"
                        description="Secure app with PIN"
                        left={(props) => <List.Icon {...props} icon="lock" />}
                        right={() => (
                            <Switch
                                value={isPinEnabled}
                                onValueChange={(val) => {
                                    if (val) {
                                        navigation.navigate('PinLogin', { mode: 'create' });
                                    } else {
                                        navigation.navigate('PinLogin', { mode: 'disable' });
                                    }
                                }}
                            />
                        )}
                    />
                    {isPinEnabled && (
                        <List.Item
                            title="Change PIN"
                            left={(props) => <List.Icon {...props} icon="key-change" />}
                            onPress={() => navigation.navigate('PinLogin', { mode: 'change' })}
                        />
                    )}
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Backup & Sync</List.Subheader>
                    <List.Item
                        title={user ? `Signed in as ${user.name}` : 'Not Signed In'}
                        description="Sign in with Google to enable backup"
                        left={(props) => <List.Icon {...props} icon="google" />}
                        right={() => (
                            <Button mode="outlined" onPress={handleGoogleLogin}>
                                {user ? 'Sign Out' : 'Sign In'}
                            </Button>
                        )}
                    />
                    <List.Item
                        title="Backup Data"
                        description={isBackingUp ? 'Backing up...' : 'Upload local data to Google Drive'}
                        left={(props) => <List.Icon {...props} icon="cloud-upload" />}
                        onPress={handleBackup}
                        disabled={!user || isBackingUp || isRestoring}
                    />
                    <List.Item
                        title="Restore Data"
                        description={isRestoring ? 'Restoring...' : 'Restore data from Google Drive'}
                        left={(props) => <List.Icon {...props} icon="cloud-download" />}
                        onPress={handleRestore}
                        disabled={!user || isBackingUp || isRestoring}
                    />

                </List.Section>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileContainer: { paddingHorizontal: 16, paddingBottom: 8 },
    input: {},
});
