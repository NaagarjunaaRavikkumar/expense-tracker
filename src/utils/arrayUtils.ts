// Utility to ensure store arrays are never undefined
export const ensureArray = <T,>(arr: T[] | undefined): T[] => arr || [];
