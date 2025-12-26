export interface Loan {
    id: string;
    nickname: string;
    principalAmount: number;
    startDate: string; // ISO Date string
    tenureMonths: number;
    initialInterestRate: number;
    type: 'reducing_balance';
    notes?: string;
    variableRates: VariableRate[];
    prePayments: PrePayment[];
    compoundPeriod?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
    paymentFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
    prePaymentConfig?: PrePaymentConfig;
}

export interface PrePaymentConfig {
    startPaymentNumber: number;
    amount: number;
    interval: number;
    annualAmount: number;
    annualPaymentMonth: number; // 1-12
}

export interface VariableRate {
    id: string;
    effectiveDate: string; // ISO Date string
    rate: number;
    reason?: string;
}

export interface PrePayment {
    id: string;
    date: string; // ISO Date string
    amount: number;
    type: 'reduce_emi' | 'reduce_tenure';
}

export interface AmortizationSchedule {
    month: number;
    date: string;
    openingBalance: number;
    emi: number;
    principalComponent: number;
    interestComponent: number;
    closingBalance: number;
    rate: number;
}

export interface Account {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'emergency' | 'custom';
    balance: number;
    currency: string;
}

export interface Transaction {
    id: string;
    amount: number;
    date: string;
    type: 'expense' | 'income' | 'transfer';
    categoryId: string;
    accountId: string;
    toAccountId?: string; // For transfers
    notes?: string;
    attachmentUri?: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'expense' | 'income';
    budget?: number;
    icon?: string;
    color?: string;
}

export interface Settings {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    lastBackup?: string;
}

export interface BackupData {
    version: number;
    timestamp: string;
    loans: Loan[];
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    settings: Settings;
}
