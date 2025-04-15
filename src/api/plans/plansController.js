import UserPlan from '../../models/UserPlans.js';
import ProductPackage from '../../models/Package.js';
import Alert from '../../models/Alerts.js';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';

export const getUserPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan_type } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { user_id: req.user._id };
    
    if (status === 'active') {
      filter.active = true;
      filter.expired = false;
    } else if (status === 'expired') {
      filter.expired = true;
    }
    
    if (plan_type) {
      filter.plan_type = plan_type;
    }
    
    const plans = await UserPlan.find(filter)
      .populate('package_id', 'name description type price duration_days')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const count = await UserPlan.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        plans,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalItems: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user plans',
      error: error.message
    });
  }
};

export const getUserPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }
    
    const plan = await UserPlan.findOne({
      _id: id,
      user_id: req.user._id
    }).populate('package_id', 'name description type price duration_days');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving plan details',
      error: error.message
    });
  }
};

export const toggleAutoRenew = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }
    
    const plan = await UserPlan.findOne({
      _id: id,
      user_id: req.user._id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    plan.auto_renew = !plan.auto_renew;
    await plan.save();
    
    res.status(200).json({
      success: true,
      message: `Auto-renewal ${plan.auto_renew ? 'enabled' : 'disabled'} successfully`,
      data: {
        id: plan._id,
        auto_renew: plan.auto_renew
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling auto-renew setting',
      error: error.message
    });
  }
};

export const renewPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }
    
    const plan = await UserPlan.findOne({
      _id: id,
      user_id: req.user._id
    }).populate('package_id');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // Kiểm tra số dư
    const user = await User.findById(req.user._id);
    const renewalPrice = plan.renewal_price;
    
    if (user.balance < renewalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for renewal'
      });
    }
    
    // Trừ tiền
    user.balance -= renewalPrice;
    await user.save();
    
    // Tạo giao dịch
    await Transaction.create({
      user_id: user._id,
      amount: -renewalPrice,
      type: 'plan_renewal',
      description: `Renewal of ${plan.package_id.name} plan`,
      status: 'completed',
      reference_id: plan._id
    });
    
    // Gia hạn gói
    const packageDetails = await ProductPackage.findById(plan.package_id);
    await plan.renew(packageDetails.duration_days);
    
    res.status(200).json({
      success: true,
      message: 'Plan renewed successfully',
      data: {
        plan,
        newBalance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error renewing plan',
      error: error.message
    });
  }
}; 