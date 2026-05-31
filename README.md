# DevCircle

DevCircle is a full-stack developer community platform built with React, Node.js, Express, MongoDB, and Socket.IO. It combines social posting, Q&A, real-time messaging, user profiles, search, and AI-powered tools in one place.

## Features

- User authentication with JWT
- Create, edit, delete, like, and repost posts
- Add comments on posts
- Ask questions and post answers
- Tag-based question filtering
- Popular tags section
- User profiles and profile editing
- Follow and unfollow users
- Search for users, posts, and questions
- Real-time chat with Socket.IO
- Online user presence tracking
- AI helpers for improving posts, improving questions, generating tags, detecting vague questions, and suggesting answers
- Image upload support for posts and avatars

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Multer, Helmet, CORS
- AI: OpenAI and Google Generative AI packages

## Architecture Choices

### 1. Client-Server Separation
The project is split into two parts:

- `backend`: REST API, authentication, database logic, Socket.IO, and AI routes
- `frontend/devcircle`: React application for UI and state management

This keeps the codebase easier to scale and maintain.

### 2. MongoDB + Mongoose
MongoDB is used because the app has flexible data needs such as:

- posts
- questions
- answers
- comments
- messages
- followers
- notifications

Mongoose is used for schema validation and structured data modeling.

### 3. Redux Toolkit for State Management
Redux Toolkit manages shared app state like:

- auth state
- posts
- questions
- messages
- user data

### 4. Socket.IO for Real-Time Features
Socket.IO is used for:

- instant messaging
- online user tracking
- live message updates

### 5. AI Integration
AI features are handled in backend controllers and services so the frontend only sends requests and displays results.

### 6. Counter-Based Post Numbering
Posts use a separate counter collection to generate a readable `postNumber` in addition to MongoDB `_id`. This allows routes to work with either a MongoDB ID or a human-friendly post number.

## Project Structure

```bash
DevCircle/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── validations/
│   └── server.js
└── frontend/
    └── devcircle/
        ├── src/
        │   ├── api/
        │   ├── app/
        │   ├── assets/
        │   ├── components/
        │   ├── features/
        │   ├── pages/
        │   └── services/
        └── package.json
```

## How to Run the Project

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd DevCircle
```

### 2. Start the Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Now start the backend server:

```bash
npm run dev
```

The backend will run on:

```bash
http://localhost:5000
```

### 3. Start the Frontend

Open another terminal and run:

```bash
cd frontend/devcircle
npm install
```

If needed, create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Now start the frontend app:

```bash
npm run dev
```

The frontend will run on:

```bash
http://localhost:5173
```

### 4. Open the App

After both servers are running, open this in your browser:

```bash
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Pages

- Login
- Register
- Home / Feed
- Explore
- Post Details
- Questions
- Question Details
- Ask Question
- Profile
- Edit Profile
- Search
- Messages

## API Overview

### Authentication

- Register user
- Login user
- Get current user

### Posts

- Create post
- Get feed
- Get explore posts
- Get post by ID or post number
- Like / unlike post
- Repost post
- Add / get comments
- Delete post

### Questions

- Create question
- Get all questions
- Get question by ID
- Update / delete question
- Vote on question
- Get popular tags
- Add answers

### Users

- Get user profile
- Update profile
- Upload avatar
- Get followers
- Get following

### Messages

- Get conversations
- Get chat messages
- Send messages in real time

### AI

- Improve post
- Improve question
- Generate tags
- Detect vague questions
- Suggest answer

## Sample API Calls

> Replace `<your_token>` with a valid JWT token after login.

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register 
  -H "Content-Type: application/json" 
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "12345678"
  }'
```

### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login 
  -H "Content-Type: application/json" 
  -d '{
    "email": "john@example.com",
    "password": "12345678"
  }'
```

### 3. Get Current Logged-in User

```bash
curl http://localhost:5000/api/auth/me 
  -H "Authorization: Bearer <your_token>"
```

### 4. Create a Post

```bash
curl -X POST http://localhost:5000/api/posts 
  -H "Authorization: Bearer <your_token>" 
  -F "content=Hello DevCircle, this is my first post!" 
  -F "tags=[\"react\",\"node\",\"mongodb\"]"
```

### 5. Create a Post With Image

```bash
curl -X POST http://localhost:5000/api/posts 
  -H "Authorization: Bearer <your_token>" 
  -F "content=Posting with an image" 
  -F "tags=[\"frontend\",\"ui\"]" 
  -F "image=@/path/to/image.jpg"
```

### 6. Get Feed Posts

```bash
curl http://localhost:5000/api/posts 
  -H "Authorization: Bearer <your_token>"
```

### 7. Get Explore Posts

```bash
curl http://localhost:5000/api/posts/explore
```

