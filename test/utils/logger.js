/**
 * ============================================================================
 *  LOGGER  -  Centralized, structured logging for the entire framework
 * ----------------------------------------------------------------------------
 *  Why a logger and not console.log?
 *    1. Log levels (info/warn/error/debug) -> filterable noise
 *    2. Timestamps automatically attached
 *    3. Logs written to file too -> CI artifact / forensic debugging
 *    4. Single place to swap log backend later (e.g., Datadog/Splunk/Cloud)
 *    5. Mobile runs are flaky by nature - good logs are LIFE-SAVERS
 * ============================================================================
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists (idempotent)
const logsDir = './logs';
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}] ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
    ),
    transports: [
        // Pretty colored output for the terminal
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'HH:mm:ss' }),
                customFormat
            ),
        }),
        // Plain text file for archival / CI artifact upload
        new winston.transports.File({
            filename: path.join(logsDir, 'test-run.log'),
            maxsize: 5 * 1024 * 1024, // 5 MB rotation
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'errors.log'),
            level: 'error',
        }),
    ],
});

export default logger;
