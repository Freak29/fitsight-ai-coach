import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class PoseService {
    private poseLandmarker: PoseLandmarker | null = null;

    async initialize(): Promise<void> {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
            );
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numPoses: 1,
            });
        } catch (error) {
            console.error("Failed to initialize PoseLandmarker:", error);
            throw error;
        }
    }

    async predict(video: HTMLVideoElement) {
        if (!this.poseLandmarker) {
            console.warn("PoseLandmarker not initialized.");
            return;
        }
        
        const startTimeMs = performance.now();
        const result = this.poseLandmarker.detectForVideo(video, startTimeMs);
        return result;
    }

    close() {
        this.poseLandmarker?.close();
    }
}