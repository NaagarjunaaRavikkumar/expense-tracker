import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface AppCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    mode?: 'elevated' | 'outlined' | 'contained';
}

export const AppCard = ({ children, style, onPress, mode = 'elevated' }: AppCardProps) => {
    const theme = useTheme();

    return (
        <Card
            style={[
                styles.card,
                { backgroundColor: theme.colors.surface },
                style,
            ]}
            mode={mode}
            onPress={onPress}
        >
            {children}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginVertical: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
});
