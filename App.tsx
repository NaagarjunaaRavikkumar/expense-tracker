import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LightTheme, DarkTheme } from './src/theme';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useUserStore } from './src/store/useUserStore';
import { initDatabase } from './src/database';
import { useCategoryStore } from './src/store/useCategoryStore';
import { useAccountStore } from './src/store/useAccountStore';
import { useExpenseStore } from './src/store/useExpenseStore';
import { useGoalStore } from './src/store/useGoalStore';
import { useBudgetStore } from './src/store/useBudgetStore';

import { useSubcategoryStore } from './src/store/useSubcategoryStore';

const App = () => {
  const systemScheme = useColorScheme();
  const { theme: appTheme } = useSettingsStore();
  const { _hasHydrated } = useUserStore();
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  const isDark = appTheme === 'system'
    ? systemScheme === 'dark'
    : appTheme === 'dark';

  const theme = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        await initDatabase();
        console.log('Database initialized successfully');

        // Load initial data
        console.log('Loading categories...');
        await useCategoryStore.getState().loadCategories();
        console.log('Categories loaded');

        console.log('Loading subcategories...');
        await useSubcategoryStore.getState().loadSubcategories();
        console.log('Subcategories loaded');

        console.log('Loading accounts...');
        await useAccountStore.getState().loadAccounts();
        console.log('Accounts loaded');

        console.log('Loading expenses...');
        await useExpenseStore.getState().loadData();
        console.log('Expenses loaded');

        console.log('Loading goals...');
        await useGoalStore.getState().loadGoals();
        console.log('Goals loaded');

        console.log('Loading budgets...');
        await useBudgetStore.getState().loadBudgets();
        console.log('Budgets loaded');

        setIsDbInitialized(true);
        console.log('App initialization complete');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Handle error appropriately (e.g., show error screen)
      }
    };

    setupDatabase();
  }, []);

  if (!_hasHydrated) {
    console.log('Waiting for user store hydration...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!isDbInitialized) {
    console.log('Waiting for DB initialization...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <AppNavigator />
          </ErrorBoundary>
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
