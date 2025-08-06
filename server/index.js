const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./db');
const cleanupUploads = require('./utils/cleanup');
const path = require('path');
const userRoutes = require("./routes/userRoutes");
require('dotenv').config();

const app = express();

// Debug logs
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// CORS config
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:3001'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

//Serve static files — MUST be above app.listen
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Mount routes once
app.use("/api", userRoutes);

// Scheduled cleanup
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled uploads cleanup...');
  cleanupUploads();
});

// Home test route
app.get('/', (req, res) => {
  res.send('ArtConnect backend is running.');
});

//Start the server LAST
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});