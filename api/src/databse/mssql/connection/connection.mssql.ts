import { AppConfig } from "src/config/AppConfig";
import AppLogger from "src/core/logger/app-logger";
import { MsSqlConstants } from "./constant.mssql";
import { HttpStatus } from "@nestjs/common";
import { messageFactory } from "src/shared/message.shared";
import { Sequelize } from "sequelize-typescript";


export const sequelizeProvider = [
	{
		provide: MsSqlConstants.SEQUELIZE_PROVIDER,
		useFactory: async (_appConfigSvc: AppConfig, _logger: AppLogger) => {
			const sequelize: Sequelize = null;
			try {
				const dbConfig = _appConfigSvc.get('db').mssql,
					sequelize = new Sequelize({ ...dbConfig, logging: true });
				sequelize.addModels([...models]);
				_logger.log(messages.S3, 200);
				return sequelize;
			} catch (err) {
				_logger.log(messageFactory(messages.E4, [err.stack]), HttpStatus.INTERNAL_SERVER_ERROR);
			} finally {
				/* If the Node process ends, dispose the sequelize connection */
				process.on('SIGINT', async () => {
					if (sequelize) {
						try {
							await sequelize.close();
							_logger.log(messages.E5, 200);
						} catch (err) {
							_logger.log(messageFactory(messages.E6, [err.stack]), HttpStatus.INTERNAL_SERVER_ERROR);
						} finally {
							process.exit(0);
						}
					}
				});
			}
		},
		inject: [AppConfig, AppLogger]
	}
];
