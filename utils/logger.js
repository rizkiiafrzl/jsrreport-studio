const fs = require('fs');
const path = require('path');
const { inspect } = require('util');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Simple pick utility (avoid lodash-es in CJS project)
function pick(obj, keys) {
	const out = {};
	if (!obj) return out;
	for (const key of keys) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
	}
	return out;
}

const rootDir = path.join(__dirname, '..');
const logDir = path.join(rootDir, 'logs');
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

const colorizer = format.colorize();

const logger = createLogger({
	level: 'silly',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss Z',
		}),
		format.errors({ stack: true })
	),
	transports: [
		new DailyRotateFile({
			dirname: logDir,
			filename: 'daily-log-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			format: format.json(),
		}),
		new transports.Console({
			format: format.printf((info) => {
				const colorize = (str) => colorizer.colorize(info.level, str);
				const level = colorize(info.level.toUpperCase());
				const timestamp = info.timestamp;
				let message = info.message;
				if (typeof message === 'object') {
					message = inspect(message);
				}

				let out = `[${timestamp}] [${level}] - ${message}`;

				if (info.request || info.response) {
					// axios-like error shape
					out += `\n${colorize('Error data')}: ${inspect(pick(info, ['code', 'config', 'request', 'response']), undefined, 2)}`;
				} else if (info.stack) {
					// native/Error stack
					out += `\n${info.stack}`;
				}
				return out;
			}),
		})
	]
});

// Request helper for express middleware compatibility
logger.request = function request(req) {
	try {
		const { method, url } = req;
		const ip = req.ip || (req.connection && req.connection.remoteAddress) || undefined;
		const ua = (req.headers && req.headers['user-agent']) || undefined;
		logger.info(`HTTP ${method} ${url}`, { method, url, ip, ua });
	} catch (err) {
		logger.warn('Failed to log request', err);
	}
};

module.exports = logger;
