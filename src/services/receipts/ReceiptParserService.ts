import { NormalizedText, ReceiptTextNormalizer } from '../../utils/receiptTextNormalizer';

export interface ParsedItem {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    confidence: number;
}

export interface ParsedReceipt {
    merchantName?: string;
    merchantConfidence: number;

    date?: string;
    dateConfidence: number;

    totalAmount?: number;
    totalConfidence: number;

    taxAmount?: number;
    taxConfidence: number;

    items: ParsedItem[];
    rawText: string;
}

/**
 * Multi-pattern receipt parser supporting various receipt formats
 * Supports: grocery, pharmacy, restaurant, fuel, retail receipts
 */
export const ReceiptParserService = {
    /**
     * Parse receipt from raw OCR text
     */
    parse: (rawText: string): ParsedReceipt => {
        console.log('[ReceiptParser] ===== STARTING PARSE =====');
        console.log('[ReceiptParser] Raw OCR Text:', rawText);

        // Normalize text first
        const normalized = ReceiptTextNormalizer.normalize(rawText);
        console.log('[ReceiptParser] Normalized lines count:', normalized.lines.length);
        console.log('[ReceiptParser] First 10 lines:', normalized.lines.slice(0, 10));

        // Extract metadata
        const merchant = extractMerchant(normalized.lines);
        console.log('[ReceiptParser] Merchant:', merchant);

        const date = extractDate(normalized.lines);
        console.log('[ReceiptParser] Date:', date);

        const total = extractTotal(normalized.lines);
        console.log('[ReceiptParser] Total:', total);

        const tax = extractTax(normalized.lines);
        console.log('[ReceiptParser] Tax:', tax);

        // Extract line items using multi-pattern matching
        const items = extractItems(normalized);
        console.log('[ReceiptParser] Items extracted:', items.length);
        console.log('[ReceiptParser] Items:', items);

        return {
            merchantName: merchant.value,
            merchantConfidence: merchant.confidence,
            date: date.value,
            dateConfidence: date.confidence,
            totalAmount: total.value,
            totalConfidence: total.confidence,
            taxAmount: tax.value,
            taxConfidence: tax.confidence,
            items,
            rawText,
        };
    },
};

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

const extractMerchant = (lines: string[]): { value?: string; confidence: number } => {
    // Merchant name is usually in the first 5 lines
    const ignoredWords = ['RECEIPT', 'INVOICE', 'BILL', 'WELCOME', 'TAX', 'GST', 'PHONE', 'TEL', 'DATE', 'TIME'];

    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const line = lines[i];

        // Skip if contains ignored words
        if (ignoredWords.some(word => line.includes(word))) continue;

        // Skip if starts with number or date pattern
        if (/^\d/.test(line)) continue;

        // Skip if purely symbols or very short
        if (!/[A-Z]/.test(line) || line.length < 3) continue;

        // Skip if it looks like an address (contains numbers mixed with text)
        if (/\d+.*[A-Z]+.*\d+/.test(line)) continue;

        return { value: line, confidence: 0.8 };
    }

    return { value: undefined, confidence: 0.0 };
};

const extractDate = (lines: string[]): { value?: string; confidence: number } => {
    // Date patterns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD MMM YYYY
    const datePatterns = [
        /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
        /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/,
        /(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{2,4})/i,
    ];

    for (const line of lines) {
        for (const pattern of datePatterns) {
            const match = line.match(pattern);
            if (match) {
                return { value: match[0], confidence: 0.9 };
            }
        }
    }

    return { value: undefined, confidence: 0.0 };
};

