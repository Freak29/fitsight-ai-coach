
import { Landmark, ExerciseName, FormFeedback, AnalysisResult } from '../types';
import { EXERCISE_THRESHOLDS, LANDMARK_INDICES as LI } from '../constants';

const calculateAngle = (p1: Landmark, p2: Landmark, p3: Landmark): number => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
};

const getVisibility = (landmarks: Landmark[], indices: number[]): number => {
    let totalVisibility = 0;
    indices.forEach(index => {
        if(landmarks[index] && landmarks[index].visibility) {
            totalVisibility += landmarks[index].visibility!;
        }
    });
    return totalVisibility / indices.length;
}

const analyzeSquat = (landmarks: Landmark[], currentStage: string): AnalysisResult => {
    const feedback: FormFeedback = { messages: [], isCorrect: true };
    let repCounted = false;
    let nextStage = currentStage;
    
    const requiredLandmarks = [LI.LEFT_HIP, LI.RIGHT_HIP, LI.LEFT_KNEE, LI.RIGHT_KNEE, LI.LEFT_ANKLE, LI.RIGHT_ANKLE, LI.LEFT_SHOULDER, LI.RIGHT_SHOULDER];
    if (getVisibility(landmarks, requiredLandmarks) < 0.7) {
        feedback.messages.push("Please make sure your full body is visible.");
        feedback.isCorrect = false;
        return { feedback, stage: currentStage, repCounted };
    }

    const leftHip = landmarks[LI.LEFT_HIP];
    const rightHip = landmarks[LI.RIGHT_HIP];
    const leftKnee = landmarks[LI.LEFT_KNEE];
    const rightKnee = landmarks[LI.RIGHT_KNEE];
    const leftAnkle = landmarks[LI.LEFT_ANKLE];
    const rightAnkle = landmarks[LI.RIGHT_ANKLE];
    const leftShoulder = landmarks[LI.LEFT_SHOULDER];
    const rightShoulder = landmarks[LI.RIGHT_SHOULDER];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;
    
    const thresholds = EXERCISE_THRESHOLDS.squats;

    if (currentStage === 'up' && avgKneeAngle < thresholds.down.knee_angle && avgHipAngle < thresholds.down.hip_angle + 20) {
        nextStage = 'down';
    } else if (currentStage === 'down') {
        if (avgKneeAngle < thresholds.down.knee_angle) {
             feedback.messages.push("Good depth!");
        } else {
            feedback.messages.push("Squat deeper!");
            feedback.isCorrect = false;
        }

        if (avgHipAngle < thresholds.down.hip_angle) {
            feedback.messages.push("Keep your chest up!");
            feedback.isCorrect = false;
        }

        if (avgKneeAngle > thresholds.up.knee_angle && avgHipAngle > thresholds.up.hip_angle) {
            nextStage = 'up';
            repCounted = true;
            feedback.messages.push("Rep counted!");
        }
    }

    if (feedback.messages.length === 0) feedback.messages.push("Keep it up!");

    return { feedback, stage: nextStage, repCounted };
};

