import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const CameraFeed = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [posture, setPosture] = useState("Good");
    const [goodPostureHeight, setGoodPostureHeight] = useState(null);
    const [landmarks, setLandmarks] = useState(null); // State to store landmarks

    useEffect(() => {
        const startCamera = async () => {
            try {
                // Request camera access
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        // Initialize MediaPipe Pose
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@latest/${file}`,
        });
        
        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
            if (results.poseLandmarks) {
                setLandmarks(results.poseLandmarks); // Update landmarks state
                drawResults(results.poseLandmarks);
                analyzePosture(results.poseLandmarks);
            }
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await pose.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
        });

        camera.start();
        startCamera();
    }, []); // Empty dependency array ensures this runs only once

    const drawResults = (landmarks) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (landmarks) {
            landmarks.forEach((landmark) => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvasRef.current.width,
                    landmark.y * canvasRef.current.height,
                    5,
                    0,
                    2 * Math.PI
                );
                ctx.fillStyle = "Red";
                ctx.fill();
            });
        }
    };

    const analyzePosture = (landmarks) => {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const angle = Math.abs(leftShoulder.y - rightShoulder.y);
        const currentShoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;

        if (goodPostureHeight !== null) {
            const heightDifference = Math.abs(goodPostureHeight - currentShoulderHeight);

            // Define a threshold for slouching detection (you can tweak this value)
            const slouchThreshold = 0.01; // Threshold for slouching detection

            if (heightDifference > slouchThreshold) {
                setPosture("Slouching"); // Shoulders are too low, slouching detected
            } else {
                setPosture("Good"); // Shoulders are aligned with the good posture
            }
        }

        if (angle > 0.05) {
            setPosture("Bad");
        } else {
            setPosture("Good");
        }
    };

    const setGoodPosture = () => {
        if (landmarks) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];

            // Save the average shoulder height as the good posture reference
            const height = (leftShoulder.y + rightShoulder.y) / 2;
            setGoodPostureHeight(height);
            alert("Good posture height saved!"); // Notify the user that the height is saved
        } else {
            alert("No landmarks detected yet.");
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">WebRTC Camera + Posture Detection</h1>
            <video ref={videoRef} autoPlay playsInline className="mt-4 border border-gray-400 rounded-lg w-80 h-60" />
            <canvas ref={canvasRef} className="mt-4 w-80 h-60 absolute top-0 left-0" />
            <div className="mt-4 text-xl font-semibold">{posture} Posture</div>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={setGoodPosture}>Set Good Posture</button>
        </div>
    );
};

export default CameraFeed;