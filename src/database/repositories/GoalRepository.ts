import { getDBConnection } from '../index';
import { TABLE_NAMES } from '../tables';
import { Goal, GoalType } from '../../types/goalTypes';

export const GoalRepository = {
    getAllGoals: async (): Promise<Goal[]> => {
        const db = await getDBConnection();
        const results = await db.executeSql(`SELECT * FROM ${TABLE_NAMES.GOALS}`);
        const goals: Goal[] = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            goals.push(results[0].rows.item(i));
        }

        return goals;
    },

    createGoal: async (goal: Goal): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(
            `INSERT INTO ${TABLE_NAMES.GOALS} (id, type, name, description, targetAmount, currentProgress, color, icon, startDate, endDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                goal.id,
                goal.type,
                goal.name,
                goal.description || null,
                goal.targetAmount,
                goal.currentProgress,
                goal.color,
                goal.icon,
                goal.startDate,
                goal.endDate,
                goal.createdAt,
                goal.updatedAt,
            ]
        );
    },

    updateGoal: async (id: string, goal: Partial<Goal>): Promise<void> => {
        const db = await getDBConnection();
        const updates: string[] = [];
        const values: any[] = [];

        if (goal.name !== undefined) {
            updates.push('name = ?');
            values.push(goal.name);
        }
        if (goal.description !== undefined) {
            updates.push('description = ?');
            values.push(goal.description);
        }
        if (goal.targetAmount !== undefined) {
            updates.push('targetAmount = ?');
            values.push(goal.targetAmount);
        }
        if (goal.currentProgress !== undefined) {
            updates.push('currentProgress = ?');
            values.push(goal.currentProgress);
        }
        if (goal.color !== undefined) {
            updates.push('color = ?');
            values.push(goal.color);
        }
        if (goal.icon !== undefined) {
            updates.push('icon = ?');
            values.push(goal.icon);
        }
        if (goal.startDate !== undefined) {
            updates.push('startDate = ?');
            values.push(goal.startDate);
        }
        if (goal.endDate !== undefined) {
            updates.push('endDate = ?');
            values.push(goal.endDate);
        }
        if (goal.updatedAt !== undefined) {
            updates.push('updatedAt = ?');
            values.push(goal.updatedAt);
        }

        if (updates.length === 0) return;

        values.push(id);
        await db.executeSql(
            `UPDATE ${TABLE_NAMES.GOALS} SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    deleteGoal: async (id: string): Promise<void> => {
        const db = await getDBConnection();
        await db.executeSql(`DELETE FROM ${TABLE_NAMES.GOALS} WHERE id = ?`, [id]);
    },
};
