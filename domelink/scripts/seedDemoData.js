// scripts/seedDemoData.js
// Run with: node scripts/seedDemoData.js

const mongoose = require('mongoose');
const { UserModel } = require('../backend/src/models/User.js');
const { NotificationModel } = require('../backend/src/models/Notification.js');
// Add other models as needed

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/domelink';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Demo users
  await UserModel.create([
    { name: 'Demo Homeowner', email: 'demo.homeowner@domelink.com', passwordHash: 'demo', role: 'homeowner' },
    { name: 'Demo Architect', email: 'demo.architect@domelink.com', passwordHash: 'demo', role: 'architect' },
  ]);

  // Demo notifications
  await NotificationModel.create([
    { user: 'demo.homeowner@domelink.com', message: 'Welcome to DomeLink!', read: false },
    { user: 'demo.architect@domelink.com', message: 'You have a new project inquiry.', read: false },
  ]);

  // Add demo data for reviews, payments, support, etc.

  console.log('Demo data seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
