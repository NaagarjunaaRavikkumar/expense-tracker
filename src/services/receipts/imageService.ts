import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

export const ImageService = {
    requestCameraPermission: async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera permission to scan receipts.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    },

    captureReceipt: async (): Promise<string | null> => {
        const hasPermission = await ImageService.requestCameraPermission();
        if (!hasPermission) return null;

        return new Promise((resolve) => {
            launchCamera(
                {
                    mediaType: 'photo',
                    saveToPhotos: false,
                    // High quality for OCR - text needs to be clear
                    quality: 0.9,
                    maxWidth: 2000,
                    maxHeight: 2000,
                },
                async (response: ImagePickerResponse) => {
                    if (response.didCancel || response.errorCode || !response.assets?.[0]?.uri) {
                        resolve(null);
                        return;
                    }

                    const sourceUri = response.assets[0].uri;
                    const fileName = `receipt_${Date.now()}.jpg`;
                    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                    try {
                        await RNFS.copyFile(sourceUri, destPath);
                        resolve(`file://${destPath}`);
                    } catch (error) {
                        console.error('Failed to save receipt image:', error);
                        resolve(null);
                    }
                }
            );
        });
    },

    pickFromGallery: async (): Promise<string | null> => {
        return new Promise((resolve) => {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    // High quality for OCR - text needs to be clear
                    quality: 0.9,
                    maxWidth: 2000,
                    maxHeight: 2000,
                },
                async (response: ImagePickerResponse) => {
                    if (response.didCancel || response.errorCode || !response.assets?.[0]?.uri) {
                        resolve(null);
                        return;
                    }

                    const sourceUri = response.assets[0].uri;
                    const fileName = `receipt_import_${Date.now()}.jpg`;
                    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                    try {
                        await RNFS.copyFile(sourceUri, destPath);
                        resolve(`file://${destPath}`);
                    } catch (error) {
                        console.error('Failed to save imported image:', error);
                        resolve(null);
                    }
                }
            );
        });
    }
};
