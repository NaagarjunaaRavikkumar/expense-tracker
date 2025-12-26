import { GoogleSignin } from '@react-native-google-signin/google-signin';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const DB_NAME = 'FinTrackHub.db';
const MIME_TYPE = 'application/x-sqlite3';
const BOUNDARY = 'foo_bar_baz';

// Get Database Path
const getDatabasePath = () => {
    if (Platform.OS === 'android') {
        return `/data/data/com.fintrackhub/databases/${DB_NAME}`;
    }
    // iOS path (default for react-native-sqlite-storage)
    return `${RNFS.LibraryDirectoryPath}/LocalDatabase/${DB_NAME}`;
};

export const uploadDatabase = async (): Promise<boolean> => {
    try {
        const tokens = await GoogleSignin.getTokens();
        const accessToken = tokens.accessToken;
        const dbPath = getDatabasePath();

        // Check if DB exists
        const exists = await RNFS.exists(dbPath);
        if (!exists) {
            throw new Error('Database file not found');
        }

        // Read DB file as base64
        const fileContent = await RNFS.readFile(dbPath, 'base64');

        // Create multipart body
        const metadata = {
            name: DB_NAME,
            mimeType: MIME_TYPE,
            parents: ['appDataFolder'],
        };

        const body =
            `--${BOUNDARY}\r\n` +
            `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
            `${JSON.stringify(metadata)}\r\n` +
            `--${BOUNDARY}\r\n` +
            `Content-Type: ${MIME_TYPE}\r\n` +
            `Content-Transfer-Encoding: base64\r\n\r\n` +
            `${fileContent}\r\n` +
            `--${BOUNDARY}--`;

        // Upload to Drive
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
            },
            body: body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        console.log('Database backup successful');
        return true;
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
};

export const restoreDatabase = async (): Promise<boolean> => {
    try {
        const tokens = await GoogleSignin.getTokens();
        const accessToken = tokens.accessToken;
        const dbPath = getDatabasePath();

        // 1. List files in appDataFolder
        const listResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='appDataFolder' in parents and name = '${DB_NAME}' and trashed = false&orderBy=createdTime desc&pageSize=1&spaces=appDataFolder`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!listResponse.ok) {
            const errorText = await listResponse.text();
            console.error('List backups failed:', errorText);
            throw new Error(`Failed to list backups: ${errorText}`);
        }

        const listData = await listResponse.json();
        if (!listData.files || listData.files.length === 0) {
            throw new Error('No backup found');
        }

        const fileId = listData.files[0].id;

        // 2. Download file content
        const downloadResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!downloadResponse.ok) {
            throw new Error('Failed to download backup');
        }

        // Get blob/buffer (React Native fetch returns blob support varies, better to use text/base64 if possible or RNFS downloadFile)
        // For binary files, fetch might be tricky with text().
        // Let's use RNFS.downloadFile for reliability with binary data

        const tempPath = `${RNFS.CachesDirectoryPath}/${DB_NAME}_restore`;

        const downloadResult = await RNFS.downloadFile({
            fromUrl: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            toFile: tempPath,
            headers: { Authorization: `Bearer ${accessToken}` },
        }).promise;

        if (downloadResult.statusCode !== 200) {
            throw new Error(`Download failed with status ${downloadResult.statusCode}`);
        }

        // 3. Overwrite local database
        // It's safer to close DB connection first if possible, but we might not have access to the instance here.
        // Assuming the app can handle hot-swap or requires restart.

        await RNFS.copyFile(tempPath, dbPath);
        await RNFS.unlink(tempPath);

        console.log('Database restore successful');
        return true;
    } catch (error) {
        console.error('Restore failed:', error);
        throw error;
    }
};
