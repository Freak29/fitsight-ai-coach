
import React, { useState } from 'react';
import { Exercise, ExerciseName, SessionData, FormFeedback, EXERCISE_DEFINITIONS } from '../types';
import { ProgressChart } from './ProgressChart';
import { PlayIcon, PauseIcon, InfoIcon } from './Icons';

interface DashboardProps {
    selectedExercise: Exercise;
    reps: number;
    calories: number;
    timer: number;
    isStarted: boolean;
    formFeedback: FormFeedback;
    motivationalTip: string;
    sessionHistory: SessionData[];
    onStartStop: () => void;
    onExerciseChange: (name: ExerciseName) => void;
    currentSet: number;
    targetSets: number;
    targetReps: number;
    onTargetRepsChange: (reps: number) => void;
    onTargetSetsChange: (sets: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    selectedExercise,
    reps,
    calories,
    timer,
    isStarted,
    formFeedback,
    motivationalTip,
    sessionHistory,
    onStartStop,
    onExerciseChange,
    currentSet,
    targetSets,
    targetReps,
    onTargetRepsChange,
    onTargetSetsChange
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const [activeTab, setActiveTab] = useState<'feedback' | 'progress'>('feedback');

    return (
        <div className="flex flex-col h-full">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold text-brand-primary">FitSight</h1>
            </header>

            <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <StatCard label="Time" value={formatTime(timer)} />
                <StatCard label="Calories" value={calories.toFixed(1)} />
                <StatCard label="Set" value={`${isStarted ? currentSet : '-' } / ${targetSets}`} />
                <StatCard label="Reps" value={`${isStarted ? reps : '-' } / ${targetReps}`} />
            </div>

            <div className="bg-brand-gray-700 rounded-lg p-4 mb-4">
                 <label htmlFor="exercise-select" className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Choose Your Workout
                </label>
                <select
                    id="exercise-select"
                    value={selectedExercise.name}
                    onChange={(e) => onExerciseChange(e.target.value as ExerciseName)}
                    disabled={isStarted}
                    className="w-full bg-brand-gray-600 border border-brand-gray-500 text-white rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
                >
                    {Object.values(EXERCISE_DEFINITIONS).map(ex => (
                        <option key={ex.name} value={ex.name}>{ex.displayName}</option>
                    ))}
                </select>
            </div>
            
             <div className="bg-brand-gray-700 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sets-input" className="block text-sm font-medium text-brand-gray-300 mb-1">Sets</label>
                        <input id="sets-input" type="number" value={targetSets} onChange={e => onTargetSetsChange(Number(e.target.value))} disabled={isStarted} className="w-full bg-brand-gray-600 border border-brand-gray-500 text-white rounded-lg p-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 text-center"/>
                    </div>
                    <div>
                        <label htmlFor="reps-input" className="block text-sm font-medium text-brand-gray-300 mb-1">Reps/Set</label>
                        <input id="reps-input" type="number" value={targetReps} onChange={e => onTargetRepsChange(Number(e.target.value))} disabled={isStarted} className="w-full bg-brand-gray-600 border border-brand-gray-500 text-white rounded-lg p-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 text-center"/>
                    </div>
                </div>
            </div>


            <button
                onClick={onStartStop}
                className={`w-full text-2xl font-bold py-4 rounded-lg flex items-center justify-center transition-all duration-300 ${isStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-opacity-80 text-brand-dark'}`}
            >
                {isStarted ? <PauseIcon /> : <PlayIcon />}
                <span className="ml-3">{isStarted ? 'Stop Session' : 'Start Session'}</span>
            </button>
            
            <div className="flex-grow bg-brand-gray-700 rounded-lg mt-6 p-4 flex flex-col">
                 <div className="flex border-b border-brand-gray-600 mb-4">
                    <button onClick={() => setActiveTab('feedback')} className={`py-2 px-4 font-semibold ${activeTab === 'feedback' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-gray-300'}`}>Feedback</button>
                    <button onClick={() => setActiveTab('progress')} className={`py-2 px-4 font-semibold ${activeTab === 'progress' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-gray-300'}`}>Progress</button>
                </div>
                {activeTab === 'feedback' ? (
                     <div className="flex-grow space-y-4">
                        <FeedbackCard title="Real-time Form Analysis" feedback={formFeedback} />
                        {motivationalTip && <div className="p-3 bg-blue-900/50 rounded-lg text-blue-200 text-sm">{motivationalTip}</div>}
                     </div>
                ) : (
                    <ProgressChart data={sessionHistory} />
                )}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-brand-gray-700 p-4 rounded-lg">
        <p className="text-sm text-brand-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const FeedbackCard: React.FC<{ title: string; feedback: FormFeedback }> = ({ title, feedback }) => (
     <div className={`p-4 rounded-lg transition-all duration-300 ${feedback.isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
        <h3 className="font-semibold text-white mb-2 flex items-center">
            <InfoIcon className="mr-2"/>
            {title}
        </h3>
        <ul className="list-disc list-inside text-sm">
            {feedback.messages.map((msg, index) => (
                <li key={index} className={feedback.isCorrect ? 'text-green-200' : 'text-red-200'}>
                    {msg}
                </li>
            ))}
        </ul>
    </div>
);