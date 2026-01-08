// CORS Configuration
// Separate concern for handling Cross-Origin Resource Sharing

const cors = require('cors');

// Development: Allow all origins
const corsOptions = {
  origin: '*', // Allow all origins for now
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// TODO: Production configuration (commented for later implementation)
// const corsOptions = {
//   origin: [
//     'http://localhost:5173',      // Local development
//     'http://localhost:3000',       // Backend dev
//     // 'https://yourdomain.com'    // Production domain
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// Export the middleware
module.exports = cors(corsOptions);
