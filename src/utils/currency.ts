export const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
        'USD': '$',
        'INR': '₹',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
    };
    return symbols[currency] || currency;
};

export const formatCurrency = (amount: number, currency: string): string => {
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formattedAmount}`;
};
