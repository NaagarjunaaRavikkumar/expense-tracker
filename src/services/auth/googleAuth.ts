import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    scopes: [
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.readonly'
    ],
    webClientId: '299989189116-6ss0lpnejf197pq5tt8ffqm871abq69q.apps.googleusercontent.com',
    offlineAccess: true,
});

export const signIn = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        return userInfo;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled the login flow');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('Operation (e.g. sign in) is in progress already');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log('Play services not available or outdated');
        } else {
            console.error('Some other error happened', error);
        }
        throw error;
    }
};

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error(error);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentUser = await GoogleSignin.getCurrentUser();
        return currentUser;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const signInSilently = async () => {
    try {
        const userInfo = await GoogleSignin.signInSilently();
        return userInfo;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {
            // User has not signed in yet
        } else {
            console.error('Sign in silently failed', error);
        }
        return null;
    }
};
