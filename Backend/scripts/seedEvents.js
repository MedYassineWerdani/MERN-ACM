/**
 * Seed Events Database Script
 * 
 * This script populates the database with sample events for testing all 13 event endpoints.
 * 
 * Usage:
 *   node Backend/scripts/seedEvents.js
 * 
 * This will create:
 * - 2 in-house events
 * - 1 online event
 * - Registrations and discussions for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/event');
const User = require('../models/user');
const connectDB = require('../config/db');

const seedEvents = async () => {
  try {
    await connectDB();
    console.log('📊 Connected to MongoDB');

    // Get existing users for sample data
    const owner = await User.findOne({ role: 'owner' });
    const office = await User.findOne({ role: 'office' });
    const manager = await User.findOne({ role: 'manager' });
    const members = await User.find({ role: 'member' }).limit(5);

    if (!owner) {
      console.error('❌ Owner user not found. Run the server first to seed owner.');
      process.exit(1);
    }

    // Create office user if doesn't exist
    let officeUser = office;
    if (!office) {
      console.log('📝 Creating office user...');
      const officeDoc = new User({
        fullName: 'Jane Office',
        handle: 'psycholops99',
        email: 'jane@office.com',
        password: 'password123',
        role: 'office'
      });
      officeUser = await officeDoc.save();
      console.log('✅ Office user created');
    }

    // Create manager user if doesn't exist
    let managerUser = manager;
    if (!manager) {
      console.log('📝 Creating manager user...');
      const managerDoc = new User({
        fullName: 'Mike Manager',
        handle: 'tourist',
        email: 'mike@manager.com',
        password: 'password123',
        role: 'manager'
      });
      managerUser = await managerDoc.save();
      console.log('✅ Manager user created');
    }

    // Create member users if needed
    let membersList = members;
    if (members.length === 0) {
      console.log('📝 Creating member users...');
      const memberData = [
        { fullName: 'Alice Member', handle: 'ksun48', email: 'alice@member.com' },
        { fullName: 'Bob Member', handle: 'Um_nik', email: 'bob@member.com' },
        { fullName: 'Carol Member', handle: 'Radewoosh', email: 'carol@member.com' },
        { fullName: 'David Member', handle: 'Benq', email: 'david@member.com' },
        { fullName: 'Eve Member', handle: 'dotdotdot', email: 'eve@member.com' }
      ];
      
      membersList = [];
      for (const data of memberData) {
        const member = new User({
          ...data,
          password: 'password123',
          role: 'member'
        });
        const saved = await member.save();
        membersList.push(saved);
      }
      console.log(`✅ Created ${membersList.length} member users`);
    } else {
      membersList = members;
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // Sample events data
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const threeWeeksLater = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        name: 'February Coding Contest',
        description: 'In-house monthly competitive programming contest. Solve 5-7 problems in 2 hours.',
        startDate: oneWeekLater,
        endDate: new Date(oneWeekLater.getTime() + 2 * 60 * 60 * 1000),
        location: 'Computer Lab A, Building 5',
        type: 'in-house',
        maxParticipants: 50,
        fees: 0,
        createdBy: owner._id,
        status: 'upcoming',
        registeredUsers: [members[0]._id, members[1]._id],
        paidUsers: [],
        discussions: [
          {
            author: members[0]._id,
            content: 'What topics will be covered in this contest?',
            isPinned: false,
            upvotes: [members[1]._id],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            author: members[1]._id,
            content: 'Do we need to bring laptops or will systems be provided?',
            isPinned: true,
            upvotes: [members[0]._id, members[2]._id],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      },
      {
        name: 'Bug Bounty Hunting Workshop',
        description: 'Learn web application security vulnerabilities and how to find them. Hands-on workshop with real-world examples.',
        startDate: twoWeeksLater,
        endDate: new Date(twoWeeksLater.getTime() + 3 * 60 * 60 * 1000),
        location: 'Auditorium, Building 3',
        type: 'in-house',
        maxParticipants: 100,
        fees: 0,
        createdBy: office._id,
        status: 'upcoming',
        registeredUsers: [members[2]._id],
        paidUsers: [],
        discussions: [
          {
            author: members[2]._id,
            content: 'Is there any prerequisite knowledge required?',
            isPinned: true,
            upvotes: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      },
      {
        name: 'Codeforces Global Round 25',
        description: 'Online competitive programming contest. Participate from anywhere in the world. Synchronized on Codeforces platform.',
        startDate: threeWeeksLater,
        endDate: new Date(threeWeeksLater.getTime() + 2 * 60 * 60 * 1000),
        location: null,
        type: 'online',
        maxParticipants: null,
        fees: 0,
        createdBy: manager._id,
        status: 'upcoming',
        registeredUsers: [members[3]._id, members[4]._id],
        paidUsers: [],
        discussions: [
          {
            author: members[3]._id,
            content: 'Will this be rated?',
            isPinned: false,
            upvotes: [members[4]._id],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ];

    // Insert events
    const insertedEvents = await Event.insertMany(eventsData);
    console.log(`✅ Created ${insertedEvents.length} sample events`);

    // Print created event IDs for reference
    console.log('\n📝 Created Events (save these IDs for testing):\n');
    insertedEvents.forEach((event, index) => {
      console.log(`Event ${index + 1}: ${event.name}`);
      console.log(`  ID: ${event._id}`);
      console.log(`  Type: ${event.type}`);
      console.log(`  Creator: ${event.createdBy}`);
      console.log(`  Registered: ${event.registeredUsers.length} users`);
      console.log(`  Discussions: ${event.discussions.length}`);
      console.log();
    });

    // Print user IDs for reference
    console.log('👤 User IDs (for cURL commands):\n');
    console.log(`Owner ID: ${owner._id}`);
    console.log(`Office ID: ${office._id}`);
    if (manager) console.log(`Manager ID: ${manager._id}`);
    console.log(`Member 1 ID: ${members[0]._id}`);
    console.log(`Member 2 ID: ${members[1]._id}`);
    console.log(`Member 3 ID: ${members[2]._id}`);
    if (members[3]) console.log(`Member 4 ID: ${members[3]._id}`);
    if (members[4]) console.log(`Member 5 ID: ${members[4]._id}`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 Start the server and use the commands in EVENTS_TESTING.md\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error.message);
    process.exit(1);
  }
};

seedEvents();
