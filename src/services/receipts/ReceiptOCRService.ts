import TextRecognition from '@react-native-ml-kit/text-recognition';
import { ReceiptParserService, ParsedReceipt } from './ReceiptParserService';
import { ImagePreprocessor } from './ImagePreprocessor';

export interface OCRResult {
    text: string;
    blocks: {
        text: string;
        frame?: { x: number; y: number; width: number; height: number };
    }[];
}

/**
 * Offline Receipt OCR Service using ML Kit Text Recognition
 * No network calls, no API keys required
 */
export const ReceiptOCRService = {
    /**
     * Recognize text from receipt image using ML Kit
     * Fully offline, no API calls
     */
    recognizeText: async (imageUri: string): Promise<OCRResult> => {
        try {
            console.log('[ReceiptOCR] Starting ML Kit recognition for:', imageUri);

            // STEP 1: Preprocess image for better OCR
            console.log('[ReceiptOCR] Preprocessing image...');
            const preprocessedUri = await ImagePreprocessor.preprocessForOCR(imageUri);
            console.log('[ReceiptOCR] Using preprocessed image:', preprocessedUri);

            // STEP 2: Run ML Kit OCR on preprocessed image
            const result = await TextRecognition.recognize(preprocessedUri);

            console.log('[ReceiptOCR] ===== ML KIT RESULT =====');
            console.log('[ReceiptOCR] Total text length:', result.text.length);
            console.log('[ReceiptOCR] Number of blocks:', result.blocks.length);
            console.log('[ReceiptOCR] Complete text:', result.text);
            console.log('[ReceiptOCR] ===== BLOCKS DETAIL =====');
            result.blocks.forEach((block, idx) => {
                console.log(`[ReceiptOCR] Block ${idx}:`, block.text);
                console.log(`[ReceiptOCR] Block ${idx} lines:`, block.lines?.length || 0);
                if (block.lines) {
                    block.lines.forEach((line, lineIdx) => {
                        console.log(`[ReceiptOCR]   Line ${lineIdx}:`, line.text);
                    });
                }
            });
            console.log('[ReceiptOCR] ===== END ML KIT RESULT =====');

            return {
                text: result.text,
                blocks: result.blocks.map(block => ({
                    text: block.text,
                    frame: block.frame as any, // ML Kit's Frame type
                })),
            };
        } catch (error) {
            console.error('[ReceiptOCR] ML Kit recognition failed:', error);
            throw new Error('OCR failed. Please try again with a clearer image.');
        }
    },

    /**
     * Complete pipeline: OCR + Parse
     * Returns structured receipt data
     */
    scanReceipt: async (imageUri: string): Promise<ParsedReceipt> => {
        try {
            // Step 1: Run ML Kit OCR
            const ocrResult = await ReceiptOCRService.recognizeText(imageUri);

            // Step 2: Parse the text
            const parsedReceipt = ReceiptParserService.parse(ocrResult.text);

            return parsedReceipt;
        } catch (error) {
            console.error('[ReceiptOCR] Scan failed:', error);
            throw error;
        }
    },
};
