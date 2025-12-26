import { Loan, AmortizationSchedule, VariableRate, PrePayment, PrePaymentConfig } from '../../types';
import { addMonths, startOfMonth, parseISO, format, isSameMonth, getMonth } from 'date-fns';

export const calculateAmortization = (loan: Loan): AmortizationSchedule[] => {
    const schedule: AmortizationSchedule[] = [];
    let currentPrincipal = loan.principalAmount;
    let currentRate = loan.initialInterestRate;
    let currentDate = startOfMonth(parseISO(loan.startDate));

    // Sort variable rates and manual pre-payments
    const sortedRates = [...loan.variableRates].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    const sortedPayments = [...loan.prePayments].sort((a, b) => a.date.localeCompare(b.date));

    const totalMonths = loan.tenureMonths;
    let currentEMI = calculateEMI(currentPrincipal, currentRate, totalMonths);

    let monthCounter = 1;
    const MAX_MONTHS = 600; // 50 years cap

    while (currentPrincipal > 1 && monthCounter <= MAX_MONTHS) {
        const openingBalance = currentPrincipal;

        // 1. Check for Rate Changes
        const rateChange = sortedRates.find(r => isSameMonth(parseISO(r.effectiveDate), currentDate));
        if (rateChange) {
            currentRate = rateChange.rate;
            // Recalculate EMI for remaining tenure
            const remainingMonths = Math.max(1, totalMonths - monthCounter + 1);
            currentEMI = calculateEMI(currentPrincipal, currentRate, remainingMonths);
        }

        // 2. Calculate Pre-Payments (Manual + Configured)
        let totalPrePayment = 0;
        let reduceTenure = true; // Default to reducing tenure for prepayments

        // A. Manual Pre-Payments
        const manualPayments = sortedPayments.filter(p => isSameMonth(parseISO(p.date), currentDate));
        manualPayments.forEach(p => {
            totalPrePayment += p.amount;
            if (p.type === 'reduce_emi') reduceTenure = false;
        });

        // B. Configured Recurring Pre-Payments
        if (loan.prePaymentConfig) {
            const config = loan.prePaymentConfig;

            // Regular Interval Prepayment
            if (monthCounter >= config.startPaymentNumber &&
                (monthCounter - config.startPaymentNumber) % config.interval === 0) {
                totalPrePayment += config.amount;
            }

            // Annual Prepayment
            // getMonth returns 0-11. config.annualPaymentMonth is 1-12.
            const currentMonthIndex = getMonth(currentDate) + 1;
            if (currentMonthIndex === config.annualPaymentMonth) {
                totalPrePayment += config.annualAmount;
            }
        }

        // Apply Pre-Payments
        if (totalPrePayment > 0) {
            currentPrincipal -= totalPrePayment;

            if (currentPrincipal <= 0) {
                // Loan closed by prepayment
                schedule.push({
                    month: monthCounter,
                    date: format(currentDate, 'yyyy-MM-dd'),
                    openingBalance,
                    emi: totalPrePayment + openingBalance,
                    principalComponent: openingBalance,
                    interestComponent: 0,
                    closingBalance: 0,
                    rate: currentRate
                });
                break;
            }

            if (!reduceTenure) {
                // Recalculate EMI if strategy is Reduce EMI
                const remainingMonths = Math.max(1, totalMonths - monthCounter + 1);
                currentEMI = calculateEMI(currentPrincipal, currentRate, remainingMonths);
            }
        }

        // 3. Calculate Monthly Interest & Principal
        const monthlyInterest = (currentPrincipal * currentRate) / 1200;
        let monthlyPrincipal = currentEMI - monthlyInterest;

        // Handle last month adjustment
        if (currentPrincipal + monthlyInterest <= currentEMI || monthlyPrincipal > currentPrincipal) {
            currentEMI = currentPrincipal + monthlyInterest;
            monthlyPrincipal = currentPrincipal;
        }

        const closingBalance = currentPrincipal - monthlyPrincipal;

        schedule.push({
            month: monthCounter,
            date: format(currentDate, 'yyyy-MM-dd'),
            openingBalance,
            emi: currentEMI,
            principalComponent: monthlyPrincipal,
            interestComponent: monthlyInterest,
            closingBalance: closingBalance < 0 ? 0 : closingBalance,
            rate: currentRate
        });

        currentPrincipal = closingBalance;
        currentDate = addMonths(currentDate, 1);
        monthCounter++;
    }

    return schedule;
};

export const calculateEMI = (principal: number, rate: number, months: number): number => {
    if (rate === 0) return principal / months;
    const r = rate / 1200;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

export const calculateSummaryMetrics = (schedule: AmortizationSchedule[], loan: Loan) => {
    const totalInterest = schedule.reduce((sum, item) => sum + item.interestComponent, 0);
    const totalPayment = schedule.reduce((sum, item) => sum + item.emi, 0); // Note: emi field includes prepayments in our logic above? No, wait.
    // In our logic: emi field in schedule is the *scheduled* emi. 
    // But if we have prepayments, we subtracted them from principal directly.
    // We should probably track total payments better.

    // Let's refine the schedule to include total paid.
    // Actually, for the summary, we can just sum up principal + interest.
    // But wait, if we made prepayments, they are not in the 'emi' column of the schedule row unless it closed the loan.
    // They are just subtracted from principal.

    // To be accurate, we should probably add a 'totalPayment' field to AmortizationSchedule or calculate it.
    // For now, let's approximate: Total Principal Paid (should be Loan Amount) + Total Interest Paid.

    const totalPrincipalPaid = loan.principalAmount; // Assuming fully paid
    const lastDate = schedule.length > 0 ? schedule[schedule.length - 1].date : loan.startDate;

    return {
        totalInterest,
        totalPayment: totalPrincipalPaid + totalInterest,
        payoffDate: lastDate,
        monthsSaved: loan.tenureMonths - schedule.length
    };
};
