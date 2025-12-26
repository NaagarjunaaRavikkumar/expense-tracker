import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { LoanDashboard } from '../screens/loans/LoanDashboard';
import { HomeScreen } from '../screens/HomeScreen';
import { ExpenseDashboard } from '../screens/expenses/ExpenseDashboard';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { AddLoan } from '../screens/loans/AddLoan';
import { LoanDetail } from '../screens/loans/LoanDetail';
import { AddTransaction } from '../screens/expenses/AddTransaction';
import { EditTransaction } from '../screens/expenses/EditTransaction';
import { CategoryListScreen } from '../screens/categories/CategoryListScreen';
import { CategoryDetailScreen } from '../screens/categories/CategoryDetailScreen';
import { AccountListScreen } from '../screens/accounts/AccountListScreen';
import { AccountDetailScreen } from '../screens/accounts/AccountDetailScreen';
import { BudgetListScreen } from '../screens/budgets/BudgetListScreen';
import { CreateBudgetScreen } from '../screens/budgets/CreateBudgetScreen';
import { BudgetDetailScreen } from '../screens/budgets/BudgetDetailScreen';
import { EditBudgetScreen } from '../screens/budgets/EditBudgetScreen';
import { GoalListScreen } from '../screens/goals/GoalListScreen';
import { CreateGoalScreen } from '../screens/goals/CreateGoalScreen';
import { GoalDetailScreen } from '../screens/goals/GoalDetailScreen';
import { EditGoalScreen } from '../screens/goals/EditGoalScreen';
import { ReceiptScanScreen } from '../screens/receipts/ReceiptScanScreen';
import { OCRPreviewScreen } from '../screens/receipts/OCRPreviewScreen';
import { PurchaseHistoryScreen } from '../screens/receipts/PurchaseHistoryScreen';
import { ItemDetailScreen } from '../screens/receipts/ItemDetailScreen';
import { LoanTrackerListScreen } from '../screens/loanTracker/LoanTrackerListScreen';
import { AddLoanTrackerScreen } from '../screens/loanTracker/AddLoanTrackerScreen';
import { LoanTrackerDetailScreen } from '../screens/loanTracker/LoanTrackerDetailScreen';
import { AddROIScreen } from '../screens/loanTracker/AddROIScreen';
import { AddPrepaymentScreen } from '../screens/loanTracker/AddPrepaymentScreen';
import { AddMonthlyEntryScreen } from '../screens/loanTracker/AddMonthlyEntryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import { useTheme } from 'react-native-paper';

const MainTabs = () => {
    const theme = useTheme();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outline,
                    height: 60,
                    paddingBottom: 5
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Loans"
                component={LoanDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="bank" color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpenseDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="wallet" color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="cog" color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
};

import { PinScreen } from '../screens/auth/PinScreen';
import { useUserStore } from '../store/useUserStore';

export const AppNavigator = () => {
    const { isPinEnabled } = useUserStore();
    console.log("FinTrackHub: AppNavigator rendering", { isPinEnabled });

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isPinEnabled ? "PinLogin" : "Main"}>
                <Stack.Screen name="PinLogin" component={PinScreen} options={{ headerShown: false }} />
                <Stack.Screen
                    name="Main"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="AddLoan" component={AddLoan} options={{ presentation: 'modal', title: 'Add Loan' }} />
                <Stack.Screen name="LoanDetail" component={LoanDetail} options={{ headerShown: false }} />
                <Stack.Screen name="AddTransaction" component={AddTransaction} options={{ presentation: 'modal', title: 'Add Transaction' }} />
                <Stack.Screen name="EditTransaction" component={EditTransaction} options={{ presentation: 'modal', title: 'Edit Transaction' }} />
                <Stack.Screen name="Categories" component={CategoryListScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Accounts" component={AccountListScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AccountDetail" component={AccountDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} options={{ presentation: 'modal', title: 'Create Budget' }} />
                <Stack.Screen name="EditBudget" component={EditBudgetScreen} options={{ presentation: 'modal', title: 'Edit Budget' }} />
                <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ presentation: 'modal', title: 'Create Goal' }} />
                <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ presentation: 'modal', title: 'Edit Goal' }} />
                <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Budgets" component={BudgetListScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Goals" component={GoalListScreen} options={{ headerShown: false }} />
                <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ReceiptScan" component={ReceiptScanScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OCRPreview" component={OCRPreviewScreen} options={{ title: 'Review Receipt' }} />
                <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} options={{ title: 'Purchase History' }} />
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item Details' }} />
                <Stack.Screen name="LoanTrackerList" component={LoanTrackerListScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AddLoanTracker" component={AddLoanTrackerScreen} options={{ presentation: 'modal', title: 'Add Loan' }} />
                <Stack.Screen name="LoanTrackerDetail" component={LoanTrackerDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AddROI" component={AddROIScreen} options={{ presentation: 'modal', title: 'Add ROI Change' }} />
                <Stack.Screen name="AddPrepayment" component={AddPrepaymentScreen} options={{ presentation: 'modal', title: 'Add Prepayment' }} />
                <Stack.Screen name="AddMonthlyEntry" component={AddMonthlyEntryScreen} options={{ presentation: 'modal', title: 'Add Monthly Entry' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
