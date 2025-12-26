import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImageService } from '../../services/receipts/imageService';

export const ReceiptScanScreen = () => {
    const navigation = useNavigation();
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<Camera>(null);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    const handleCapture = async () => {
        if (camera.current) {
            try {
                const photo = await camera.current.takePhoto({
                    flash: 'off',
                });

                navigation.navigate('OCRPreview', { imageUri: `file://${photo.path}` });
            } catch (error) {
                console.error('Failed to take photo:', error);
            }
        }
    };

    const handleGallery = async () => {
        const uri = await ImageService.pickFromGallery();
        if (uri) {
            navigation.navigate('OCRPreview', { imageUri: uri });
        }
    };

    if (!hasPermission) return <View style={styles.container}><Text>No Camera Permission</Text></View>;
    if (device == null) return <View style={styles.container}><Text>No Camera Device</Text></View>;

    return (
        <View style={styles.container}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                photo={true}
            />

            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Icon name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan Receipt</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.guideFrame} />

                <View style={styles.controls}>
                    <TouchableOpacity onPress={handleGallery} style={styles.galleryButton}>
                        <Icon name="image" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>

                    <View style={{ width: 40 }} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    guideFrame: {
        flex: 1,
        marginVertical: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        borderStyle: 'dashed',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 40,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    galleryButton: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
    },
});
