import { body, param, query } from 'express-validator';

export const getUserWalletValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID format')
];

export const getTransactionsValidator = [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('type').optional().isString().isIn(['all', 'deposit', 'withdrawal', 'order_payment', 'commission']).withMessage('Invalid transaction type')
];

export const requestDepositValidator = [
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 10000 }).withMessage('Minimum deposit amount is 10,000'),
  body('payment_method').isString().isIn(['bank_transfer', 'credit_card', 'crypto']).withMessage('Invalid payment method')
];

export const requestWithdrawalValidator = [
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 50000 }).withMessage('Minimum withdrawal amount is 50,000'),
  body('payment_details').isObject().withMessage('Payment details must be an object'),
  body('payment_details.bank_name').optional().isString(),
  body('payment_details.account_number').optional().isString(),
  body('payment_details.account_name').optional().isString(),
  body('payment_details.wallet_address').optional().isString()
]; 