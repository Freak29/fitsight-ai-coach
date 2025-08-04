
import React, { useRef, useEffect } from 'react';
import { PoseResult, FormFeedback } from '../types';
import { PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { PoseService } from '../services/poseService';
import { COLORS } from '../constants';

interface WebcamViewProps {
    onPoseResult: (result: PoseResult) => void;
    onLoadingChange: (isLoading: boolean) => void;
    formFeedback: FormFeedback;
    isResting: boolean;
    restTimer: number;
}

export const WebcamView: React.FC<WebcamViewProps> = ({ onPoseResult, onLoadingChange, formFeedback, isResting, restTimer }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const poseServiceRef = useRef<PoseService | null>(null);
    const lastVideoTimeRef = useRef(-1);

    const latestProps = useRef({ onPoseResult, formFeedback });
    useEffect(() => {
        latestProps.current = { onPoseResult, formFeedback };
    }, [onPoseResult, formFeedback]);

    useEffect(() => {
        const predictWebcam = async () => {
            if (!videoRef.current || !canvasRef.current || !poseServiceRef.current || videoRef.current.paused) {
                animationFrameId.current = requestAnimationFrame(predictWebcam);
                return;
            }

            const { onPoseResult: currentOnPoseResult, formFeedback: currentFormFeedback } = latestProps.current;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;
                
                const results = await poseServiceRef.current.predict(video);
                
                const ctx = canvas.getContext('2d');
                if (ctx && results) {
                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const drawingUtils = new DrawingUtils(ctx);
                    
                    if (results.landmarks && results.landmarks.length > 0) {
                        currentOnPoseResult({ landmarks: results.landmarks[0] });

                        const connectionColor = currentFormFeedback.isCorrect ? COLORS.CORRECT : COLORS.INCORRECT;

                        for (const landmarks of results.landmarks) {
                            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: connectionColor, lineWidth: 4 });
                            drawingUtils.drawLandmarks(landmarks, { color: COLORS.SKELETON, radius: 6 });
                        }
                    } else {
                         currentOnPoseResult({ landmarks: [] });
                    }
                    ctx.restore();
                }
            }

            animationFrameId.current = requestAnimationFrame(predictWebcam);
        };

        const init = async () => {
            onLoadingChange(true);
            try {
                poseServiceRef.current = new PoseService();
                const posePromise = poseServiceRef.current.initialize();

                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
                
                const videoReadyPromise = new Promise<void>((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => resolve();
                    }
                });

                await Promise.all([posePromise, videoReadyPromise]);

                if (videoRef.current && canvasRef.current) {
                    videoRef.current.play();
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    animationFrameId.current = requestAnimationFrame(predictWebcam);
                }

            } catch (error) {
                console.error("Error initializing webcam or Pose Landmarker:", error);
                alert("Could not access webcam or initialize AI model. Please check permissions and refresh.");
            } finally {
                onLoadingChange(false);
            }
        };

        init();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if(videoRef.current && videoRef.current.srcObject){
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
            poseServiceRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onLoadingChange]);

    return (
        <>
            <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover transform scaleX-[-1]" playsInline muted></video>
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover transform scaleX-[-1]"></canvas>
            {isResting && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-30 text-white transition-opacity duration-500">
                    <h2 className="text-5xl font-bold text-brand-secondary mb-4 animate-pulse">REST</h2>
                    <p className="text-8xl font-mono font-bold">{restTimer}</p>
                    <p className="text-xl mt-4 text-brand-gray-300">Next set coming up!</p>
                </div>
            )}
        </>
    );
};
