import { Goal, GoalProgress } from '../types/goalTypes';
import { parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';

/**
 * Calculate goal progress
 */
export const calculateGoalProgress = (goal: Goal): GoalProgress => {
    const progress = goal.currentProgress;
    const target = goal.targetAmount;
    const percentage = target > 0 ? (progress / target) * 100 : 0;
    const remaining = target - progress;
    const isComplete = progress >= target;

    return {
        goalId: goal.id,
        progress,
        target,
        percentage,
        remaining,
        isComplete,
    };
};

/**
 * Get days remaining until goal end date
 */
export const getDaysRemaining = (goal: Goal): number => {
    const now = new Date();
    const endDate = parseISO(goal.endDate);
    return differenceInDays(endDate, now);
};

/**
 * Check if goal is currently active
 */
export const isGoalActive = (goal: Goal): boolean => {
    const now = new Date();
    const startDate = parseISO(goal.startDate);
    const endDate = parseISO(goal.endDate);

    return !isBefore(now, startDate) && !isAfter(now, endDate);
};

/**
 * Check if goal is expired
 */
export const isGoalExpired = (goal: Goal): boolean => {
    const now = new Date();
    const endDate = parseISO(goal.endDate);
    return isAfter(now, endDate);
};

/**
 * Get progress color based on percentage and goal type
 */
export const getProgressColor = (percentage: number, type: 'savings' | 'spending'): string => {
    if (type === 'savings') {
        // For savings: green is good
        if (percentage < 25) return '#F44336'; // Red
        if (percentage < 50) return '#FF9800'; // Orange
        if (percentage < 75) return '#FFA726'; // Light Orange
        if (percentage < 100) return '#4CAF50'; // Green
        return '#2E7D32'; // Dark Green
    } else {
        // For spending: staying under budget is good
        if (percentage < 50) return '#4CAF50'; // Green
        if (percentage < 75) return '#FFA726'; // Orange
        if (percentage < 100) return '#FF9800'; // Dark Orange
        return '#F44336'; // Red (over budget)
    }
};

/**
 * Format goal status text
 */
export const getGoalStatusText = (goal: Goal): string => {
    const daysRemaining = getDaysRemaining(goal);
    const progress = calculateGoalProgress(goal);

    if (progress.isComplete) {
        return 'Completed!';
    }

    if (daysRemaining < 0) {
        return 'Expired';
    }

    if (daysRemaining === 0) {
        return 'Ends today';
    }

    if (daysRemaining === 1) {
        return '1 day left';
    }

    return `${daysRemaining} days left`;
};
