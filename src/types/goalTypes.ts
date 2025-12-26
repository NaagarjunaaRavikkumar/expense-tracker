export type GoalType = 'savings' | 'spending';

export interface Goal {
    id: string;
    type: GoalType;
    name: string;
    description?: string;
    targetAmount: number;
    currentProgress: number; // Manual tracking only in Phase 1
    color: string;
    icon: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    createdAt: string;
    updatedAt: string;
}

export interface GoalProgress {
    goalId: string;
    progress: number;
    target: number;
    percentage: number;
    remaining: number;
    isComplete: boolean;
}

export const GOAL_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
    '#ABEBC6', // Light Green
];

export const GOAL_ICONS = [
    'piggy-bank',
    'cash-multiple',
    'wallet',
    'bank',
    'chart-line',
    'trophy',
    'star',
    'flag',
    'rocket',
    'heart',
    'home',
    'car',
    'airplane',
    'gift',
    'school',
];
