const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { startScheduler } = require('./services/schedulerService');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? [process.env.FRONTEND_URL] || `https://project-frontend-livid.vercel.app/`
//     : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Development frontend URLs (Vite)
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   maxAge: 86400 // 24 hours
// }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => { 
  console.log('MongoDB connected');
  // Start the task scheduler after successful database connection
  startScheduler();
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Todo API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
// Ensure PORT is a number, not a URL
const portNumber = parseInt(PORT) || 5000;
app.listen(portNumber, () => {
  console.log(`Server is running on port ${portNumber}`);
});
