import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
    displayLarge: { fontFamily: 'System', fontSize: 57, fontWeight: '400', letterSpacing: 0, lineHeight: 64 },
    displayMedium: { fontFamily: 'System', fontSize: 45, fontWeight: '400', letterSpacing: 0, lineHeight: 52 },
    displaySmall: { fontFamily: 'System', fontSize: 36, fontWeight: '400', letterSpacing: 0, lineHeight: 44 },
    headlineLarge: { fontFamily: 'System', fontSize: 32, fontWeight: '700', letterSpacing: 0, lineHeight: 40 },
    headlineMedium: { fontFamily: 'System', fontSize: 28, fontWeight: '700', letterSpacing: 0, lineHeight: 36 },
    headlineSmall: { fontFamily: 'System', fontSize: 24, fontWeight: '700', letterSpacing: 0, lineHeight: 32 },
    titleLarge: { fontFamily: 'System', fontSize: 22, fontWeight: '700', letterSpacing: 0, lineHeight: 28 },
    titleMedium: { fontFamily: 'System', fontSize: 16, fontWeight: '600', letterSpacing: 0.15, lineHeight: 24 },
    titleSmall: { fontFamily: 'System', fontSize: 14, fontWeight: '500', letterSpacing: 0.1, lineHeight: 20 },
    labelLarge: { fontFamily: 'System', fontSize: 14, fontWeight: '600', letterSpacing: 0.1, lineHeight: 20 },
    labelMedium: { fontFamily: 'System', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, lineHeight: 16 },
    labelSmall: { fontFamily: 'System', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, lineHeight: 16 },
    bodyLarge: { fontFamily: 'System', fontSize: 16, fontWeight: '400', letterSpacing: 0.15, lineHeight: 24 },
    bodyMedium: { fontFamily: 'System', fontSize: 14, fontWeight: '400', letterSpacing: 0.25, lineHeight: 20 },
    bodySmall: { fontFamily: 'System', fontSize: 12, fontWeight: '400', letterSpacing: 0.4, lineHeight: 16 },
} as const;

export const LightTheme = {
    ...MD3LightTheme,
    roundness: 2,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6366F1', // Indigo
        onPrimary: '#FFFFFF',
        primaryContainer: '#E0E7FF',
        onPrimaryContainer: '#3730A3',
        secondary: '#EC4899', // Pink
        onSecondary: '#FFFFFF',
        secondaryContainer: '#FCE7F3',
        onSecondaryContainer: '#9D174D',
        tertiary: '#10B981', // Green
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#D1FAE5',
        onTertiaryContainer: '#065F46',
        error: '#EF4444', // Red
        onError: '#FFFFFF',
        errorContainer: '#FEE2E2',
        onErrorContainer: '#991B1B',
        background: '#F9FAFB', // User specified background
        onBackground: '#111827', // User specified text primary
        surface: '#FFFFFF',
        onSurface: '#111827', // User specified text primary
        surfaceVariant: '#F3F4F6',
        onSurfaceVariant: '#6B7280', // User specified text secondary
        outline: '#9CA3AF',
        elevation: {
            level0: 'transparent',
            level1: '#FFFFFF',
            level2: '#FFFFFF',
            level3: '#FFFFFF',
            level4: '#FFFFFF',
            level5: '#FFFFFF',
        },
    },
    fonts: configureFonts({ config: fontConfig }),
};

export const DarkTheme = {
    ...MD3DarkTheme,
    roundness: 2,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#818CF8', // Lighter Indigo
        onPrimary: '#111827',
        primaryContainer: '#3730A3',
        onPrimaryContainer: '#E0E7FF',
        secondary: '#F472B6', // Softer Pink
        onSecondary: '#111827',
        secondaryContainer: '#831843',
        onSecondaryContainer: '#FCE7F3',
        tertiary: '#34D399', // Lighter Green
        onTertiary: '#111827',
        tertiaryContainer: '#064E3B',
        onTertiaryContainer: '#D1FAE5',
        error: '#F87171', // Red
        onError: '#111827',
        errorContainer: '#7F1D1D',
        onErrorContainer: '#FEE2E2',
        background: '#111827', // User specified background
        onBackground: '#F9FAFB', // User specified text primary
        surface: '#1F2937', // User specified surface
        onSurface: '#F9FAFB', // User specified text primary
        surfaceVariant: '#374151',
        onSurfaceVariant: '#9CA3AF', // User specified text secondary
        outline: '#6B7280',
        elevation: {
            level0: 'transparent',
            level1: '#1F2937',
            level2: '#1F2937',
            level3: '#1F2937',
            level4: '#1F2937',
            level5: '#1F2937',
        },
    },
    fonts: configureFonts({ config: fontConfig }),
};
