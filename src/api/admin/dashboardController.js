import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Proxy from '../../models/Proxy.js';
import Wallet from '../../models/Wallet.js';
import Transaction from '../../models/Transaction.js';
import ProductPackage from '../../models/ProductPackage.js';

/**
 * Lấy thông tin tổng quan cho dashboard
 * @route GET /api/v1/admin/dashboard
 * @access Admin
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    // Lấy số lượng người dùng
    const userCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ active: true });
    
    // Lấy số lượng người dùng theo level
    const resellerCount = await User.countDocuments({ user_level: 2 });
    const customerCount = await User.countDocuments({ user_level: 3 });
    
    // Lấy số lượng proxy
    const proxyCount = await Proxy.countDocuments();
    const activeProxyCount = await Proxy.countDocuments({ status: 'active' });
    
    // Lấy số lượng đơn hàng
    const orderCount = await Order.countDocuments();
    const pendingOrderCount = await Order.countDocuments({ status: 'pending' });
    const completedOrderCount = await Order.countDocuments({ status: 'completed' });
    
    // Lấy số lượng gói dịch vụ
    const packageCount = await ProductPackage.countDocuments();
    
    // Tính tổng doanh thu
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Tính doanh thu trong tháng hiện tại
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = await Transaction.aggregate([
      { 
        $match: { 
          type: 'deposit',
          created_at: { $gte: firstDayOfMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Tính doanh thu trong 7 ngày gần nhất
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    
    const weeklyRevenue = await Transaction.aggregate([
      { 
        $match: { 
          type: 'deposit',
          created_at: { $gte: last7Days } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Trả về dữ liệu
    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: userCount,
          active: activeUserCount,
          resellers: resellerCount,
          customers: customerCount
        },
        proxies: {
          total: proxyCount,
          active: activeProxyCount
        },
        orders: {
          total: orderCount,
          pending: pendingOrderCount,
          completed: completedOrderCount
        },
        packages: packageCount,
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          weekly: weeklyRevenue.length > 0 ? weeklyRevenue[0].total : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    next(error);
  }
};

/**
 * Lấy biểu đồ doanh thu theo ngày trong tháng hiện tại
 * @route GET /api/v1/admin/dashboard/revenue-chart
 * @access Admin
 */
export const getRevenueChart = async (req, res, next) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Lấy doanh thu theo ngày
    const dailyRevenue = await Transaction.aggregate([
      { 
        $match: { 
          type: 'deposit',
          created_at: { 
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' } 
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tạo mảng các ngày trong tháng
    const daysInMonth = lastDayOfMonth.getDate();
    const chartData = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      
      // Tìm dữ liệu doanh thu cho ngày này
      const dayRevenue = dailyRevenue.find(item => item._id === dateString);
      
      chartData.push({
        date: dateString,
        revenue: dayRevenue ? dayRevenue.total : 0
      });
    }
    
    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    next(error);
  }
};

/**
 * Lấy thống kê về người dùng mới trong 30 ngày gần đây
 * @route GET /api/v1/admin/dashboard/new-users
 * @access Admin
 */
export const getNewUsersStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Lấy số lượng người dùng mới theo ngày
    const newUsers = await User.aggregate([
      { 
        $match: { 
          created_at: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tạo mảng dữ liệu cho 30 ngày
    const statsData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (29 - i));
      const dateString = date.toISOString().split('T')[0];
      
      // Tìm dữ liệu số người dùng mới cho ngày này
      const dayData = newUsers.find(item => item._id === dateString);
      
      statsData.push({
        date: dateString,
        count: dayData ? dayData.count : 0
      });
    }
    
    // Tính tổng số người dùng mới trong 30 ngày
    const totalNewUsers = statsData.reduce((sum, item) => sum + item.count, 0);
    
    return res.status(200).json({
      success: true,
      data: {
        total: totalNewUsers,
        daily: statsData
      }
    });
  } catch (error) {
    console.error('Error fetching new users stats:', error);
    next(error);
  }
}; 