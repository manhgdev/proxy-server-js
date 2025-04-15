import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

// Hàm tạo chuỗi ngẫu nhiên
const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length);
};

// Xóa hết dữ liệu cũ
const clearAllData = async (db) => {
  try {
    console.log('Removing existing data...');
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`Collection ${collection.name} cleared`);
    }
    
    console.log('All data cleared');
  } catch (error) {
    console.error(`Error clearing data: ${error.message}`);
  }
};

// Seed roles
const seedRoles = async (db) => {
  try {
    const roles = [
      {
        name: "Admin",
        description: "System administrator with full access",
        level: 0,
        is_admin: true,
        is_reseller: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Manager",
        description: "System manager with limited administrative access",
        level: 1,
        is_admin: true,
        is_reseller: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Reseller",
        description: "Can sell proxies and manage customers",
        level: 2,
        is_admin: false,
        is_reseller: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Customer",
        description: "Regular end user",
        level: 3,
        is_admin: false,
        is_reseller: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const result = await db.collection('roles').insertMany(roles);
    console.log(`Roles seeded successfully: ${result.insertedCount}`);
    return result.insertedIds;
  } catch (error) {
    console.error(`Error seeding roles: ${error.message}`);
  }
};

// Seed permissions
const seedPermissions = async (db) => {
  try {
    const permissions = [
      {
        name: "Manage Users",
        code: "manage_users",
        description: "Create, edit, view users",
        group: "user",
        created_at: new Date()
      },
      {
        name: "View Users",
        code: "view_users",
        description: "View users only",
        group: "user",
        created_at: new Date()
      },
      {
        name: "Manage Proxies",
        code: "manage_proxies",
        description: "Add, edit, delete proxies",
        group: "proxy",
        created_at: new Date()
      },
      {
        name: "View Proxies",
        code: "view_proxies",
        description: "View proxy details",
        group: "proxy",
        created_at: new Date()
      },
      {
        name: "Manage Finances",
        code: "manage_finances",
        description: "Manage financial transactions",
        group: "finance",
        created_at: new Date()
      },
      {
        name: "Approve Withdrawals",
        code: "approve_withdrawals",
        description: "Approve withdrawal requests",
        group: "finance",
        created_at: new Date()
      },
      {
        name: "Manage Orders",
        code: "manage_orders",
        description: "Create, edit, cancel orders",
        group: "order",
        created_at: new Date()
      },
      {
        name: "View Orders",
        code: "view_orders",
        description: "View orders",
        group: "order",
        created_at: new Date()
      }
    ];
    
    const result = await db.collection('permissions').insertMany(permissions);
    console.log(`Permissions seeded successfully: ${result.insertedCount}`);
    return result.insertedIds;
  } catch (error) {
    console.error(`Error seeding permissions: ${error.message}`);
  }
};

// Seed role permissions
const seedRolePermissions = async (db) => {
  try {
    const roles = await db.collection('roles').find().toArray();
    const permissions = await db.collection('permissions').find().toArray();
    
    const adminRole = roles.find(role => role.name === "Admin");
    const managerRole = roles.find(role => role.name === "Manager");
    const resellerRole = roles.find(role => role.name === "Reseller");
    const customerRole = roles.find(role => role.name === "Customer");
    
    const permissionMap = {};
    permissions.forEach(permission => {
      permissionMap[permission.code] = permission._id;
    });
    
    // Admin có tất cả quyền
    const adminPermissions = permissions.map(permission => ({
      role_id: adminRole._id,
      permission_id: permission._id,
      created_at: new Date()
    }));
    
    // Manager có hầu hết quyền trừ một số quyền đặc biệt
    const managerPermissions = permissions
      .filter(p => p.code !== "approve_withdrawals")
      .map(permission => ({
        role_id: managerRole._id,
        permission_id: permission._id,
        created_at: new Date()
      }));
    
    // Reseller chỉ có một số quyền
    const resellerPermissions = [
      {
        role_id: resellerRole._id,
        permission_id: permissionMap["view_users"],
        created_at: new Date()
      },
      {
        role_id: resellerRole._id,
        permission_id: permissionMap["view_proxies"],
        created_at: new Date()
      },
      {
        role_id: resellerRole._id,
        permission_id: permissionMap["view_orders"],
        created_at: new Date()
      },
      {
        role_id: resellerRole._id,
        permission_id: permissionMap["manage_orders"],
        created_at: new Date()
      }
    ];
    
    // Customer chỉ có quyền xem proxy của mình
    const customerPermissions = [
      {
        role_id: customerRole._id,
        permission_id: permissionMap["view_proxies"],
        created_at: new Date()
      }
    ];
    
    const allRolePermissions = [
      ...adminPermissions,
      ...managerPermissions,
      ...resellerPermissions,
      ...customerPermissions
    ];
    
    const result = await db.collection('rolePermissions').insertMany(allRolePermissions);
    console.log(`Role permissions seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding role permissions: ${error.message}`);
  }
};

// Seed admin user
const seedAdminUser = async (db) => {
  try {
    const passwordHash = await bcrypt.hash('admin_initial_password', 10);
    
    const adminUser = {
      username: "admin",
      password_hash: passwordHash,
      email: "admin@proxy-server.com",
      fullname: "System Administrator",
      phone: "",
      user_level: 0,
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      active: true,
      api_key: generateRandomString(32),
      access_token: null
    };
    
    const result = await db.collection('users').insertOne(adminUser);
    console.log(`Admin user created with ID: ${result.insertedId}`);
    
    // Tạo ví cho admin
    const wallet = {
      user_id: result.insertedId,
      balance: 1000000,
      currency: "VND",
      locked_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
      last_deposit_at: null,
      is_active: true
    };
    
    const walletResult = await db.collection('wallets').insertOne(wallet);
    console.log(`Admin wallet created with ID: ${walletResult.insertedId}`);
    
    // Cập nhật wallet_id cho admin
    await db.collection('users').updateOne(
      { _id: result.insertedId },
      { $set: { wallet_id: walletResult.insertedId } }
    );
    
    // Gán vai trò Admin cho user
    const adminRole = await db.collection('roles').findOne({ name: "Admin" });
    
    const userRole = {
      user_id: result.insertedId,
      role_id: adminRole._id,
      assigned_at: new Date(),
      assigned_by: result.insertedId, // Self-assigned
      created_at: new Date()
    };
    
    await db.collection('userRoles').insertOne(userRole);
    console.log(`Admin role assigned to admin user`);
    
    return result.insertedId;
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
  }
};

// Seed proxies
const seedProxies = async (db) => {
  try {
    // Proxy Datacenter
    const datacenterProxy = {
      ip: "18.223.45.67",
      port: 10001,
      username: "user",
      password: "pass",
      protocol: "http",
      type: "datacenter",
      category: "dedicated",
      country: "US",
      city: "New York",
      region: "East",
      isp: "Amazon",
      status: "active",
      sold: false,
      assigned: false,
      current_user_id: null,
      last_user_id: null,
      health_status: {
        last_check: new Date(),
        response_time: 80,
        success_rate: 99.8,
        error_message: null
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Proxy Residential
    const residentialProxy = {
      ip: "45.67.89.10",
      port: 20001,
      username: "user",
      password: "pass",
      protocol: "http",
      type: "residential",
      category: "dedicated",
      country: "VN",
      city: "Ho Chi Minh",
      region: "South",
      isp: "VNPT",
      status: "active",
      sold: false,
      assigned: false,
      current_user_id: null,
      last_user_id: null,
      health_status: {
        last_check: new Date(),
        response_time: 120,
        success_rate: 98.5,
        error_message: null
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('proxies').insertMany([datacenterProxy, residentialProxy]);
    console.log(`Proxies seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding proxies: ${error.message}`);
  }
};

// Seed product packages
const seedProductPackages = async (db) => {
  try {
    const packages = [
      // Static proxies - Datacenter
      {
        name: "Datacenter Static - Basic",
        description: "5 dedicated datacenter proxies",
        type: "static",
        category: "datacenter",
        protocol: "http",
        is_rotating: false,
        is_bandwidth: false,
        duration_days: 30,
        price: 250000,
        price_tiers: [
          { min_quantity: 1, price_per_unit: 250000 },
          { min_quantity: 5, price_per_unit: 230000 }
        ],
        allowed_countries: ["US", "GB", "DE"],
        allowed_isps: ["Amazon", "Google"],
        features: ["dedicated_ip", "unlimited_bandwidth"],
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Residential Bandwidth
      {
        name: "Residential Bandwidth - 5GB",
        description: "5GB residential bandwidth",
        type: "bandwidth",
        category: "residential",
        protocol: "http",
        is_rotating: true,
        is_bandwidth: true,
        duration_days: 30,
        price: 500000,
        price_tiers: [
          { min_quantity: 1, price_per_unit: 500000 }
        ],
        allowed_countries: ["US", "VN", "JP"],
        allowed_isps: ["All ISPs"],
        features: ["high_anonymity", "global_access"],
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const result = await db.collection('productPackages').insertMany(packages);
    console.log(`Product packages seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding product packages: ${error.message}`);
  }
};

// Seed proxy pools
const seedProxyPools = async (db) => {
  try {
    const pools = [
      {
        name: "Datacenter Pool - Global",
        description: "Datacenter proxies with global distribution",
        group: "datacenter",
        countries: ["US", "GB", "DE"],
        isps: ["Amazon", "Google"],
        connection_types: ["datacenter"],
        proxy_count: 1000,
        active_proxy_count: 950,
        entry_point: "dc.proxy-server.com",
        port_range: {
          start: 10000,
          end: 19999
        },
        username: "user",
        password: "pass",
        is_bandwidth_pool: false,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Residential Pool - Asia",
        description: "Residential proxies focused on Asian countries",
        group: "residential-asia",
        countries: ["JP", "KR", "VN"],
        isps: ["VNPT", "Viettel", "NTT"],
        connection_types: ["residential"],
        proxy_count: 300,
        active_proxy_count: 280,
        entry_point: "asia.proxy-server.com",
        port_range: {
          start: 30000,
          end: 39999
        },
        username: "user",
        password: "pass",
        is_bandwidth_pool: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const result = await db.collection('proxyPools').insertMany(pools);
    console.log(`Proxy pools seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding proxy pools: ${error.message}`);
  }
};

// Seed bonus tiers
const seedBonusTiers = async (db) => {
  try {
    const tiers = [
      {
        name: "Basic Bonus",
        min_amount: 500000,
        bonus_percent: 5,
        bonus_max: 100000,
        active: true,
        currency: "VND",
        start_date: new Date(),
        end_date: null,
        description: "5% bonus for deposits from 500,000 VND",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const result = await db.collection('bonusTiers').insertMany(tiers);
    console.log(`Bonus tiers seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding bonus tiers: ${error.message}`);
  }
};

// Seed user settings
const seedUserSettings = async (db, adminId) => {
  try {
    const settings = {
      user_id: adminId,
      theme: "light",
      language: "vi",
      notification_prefs: {
        email: true,
        dashboard: true,
        proxy_expiry: true,
        balance_low: true
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('userSettings').insertOne(settings);
    console.log(`User settings seeded successfully`);
  } catch (error) {
    console.error(`Error seeding user settings: ${error.message}`);
  }
};

// Seed alerts
const seedAlerts = async (db, adminId) => {
  try {
    const alerts = [
      {
        user_id: adminId,
        plan_id: null,
        type: "system",
        message: "Chào mừng bạn đến với Proxy Server!",
        data: {},
        triggered_at: new Date(),
        is_read: false,
        notification_sent: true,
        notification_method: "dashboard",
        created_at: new Date()
      }
    ];
    
    const result = await db.collection('alerts').insertMany(alerts);
    console.log(`Alerts seeded successfully: ${result.insertedCount}`);
  } catch (error) {
    console.error(`Error seeding alerts: ${error.message}`);
  }
};

// Seed orders
const seedOrders = async (db, adminId) => {
  try {
    const order = {
      user_id: adminId,
      wallet_id: (await db.collection('wallets').findOne({ user_id: adminId }))._id,
      order_number: "ORD-" + Date.now(),
      total_amount: 250000,
      payment_source: "wallet",
      wallet_trans_id: null,
      status: "completed",
      payment_method: "wallet",
      payment_status: "paid",
      reseller_id: null,
      commission_rate: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    console.log(`Orders seeded successfully`);
    
    // Add order items
    const packageData = await db.collection('productPackages').findOne({ name: "Datacenter Static - Basic" });
    
    const orderItem = {
      order_id: result.insertedId,
      package_id: packageData._id,
      quantity: 1,
      price: 250000,
      subtotal: 250000,
      custom_config: {
        protocol: "http",
        countries: ["US"],
        rotation_interval: 0
      },
      created_at: new Date()
    };
    
    await db.collection('orderItems').insertOne(orderItem);
    console.log(`Order items seeded successfully`);
    
    return result.insertedId;
  } catch (error) {
    console.error(`Error seeding orders: ${error.message}`);
  }
};

// Seed user plans
const seedUserPlans = async (db, adminId, orderId) => {
  try {
    const packageData = await db.collection('productPackages').findOne({ name: "Datacenter Static - Basic" });
    
    const userPlan = {
      user_id: adminId,
      package_id: packageData._id,
      order_id: orderId,
      plan_type: "static",
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 86400000), // 30 days
      active: true,
      expired: false,
      expired_at: null,
      grace_period_days: 3,
      suspension_date: null,
      renewal_status: "not_renewed",
      renewal_price: 250000,
      auto_renew: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('userPlans').insertOne(userPlan);
    console.log(`User plans seeded successfully`);
    
    // Add static proxy plan
    const proxy = await db.collection('proxies').findOne({ type: "datacenter" });
    
    const staticProxyPlan = {
      user_plan_id: result.insertedId,
      proxies: [proxy._id],
      protocol: "http",
      category: "datacenter",
      is_rotating: false,
      rotation_interval: 0,
      rotation_url: null,
      proxies_released: false,
      previous_proxies: [],
      custom_username: "user",
      custom_password: "pass",
      current_proxy_id: proxy._id,
      last_rotation: null
    };
    
    await db.collection('staticProxyPlans').insertOne(staticProxyPlan);
    console.log(`Static proxy plans seeded successfully`);
    
    // Update proxy to be assigned
    await db.collection('proxies').updateOne(
      { _id: proxy._id },
      { 
        $set: {
          sold: true,
          assigned: true,
          current_user_id: adminId
        }
      }
    );
    
    return result.insertedId;
  } catch (error) {
    console.error(`Error seeding user plans: ${error.message}`);
  }
};

// Seed transaction log
const seedWalletTransactions = async (db, adminId) => {
  try {
    const wallet = await db.collection('wallets').findOne({ user_id: adminId });
    
    const transaction = {
      wallet_id: wallet._id,
      user_id: adminId,
      type: "deposit",
      amount: 1000000,
      balance_before: 0,
      balance_after: 1000000,
      currency: "VND",
      status: "completed",
      description: "Initial deposit",
      bonus_amount: 0,
      metadata: {
        payment_method: "manual",
        order_id: null,
        invoice_number: null,
        commission_for: null
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('walletTransactions').insertOne(transaction);
    console.log(`Wallet transactions seeded successfully`);
  } catch (error) {
    console.error(`Error seeding wallet transactions: ${error.message}`);
  }
};

// Seed proxy usage logs
const seedProxyUsageLogs = async (db, adminId, userPlanId) => {
  try {
    const proxy = await db.collection('proxies').findOne({ current_user_id: adminId });
    
    const usageLog = {
      user_id: adminId,
      plan_id: userPlanId,
      proxy_id: proxy._id,
      timestamp: new Date(),
      request_url: "https://example.com",
      bytes_sent: 1024,
      bytes_received: 8192,
      total_bytes: 9216,
      gb_used: 0.000009216,
      success: true,
      error_code: null,
      error_message: null,
      location_info: {
        country: "US",
        city: "New York"
      },
      created_at: new Date()
    };
    
    const result = await db.collection('proxyUsageLogs').insertOne(usageLog);
    console.log(`Proxy usage logs seeded successfully`);
  } catch (error) {
    console.error(`Error seeding proxy usage logs: ${error.message}`);
  }
};

// Seed reseller details
const seedResellerDetails = async (db) => {
  try {
    const resellerRole = await db.collection('roles').findOne({ name: "Reseller" });
    
    // Tạo reseller user
    const passwordHash = await bcrypt.hash('reseller_password', 10);
    
    const resellerUser = {
      username: "reseller",
      password_hash: passwordHash,
      email: "reseller@proxy-server.com",
      fullname: "Demo Reseller",
      phone: "0123456789",
      user_level: 2,
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      active: true,
      api_key: generateRandomString(32),
      access_token: null
    };
    
    const result = await db.collection('users').insertOne(resellerUser);
    
    // Gán vai trò Reseller
    const userRole = {
      user_id: result.insertedId,
      role_id: resellerRole._id,
      assigned_at: new Date(),
      assigned_by: (await db.collection('users').findOne({ username: "admin" }))._id,
      created_at: new Date()
    };
    
    await db.collection('userRoles').insertOne(userRole);
    
    // Tạo ví cho reseller
    const wallet = {
      user_id: result.insertedId,
      balance: 500000,
      currency: "VND",
      locked_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
      last_deposit_at: null,
      is_active: true
    };
    
    const walletResult = await db.collection('wallets').insertOne(wallet);
    
    // Cập nhật wallet_id cho reseller
    await db.collection('users').updateOne(
      { _id: result.insertedId },
      { $set: { wallet_id: walletResult.insertedId } }
    );
    
    // Tạo reseller details
    const resellerDetails = {
      user_id: result.insertedId,
      commission_rate: 10, // 10%
      downline_count: 0,
      total_sales: 0,
      payment_details: {
        bank_name: "VPBank",
        account_number: "9876543210",
        account_name: "Demo Reseller"
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await db.collection('resellerDetails').insertOne(resellerDetails);
    console.log(`Reseller details seeded successfully`);
  } catch (error) {
    console.error(`Error seeding reseller details: ${error.message}`);
  }
};

// Main function to run seeding
const seedData = async () => {
  try {
    const connection = await connectDB();
    const db = connection.db;
    
    // Xóa hết dữ liệu cũ
    await clearAllData(db);
    
    // Khởi tạo dữ liệu mặc định
    await seedRoles(db);
    await seedPermissions(db);
    await seedRolePermissions(db);
    const adminId = await seedAdminUser(db);
    await seedProxies(db);
    await seedProductPackages(db);
    await seedProxyPools(db);
    await seedBonusTiers(db);
    await seedUserSettings(db, adminId);
    await seedAlerts(db, adminId);
    const orderId = await seedOrders(db, adminId);
    const userPlanId = await seedUserPlans(db, adminId, orderId);
    await seedWalletTransactions(db, adminId);
    await seedProxyUsageLogs(db, adminId, userPlanId);
    await seedResellerDetails(db);
    
    console.log('Data seeding completed');
    process.exit(0);
  } catch (error) {
    console.error(`Error in seed process: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 