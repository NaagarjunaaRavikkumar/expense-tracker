/**
 * Receipt Text Normalizer
 * Cleans and normalizes OCR text for better parsing accuracy
 */

export interface NormalizedText {
    original: string;
    normalized: string;
    lines: string[];
}

export const ReceiptTextNormalizer = {
    /**
     * Normalize OCR text for receipt parsing
     * - Uppercase all text
     * - Normalize whitespace
     * - Remove OCR noise
     * - Preserve numeric and currency characters
     */
    normalize: (rawText: string): NormalizedText => {
        // Convert to uppercase
        let normalized = rawText.toUpperCase();

        // Remove common OCR noise characters
        normalized = removeOCRNoise(normalized);

        // Normalize whitespace
        normalized = normalizeWhitespace(normalized);

        // Split into lines and clean each line
        const lines = normalized
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return {
            original: rawText,
            normalized,
            lines,
        };
    },
};

/**
 * Remove common OCR noise characters while preserving important symbols
 */
const removeOCRNoise = (text: string): string => {
    return text
        // Remove common OCR artifacts
        .replace(/[`~^°]/g, '')
        // Remove excessive punctuation (but keep single instances)
        .replace(/\.{3,}/g, '.')
        .replace(/_{3,}/g, '_')
        .replace(/-{3,}/g, '-')
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Normalize quotes
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        // Keep: letters, numbers, spaces, basic punctuation, currency symbols
        // Remove: other special characters that are likely OCR errors
        .replace(/[^\w\s.,;:()\-+*/=@#$%&₹$€£¥]/g, '');
};

/**
 * Normalize whitespace while preserving line structure
 */
const normalizeWhitespace = (text: string): string => {
    return text
        // Replace multiple spaces with single space
        .replace(/ {2,}/g, ' ')
        // Replace tabs with spaces
        .replace(/\t/g, ' ')
        // Normalize line breaks (handle \r\n, \r, \n)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive blank lines (max 1 blank line)
        .replace(/\n{3,}/g, '\n\n')
        // Trim each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
};
