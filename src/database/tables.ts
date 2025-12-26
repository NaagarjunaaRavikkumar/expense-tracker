export const TABLE_NAMES = {
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'categories',
    SUBCATEGORIES: 'subcategories',
    ACCOUNTS: 'accounts',
    GOALS: 'goals',
    BUDGETS: 'budgets',
    RECEIPTS: 'receipts',
    PURCHASE_ITEMS: 'purchase_items',
    VENDORS: 'vendors',
    LOAN_TRACKER: 'loan_tracker',
    LOAN_ROI: 'loan_roi',
    LOAN_EMI_PAYMENTS: 'loan_emi_payments',
    LOAN_PREPAYMENTS: 'loan_prepayments',
    LOAN_LEDGER: 'loan_ledger',
};

export const CREATE_TABLES = {
    [TABLE_NAMES.CATEGORIES]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.CATEGORIES} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            icon TEXT,
            color TEXT,
            is_default BOOLEAN DEFAULT 0
        );
    `,
    [TABLE_NAMES.SUBCATEGORIES]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.SUBCATEGORIES} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            categoryId TEXT NOT NULL,
            icon TEXT,
            color TEXT,
            FOREIGN KEY (categoryId) REFERENCES ${TABLE_NAMES.CATEGORIES} (id) ON DELETE CASCADE
        );
    `,
    [TABLE_NAMES.ACCOUNTS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.ACCOUNTS} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            balance REAL DEFAULT 0,
            currency TEXT DEFAULT 'INR',
            icon TEXT,
            color TEXT
        );
    `,
    [TABLE_NAMES.TRANSACTIONS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.TRANSACTIONS} (
            id TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
            categoryId TEXT,
            subcategoryId TEXT,
            accountId TEXT NOT NULL,
            paymentType TEXT NOT NULL,
            notes TEXT,
            toAccountId TEXT,
            FOREIGN KEY (categoryId) REFERENCES ${TABLE_NAMES.CATEGORIES} (id) ON DELETE SET NULL,
            FOREIGN KEY (subcategoryId) REFERENCES ${TABLE_NAMES.SUBCATEGORIES} (id) ON DELETE SET NULL,
            FOREIGN KEY (accountId) REFERENCES ${TABLE_NAMES.ACCOUNTS} (id) ON DELETE CASCADE,
            FOREIGN KEY (toAccountId) REFERENCES ${TABLE_NAMES.ACCOUNTS} (id) ON DELETE SET NULL
        );
    `,
    [TABLE_NAMES.GOALS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.GOALS} (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            targetAmount REAL NOT NULL,
            currentProgress REAL DEFAULT 0,
            color TEXT,
            icon TEXT,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );
    `,
    [TABLE_NAMES.BUDGETS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.BUDGETS} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            color TEXT,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            categoryIds TEXT NOT NULL, -- Stored as JSON string
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );
    `,
    [TABLE_NAMES.RECEIPTS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.RECEIPTS} (
            id TEXT PRIMARY KEY,
            imagePath TEXT,
            merchantName TEXT,
            transactionDate TEXT,
            totalAmount REAL,
            taxAmount REAL,
            currency TEXT DEFAULT 'INR',
            createdAt TEXT NOT NULL,
            expenseId TEXT,
            FOREIGN KEY (expenseId) REFERENCES ${TABLE_NAMES.TRANSACTIONS} (id) ON DELETE SET NULL
        );
    `,
    [TABLE_NAMES.PURCHASE_ITEMS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.PURCHASE_ITEMS} (
            id TEXT PRIMARY KEY,
            receiptId TEXT NOT NULL,
            name TEXT NOT NULL,
            quantity REAL DEFAULT 1,
            unitPrice REAL,
            totalPrice REAL,
            category TEXT,
            FOREIGN KEY (receiptId) REFERENCES ${TABLE_NAMES.RECEIPTS} (id) ON DELETE CASCADE
        );
    `,
    [TABLE_NAMES.VENDORS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.VENDORS} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            defaultCategory TEXT,
            logoUrl TEXT
        );
    `,
    [TABLE_NAMES.LOAN_TRACKER]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOAN_TRACKER} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            startDate TEXT NOT NULL,
            initialPrincipal REAL NOT NULL,
            emi REAL NOT NULL,
            description TEXT,
            createdAt TEXT NOT NULL,
            isActive BOOLEAN DEFAULT 1
        );
    `,
    [TABLE_NAMES.LOAN_ROI]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOAN_ROI} (
            id TEXT PRIMARY KEY,
            loanId TEXT NOT NULL,
            effectiveDate TEXT NOT NULL,
            annualRate REAL NOT NULL,
            FOREIGN KEY (loanId) REFERENCES ${TABLE_NAMES.LOAN_TRACKER} (id) ON DELETE CASCADE
        );
    `,
    [TABLE_NAMES.LOAN_EMI_PAYMENTS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOAN_EMI_PAYMENTS} (
            id TEXT PRIMARY KEY,
            loanId TEXT NOT NULL,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            FOREIGN KEY (loanId) REFERENCES ${TABLE_NAMES.LOAN_TRACKER} (id) ON DELETE CASCADE
        );
    `,
    [TABLE_NAMES.LOAN_PREPAYMENTS]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOAN_PREPAYMENTS} (
            id TEXT PRIMARY KEY,
            loanId TEXT NOT NULL,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            note TEXT,
            FOREIGN KEY (loanId) REFERENCES ${TABLE_NAMES.LOAN_TRACKER} (id) ON DELETE CASCADE
        );
    `,
    [TABLE_NAMES.LOAN_LEDGER]: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOAN_LEDGER} (
            id TEXT PRIMARY KEY,
            loanId TEXT NOT NULL,
            month TEXT NOT NULL,
            openingPrincipal REAL NOT NULL,
            emiPaid REAL NOT NULL,
            interestPaid REAL NOT NULL,
            principalPaid REAL NOT NULL,
            prepayment REAL DEFAULT 0,
            closingPrincipal REAL NOT NULL,
            roi REAL NOT NULL,
            FOREIGN KEY (loanId) REFERENCES ${TABLE_NAMES.LOAN_TRACKER} (id) ON DELETE CASCADE,
            UNIQUE(loanId, month)
        );
    `,
};


