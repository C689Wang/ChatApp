# Real-Time Chat Application

<img width="891" alt="Screenshot 2025-01-10 at 4 18 17 PM" src="https://github.com/user-attachments/assets/213be0c9-cdaa-4f8f-96d7-0600c912398b" />

<img width="1806" alt="Screenshot 2025-01-10 at 4 20 23 PM" src="https://github.com/user-attachments/assets/17cbeddb-ce06-4d34-aecf-45570dc75125" />


A full-stack real-time messaging application built with modern web technologies. This project implements core features of a messaging platform, including real-time message updates, conversation management, and user authentication.

## Features

- **Real-time Messaging**: Instant message delivery using GraphQL subscriptions
- **User Authentication**: Secure Google OAuth integration via NextAuth.js
- **Conversation Management**: Create conversations and chat with multiple users
- **Message Status**: Track message read/unread status
- **Real-time Updates**: Live updates for new messages and conversation changes
- **Responsive Design**: Clean UI built with Chakra UI

## Tech Stack

### Backend

- Node.js
- Express
- Apollo Server
- GraphQL
- Prisma (ORM)
- MongoDB
- WebSocket for real-time functionality
- TypeScript

### Frontend

- Next.js
- React
- Apollo Client
- GraphQL
- Chakra UI
- TypeScript
- NextAuth.js for authentication

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB instance
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies

Install backend dependencies

```
cd backend
npm install
```

Install frontend dependencies

```
cd frontend
npm install
```

3. Set up environment variables

4. Start the development servers

Start the backend server

```
cd backend
npm run dev
```

Start the frontend server

```
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Key Features Implementation

- **Real-time Communication**: Implemented using GraphQL subscriptions and WebSocket protocol for instant message delivery and conversation updates
- **Data Persistence**:
  - MongoDB database with Prisma ORM for type-safe database operations
  - GraphQL mutations for creating/updating conversations, sending messages, and managing user data
  - Optimistic updates in Apollo Client for smooth user experience
- **Authentication Flow**: Secure authentication using NextAuth.js with Google OAuth provider
- **State Management**: Apollo Client for global state management and caching
