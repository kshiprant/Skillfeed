import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import skillRoutes from './routes/skills.js';
import ideaRoutes from './routes/ideas.js';
import connectionRoutes from './routes/connections.js';
import messageRoutes from './routes/messages.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io event handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Track active users
  socket.on('user_online', (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit('user_status', { userId, status: 'online' });
  });

  // Handle incoming messages
  socket.on('send_message', (data) => {
    io.to(data.recipientSocketId).emit('receive_message', {
      senderId: data.senderId,
      message: data.message,
      timestamp: new Date(),
      conversationId: data.conversationId
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    io.to(data.recipientSocketId).emit('user_typing', {
      senderId: data.senderId,
      conversationId: data.conversationId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit('user_status', { userId, status: 'offline' });
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  Skillfeed Backend Server Started  ║
║  Port: ${PORT}                     ║
║  Environment: ${process.env.NODE_ENV || 'development'}  ║
╚════════════════════════════════════╝
  `);
});

export { io };
