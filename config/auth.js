const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development',
    expiresIn: process.env.JWT_EXPIRE || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_jwt_secret_key_for_development',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    algorithm: 'HS256'
  },
  
  password: {
    saltRounds: 10,
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumber: true,
    requireSymbol: false
  },
  
  roles: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    RESELLER: 'reseller',
    CUSTOMER: 'customer'
  },
  
  rbac: {
    permissions: {
      users: ['create', 'read', 'update', 'delete', 'list'],
      roles: ['create', 'read', 'update', 'delete', 'list'],
      proxies: ['create', 'read', 'update', 'delete', 'list', 'replace'],
      orders: ['create', 'read', 'update', 'delete', 'list', 'confirm'],
      packages: ['create', 'read', 'update', 'delete', 'list'],
      wallets: ['read', 'update', 'deposit', 'withdraw', 'transactions'],
      plans: ['create', 'read', 'update', 'delete', 'list', 'renew', 'topup']
    },
    
    rolePermissions: {
      admin: ['*'],
      manager: [
        'users:read', 'users:list',
        'proxies:*',
        'orders:*',
        'packages:*',
        'wallets:read', 'wallets:transactions', 'wallets:deposit', 'wallets:withdraw',
        'plans:*'
      ],
      reseller: [
        'users:read', 'users:list',
        'proxies:read', 'proxies:list',
        'orders:create', 'orders:read', 'orders:list',
        'packages:read', 'packages:list',
        'wallets:read', 'wallets:deposit', 'wallets:withdraw', 'wallets:transactions',
        'plans:read', 'plans:list', 'plans:renew', 'plans:topup'
      ],
      customer: [
        'users:read',
        'proxies:read', 'proxies:list', 'proxies:replace',
        'orders:create', 'orders:read', 'orders:list',
        'packages:read', 'packages:list',
        'wallets:read', 'wallets:deposit', 'wallets:transactions',
        'plans:read', 'plans:list', 'plans:renew', 'plans:topup'
      ]
    }
  }
};

export default authConfig; 