
export const COLORS = {
    CORRECT: '#14F195', // brand-primary
    INCORRECT: '#F43F5E', // red-500
    SKELETON: '#00C2FF', // brand-secondary
    TEXT: '#F9FAFB'
};

export const EXERCISE_THRESHOLDS = {
    squats: {
        up: {
            hip_angle: 160,
            knee_angle: 160,
        },
        down: {
            hip_angle: 90,
            knee_angle: 90,
        }
    },
    pushups: {
        up: {
            elbow_angle: 160,
            shoulder_angle: 90, // Not as primary, but can check for body line
            hip_angle: 160,
        },
        down: {
            elbow_angle: 90,
            hip_angle: 160,
        }
    },
    jumping_jacks: {
        closed: {
            left_shoulder_angle: 20, // Arm to body angle
            right_shoulder_angle: 20,
            hip_distance_ratio: 0.2 // Ratio of distance between feet to shoulder width
        },
        open: {
            left_shoulder_angle: 160,
            right_shoulder_angle: 160,
            hip_distance_ratio: 0.8
        }
    }
};

export const LANDMARK_INDICES = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
};