const analyzePushup = (landmarks: Landmark[], currentStage: string): AnalysisResult => {
    const feedback: FormFeedback = { messages: [], isCorrect: true };
    let repCounted = false;
    let nextStage = currentStage;
    
    const requiredLandmarks = [LI.LEFT_SHOULDER, LI.RIGHT_SHOULDER, LI.LEFT_ELBOW, LI.RIGHT_ELBOW, LI.LEFT_WRIST, LI.RIGHT_WRIST, LI.LEFT_HIP, LI.RIGHT_HIP];
    if (getVisibility(landmarks, requiredLandmarks) < 0.6) {
        feedback.messages.push("Please position yourself sideways to the camera.");
        feedback.isCorrect = false;
        return { feedback, stage: currentStage, repCounted };
    }

    // Use one side for simplicity, assuming side view
    const shoulder = landmarks[LI.LEFT_SHOULDER];
    const elbow = landmarks[LI.LEFT_ELBOW];
    const wrist = landmarks[LI.LEFT_WRIST];
    const hip = landmarks[LI.LEFT_HIP];
    const knee = landmarks[LI.LEFT_KNEE];

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const hipAngle = calculateAngle(shoulder, hip, knee);
    
    const thresholds = EXERCISE_THRESHOLDS.pushups;

    if (hipAngle < thresholds.up.hip_angle) {
        feedback.messages.push("Keep your back straight!");
        feedback.isCorrect = false;
    }

    if (currentStage === 'up' && elbowAngle < thresholds.down.elbow_angle + 20) {
        nextStage = 'down';
    } else if (currentStage === 'down') {
         if(elbowAngle > thresholds.down.elbow_angle) {
            feedback.messages.push("Go lower!");
            feedback.isCorrect = false;
        } else {
            feedback.messages.push("Great depth!");
        }

        if (elbowAngle > thresholds.up.elbow_angle) {
            nextStage = 'up';
            repCounted = true;
            feedback.messages.push("Rep counted!");
        }
    }
    
    if (feedback.messages.length === 0) feedback.messages.push("Perfect form!");
    
    return { feedback, stage: nextStage, repCounted };
};

const analyzeJumpingJack = (landmarks: Landmark[], currentStage: string): AnalysisResult => {
    const feedback: FormFeedback = { messages: [], isCorrect: true };
    let repCounted = false;
    let nextStage = currentStage;

    const requiredLandmarks = [LI.LEFT_SHOULDER, LI.RIGHT_SHOULDER, LI.LEFT_WRIST, LI.RIGHT_WRIST, LI.LEFT_ANKLE, LI.RIGHT_ANKLE];
    if (getVisibility(landmarks, requiredLandmarks) < 0.7) {
        feedback.messages.push("Please make sure your full body is visible.");
        feedback.isCorrect = false;
        return { feedback, stage: currentStage, repCounted };
    }

    const leftShoulder = landmarks[LI.LEFT_SHOULDER];
    const rightShoulder = landmarks[LI.RIGHT_SHOULDER];
    const leftWrist = landmarks[LI.LEFT_WRIST];
    const rightWrist = landmarks[LI.RIGHT_WRIST];
    const leftHip = landmarks[LI.LEFT_HIP];
    const rightHip = landmarks[LI.RIGHT_HIP];
    const leftAnkle = landmarks[LI.LEFT_ANKLE];
    const rightAnkle = landmarks[LI.RIGHT_ANKLE];

    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const hipDistanceRatio = ankleDistance / shoulderWidth;
    const handsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;

    const thresholds = EXERCISE_THRESHOLDS.jumping_jacks;
    
    if (currentStage === 'closed' && handsUp && hipDistanceRatio > thresholds.open.hip_distance_ratio) {
        nextStage = 'open';
    } else if (currentStage === 'open') {
        if(!handsUp) {
            feedback.messages.push("Raise your hands higher!");
            feedback.isCorrect = false;
        }
        if(hipDistanceRatio < thresholds.open.hip_distance_ratio) {
            feedback.messages.push("Spread your feet wider!");
            feedback.isCorrect = false;
        }

        if (!handsUp && hipDistanceRatio < thresholds.closed.hip_distance_ratio) {
            nextStage = 'closed';
            repCounted = true;
            feedback.messages.push("Rep counted!");
        }
    }
    
    if (feedback.messages.length === 0) feedback.messages.push("Good energy!");

    return { feedback, stage: nextStage, repCounted };
};

export const analyzePose = (
    exercise: ExerciseName,
    landmarks: Landmark[],
    currentStage: string
): AnalysisResult => {
    switch (exercise) {
        case ExerciseName.SQUATS:
            return analyzeSquat(landmarks, currentStage);
        case ExerciseName.PUSHUPS:
            return analyzePushup(landmarks, currentStage);
        case ExerciseName.JUMPING_JACKS:
            return analyzeJumpingJack(landmarks, currentStage);
        default:
            return {
                feedback: { messages: ["Exercise not recognized."], isCorrect: false },
                stage: 'start',
                repCounted: false
            };
    }
};
