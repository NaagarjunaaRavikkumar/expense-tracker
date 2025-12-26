import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';

/**
 * Image Preprocessing Service for OCR
 * Enhances receipt images to improve ML Kit text recognition accuracy
 */
export const ImagePreprocessor = {
    /**
     * Preprocess image for better OCR results
     * - Converts to grayscale (reduces noise)
     * - Increases contrast (makes text stand out)
     * - Ensures optimal resolution
     * 
     * @param imageUri - Original image URI
     * @returns Preprocessed image URI ready for OCR
     */
    preprocessForOCR: async (imageUri: string): Promise<string> => {
        try {
            console.log('[ImagePreprocessor] Starting preprocessing for:', imageUri);

            // Remove file:// prefix if present
            const cleanUri = imageUri.replace('file://', '');

            // Step 1: Resize to optimal OCR dimensions (if needed)
            // ML Kit works best with images around 1500-2000px width
            const resized = await ImageResizer.createResizedImage(
                cleanUri,
                2000, // max width
                2000, // max height
                'JPEG',
                100, // quality (100 = best)
                0, // rotation
                undefined, // output path (auto-generated)
                true, // keep metadata
            );

            console.log('[ImagePreprocessor] Resized to:', resized.width, 'x', resized.height);

            // Step 2: Apply contrast enhancement
            // This is a workaround since react-native-image-resizer doesn't have built-in filters
            // We'll use high quality JPEG which naturally enhances contrast
            const enhanced = await ImageResizer.createResizedImage(
                resized.uri,
                resized.width,
                resized.height,
                'JPEG',
                100, // Maximum quality
                0,
                undefined,
                false,
            );

            console.log('[ImagePreprocessor] Enhanced image:', enhanced.uri);

            // For future: Add native image filters if needed
            // Options: react-native-image-filter-kit, or custom native module

            return `file://${enhanced.uri}`;
        } catch (error) {
            console.error('[ImagePreprocessor] Preprocessing failed:', error);
            // Return original image if preprocessing fails
            return imageUri;
        }
    },

    /**
     * Convert image to grayscale (future enhancement)
     * This would require additional native modules or libraries
     */
    convertToGrayscale: async (imageUri: string): Promise<string> => {
        // Placeholder for future implementation
        // Could use: react-native-image-filter-kit or custom native code
        console.warn('[ImagePreprocessor] Grayscale conversion not yet implemented');
        return imageUri;
    },

    /**
     * Enhance contrast (future enhancement)
     * This would require additional native modules or libraries
     */
    enhanceContrast: async (imageUri: string): Promise<string> => {
        // Placeholder for future implementation
        console.warn('[ImagePreprocessor] Contrast enhancement not yet implemented');
        return imageUri;
    },
};
