import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đảm bảo thư mục logs tồn tại
const logDir = process.env.LOG_FILE_PATH || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Định dạng logs
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

// Thiết lập logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'proxy-server' },
  transports: [
    // Ghi log lỗi vào file
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      format: logFormat 
    }),
    // Ghi tất cả logs vào file
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      format: logFormat 
    })
  ]
});

// Nếu không phải production thì log ra console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      logFormat
    )
  }));
}

// Thêm stream để sử dụng với morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger; 