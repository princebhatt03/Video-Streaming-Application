## 🎥 Live Stream Web App

A real-time live streaming application built with React, Socket.IO, and WebRTC (SimplePeer). It allows an admin to broadcast a live video to multiple viewers, who can watch the stream in real-time through their browser. The admin can also record the stream automatically.

## Live Netlify Link:

- **Website**: [Video Streaming Application Live](https://video-streaming-application-prince.netlify.app)

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

### Server
```
# Clone repository
git clone <repo-url>
cd Server
```

# Install dependencies
```
npm install
```

# Run server
```
node server.js
Server runs on: http://localhost:3000
```

### Client
```
cd Client
npm install
npm run dev
Frontend runs on: http://localhost:5173
```

### 🌐 Environment Variables Setup

### 🔒 Server: `Server/.env`
```env
DB_CONNECT=your_mongodb_connection_link
PORT=3000
FRONTEND_URL=your_frontend_url
SESSION_SECRET=your_session_secret
JWT_SECRET=supersecret_for_jwt
JWT_EXPIRES=7d
COOKIE_NAME=token
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
### 🎯 Client: `Client/.env`
```env
VITE_API_URL=your_backend_url
```

## 🎬 How to Use
### Admin

Go to http://localhost:5173/admin.

Enter a Stream ID (unique identifier for this live session).

Click Start Live.

Admin’s camera and microphone start broadcasting.

Recording starts automatically.

Click End Live to stop stream and save recording.

### Viewer

Open the URL http://localhost:5173/live/<streamId> where <streamId> matches the admin stream ID.

Wait for the admin to start the stream.

Once started, the video will play automatically in real-time.

If the admin ends the stream, the viewer is notified.
```
🔌 WebRTC & Socket.IO Flow
sequenceDiagram
    Admin->>Socket.IO Server: Join stream
    Server-->>All Viewers: admin:started (streamId)
    Viewer->>Server: viewer:join (streamId)
    Server-->>Admin: viewer:joined (viewerId)
    Admin->>Viewer: signal:admin-to-viewer
    Viewer->>Admin: signal:viewer-to-admin
    Admin->>Viewer: Real-time media stream
```
AdminDashboard.jsx – Start/Stop stream, handle viewers, record stream.

LiveWatch.jsx – Join live stream, receive video via WebRTC.

server.js – Node.js backend with Socket.IO for signaling and viewer/admin communication.

⚠️ Known Issues & Tips

Autoplay may be blocked in some browsers; ensure muted preview for admin.

Use the same Stream ID for admin and viewers to connect.

Ensure backend is running before frontend to avoid connection refused errors.

WebRTC works best in modern browsers like Chrome, Edge, Firefox.

## 📌 Dependencies

### Client
```
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hot-toast": "^2.4.0",
  "simple-peer": "^9.11.1",
  "socket.io-client": "^4.7.0"
}
```

### Server
```
"dependencies": {
  "express": "^4.18.2",
  "socket.io": "^4.7.0",
  "cors": "^2.8.5"
}
```
## 🖼 Screenshots

<img width="1366" height="724" alt="s1" src="https://github.com/user-attachments/assets/f921583d-e7ec-4a8e-b576-ab33740de5c8" />

## 👨‍💻 Developer

Prince Bhatt

📧 Email: princebhatt316@gmail.com

🌐 Portfolio: [Prince Bhatt](https://princebhatt03.github.io/Portfolio)

💼 GitHub: [princebhatt03](https://github.com/princebhatt03)

💬 LinkedIn: [Prince Bhatt](https://www.linkedin.com/in/prince-bhatt-0958a725a/)

📄 License
This Website is Created as Task for Job application by Prince Bhatt
