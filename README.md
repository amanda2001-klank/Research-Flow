Research-Flow
Research-Flow is a web application for students and academics to manage and organize research papers and notes. It supports user authentication and real-time collaboration, so multiple people can work together on the same research without conflicts or stale data.
The project is mostly complete and built entirely in JavaScript, with a Node.js/Express backend and a separate frontend communicating over HTTP and WebSockets.

Features

User authentication — Secure login and registration so each user has their own account and data.
Research management — Add, view, and organize research papers and notes in one place.
Real-time collaboration — Multiple users can work together simultaneously. Changes appear instantly for all connected users via Socket.io, no page refresh needed.

1. Clone the repo
bashgit clone https://github.com/amanda2001-klank/Research-Flow.git
cd Research-Flow
2. Install dependencies
bash# Root dependencies
npm install

# Backend dependencies
npm --prefix backend install

# Frontend dependencies
npm --prefix frontend install
3. Configure environment variables
Create a .env file inside the backend/ folder:
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
Check the backend source for any additional variables that may be required.
4. Run the app
Windows — starts both servers in separate terminal windows:
bashnpm run dev
macOS / Linux — run each in a separate terminal:
bashnpm run dev:backend
npm run dev:frontend