const extractTotal = (lines: string[]): { value?: number; confidence: number } => {
    const totalKeywords = /(?:TOTAL|GRAND\s*TOTAL|NET\s*TOTAL|AMOUNT\s*DUE|AMOUNT\s*PAYABLE|BILL\s*AMOUNT|PAYABLE)/;
    // More flexible amount pattern - handles numbers with or without decimals
    const amountPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/;

    console.log('[extractTotal] Searching for total in', lines.length, 'lines');

    // Search from bottom to top (totals are usually at the end)
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        if (totalKeywords.test(line)) {
            console.log('[extractTotal] Found total keyword in line:', line);
            // Try to find amount on the same line
            const match = line.match(amountPattern);
            if (match) {
                console.log('[extractTotal] Found amount on same line:', match[0]);
                return { value: parseFloat(match[0].replace(/,/g, '')), confidence: 0.95 };
            }

            // Check next line
            if (i + 1 < lines.length) {
                const nextMatch = lines[i + 1].match(amountPattern);
                if (nextMatch) {
                    console.log('[extractTotal] Found amount on next line:', nextMatch[0]);
                    return { value: parseFloat(nextMatch[0].replace(/,/g, '')), confidence: 0.9 };
                }
            }
        }
    }

    console.log('[extractTotal] No keyword match, trying fallback...');
    // Fallback: Find the largest number in the bottom 30% of the receipt
    const startIdx = Math.floor(lines.length * 0.7);
    let maxAmount = 0;

    for (let i = startIdx; i < lines.length; i++) {
        // More flexible pattern - handles integers and decimals
        const matches = lines[i].match(/\d+(?:\.\d{1,2})?/g);
        if (matches) {
            matches.forEach(m => {
                const val = parseFloat(m);
                if (val > maxAmount && val < 100000) {
                    maxAmount = val;
                    console.log('[extractTotal] Fallback found larger amount:', val, 'in line:', lines[i]);
                }
            });
        }
    }

    return maxAmount > 0 ? { value: maxAmount, confidence: 0.5 } : { value: undefined, confidence: 0.0 };
};

const extractTax = (lines: string[]): { value?: number; confidence: number } => {
    const taxKeywords = /(?:TAX|GST|CGST|SGST|IGST|VAT)/;
    const amountPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;

    for (const line of lines) {
        if (taxKeywords.test(line)) {
            const match = line.match(amountPattern);
            if (match) {
                return { value: parseFloat(match[0].replace(/,/g, '')), confidence: 0.85 };
            }
        }
    }

    return { value: undefined, confidence: 0.0 };
};

// ============================================================================
// ITEM EXTRACTION - MULTI-PATTERN MATCHING
// ============================================================================

/**
 * Extract line items using multiple patterns
 * Supports various receipt formats
 */
const extractItems = (normalized: NormalizedText): ParsedItem[] => {
    const items: ParsedItem[] = [];
    const lines = normalized.lines;

    // Skip header (first 3 lines) and footer (last 5 lines)
    const startIdx = Math.min(3, Math.floor(lines.length * 0.1));
    const endIdx = Math.max(lines.length - 5, Math.floor(lines.length * 0.85));

    for (let i = startIdx; i < endIdx; i++) {
        const line = lines[i];

        // Skip non-item lines
        if (isNonItemLine(line)) continue;

        // Try different patterns
        const item =
            tryPattern1(line) || // ITEM_NAME PRICE
            tryPattern2(line) || // ITEM_NAME QTY x PRICE
            tryPattern3(line) || // ITEM_NAME QTY PRICE
            tryPattern4(line) || // QTY ITEM_NAME PRICE
            tryPattern5(line); // ITEM_NAME @ PRICE

        if (item && isValidItem(item)) {
            items.push(item);
        }
    }

    return items;
};

/**
 * Check if line should be excluded (totals, taxes, etc.)
 */
const isNonItemLine = (line: string): boolean => {
    const excludeKeywords = [
        'TOTAL',
        'SUBTOTAL',
        'SUB TOTAL',
        'GRAND TOTAL',
        'TAX',
        'CGST',
        'SGST',
        'IGST',
        'GST',
        'VAT',
        'DISCOUNT',
        'ROUND OFF',
        'ROUNDING',
        'CASH',
        'CARD',
        'CREDIT',
        'DEBIT',
        'CHANGE',
        'BALANCE',
        'PAYMENT',
        'TENDER',
        'AMOUNT DUE',
        'AMOUNT PAID',
        'THANK YOU',
        'THANKS',
        'VISIT AGAIN',
        'CUSTOMER COPY',
        'MERCHANT COPY',
        'SIGNATURE',
    ];

    return excludeKeywords.some(keyword => line.includes(keyword));
};

