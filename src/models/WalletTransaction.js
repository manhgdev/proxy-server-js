import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'purchase', 'refund', 'commission', 'topup', 'bonus', 'adjustment'],
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance_before: {
    type: Number,
    required: true
  },
  balance_after: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'VND']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  bonus_amount: {
    type: Number,
    default: 0
  },
  metadata: {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    related_transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
      default: null
    },
    payment_method: {
      type: String,
      default: null
    },
    payment_details: {
      type: Object,
      default: null
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: null
    }
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Indexes for faster querying
walletTransactionSchema.index({ wallet_id: 1, created_at: -1 });
walletTransactionSchema.index({ user_id: 1, created_at: -1 });
walletTransactionSchema.index({ type: 1, created_at: -1 });
walletTransactionSchema.index({ status: 1, created_at: -1 });
walletTransactionSchema.index({ 'metadata.order_id': 1 }, { sparse: true });

// Update timestamps before saving
walletTransactionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static method to create a transaction with wallet update
walletTransactionSchema.statics.createTransaction = async function(transactionData, session = null) {
  const Wallet = mongoose.model('Wallet');
  
  // Find the wallet
  const wallet = await Wallet.findById(transactionData.wallet_id).session(session);
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  
  // Set balance before
  transactionData.balance_before = wallet.balance;
  
  // Calculate balance after based on transaction type
  let balanceChange = 0;
  
  switch (transactionData.type) {
    case 'deposit':
    case 'refund':
    case 'commission':
    case 'bonus':
      balanceChange = transactionData.amount;
      wallet.balance += balanceChange;
      if (transactionData.type === 'deposit') {
        wallet.last_deposit_at = Date.now();
        wallet.total_deposit += transactionData.amount;
      }
      break;
    case 'withdrawal':
    case 'purchase':
      balanceChange = -transactionData.amount;
      if (wallet.balance < transactionData.amount) {
        throw new Error('Insufficient balance for the transaction');
      }
      wallet.balance += balanceChange;
      if (transactionData.type === 'purchase') {
        wallet.total_spending += transactionData.amount;
      }
      break;
    case 'adjustment':
      balanceChange = transactionData.amount; // Can be positive or negative
      wallet.balance += balanceChange;
      break;
    default:
      throw new Error('Invalid transaction type');
  }
  
  // Set balance after
  transactionData.balance_after = wallet.balance;
  
  // Create transaction
  const transaction = new this(transactionData);
  
  // If no session, save directly
  if (!session) {
    await wallet.save();
    await transaction.save();
  } else {
    // If session provided, add to session but don't save yet (caller will commit)
    wallet.$session(session);
    transaction.$session(session);
    await wallet.save();
    await transaction.save();
  }
  
  return transaction;
};

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema, 'walletTransactions');

export default WalletTransaction; 