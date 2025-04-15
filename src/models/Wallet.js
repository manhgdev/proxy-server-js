import mongoose from 'mongoose';
import WalletTransaction from './WalletTransaction.js';

const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'VND']
  },
  locked_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_deposit_at: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  total_deposit: {
    type: Number,
    default: 0
  },
  total_spending: {
    type: Number,
    default: 0
  }
}, { versionKey: false });

// Index for query optimization
walletSchema.index({ user_id: 1 }, { unique: true });
walletSchema.index({ updated_at: -1 });

// Update timestamps before saving
walletSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static method to find or create a wallet for a user
walletSchema.statics.findOrCreate = async function(userId) {
  let wallet = await this.findOne({ user_id: userId });
  
  if (!wallet) {
    wallet = new this({
      user_id: userId,
      balance: 0,
      currency: 'USD',
      locked_amount: 0,
      is_active: true
    });
    
    await wallet.save();
  }
  
  return wallet;
};

// Method to deposit amount
walletSchema.methods.deposit = async function(amount) {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }
  
  this.balance += amount;
  this.total_deposit += amount;
  this.last_deposit_at = Date.now();
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to withdraw amount
walletSchema.methods.withdraw = async function(amount) {
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be greater than zero');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  this.balance -= amount;
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to deduct amount and create transaction (used for orders)
walletSchema.methods.deduct = async function(amount, description, metadata = {}, session = null) {
  if (amount <= 0) {
    throw new Error('Deduct amount must be greater than zero');
  }
  
  // Đảm bảo amount là số
  amount = Number(amount);
  
  if (isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  // Đảm bảo các giá trị là số
  const balanceBefore = Number(this.balance);
  this.balance = Number(this.balance) - amount;
  
  // Đảm bảo total_spending là số
  if (isNaN(this.total_spending)) {
    this.total_spending = 0;
  }
  this.total_spending = Number(this.total_spending) + amount;
  
  this.updated_at = Date.now();
  
  const options = session ? { session } : {};
  await this.save(options);
  
  // Create a wallet transaction record
  const transaction = new WalletTransaction({
    wallet_id: this._id,
    user_id: this.user_id,
    type: 'purchase',  // Thay đổi từ 'payment' thành 'purchase' để phù hợp với enum
    amount: amount,
    balance_before: balanceBefore,
    balance_after: this.balance,
    currency: this.currency,
    status: 'completed',
    description: description,
    metadata: metadata,
    created_at: Date.now(),
    updated_at: Date.now()
  });
  
  await transaction.save(options);
  return transaction;
};

// Method to lock amount for pending transactions
walletSchema.methods.lockAmount = async function(amount) {
  if (amount <= 0) {
    throw new Error('Lock amount must be greater than zero');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient funds to lock');
  }
  
  this.balance -= amount;
  this.locked_amount += amount;
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to unlock amount and either return to balance or finalize transaction
walletSchema.methods.unlockAmount = async function(amount, returnToBalance = true) {
  if (amount <= 0) {
    throw new Error('Unlock amount must be greater than zero');
  }
  
  if (this.locked_amount < amount) {
    throw new Error('Locked amount is less than requested unlock amount');
  }
  
  this.locked_amount -= amount;
  
  if (returnToBalance) {
    this.balance += amount;
  } else {
    this.total_spending += amount;
  }
  
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

const Wallet = mongoose.model('Wallet', walletSchema, 'wallets');

export default Wallet; 