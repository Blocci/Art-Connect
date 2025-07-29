const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const connectDB = require('./db');
const cleanupUploads = require('./utils/cleanup');
require('dotenv').config();

const app = express();

// Debug logs
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

// SSL cert paths
const keyPath = path.join(__dirname, 'cert', 'key.pem');
const certPath = path.join(__dirname, 'cert', 'cert.pem');
console.log('key exists?', fs.existsSync(keyPath));
console.log('cert exists?', fs.existsSync(certPath));

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// CORS config
app.use(cors({
  origin: (origin, callback) => {
  const allowedOrigins = ['http://localhost:3000', 'https://localhost:3000', 'https://localhost:3001'];
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

// Mount API routes
app.use('/api', require('./routes/auth')); // 🔁 Rename if needed

// Scheduled cleanup job
cron.schedule('0 0 * * *', () => {
  console.log('🧹 Running scheduled uploads cleanup...');
  cleanupUploads();
});

// Start HTTPS server
const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const PORT = 3001;
https.createServer(sslOptions, app).listen(PORT, () =>
  console.log(`🔐 HTTPS server running at https://localhost:${PORT}`)
);