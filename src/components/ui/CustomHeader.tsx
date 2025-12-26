import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme, Menu } from 'react-native-paper';
import { useSettingsStore } from '../../store/useSettingsStore';

interface CustomHeaderProps {
    title: string;
    navigation?: any;
    back?: boolean;
    showThemeToggle?: boolean;
}

export const CustomHeader = ({ title, navigation, back = false, showThemeToggle = true }: CustomHeaderProps) => {
    const theme = useTheme();
    const { theme: currentTheme, setTheme } = useSettingsStore();
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleTheme = () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
            {back && navigation ? (
                <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
            ) : (
                <View>
                    <IconButton
                        icon="menu"
                        size={24}
                        onPress={() => setMenuVisible(!menuVisible)}
                    />
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={{ x: 0, y: 56 }}
                        anchorPosition="bottom"
                    >
                        <Menu.Item
                            onPress={() => {
                                setMenuVisible(false);
                                navigation?.navigate('Categories');
                            }}
                            title="Categories"
                            leadingIcon="shape-outline"
                        />
                        <Menu.Item
                            onPress={() => {
                                setMenuVisible(false);
                                navigation?.navigate('Accounts');
                            }}
                            title="Accounts"
                            leadingIcon="bank"
                        />
                        <Menu.Item
                            onPress={() => {
                                setMenuVisible(false);
                                navigation?.navigate('Budgets');
                            }}
                            title="Budgets"
                            leadingIcon="chart-donut"
                        />
                        <Menu.Item
                            onPress={() => {
                                setMenuVisible(false);
                                navigation?.navigate('Goals');
                            }}
                            title="Goals"
                            leadingIcon="flag"
                        />
                        <Menu.Item
                            onPress={() => {
                                setMenuVisible(false);
                                navigation?.navigate('About');
                            }}
                            title="About"
                            leadingIcon="information-outline"
                        />
                    </Menu>
                </View>
            )}

            <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.primary }]}>
                {title}
            </Text>

            <View style={styles.headerRight}>
                {/* <IconButton icon="bell-outline" size={24} onPress={() => { }} /> */}
                {showThemeToggle && (
                    <IconButton
                        icon={currentTheme === 'dark' ? 'weather-sunny' : 'weather-night'}
                        size={24}
                        onPress={toggleTheme}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        flexDirection: 'row',
    },
});
