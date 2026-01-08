// server.js
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const User = require('./models/user');
const OWNER = require('./config/owner');

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- PROPER OWNER SEEDING AFTER DB CONNECTION ---
const seedOwner = async () => {
  try {
    const existingOwner = await User.findOne({ role: OWNER.role });
    if (!existingOwner) {
      const ownerUser = new User(OWNER);
      await ownerUser.save();
      console.log('Static OWNER created');
    } else {
      console.log('Static OWNER already exists');
    }
  } catch (err) {
    console.error('Error while seeding owner:', err.message);
  }
};

// --- CONNECT TO DB THEN START SERVER ---
const startServer = async () => {
  await connectDB();     // ensure DB is ready
  await seedOwner();     // seed owner once DB is definitely connected

  // --- ROUTES ---
  app.use('/api/auth', authRoutes); // login route
  app.use('/api/users', userRoutes);  // user CRUD routes
  app.use('/api/sessions', sessionRoutes); // session code / presence


  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

startServer();