/**
 * Pattern 1: ITEM_NAME PRICE
 * Example: "MILK 45.00"
 */
const tryPattern1 = (line: string): ParsedItem | null => {
    // More flexible - handles numbers with or without decimals
    const pattern = /^(.+?)\s+(\d+(?:\.\d{1,2})?)$/;
    const match = line.match(pattern);

    if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);

        if (name.length >= 2) {
            return {
                name,
                quantity: 1,
                unitPrice: price,
                totalPrice: price,
                confidence: 0.8,
            };
        }
    }

    return null;
};

/**
 * Pattern 2: ITEM_NAME QTY x PRICE
 * Example: "BREAD 2 X 25.00"
 */
const tryPattern2 = (line: string): ParsedItem | null => {
    const pattern = /^(.+?)\s+(\d+)\s*[Xx×]\s*(\d+(?:\.\d{1,2})?)$/;
    const match = line.match(pattern);

    if (match) {
        const name = match[1].trim();
        const qty = parseInt(match[2]);
        const unitPrice = parseFloat(match[3]);

        if (name.length >= 2 && qty > 0 && qty <= 100) {
            return {
                name,
                quantity: qty,
                unitPrice,
                totalPrice: qty * unitPrice,
                confidence: 0.9,
            };
        }
    }

    return null;
};

/**
 * Pattern 3: ITEM_NAME QTY PRICE
 * Example: "EGGS 12 60.00"
 */
const tryPattern3 = (line: string): ParsedItem | null => {
    const pattern = /^(.+?)\s+(\d+)\s+(\d+(?:\.\d{1,2})?)$/;
    const match = line.match(pattern);

    if (match) {
        const name = match[1].trim();
        const qty = parseInt(match[2]);
        const totalPrice = parseFloat(match[3]);

        // Only accept if quantity is reasonable (1-100)
        if (name.length >= 2 && qty > 0 && qty <= 100) {
            return {
                name,
                quantity: qty,
                unitPrice: totalPrice / qty,
                totalPrice,
                confidence: 0.75,
            };
        }
    }

    return null;
};

/**
 * Pattern 4: QTY ITEM_NAME PRICE
 * Example: "2 BUTTER 80.00"
 */
const tryPattern4 = (line: string): ParsedItem | null => {
    const pattern = /^(\d+)\s+(.+?)\s+(\d+(?:\.\d{1,2})?)$/;
    const match = line.match(pattern);

    if (match) {
        const qty = parseInt(match[1]);
        const name = match[2].trim();
        const totalPrice = parseFloat(match[3]);

        if (qty > 0 && qty <= 100 && name.length >= 2) {
            return {
                name,
                quantity: qty,
                unitPrice: totalPrice / qty,
                totalPrice,
                confidence: 0.75,
            };
        }
    }

    return null;
};

/**
 * Pattern 5: ITEM_NAME @ PRICE
 * Example: "RICE @ 50.00"
 */
const tryPattern5 = (line: string): ParsedItem | null => {
    const pattern = /^(.+?)\s*@\s*(\d+(?:\.\d{1,2})?)$/;
    const match = line.match(pattern);

    if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);

        if (name.length >= 2) {
            return {
                name,
                quantity: 1,
                unitPrice: price,
                totalPrice: price,
                confidence: 0.85,
            };
        }
    }

    return null;
};

/**
 * Validate extracted item
 */
const isValidItem = (item: ParsedItem): boolean => {
    // Price should be reasonable
    if (item.totalPrice <= 0 || item.totalPrice > 50000) return false;

    // Unit price should be reasonable
    if (item.unitPrice <= 0 || item.unitPrice > 10000) return false;

    // Quantity should be reasonable
    if (item.quantity <= 0 || item.quantity > 1000) return false;

    // Name should not be too short or just numbers
    if (item.name.length < 2 || /^\d+$/.test(item.name)) return false;

    return true;
};
