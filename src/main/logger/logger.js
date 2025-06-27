const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize } = winston.format;

// 自定义日志格式 - 修正版
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// 控制台专用的格式（带颜色）
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

// 文件专用的格式（不带颜色）
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

const logger = winston.createLogger({
  level: 'debug',
  format: fileFormat, // 默认格式用于文件
  transports: [
    // 控制台传输
    new winston.transports.Console({
      format: consoleFormat
    }),
    // 文件传输
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      options: { encoding: 'utf8' }
    })
  ]
});

// 处理未捕获异常
logger.exceptions.handle(
  new DailyRotateFile({
    filename: 'logs/exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    options: { encoding: 'utf8' }
  })
);


export default logger;
