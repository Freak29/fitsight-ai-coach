
export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export enum ExerciseName {
    SQUATS = 'squats',
    PUSHUPS = 'pushups',
    JUMPING_JACKS = 'jumping_jacks',
}

export interface Exercise {
    name: string;
    displayName: string;
    metValue: number;
    instructions: string;
    initialState: string;
}

export type ExerciseDefinitions = {
    [key in ExerciseName]: Exercise;
};

export const EXERCISE_DEFINITIONS: ExerciseDefinitions = {
    [ExerciseName.SQUATS]: {
        name: ExerciseName.SQUATS,
        displayName: 'Squats',
        metValue: 5.5,
        instructions: 'Keep your back straight and lower your hips until your thighs are parallel to the floor.',
        initialState: 'up',
    },
    [ExerciseName.PUSHUPS]: {
        name: ExerciseName.PUSHUPS,
        displayName: 'Push-ups',
        metValue: 8.0,
        instructions: 'Keep your body in a straight line from head to heels. Lower until your chest nearly touches the floor.',
        initialState: 'up',
    },
    [ExerciseName.JUMPING_JACKS]: {
        name: ExerciseName.JUMPING_JACKS,
        displayName: 'Jumping Jacks',
        metValue: 8.0,
        instructions: 'Jump while spreading your legs and bringing your arms overhead. Return to the starting position.',
        initialState: 'closed',
    }
};


export interface PoseResult {
    landmarks: Landmark[];
}

export interface FormFeedback {
    messages: string[];
    isCorrect: boolean;
}

export interface AnalysisResult {
    feedback: FormFeedback;
    stage: string;
    repCounted: boolean;
}

export interface SessionData {
    name: string;
    reps: number;
    duration: number;
    calories: number;
    date: Date;
    sets: number;
}