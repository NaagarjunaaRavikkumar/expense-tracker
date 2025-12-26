import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface OCRResult {
    text: string;
    blocks: {
        text: string;
        frame?: { x: number; y: number; width: number; height: number };
    }[];
}

export const OCRService = {
    recognizeText: async (imageUri: string): Promise<OCRResult> => {
        try {
            const result = await TextRecognition.recognize(imageUri);
            return {
                text: result.text,
                blocks: result.blocks.map(block => ({
                    text: block.text,
                    frame: block.frame,
                })),
            };
        } catch (error) {
            console.error('OCR failed:', error);
            throw error;
        }
    }
};