### 8. Get Single Post

You can use either MongoDB `_id` or `postNumber`.

```bash
curl http://localhost:5000/api/posts/41
```

Or:

```bash
curl http://localhost:5000/api/posts/665f1a2b3c4d5e6f7a8b9c0d
```

### 9. Like a Post

```bash
curl -X POST http://localhost:5000/api/posts/41/like 
  -H "Authorization: Bearer <your_token>"
```

### 10. Unlike a Post

```bash
curl -X DELETE http://localhost:5000/api/posts/41/like 
  -H "Authorization: Bearer <your_token>"
```

### 11. Repost a Post

```bash
curl -X POST http://localhost:5000/api/posts/41/repost 
  -H "Authorization: Bearer <your_token>"
```

### 12. Get Comments for a Post

```bash
curl http://localhost:5000/api/posts/41/comments
```

### 13. Add Comment to a Post

```bash
curl -X POST http://localhost:5000/api/posts/41/comments 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "content": "Nice post!"
  }'
```

### 14. Delete a Comment

```bash
curl -X DELETE http://localhost:5000/api/comments/COMMENT_ID 
  -H "Authorization: Bearer <your_token>"
```

### 15. Create a Question

```bash
curl -X POST http://localhost:5000/api/questions 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "title": "How do I manage state in React?",
    "body": "I am confused between useState and Redux. When should I use each?",
    "tags": ["react", "redux", "state"]
  }'
```

### 16. Get All Questions

```bash
curl http://localhost:5000/api/questions
```

### 17. Get Popular Tags

```bash
curl http://localhost:5000/api/questions/tags
```

### 18. Get a Single Question

```bash
curl http://localhost:5000/api/questions/QUESTION_ID
```

### 19. Vote on a Question

```bash
curl -X POST http://localhost:5000/api/questions/QUESTION_ID/vote 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "value": 1
  }'
```

### 20. Add an Answer to a Question

```bash
curl -X POST http://localhost:5000/api/questions/QUESTION_ID/answers 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "content": "You can start with useState for local state and move to Redux for shared global state."
  }'
```

### 21. Get Answers for a Question

```bash
curl http://localhost:5000/api/questions/QUESTION_ID/answers
```

### 22. Update Profile

```bash
curl -X PUT http://localhost:5000/api/users/profile 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "name": "John Doe",
    "bio": "Frontend developer",
    "location": "India"
  }'
```

### 23. Upload Avatar

```bash
curl -X POST http://localhost:5000/api/users/avatar 
  -H "Authorization: Bearer <your_token>" 
  -F "avatar=@/path/to/avatar.png"
```

### 24. Get User Profile

```bash
curl http://localhost:5000/api/users/john
```

### 25. Get Followers

```bash
curl http://localhost:5000/api/users/USER_ID/followers
```

### 26. Get Following

```bash
curl http://localhost:5000/api/users/USER_ID/following
```

### 27. Get Conversations

```bash
curl http://localhost:5000/api/messages/conversations 
  -H "Authorization: Bearer <your_token>"
```

### 28. Get Messages With a User

```bash
curl http://localhost:5000/api/messages/USER_ID 
  -H "Authorization: Bearer <your_token>"
```

### 29. Send a Message

```bash
curl -X POST http://localhost:5000/api/messages/USER_ID 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "content": "Hey, how are you?"
  }'
```

### 30. AI Improve Post

```bash
curl -X POST http://localhost:5000/api/ai/improve-post 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "content": "i want to learn react hooks but i am confused"
  }'
```

### 31. AI Improve Question

```bash
curl -X POST http://localhost:5000/api/ai/improve-question 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "title": "How to learn react?",
    "body": "I am a beginner and want to learn react properly."
  }'
```

### 32. AI Generate Tags

```bash
curl -X POST http://localhost:5000/api/ai/generate-tags 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "content": "How do I build a responsive dashboard in React with charts and authentication?"
  }'
```

### 33. AI Detect Vague Question

```bash
curl -X POST http://localhost:5000/api/ai/detect-vague 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json" 
  -d '{
    "title": "Need help",
    "body": "My code is not working. What should I do?"
  }'
```

### 34. AI Suggest Answer

```bash
curl -X POST http://localhost:5000/api/ai/suggest-answer 
  -H "Authorization: Bearer <your_token>" 
  -H "Content-Type: application/json"
  -d '{
    "title": "How do I protect routes in React?",
    "body": "I want to redirect unauthenticated users to login."
  }'
```

## Notes

- MongoDB is required for the backend.
- Socket.IO is used for real-time messaging and online user tracking.
- Uploaded images are served from the backend `/uploads` folder.
- Some AI features require valid API keys in the backend `.env` file.



