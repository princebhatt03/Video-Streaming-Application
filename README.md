## 🎥 Live Stream Web App

A real-time live streaming application built with React, Socket.IO, and WebRTC (SimplePeer). It allows an admin to broadcast a live video to multiple viewers, who can watch the stream in real-time through their browser. The admin can also record the stream automatically.

## 🚀 Features

Admin Dashboard: Start/stop live streams, preview camera feed, and broadcast to viewers.

Real-Time Viewer: Watch live streams with low latency via WebRTC.

Recording: Automatic video recording on the admin side.

Multiple Viewers Support: Many viewers can watch a single live stream simultaneously.

Notifications: Toast notifications for stream events like start/end or errors.

WebRTC Powered: Peer-to-peer streaming using simple-peer.

## 🛠 Tech Stack
| Frontend        | Backend           | Streaming           | Database                               |
| --------------- | ----------------- | ------------------- | -------------------------------------- |
| React (Vite)    | Node.js + Express | SimplePeer (WebRTC) | Optional (MongoDB for storing streams) |
| react-hot-toast | Socket.IO         | MediaRecorder API   | Optional                               |

Other Tools: Axios, TailwindCSS (optional for styling)

## 📦 Installation

Backend
# Clone repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Run server
node server.js
Server runs on: http://localhost:3000

Frontend (React)
cd frontend
npm install
npm run dev
Frontend runs on: http://localhost:5173

## ⚙️ Environment Variables

Create a .env file in the frontend and backend (if needed).

Frontend (.env)
VITE_API_URL=http://localhost:3000

Backend (.env)
PORT=3000


Ensure CORS allows http://localhost:5173 for Socket.IO connections.

🎬 How to Use
Admin

Go to http://localhost:5173/admin.

Enter a Stream ID (unique identifier for this live session).

Click Start Live.

Admin’s camera and microphone start broadcasting.

Recording starts automatically.

Click End Live to stop stream and save recording.

Viewer

Open the URL http://localhost:5173/live/<streamId> where <streamId> matches the admin stream ID.

Wait for the admin to start the stream.

Once started, the video will play automatically in real-time.

If the admin ends the stream, the viewer is notified.

🔌 WebRTC & Socket.IO Flow
sequenceDiagram
    Admin->>Socket.IO Server: Join stream
    Server-->>All Viewers: admin:started (streamId)
    Viewer->>Server: viewer:join (streamId)
    Server-->>Admin: viewer:joined (viewerId)
    Admin->>Viewer: signal:admin-to-viewer
    Viewer->>Admin: signal:viewer-to-admin
    Admin->>Viewer: Real-time media stream

🧩 Project Structure
/backend
  └─ server.js
/frontend
  ├─ src
  │  ├─ AdminDashboard.jsx
  │  ├─ LiveWatch.jsx
  │  └─ main.jsx


AdminDashboard.jsx – Start/Stop stream, handle viewers, record stream.

LiveWatch.jsx – Join live stream, receive video via WebRTC.

server.js – Node.js backend with Socket.IO for signaling and viewer/admin communication.

⚠️ Known Issues & Tips

Autoplay may be blocked in some browsers; ensure muted preview for admin.

Use the same Stream ID for admin and viewers to connect.

Ensure backend is running before frontend to avoid connection refused errors.

WebRTC works best in modern browsers like Chrome, Edge, Firefox.

📌 Dependencies

Frontend

"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hot-toast": "^2.4.0",
  "simple-peer": "^9.11.1",
  "socket.io-client": "^4.7.0"
}


Backend

"dependencies": {
  "express": "^4.18.2",
  "socket.io": "^4.7.0",
  "cors": "^2.8.5"
}

🖼 Screenshots
Admin Dashboard

Viewer Live Screen

💡 Future Enhancements

Authentication for Admin & Viewers.

Multiple concurrent streams.

Chat system during live stream.

Save recordings to cloud storage.

Mobile-friendly responsive UI.

📄 License

MIT License © 2025
