import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import followRoutes from './routes/followRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import messageRoutes from './routes/messageRoutes.js';


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

 const server = http.createServer(app);

const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');

//socket.io setup for real time messaging

const io = new Server(server,{
    cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
  },
});


//track online users: userId->socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);


    //user comes online

    socket.on('user_online', (userId) => {
        onlineUsers.set(userId, socket.id);

        io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // send message to a specific user

    socket.on('send_message', (data) => {
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', data);
        }
    });

    //user offline

    socket.on('disconnect', () => {
        onlineUsers.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
            }
        });
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log('Socket disconnected:', socket.id);
    });

});

app.use(
    helmet({    
        crossOriginResourcePolicy: {policy:'cross-origin'},
    })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (normalizedOrigin === clientUrl) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DevCircle API is running' });
});

// global error handler

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
