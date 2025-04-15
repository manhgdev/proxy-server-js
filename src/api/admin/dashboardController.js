import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Proxy from '../../models/Proxy.js';
import Wallet from '../../models/Wallet.js';
import WalletTransaction from '../../models/WalletTransaction.js';
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
    
    // Lấy số lượng đơn hàng
    const orderCount = await Order.countDocuments();
    const completedOrderCount = await Order.countDocuments({ status: 'completed' });
    const pendingOrderCount = await Order.countDocuments({ status: 'pending' });
    
    // Lấy số lượng proxy
    const proxyCount = await Proxy.countDocuments();
    const activeProxyCount = await Proxy.countDocuments({ status: 'active' });
    
    // Lấy số lượng gói sản phẩm
    const packageCount = await ProductPackage.countDocuments();
    
    // Lấy doanh thu
    const totalRevenue = await WalletTransaction.aggregate([
      { $match: { type: 'order_payment', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const monthlyRevenue = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: 'order_payment', 
          status: 'completed',
          created_at: { $gte: new Date(new Date().setDate(1)) } // Từ đầu tháng hiện tại
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const weeklyRevenue = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: 'order_payment', 
          status: 'completed',
          created_at: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } // 7 ngày qua
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const dailyRevenue = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: 'order_payment', 
          status: 'completed',
          created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } // Hôm nay
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Lấy doanh thu theo ngày cho chart
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Format ngày
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Lấy doanh thu theo ngày
    const dailyRevenueByDate = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: 'order_payment',
          status: 'completed',
          created_at: { 
            $gte: firstDayOfMonth,
            $lte: now
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
    
    // Lấy dữ liệu cho biểu đồ
    const chartDays = 30;
    const chartData = [];
    
    // Lấy dữ liệu doanh thu theo ngày trong 30 ngày gần nhất
    for (let i = chartDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);
      
      // Tìm dữ liệu doanh thu cho ngày này
      const dayRevenue = dailyRevenueByDate.find(item => item._id === dateString);
      
      chartData.push({
        date: dateString,
        revenue: dayRevenue ? dayRevenue.total : 0
      });
    }
    
    // Trả về dữ liệu
    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: userCount,
          active: activeUserCount,
          resellers: resellerCount,
          customers: customerCount
        },
        orders: {
          total: orderCount,
          completed: completedOrderCount,
          pending: pendingOrderCount
        },
        proxies: {
          total: proxyCount,
          active: activeProxyCount
        },
        packages: packageCount,
        revenue: {
          total: totalRevenue.length ? totalRevenue[0].total : 0,
          monthly: monthlyRevenue.length ? monthlyRevenue[0].total : 0,
          weekly: weeklyRevenue.length ? weeklyRevenue[0].total : 0,
          daily: dailyRevenue.length ? dailyRevenue[0].total : 0
        },
        chart: {
          revenue: chartData
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    next(error);
  }
};

/**
 * Lấy thông tin chi tiết doanh thu
 * @route GET /api/v1/admin/dashboard/revenue
 * @access Admin
 */
export const getDashboardRevenue = async (req, res, next) => {
  try {
    // Xử lý logic lấy thông tin chi tiết doanh thu
  } catch (error) {
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
    const dailyRevenueByDate = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: 'order_payment',
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
      const dayRevenue = dailyRevenueByDate.find(item => item._id === dateString);
      
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