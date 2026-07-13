import { Injectable, LoggerService } from '@nestjs/common';
import { AppConfig } from 'src/config/AppConfig';
import {
	Logger,
	createLogger,
	format,
	transport,
	transports,
} from 'winston';
import { extensions, winstonAzureBlob } from 'winston-azure-blob';

enum WinstonLogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	HTTP = 'http',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
	SILLY = 'silly',
}

@Injectable()
export default class AppLogger implements LoggerService {
	public logger: Logger;
	private readonly loggerChannels: transport[] = [];

	constructor(_appConfigSvc: AppConfig) {
		const blobCred = _appConfigSvc.get('blobStorage');

		const {
			combine,
			timestamp,
			label,
			json,
			printf,
			colorize,
			errors,
		} = format;

		/**
		 * Console Format
		 */
		const consoleFormat = combine(
			colorize({ all: true }),
			timestamp({
				format: 'YYYY-MM-DD HH:mm:ss',
			}),
			errors({ stack: true }),
			printf((info) => {
				const message =
					info.message ??
					info.msg ??
					'';

				let output =
					`[${info.timestamp}] ` +
					`[${String(info.level).toUpperCase()}] ` +
					`${message}`;

				if (info.status) {
					output += ` | Status: ${info.status}`;
				}

				if (info.sid) {
					output += ` | SID: ${info.sid}`;
				}

				if (info.route) {
					output += ` | Route: ${info.route}`;
				}

				if (info.stack) {
					output += `\n${info.stack}`;
				}

				return output;
			}),
		);

		/**
		 * Azure Blob JSON Format
		 */
		const azureFormat = combine(
			label({ label: 'TOMO-api' }),
			timestamp(),
			errors({ stack: true }),
			json(),
		);

		/**
		 * Console Transport
		 */
		this.loggerChannels.push(
			new transports.Console({
				format: consoleFormat,
			}),
		);

		/**
		 * Application Logs
		 */
		this.loggerChannels.push(
			winstonAzureBlob({
				account: {
					name: blobCred.blobAccountName,
					key: blobCred.blobAccountKey,
				},
				containerName: blobCred.blobLoggerContainerName,
				blobName: 'app-logs/TOMO',
				rotatePeriod: 'YYYY-MM-DD',
				bufferLogSize: 1,
				eol: '\n',
				extension: extensions.LOG,
				syncTimeout: 0,
				format: azureFormat,
			}),
		);

		/**
		 * Error Logs
		 */
		this.loggerChannels.push(
			winstonAzureBlob({
				account: {
					name: blobCred.blobAccountName,
					key: blobCred.blobAccountKey,
				},
				containerName: blobCred.blobLoggerContainerName,
				level: WinstonLogLevel.ERROR,
				blobName: 'errors/TOMO',
				rotatePeriod: 'YYYY-MM-DD',
				bufferLogSize: 1,
				eol: '\n',
				extension: extensions.LOG,
				syncTimeout: 0,
				format: azureFormat,
			}),
		);

		this.logger = createLogger({
			level: blobCred.logLevel || WinstonLogLevel.DEBUG,
			transports: this.loggerChannels,
		});
	}

	log(message: any, status = 200, sid = '') {
		this.logger.info({
			message,
			status,
			sid,
		});
	}

	error(error: any, status = 500, sid = '') {
		this.logger.error({
			message: error?.message || error,
			stack: error?.stack,
			status,
			sid,
		});
	}

	warn(message: any, route = '', status = 206, sid = '') {
		this.logger.warn({
			message,
			route,
			status,
			sid,
		});
	}

	debug(message: any, status = 200, sid = '') {
		this.logger.debug({
			message,
			status,
			sid,
		});
	}

	verbose(message: any, status = 200, sid = '') {
		this.logger.verbose({
			message,
			status,
			sid,
		});
	}
}