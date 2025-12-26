import { format, addMonths, parseISO, isBefore, isEqual } from 'date-fns';

export interface ROIEntry {
    effectiveDate: string; // YYYY-MM-DD
    annualRate: number;
}

export interface Prepayment {
    date: string; // YYYY-MM-DD
    amount: number;
}

export interface EMIPayment {
    date: string; // YYYY-MM-DD
    amount: number;
}

export interface LedgerEntry {
    month: string; // YYYY-MM
    openingPrincipal: number;
    emiPaid: number;
    interestPaid: number;
    principalPaid: number;
    prepayment: number;
    closingPrincipal: number;
    roi: number;
}

export interface LoanData {
    startDate: string; // YYYY-MM-DD
    initialPrincipal: number;
    emi: number; // Fallback/default EMI if no EMI payment recorded
    roiHistory: ROIEntry[];
    prepayments: Prepayment[];
    emiPayments: EMIPayment[];
}

/**
 * Calculate month-by-month ledger for a loan
 * Follows EXACT bank-grade calculation logic:
 * 1. Calculate interest from opening principal
 * 2. Apply EMI (principal = EMI - interest)
 * 3. Apply prepayment
 * 4. Calculate closing principal
 */
export const calculateLedger = (loanData: LoanData): LedgerEntry[] => {
    const { startDate, initialPrincipal, emi: defaultEMI, roiHistory, prepayments, emiPayments } = loanData;

    // Sort ROI by effective date
    const sortedROI = [...roiHistory].sort((a, b) =>
        a.effectiveDate.localeCompare(b.effectiveDate)
    );

    // Group prepayments by month (YYYY-MM)
    const prepaymentsByMonth = new Map<string, number>();
    prepayments.forEach(pp => {
        const month = pp.date.substring(0, 7); // YYYY-MM
        const existing = prepaymentsByMonth.get(month) || 0;
        prepaymentsByMonth.set(month, existing + pp.amount);
    });

    // Group EMI payments by month (YYYY-MM)
    const emiPaymentsByMonth = new Map<string, number>();
    emiPayments.forEach(ep => {
        const month = ep.date.substring(0, 7); // YYYY-MM
        const existing = emiPaymentsByMonth.get(month) || 0;
        emiPaymentsByMonth.set(month, existing + ep.amount);
    });

    const ledger: LedgerEntry[] = [];
    let currentDate = parseISO(startDate);
    let openingPrincipal = initialPrincipal;
    let monthIndex = 0;

    // Get current date for comparison - only calculate elapsed months
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');

    // Limit to 600 months (50 years) to avoid infinite loops
    const MAX_MONTHS = 600;

    while (openingPrincipal > 0.01 && monthIndex < MAX_MONTHS) {
        const monthStr = format(currentDate, 'yyyy-MM');

        // STOP at current month - don't calculate future months
        if (monthStr > currentMonth) {
            break;
        }

        // Find applicable ROI for this month
        const applicableROI = findApplicableROI(sortedROI, currentDate);

        if (applicableROI === null) {
            console.warn(`No ROI found for month ${monthStr}, stopping calculation`);
            break;
        }

        // === STEP 1: Convert annual rate to monthly ===
        const monthlyRate = applicableROI / (12 * 100);

        // === STEP 2: Calculate interest for the month ===
        // Interest is ALWAYS calculated on opening principal
        const interest = openingPrincipal * monthlyRate;

        // === STEP 3: Apply EMI ===
        // Use actual EMI payment if recorded, otherwise use default EMI
        const recordedEMI = emiPaymentsByMonth.get(monthStr);
        if (recordedEMI !== undefined) {
            console.log(`[LedgerEngine] Month ${monthStr}: Found recorded EMI ${recordedEMI}`);
        } else {
            console.log(`[LedgerEngine] Month ${monthStr}: No recorded EMI, using default ${defaultEMI}`);
        }

        const emi = recordedEMI || defaultEMI;
        let principal_from_emi = emi - interest;

        // If EMI < interest, principal paid = 0 (negative amortization)
        if (principal_from_emi < 0) {
            console.warn(`Month ${monthStr}: EMI (${emi}) < Interest (${interest.toFixed(2)}). Negative amortization!`);
            principal_from_emi = 0;
        }

        // === STEP 4: Apply prepayment ===
        const prepayment = prepaymentsByMonth.get(monthStr) || 0;

        // === STEP 5: Calculate total principal paid ===
        let total_principal_paid = principal_from_emi + prepayment;

        // Validation: Total principal paid cannot exceed opening principal
        if (total_principal_paid > openingPrincipal) {
            console.warn(`Month ${monthStr}: Capping total principal from ${total_principal_paid} to ${openingPrincipal}`);
            total_principal_paid = openingPrincipal;
        }

        // === STEP 6: Calculate closing principal ===
        let closingPrincipal = openingPrincipal - total_principal_paid;

        // Ensure closing principal doesn't go negative
        if (closingPrincipal < 0) {
            closingPrincipal = 0;
        }

        // Calculate actual EMI paid (may be less than planned EMI in final month)
        let actualEMI = emi;
        let actualPrincipalFromEMI = principal_from_emi;

        // If loan closes this month, adjust EMI
        if (closingPrincipal === 0 && openingPrincipal > 0) {
            // Final month: EMI = remaining principal + interest
            actualEMI = interest + (openingPrincipal - prepayment);
            actualPrincipalFromEMI = openingPrincipal - prepayment;
            total_principal_paid = openingPrincipal;
        }

        // Store ledger entry with rounded values
        ledger.push({
            month: monthStr,
            openingPrincipal: Math.round(openingPrincipal * 100) / 100,
            emiPaid: Math.round(actualEMI * 100) / 100,
            interestPaid: Math.round(interest * 100) / 100,
            principalPaid: Math.round(total_principal_paid * 100) / 100,
            prepayment: Math.round(prepayment * 100) / 100,
            closingPrincipal: Math.round(closingPrincipal * 100) / 100,
            roi: applicableROI,
        });

        // === STEP 7: Carry forward ===
        // Closing principal becomes next month's opening principal
        openingPrincipal = closingPrincipal;
        currentDate = addMonths(currentDate, 1);
        monthIndex++;
    }

    return ledger;
};

