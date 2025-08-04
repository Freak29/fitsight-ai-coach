
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WebcamView } from './components/WebcamView';
import { Dashboard } from './components/Dashboard';
import { PoseResult, EXERCISE_DEFINITIONS, Exercise, ExerciseName, SessionData, FormFeedback } from './types';
import { analyzePose } from './services/exerciseService';
import { getMotivationalTip } from './services/geminiService';

const App: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISE_DEFINITIONS.squats);
    const [reps, setReps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [userWeight, setUserWeight] = useState(70); // Default weight in kg
    const [formFeedback, setFormFeedback] = useState<FormFeedback>({ messages: [], isCorrect: true });
    const [motivationalTip, setMotivationalTip] = useState<string>('');
    const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(true);

    // New state for sets and rest
    const [targetReps, setTargetReps] = useState(12);
    const [targetSets, setTargetSets] = useState(3);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(60);

    const exerciseStateRef = useRef<string>('up');
    const timerIntervalRef = useRef<number | null>(null);
    const restTimerIntervalRef = useRef<number | null>(null);

    const handleStartStop = useCallback(() => {
        setIsStarted(prev => !prev);
    }, []);
    
    const handleExerciseChange = useCallback((exerciseName: ExerciseName) => {
        if (!isStarted) {
            setSelectedExercise(EXERCISE_DEFINITIONS[exerciseName]);
        }
    }, [isStarted]);

    const resetState = useCallback(() => {
        setReps(0);
        setCalories(0);
        setTimer(0);
        setCurrentSet(1);
        setIsResting(false);
        setFormFeedback({ messages: ['Get in position.'], isCorrect: true });
        exerciseStateRef.current = EXERCISE_DEFINITIONS[selectedExercise.name as ExerciseName].initialState;
    }, [selectedExercise]);

    // Main workout timer effect
    useEffect(() => {
        if (isStarted && !isResting) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isStarted, isResting]);

    // Effect for session start/stop and history logging
    useEffect(() => {
        if (isStarted) {
            resetState();
        } else {
            if (timer > 0 || currentSet > 1 || reps > 0) { // Check if any progress was made
              setSessionHistory(prev => [...prev, { name: selectedExercise.name, reps, calories: parseFloat(calories.toFixed(2)), duration: timer, date: new Date(), sets: currentSet > targetSets ? targetSets : (currentSet - 1) }]);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStarted]);
    
    // Rest timer effect
    useEffect(() => {
        if (isResting) {
            setRestTimer(60);
            restTimerIntervalRef.current = window.setInterval(() => {
                setRestTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(restTimerIntervalRef.current!);
                        setIsResting(false);
                        setCurrentSet(s => s + 1);
                        setReps(0);
                        exerciseStateRef.current = EXERCISE_DEFINITIONS[selectedExercise.name as ExerciseName].initialState;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
        };
    }, [isResting, selectedExercise.name]);

    useEffect(() => {
        if (isStarted && timer > 0) {
            const timeInHours = timer / 3600;
            const cals = selectedExercise.metValue * userWeight * timeInHours;
            setCalories(cals);
        }
    }, [timer, isStarted, selectedExercise.metValue, userWeight]);

    const handlePoseResult = (result: PoseResult) => {
        if (!isStarted || !result.landmarks.length || isResting) return;

        const { feedback, stage, repCounted } = analyzePose(selectedExercise.name as ExerciseName, result.landmarks, exerciseStateRef.current);
        
        setFormFeedback(feedback);
        exerciseStateRef.current = stage;

        if (repCounted) {
             setReps(prevReps => {
                const newReps = prevReps + 1;
                if (newReps >= targetReps) {
                    if (currentSet >= targetSets) {
                        handleStartStop(); // End of workout
                    } else {
                        setIsResting(true); // Start rest period
                    }
                }
                return newReps;
            });
        }
    };
    
    useEffect(() => {
        resetState();
    }, [selectedExercise, resetState]);

    useEffect(() => {
        if (formFeedback.messages.length > 0 && !formFeedback.isCorrect) {
             const fetchTip = async () => {
                const tip = await getMotivationalTip(selectedExercise.name as ExerciseName, formFeedback.messages[0]);
                setMotivationalTip(tip);
            };
            const debounceTimeout = setTimeout(fetchTip, 1000);
            return () => clearTimeout(debounceTimeout);
        } else {
            setMotivationalTip('');
        }
    }, [formFeedback, selectedExercise.name]);

    const handleWeightSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsWeightModalOpen(false);
    };
    
    if (isWeightModalOpen) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-brand-gray-700 p-8 rounded-lg shadow-2xl text-center">
                    <h2 className="text-2xl font-bold mb-4 text-brand-primary">Welcome to FitSight</h2>
                    <p className="mb-6 text-brand-gray-200">Please enter your weight (kg) for accurate calorie tracking.</p>
                    <form onSubmit={handleWeightSubmit}>
                        <input
                            type="number"
                            value={userWeight}
                            onChange={(e) => setUserWeight(parseInt(e.target.value, 10))}
                            className="bg-brand-gray-600 text-white p-3 rounded-lg w-full text-center text-2xl mb-6"
                            min="20"
                            max="300"
                        />
                        <button type="submit" className="w-full bg-brand-primary text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300">
                            Let's Get Started
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col lg:flex-row font-sans">
            <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-4xl aspect-video relative bg-brand-gray-700 rounded-lg shadow-2xl overflow-hidden">
                    <WebcamView onPoseResult={handlePoseResult} onLoadingChange={setIsLoading} formFeedback={formFeedback} isResting={isResting} restTimer={restTimer} />
                     {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-20">
                            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white mt-4 text-lg">Initializing AI & Webcam...</p>
                        </div>
                    )}
                </div>
            </main>
            <aside className="w-full lg:w-96 bg-brand-gray-800 p-4 lg:p-6 flex flex-col space-y-6">
                <Dashboard
                    selectedExercise={selectedExercise}
                    reps={reps}
                    calories={calories}
                    timer={timer}
                    isStarted={isStarted}
                    formFeedback={formFeedback}
                    motivationalTip={motivationalTip}
                    sessionHistory={sessionHistory}
                    onStartStop={handleStartStop}
                    onExerciseChange={handleExerciseChange}
                    currentSet={currentSet}
                    targetSets={targetSets}
                    targetReps={targetReps}
                    onTargetRepsChange={setTargetReps}
                    onTargetSetsChange={setTargetSets}
                />
            </aside>
        </div>
    );
};

export default App;