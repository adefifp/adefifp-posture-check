import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const CameraFeed = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [shoulders, setShoulders] = useState("Good");
    const [head, setHead] = useState("Good")
    const [posture, setPosture] = useState ("Good")
    const goodPostureHeight = useRef(null);
    const [landmarks, setLandmarks] = useState(null); // State to store landmarks

    useEffect(() => {
        const startCamera = async () => {
            try {
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
                setLandmarks(results.poseLandmarks);
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
    }, []);

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
    const leftEar = landmarks [7];
    const rightEar = landmarks [8];
    const angle = Math.abs(leftShoulder.y - rightShoulder.y);
    const earHeightDifference = Math.abs(leftEar.y - rightEar.y);

        const slouchThreshold = 0.025;
        const tiltThreshold = 0.05;
        const shoulderAngleThreshold = 0.05;
        
        let newPosture = "Good"
        if (goodPostureHeight.current == null) {
            newPosture = "Please Set Ideal Posture"
        }
        if (goodPostureHeight.current !== null) {
            const currentShoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
            const heightDifference = Math.abs(goodPostureHeight.current - currentShoulderHeight);
            if (heightDifference > slouchThreshold) {
                newPosture = "Slouching";
            }
        }
        let newHead = "Good"
        if (earHeightDifference > tiltThreshold){
            newHead = "Head Tilt"
        }
        let newShoulders = "Good"
        if (angle > shoulderAngleThreshold) {
            newShoulders = "Uneven Shoulders";
        }
        setHead(newHead)
        setShoulders(newShoulders)
        setPosture(newPosture)
};

    const setGoodPosture = () => {
        if (landmarks) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];

            const height = (leftShoulder.y + rightShoulder.y) / 2;
            goodPostureHeight.current = height;
            alert("Good posture height saved!");
        } else {
            alert("No landmarks detected yet.");
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">Posture Detection</h1>
            <video ref={videoRef} autoPlay playsInline className="mt-4 border border-gray-400 rounded-lg w-80 h-60" />
            <canvas ref={canvasRef} className="mt-4 w-80 h-60 absolute top-0 left-0" />
            <div className="mt-4 text-xl font-semibold">Head: {head}, Shoulders: {shoulders}, Posture: {posture}</div>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={setGoodPosture}>Set Good Posture</button>
        </div>
    );
};

export default CameraFeed;