/**
 * Find the applicable ROI for a given date
 * Returns the most recent ROI that is <= the given date
 */
const findApplicableROI = (sortedROI: ROIEntry[], date: Date): number | null => {
    if (sortedROI.length === 0) return null;

    // Find the most recent ROI entry that is <= date
    let applicableRate = null;

    for (const entry of sortedROI) {
        const effectiveDate = parseISO(entry.effectiveDate);
        if (isBefore(effectiveDate, date) || isEqual(effectiveDate, date)) {
            applicableRate = entry.annualRate;
        } else {
            break; // Since sorted, no need to check further
        }
    }

    return applicableRate;
};

/**
 * Calculate derived metrics from ledger
 */
export const calculateMetrics = (ledger: LedgerEntry[], initialPrincipal: number) => {
    const totalEMIPaid = ledger.reduce((sum, entry) => sum + entry.emiPaid, 0);
    const totalInterestPaid = ledger.reduce((sum, entry) => sum + entry.interestPaid, 0);
    const totalPrepayments = ledger.reduce((sum, entry) => sum + entry.prepayment, 0);
    const outstandingPrincipal = ledger.length > 0 ? ledger[ledger.length - 1].closingPrincipal : initialPrincipal;
    const completionMonth = ledger.length > 0 && outstandingPrincipal === 0 ? ledger[ledger.length - 1].month : null;

    return {
        totalEMIPaid: Math.round(totalEMIPaid * 100) / 100,
        totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
        totalPrepayments: Math.round(totalPrepayments * 100) / 100,
        outstandingPrincipal: Math.round(outstandingPrincipal * 100) / 100,
        completionMonth,
        tenure: ledger.length,
    };
};
