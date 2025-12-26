import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/useUserStore';

type PinMode = 'create' | 'verify' | 'login' | 'disable' | 'change';

interface PinScreenProps {
    navigation: any;
    route: any;
}

export const PinScreen = ({ navigation, route }: PinScreenProps) => {
    const theme = useTheme();
    const { pin: storedPin, setPin, enablePin } = useUserStore();
    const mode: PinMode = route.params?.mode || 'login';
    const onSuccess = route.params?.onSuccess;

    const [enteredPin, setEnteredPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [error, setError] = useState('');

    useEffect(() => {
        if (enteredPin.length === 4) {
            handlePinComplete(enteredPin);
        }
    }, [enteredPin]);

    const handlePinComplete = (pin: string) => {
        setError('');

        switch (mode) {
            case 'login':
                if (pin === storedPin) {
                    navigation.replace('Main');
                } else {
                    handleError();
                }
                break;

            case 'create':
                if (step === 'enter') {
                    setConfirmPin(pin);
                    setEnteredPin('');
                    setStep('confirm');
                } else {
                    if (pin === confirmPin) {
                        setPin(pin);
                        enablePin(true);
                        if (onSuccess) onSuccess();
                        navigation.goBack();
                    } else {
                        handleError('PINs do not match');
                        setEnteredPin('');
                        setStep('enter');
                        setConfirmPin('');
                    }
                }
                break;

            case 'verify':
            case 'disable':
                if (pin === storedPin) {
                    if (mode === 'disable') {
                        enablePin(false);
                        setPin(''); // Clear PIN
                    }
                    if (onSuccess) onSuccess();
                    navigation.goBack();
                } else {
                    handleError();
                }
                break;

            case 'change':
                // First verify old PIN, then create new
                if (step === 'enter') {
                    if (pin === storedPin) {
                        setEnteredPin('');
                        setStep('confirm'); // Reuse 'confirm' step for entering NEW pin
                    } else {
                        handleError('Incorrect old PIN');
                    }
                } else if (step === 'confirm') {
                    // This is actually entering the NEW pin
                    // We need a 3rd step for confirming the new pin, but for simplicity let's just navigate to a new 'create' mode or handle it here.
                    // Let's redirect to 'create' mode to set the new pin
                    navigation.replace('PinLogin', { mode: 'create', onSuccess });
                }
                break;
        }
    };

    const handleError = (msg = 'Incorrect PIN') => {
        try {
            Vibration.vibrate();
        } catch (error) {
            console.log('Vibration permission not granted');
        }
        setError(msg);
        setEnteredPin('');
    };

    const handlePress = (num: string) => {
        if (enteredPin.length < 4) {
            setEnteredPin(prev => prev + num);
            setError('');
        }
    };

    const handleDelete = () => {
        setEnteredPin(prev => prev.slice(0, -1));
        setError('');
    };

    const getTitle = () => {
        if (mode === 'login') return 'Enter PIN';
        if (mode === 'disable') return 'Enter PIN to Disable';
        if (mode === 'verify') return 'Enter PIN';
        if (mode === 'change') return step === 'enter' ? 'Enter Old PIN' : 'Enter New PIN';

        // Create mode
        return step === 'enter' ? 'Create PIN' : 'Confirm PIN';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                {getTitle()}
            </Text>

            <View style={styles.dotsContainer}>
                {[...Array(4)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: i < enteredPin.length
                                    ? theme.colors.primary
                                    : theme.colors.surfaceVariant,
                                borderColor: theme.colors.primary,
                            }
                        ]}
                    />
                ))}
            </View>

            {error ? (
                <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
            ) : null}

            <View style={styles.keypad}>
                {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['', '0', 'del']
                ].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((item, colIndex) => {
                            if (item === '') return <View key={colIndex} style={styles.key} />;
                            if (item === 'del') {
                                return (
                                    <TouchableOpacity
                                        key={colIndex}
                                        style={styles.key}
                                        onPress={handleDelete}
                                    >
                                        <Icon name="backspace-outline" size={28} color={theme.colors.onSurface} />
                                    </TouchableOpacity>
                                );
                            }
                            return (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={[styles.key, { backgroundColor: theme.colors.surface }]}
                                    onPress={() => handlePress(item)}
                                >
                                    <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>{item}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        marginBottom: 40,
        fontWeight: 'bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        gap: 20,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
    },
    error: {
        marginBottom: 20,
        height: 20,
    },
    keypad: {
        width: '100%',
        maxWidth: 300,
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
});
