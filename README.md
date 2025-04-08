# posture-check
Posture Check is an in-browser tool that help susers maintain healthy posture by constantly analyzing their sitting posture using camera input and user feedback. This tool is designed to be used by a stationary camera facing you directly. This is meant for more practical usage, typically a webcam facing you directly. It aims to promote physical well-being, something that can be forgotten after long hours at the desk. 

Here's the link: https://eddie-lu-posture-detection.vercel.app/

Please open in a browser that supports camera access and allow camera permissions when prompted.

## Privacy Note

All posture detection happens in your browser. No camera data is stored or transmitted.

---

It will watch for uneven shoulders, head tilt, and slouching. To enable the slouching, please use the button to set your ideal posture. It will later detect for any substantial deviance from this posture.

Currently, it is set to sound a beep alert whenever bad posture has been detected for 5 seconds straight. 

## 🛠️ Developer Info

**Built With**:
- React
- MediaPipe (for pose detection)
- Tailwind CSS
