import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  APP_NAME: Joi.string().default('MistyPay'),
  APP_ENV: Joi.string().valid('local', 'staging', 'production').default('local'),
  APP_PORT: Joi.number().default(3000),
  APP_URL: Joi.string().uri().required(),
  API_PREFIX: Joi.string().default('/api/v1'),

  DATABASE_URL: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  PIN_HASH_SALT_ROUNDS: Joi.number().default(12),
  PIN_MAX_ATTEMPTS: Joi.number().default(5),
  PIN_LOCK_DURATION_MINUTES: Joi.number().default(15),

  RATE_PROVIDER: Joi.string().default('BINANCE'),
  BINANCE_API_URL: Joi.string().uri().default('https://api.binance.com'),
  RATE_PAIR: Joi.string().default('USDT_VND'),
  RATE_CACHE_TTL_SECONDS: Joi.number().default(30),
  QUOTE_EXPIRES_SECONDS: Joi.number().default(60),

  BLOCKCHAIN_NETWORK: Joi.string().default('TRON'),
  SUPPORTED_TOKEN: Joi.string().default('USDT'),
  TRON_GRID_API_URL: Joi.string().uri().default('https://api.trongrid.io'),
  TRON_GRID_API_KEY: Joi.string().required(),
  TRON_SETTLEMENT_WALLET: Joi.string().required(),
  TRON_CONFIRMATION_REQUIRED: Joi.number().default(1),
  BLOCKCHAIN_POLL_INTERVAL_SECONDS: Joi.number().default(2),
  USDT_AMOUNT_TOLERANCE: Joi.number().default(0.01),

  PAYOUT_PROVIDER: Joi.string().valid('BAOKIM', 'PAYOS', 'BANKHUB').default('BAOKIM'),
  PAYOUT_CURRENCY: Joi.string().default('VND'),
  PAYOUT_MAX_RETRY: Joi.number().default(3),
  PAYOUT_RETRY_DELAY_SECONDS: Joi.number().default(60),

  BAOKIM_API_URL: Joi.string().uri().optional(),
  BAOKIM_CLIENT_ID: Joi.string().optional(),
  BAOKIM_CLIENT_SECRET: Joi.string().optional(),
  BAOKIM_API_KEY: Joi.string().optional(),
  BAOKIM_WEBHOOK_SECRET: Joi.string().optional(),
  BAOKIM_WALLET_ID: Joi.string().optional(),

  PAYOS_API_URL: Joi.string().uri().optional(),
  PAYOS_CLIENT_ID: Joi.string().optional(),
  PAYOS_API_KEY: Joi.string().optional(),
  PAYOS_CHECKSUM_KEY: Joi.string().optional(),
  PAYOS_WEBHOOK_SECRET: Joi.string().optional(),

  VND_LOW_BALANCE_THRESHOLD: Joi.number().default(5000000),
  VND_CRITICAL_BALANCE_THRESHOLD: Joi.number().default(1000000),
  USDT_LOW_BALANCE_THRESHOLD: Joi.number().default(100),
  TREASURY_ALERT_ENABLED: Joi.boolean().default(true),

  QUEUE_PREFIX: Joi.string().default('mistypay'),
  QUEUE_CONCURRENCY_BLOCKCHAIN: Joi.number().default(5),
  QUEUE_CONCURRENCY_PAYOUT: Joi.number().default(3),
  QUEUE_CONCURRENCY_NOTIFICATION: Joi.number().default(5),
  QUEUE_CONCURRENCY_RECONCILIATION: Joi.number().default(1),

  CORS_ORIGIN: Joi.string().required(),

  RATE_LIMIT_TTL_SECONDS: Joi.number().default(60),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  LOGIN_RATE_LIMIT_MAX: Joi.number().default(10),
  QUOTE_RATE_LIMIT_MAX: Joi.number().default(30),
  PAYMENT_RATE_LIMIT_MAX: Joi.number().default(20),

  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'text').default('json'),
  LOG_RETENTION_DAYS: Joi.number().default(30),

  RECONCILIATION_ENABLED: Joi.boolean().default(true),
  RECONCILIATION_RUN_TIME: Joi.string().default('00:30'),
  RECONCILIATION_TIMEZONE: Joi.string().default('Asia/Ho_Chi_Minh'),

  FEATURE_REAL_PAYOUT: Joi.boolean().default(false),
  FEATURE_REAL_BLOCKCHAIN: Joi.boolean().default(false),
  FEATURE_ADMIN_PANEL: Joi.boolean().default(true),
  FEATURE_NOTIFICATIONS: Joi.boolean().default(false),
  FEATURE_MANUAL_REVIEW: Joi.boolean().default(true),

  VIETQR_CLIENT_ID: Joi.string().optional().allow(''),
  VIETQR_API_KEY: Joi.string().optional().allow(''),

  BANKHUB_CLIENT_ID: Joi.string().optional().allow(''),
  BANKHUB_SECRET_KEY: Joi.string().optional().allow(''),
  BANKHUB_API_URL: Joi.string().uri().default('https://sandbox.bankhub.dev'),
});
