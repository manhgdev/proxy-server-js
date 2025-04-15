import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Role from '../src/models/Role.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Seed roles
const seedRoles = async () => {
  try {
    // Clear existing roles
    await Role.deleteMany({});
    
    // Create roles
    const roles = [
      {
        name: 'admin',
        description: 'Administrator with full access',
        level: 0,
        is_admin: true,
        is_reseller: false
      },
      {
        name: 'manager',
        description: 'Manager with limited admin access',
        level: 1,
        is_admin: false,
        is_reseller: false
      },
      {
        name: 'reseller',
        description: 'Reseller with ability to sell proxies',
        level: 2,
        is_admin: false,
        is_reseller: true
      },
      {
        name: 'customer',
        description: 'Regular customer',
        level: 3,
        is_admin: false,
        is_reseller: false
      }
    ];
    
    await Role.insertMany(roles);
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error(`Error seeding roles: ${error.message}`);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: process.env.ADMIN_DEFAULT_USERNAME });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      username: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
      password_hash: process.env.ADMIN_DEFAULT_PASSWORD || 'admin_initial_password',
      email: 'admin@example.com',
      fullname: 'System Administrator',
      user_level: 0, // Admin level
      active: true,
      api_key: 'uk_' + Math.random().toString(36).substring(2, 15)
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
  }
};

// Main function to run seeding
const seedData = async () => {
  try {
    await connectDB();
    await seedRoles();
    await seedAdmin();
    
    console.log('Data seeding completed');
    process.exit(0);
  } catch (error) {
    console.error(`Error in seed process: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 