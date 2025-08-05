# FitSight: Your Personal AI Fitness Coach

![FitSight Demo](fitsight-ai-coach/assests/demo1.png)

**FitSight is a real-time, browser-based AI personal trainer that uses your webcam to analyze your exercise form, count your reps, and provide instant, actionable feedback to help you work out safely and effectively.**

This project leverages modern web technologies and on-device machine learning to create an interactive and intelligent fitness experience.

---

## ✨ Key Features

*   **Real-time Pose Estimation:** Utilizes MediaPipe PoseLandmarker to track 33 key body points directly in the browser.
*   **Instant Form Correction:** Analyzes joint angles in real-time to detect common mistakes in exercises like squats, push-ups, and jumping jacks.
*   **Structured Workouts:** Plan your sessions with customizable sets and reps per set.
*   **Automatic Rep & Set Counting:** The app automatically counts valid repetitions and progresses you through sets.
*   **Automated Rest Timers:** A built-in rest timer starts automatically after each set to keep your workout on track.
*   **AI-Powered Motivational Tips:** Receives dynamic, encouraging tips from Google's Gemini API when your form needs correction.
*   **Progress Dashboard:** Visualize your workout history with an interactive chart to track your consistency and performance over time.
*   **Privacy-Focused:** All video processing happens on your device. Your webcam feed is never sent to a server.

---

## 🛠️ Tech Stack

FitSight is built with a modern, lightweight, and powerful stack:

*   **Frontend:** **React** & **TypeScript** for a robust, component-based UI.
*   **Styling:** **Tailwind CSS** for rapid, utility-first styling.
*   **AI & Machine Learning:**
    *   **MediaPipe (PoseLandmarker):** For on-device, real-time pose estimation via WebAssembly.
    *   **Google Gemini API:** For generating intelligent, context-aware motivational feedback.
*   **Browser APIs:** **MediaDevices (Webcam) API** for accessing the video feed.
*   **Data Visualization:** **Recharts** for clean and responsive progress charts.
*   **Module Loading:** **ES Modules with Import Maps**, allowing the app to run directly in the browser without a build step.

---

## 🚀 Getting Started

This project is configured to run directly in the browser without any build process.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    ```
2.  **Run with a local server:**
    You can use any simple HTTP server. If you have Python installed, you can run the following command from the project's root directory:
    ```bash
    # For Python 3
    python -m http.server
    ```
    Then, open your browser and navigate to `http://localhost:8000`.

3.  **Provide API Key (Optional):**
    To enable AI motivational tips, you need to provide a Google Gemini API key. This project is currently set up to read it from `process.env.API_KEY`. For local testing, you will need a way to provide this variable to your environment or modify the code in `services/geminiService.ts` temporarily.

---

## 🧑‍💻 Authors

*   [Your Name]
*   [Your Teammate's Name]
