# TechTalk

TechTalk is a modern web application designed for developer and tech communities to collaborate, discuss ideas, and share knowledge. Built with a Go backend and a React/Vite frontend, it offers a blend of forum-style discussions and real-time chat features.

## Features

- **Forum & Threads**: Create and participate in topic-based threads.
- **Real-Time Chatrooms**: Engage in real-time conversations using WebSockets.
- **Custom Emojis & Reactions**: Express yourself with custom emojis and react to posts.
- **User Profiles**: Discord-style user profiles with avatars, bios, and names.
- **Secure Authentication**: JWT-based authentication with secure HTTP-only refresh tokens.
- **Modern UI**: Built with React, TailwindCSS, and Radix UI components.

## Tech Stack

- **Backend**: Go, Gin Framework, GORM, PostgreSQL, WebSockets
- **Frontend**: React (v19), Vite, TypeScript, TailwindCSS (v4), Zustand, Radix UI

## Getting Started

### Prerequisites

- [Go](https://golang.org/) (1.20+)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/techtalk.git
   cd techtalk
   ```

2. **Configure Environment Variables:**
   Copy the example environment file and update it with your database credentials.
   ```bash
   cp .env.example .env
   ```

3. **Install Go Dependencies:**
   ```bash
   go mod download
   ```

4. **Run the Server:**
   ```bash
   go run cmd/server/main.go
   ```
   The backend server will start on `http://localhost:5070`.

### Frontend Setup

1. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Environment Variables

Check `.env.example` for the required environment variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: PostgreSQL connection details.
- `PORT`: The port for the Go server (default: 5070).
- `JWT_SECRET`: Secret key for signing JWT tokens.

## License
MIT