require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');  
const app = express();

const OWNER = require('./config/owner');
const User = require('./models/user');

const seedOwner = async () => {
  const existingOwner = await User.findOne({ role: OWNER.role });
  if (!existingOwner) {
    const ownerUser = new User(OWNER);
    await ownerUser.save();
    console.log('Static OWNER created');
  }
};





const PORT = process.env.PORT ; 

app.use(express.json());

connectDB();
seedOwner();





app.listen(PORT, () => {console.log(`Server started on http://localhost:${PORT}`)});