// Initial data for categories
export const DEFAULT_CATEGORIES = [
    // EXPENSE CATEGORIES
    { id: 'cat_housing', name: 'Housing', type: 'expense', icon: 'home', color: '#FF9800' },
    { id: 'cat_utilities', name: 'Utilities', type: 'expense', icon: 'flash', color: '#00BCD4' },
    { id: 'cat_food', name: 'Food & Groceries', type: 'expense', icon: 'food', color: '#F44336' },
    { id: 'cat_transport', name: 'Transportation', type: 'expense', icon: 'car', color: '#607D8B' },
    { id: 'cat_personal', name: 'Personal & Lifestyle', type: 'expense', icon: 'account', color: '#E91E63' },
    { id: 'cat_health', name: 'Health & Medical', type: 'expense', icon: 'hospital', color: '#4CAF50' },
    { id: 'cat_family', name: 'Family & Children', type: 'expense', icon: 'human-male-female-child', color: '#FF5722' },
    { id: 'cat_finance', name: 'Finance & Loans', type: 'expense', icon: 'bank', color: '#009688' },
    { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', icon: 'movie', color: '#9C27B0' },
    { id: 'cat_household', name: 'Household & Essentials', type: 'expense', icon: 'home-edit', color: '#795548' },
    { id: 'cat_work', name: 'Work / Business', type: 'expense', icon: 'briefcase-outline', color: '#3F51B5' },
    { id: 'cat_charity', name: 'Donations & Charity', type: 'expense', icon: 'hand-heart', color: '#CDDC39' },
    { id: 'cat_taxes', name: 'Taxes', type: 'expense', icon: 'file-document', color: '#FF5252' },
    { id: 'cat_misc_expense', name: 'Miscellaneous', type: 'expense', icon: 'dots-horizontal', color: '#9E9E9E' },

    // INCOME CATEGORIES
    { id: 'cat_salary', name: 'Salary & Wages', type: 'income', icon: 'briefcase', color: '#4CAF50' },
    { id: 'cat_business', name: 'Business / Self-Employment', type: 'income', icon: 'domain', color: '#2196F3' },
    { id: 'cat_investment', name: 'Investment Income', type: 'income', icon: 'chart-line', color: '#9C27B0' },
    { id: 'cat_rental', name: 'Rental Income', type: 'income', icon: 'home-city', color: '#FF9800' },
    { id: 'cat_government', name: 'Government Benefits', type: 'income', icon: 'account-cash', color: '#00BCD4' },
    { id: 'cat_interest', name: 'Interest Income', type: 'income', icon: 'cash-multiple', color: '#8BC34A' },
    { id: 'cat_gifts', name: 'Gifts & Donations Received', type: 'income', icon: 'gift', color: '#E91E63' },
    { id: 'cat_misc_income', name: 'Miscellaneous Income', type: 'income', icon: 'dots-horizontal', color: '#607D8B' },
];

// Initial data for accounts
export const DEFAULT_ACCOUNTS = [
    {
        id: 'default-cash',
        name: 'Cash',
        type: 'cash',
        balance: 0,
        currency: 'INR',
        icon: 'cash',
        color: '#4CAF50',
    },
    {
        id: 'default-bank',
        name: 'Bank Account',
        type: 'bank',
        balance: 0,
        currency: 'INR',
        icon: 'bank',
        color: '#2196F3',
    },
    {
        id: 'default-credit',
        name: 'Credit Card',
        type: 'credit_card',
        balance: 0,
        currency: 'INR',
        icon: 'credit-card',
        color: '#FF9800',
    },
];


// Initial data for subcategories
export const DEFAULT_SUBCATEGORIES = [
    // Housing subcategories
    { id: 'sub_housing_rent', name: 'Rent', categoryId: 'cat_housing', icon: 'home', color: '#FF9800' },
    { id: 'sub_housing_emi', name: 'Home Loan EMI', categoryId: 'cat_housing', icon: 'bank', color: '#FF9800' },
    { id: 'sub_housing_maintenance', name: 'Maintenance', categoryId: 'cat_housing', icon: 'tools', color: '#FF9800' },
    { id: 'sub_housing_repairs', name: 'Repairs', categoryId: 'cat_housing', icon: 'hammer', color: '#FF9800' },
    { id: 'sub_housing_insurance', name: 'Insurance', categoryId: 'cat_housing', icon: 'shield-home', color: '#FF9800' },

    // Utilities subcategories
    { id: 'sub_utilities_electricity', name: 'Electricity', categoryId: 'cat_utilities', icon: 'lightning-bolt', color: '#00BCD4' },
    { id: 'sub_utilities_water', name: 'Water', categoryId: 'cat_utilities', icon: 'water', color: '#00BCD4' },
    { id: 'sub_utilities_gas', name: 'Gas', categoryId: 'cat_utilities', icon: 'gas-cylinder', color: '#00BCD4' },
    { id: 'sub_utilities_internet', name: 'Internet', categoryId: 'cat_utilities', icon: 'wifi', color: '#00BCD4' },
    { id: 'sub_utilities_mobile', name: 'Mobile Recharge', categoryId: 'cat_utilities', icon: 'cellphone', color: '#00BCD4' },

    // Food subcategories
    { id: 'sub_food_groceries', name: 'Groceries', categoryId: 'cat_food', icon: 'cart', color: '#F44336' },
    { id: 'sub_food_dining', name: 'Dining Out', categoryId: 'cat_food', icon: 'silverware-fork-knife', color: '#F44336' },
    { id: 'sub_food_snacks', name: 'Snacks', categoryId: 'cat_food', icon: 'cookie', color: '#F44336' },
    { id: 'sub_food_beverages', name: 'Beverages', categoryId: 'cat_food', icon: 'coffee', color: '#F44336' },

    // Transportation subcategories
    { id: 'sub_transport_fuel', name: 'Fuel', categoryId: 'cat_transport', icon: 'gas-station', color: '#607D8B' },
    { id: 'sub_transport_taxi', name: 'Taxi', categoryId: 'cat_transport', icon: 'taxi', color: '#607D8B' },
    { id: 'sub_transport_service', name: 'Service/Repair', categoryId: 'cat_transport', icon: 'car-wrench', color: '#607D8B' },
    { id: 'sub_transport_parking', name: 'Parking', categoryId: 'cat_transport', icon: 'parking', color: '#607D8B' },

    // Personal subcategories
    { id: 'sub_personal_clothes', name: 'Clothes', categoryId: 'cat_personal', icon: 'tshirt-crew', color: '#E91E63' },
    { id: 'sub_personal_beauty', name: 'Beauty Care', categoryId: 'cat_personal', icon: 'face-woman', color: '#E91E63' },
    { id: 'sub_personal_fitness', name: 'Fitness', categoryId: 'cat_personal', icon: 'dumbbell', color: '#E91E63' },
    { id: 'sub_personal_hobbies', name: 'Hobbies', categoryId: 'cat_personal', icon: 'palette', color: '#E91E63' },

    // Health subcategories
    { id: 'sub_health_doctor', name: 'Doctor Visit', categoryId: 'cat_health', icon: 'stethoscope', color: '#4CAF50' },
    { id: 'sub_health_medicines', name: 'Medicines', categoryId: 'cat_health', icon: 'pill', color: '#4CAF50' },
    { id: 'sub_health_insurance', name: 'Insurance', categoryId: 'cat_health', icon: 'shield-plus', color: '#4CAF50' },
    { id: 'sub_health_tests', name: 'Tests', categoryId: 'cat_health', icon: 'test-tube', color: '#4CAF50' },

    // Family subcategories
    { id: 'sub_family_school', name: 'School Fees', categoryId: 'cat_family', icon: 'school', color: '#FF5722' },
    { id: 'sub_family_toys', name: 'Toys', categoryId: 'cat_family', icon: 'toy-brick', color: '#FF5722' },
    { id: 'sub_family_activities', name: 'Activities', categoryId: 'cat_family', icon: 'run', color: '#FF5722' },

    // Finance subcategories
    { id: 'sub_finance_emi', name: 'Loan EMI', categoryId: 'cat_finance', icon: 'cash-minus', color: '#009688' },
    { id: 'sub_finance_credit', name: 'Credit Card Bill', categoryId: 'cat_finance', icon: 'credit-card', color: '#009688' },
    { id: 'sub_finance_charges', name: 'Bank Charges', categoryId: 'cat_finance', icon: 'bank-minus', color: '#009688' },

    // Entertainment subcategories
    { id: 'sub_entertainment_movies', name: 'Movies', categoryId: 'cat_entertainment', icon: 'movie-open', color: '#9C27B0' },
    { id: 'sub_entertainment_ott', name: 'OTT', categoryId: 'cat_entertainment', icon: 'netflix', color: '#9C27B0' },
    { id: 'sub_entertainment_travel', name: 'Travel', categoryId: 'cat_entertainment', icon: 'airplane', color: '#9C27B0' },
    { id: 'sub_entertainment_games', name: 'Games', categoryId: 'cat_entertainment', icon: 'gamepad-variant', color: '#9C27B0' },

    // Household subcategories
    { id: 'sub_household_cleaning', name: 'Cleaning', categoryId: 'cat_household', icon: 'spray-bottle', color: '#795548' },
    { id: 'sub_household_furniture', name: 'Furniture', categoryId: 'cat_household', icon: 'sofa', color: '#795548' },
    { id: 'sub_household_kitchen', name: 'Kitchen Essentials', categoryId: 'cat_household', icon: 'pot-steam', color: '#795548' },

    // Work subcategories
    { id: 'sub_work_software', name: 'Software', categoryId: 'cat_work', icon: 'application', color: '#3F51B5' },
    { id: 'sub_work_supplies', name: 'Office Supplies', categoryId: 'cat_work', icon: 'pencil', color: '#3F51B5' },
    { id: 'sub_work_travel', name: 'Work Travel', categoryId: 'cat_work', icon: 'briefcase-variant', color: '#3F51B5' },

    // Charity subcategories
    { id: 'sub_charity_donation', name: 'Donation', categoryId: 'cat_charity', icon: 'hand-coin', color: '#CDDC39' },
    { id: 'sub_charity_helping', name: 'Helping Others', categoryId: 'cat_charity', icon: 'hands-pray', color: '#CDDC39' },

    // Taxes subcategories
    { id: 'sub_taxes_income', name: 'Income Tax', categoryId: 'cat_taxes', icon: 'file-document-outline', color: '#FF5252' },
    { id: 'sub_taxes_gst', name: 'GST', categoryId: 'cat_taxes', icon: 'receipt', color: '#FF5252' },
    { id: 'sub_taxes_professional', name: 'Professional Tax', categoryId: 'cat_taxes', icon: 'briefcase', color: '#FF5252' },

    // Misc Expense subcategories
    { id: 'sub_misc_unexpected', name: 'Unexpected Expense', categoryId: 'cat_misc_expense', icon: 'alert', color: '#9E9E9E' },
    { id: 'sub_misc_penalty', name: 'Penalty', categoryId: 'cat_misc_expense', icon: 'gavel', color: '#9E9E9E' },
    { id: 'sub_misc_loss', name: 'Loss/Theft', categoryId: 'cat_misc_expense', icon: 'alert-circle', color: '#9E9E9E' },

    // INCOME SUBCATEGORIES

    // Salary subcategories
    { id: 'sub_salary_basic', name: 'Basic Salary', categoryId: 'cat_salary', icon: 'cash', color: '#4CAF50' },
    { id: 'sub_salary_overtime', name: 'Overtime', categoryId: 'cat_salary', icon: 'clock-plus', color: '#4CAF50' },
    { id: 'sub_salary_bonus', name: 'Bonus', categoryId: 'cat_salary', icon: 'gift', color: '#4CAF50' },
    { id: 'sub_salary_commission', name: 'Commission', categoryId: 'cat_salary', icon: 'percent', color: '#4CAF50' },
    { id: 'sub_salary_allowances', name: 'Allowances', categoryId: 'cat_salary', icon: 'wallet-plus', color: '#4CAF50' },

    // Business subcategories
    { id: 'sub_business_freelance', name: 'Freelance', categoryId: 'cat_business', icon: 'laptop', color: '#2196F3' },
    { id: 'sub_business_consulting', name: 'Consulting', categoryId: 'cat_business', icon: 'account-tie', color: '#2196F3' },
    { id: 'sub_business_profit', name: 'Business Profit', categoryId: 'cat_business', icon: 'trending-up', color: '#2196F3' },
    { id: 'sub_business_side', name: 'Side Hustle', categoryId: 'cat_business', icon: 'briefcase-plus', color: '#2196F3' },

    // Investment subcategories
    { id: 'sub_investment_dividends', name: 'Dividends', categoryId: 'cat_investment', icon: 'cash-multiple', color: '#9C27B0' },
    { id: 'sub_investment_gains', name: 'Capital Gains', categoryId: 'cat_investment', icon: 'chart-line-variant', color: '#9C27B0' },
    { id: 'sub_investment_mutual', name: 'Mutual Funds', categoryId: 'cat_investment', icon: 'chart-pie', color: '#9C27B0' },
    { id: 'sub_investment_bonds', name: 'Bond Interest', categoryId: 'cat_investment', icon: 'certificate', color: '#9C27B0' },
    { id: 'sub_investment_crypto', name: 'Crypto', categoryId: 'cat_investment', icon: 'bitcoin', color: '#9C27B0' },

    // Rental subcategories
    { id: 'sub_rental_house', name: 'House Rent', categoryId: 'cat_rental', icon: 'home', color: '#FF9800' },
    { id: 'sub_rental_commercial', name: 'Commercial Rent', categoryId: 'cat_rental', icon: 'office-building', color: '#FF9800' },
    { id: 'sub_rental_short', name: 'Short-term Rent', categoryId: 'cat_rental', icon: 'calendar-clock', color: '#FF9800' },

    // Government subcategories
    { id: 'sub_govt_refund', name: 'Tax Refund', categoryId: 'cat_government', icon: 'cash-refund', color: '#00BCD4' },
    { id: 'sub_govt_pension', name: 'Pension', categoryId: 'cat_government', icon: 'account-cash-outline', color: '#00BCD4' },
    { id: 'sub_govt_subsidy', name: 'Subsidy', categoryId: 'cat_government', icon: 'hand-coin-outline', color: '#00BCD4' },

    // Interest subcategories
    { id: 'sub_interest_savings', name: 'Savings Interest', categoryId: 'cat_interest', icon: 'piggy-bank', color: '#8BC34A' },
    { id: 'sub_interest_fd', name: 'FD/RD', categoryId: 'cat_interest', icon: 'safe', color: '#8BC34A' },
    { id: 'sub_interest_credit', name: 'Credit Interest', categoryId: 'cat_interest', icon: 'cash-plus', color: '#8BC34A' },

    // Gifts subcategories
    { id: 'sub_gifts_cash', name: 'Cash Gift', categoryId: 'cat_gifts', icon: 'gift-outline', color: '#E91E63' },
    { id: 'sub_gifts_cashback', name: 'Cashback', categoryId: 'cat_gifts', icon: 'cash-refund', color: '#E91E63' },
    { id: 'sub_gifts_reimbursement', name: 'Reimbursement', categoryId: 'cat_gifts', icon: 'cash-check', color: '#E91E63' },

    // Misc Income subcategories
    { id: 'sub_misc_insurance', name: 'Insurance Payout', categoryId: 'cat_misc_income', icon: 'shield-check', color: '#607D8B' },
    { id: 'sub_misc_sale', name: 'Asset Sale', categoryId: 'cat_misc_income', icon: 'sale', color: '#607D8B' },
    { id: 'sub_misc_other', name: 'Other Income', categoryId: 'cat_misc_income', icon: 'dots-horizontal', color: '#607D8B' },
];


