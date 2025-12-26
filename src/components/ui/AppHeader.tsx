import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

export const AppHeader = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
    const theme = useTheme();
    const title = getHeaderTitle(options, route.name);

    return (
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
            {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
            <Appbar.Content title={title} titleStyle={{ fontWeight: 'bold' }} />
            {/* We can add more actions here based on options or route */}
        </Appbar.Header>
    );
};
