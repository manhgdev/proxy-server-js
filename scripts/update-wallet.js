import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

const updateWallet = async () => {
  try {
    const db = await connectDB();
    
    // Tìm user với username 'testuser'
    const user = await db.collection('users').findOne({ username: 'testuser' });
    
    if (!user) {
      console.error('User testuser not found');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} with ID: ${user._id}`);
    
    // Tìm wallet của user
    const wallet = await db.collection('wallets').findOne({ user_id: user._id });
    
    if (!wallet) {
      console.error('Wallet not found for this user');
      process.exit(1);
    }
    
    console.log(`Found wallet with ID: ${wallet._id}`);
    console.log(`Current balance: ${wallet.balance}`);
    
    // Cập nhật số dư
    const result = await db.collection('wallets').updateOne(
      { _id: wallet._id },
      { 
        $set: { 
          balance: 1000000,
          updated_at: new Date()
        }
      }
    );
    
    console.log(`Wallet updated: ${result.modifiedCount} document(s) modified`);
    
    // Lấy thông tin wallet đã cập nhật
    const updatedWallet = await db.collection('wallets').findOne({ _id: wallet._id });
    console.log(`New balance: ${updatedWallet.balance}`);
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateWallet(); 