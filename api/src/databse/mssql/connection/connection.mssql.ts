import { AppConfig } from "src/config/AppConfig";
import { MsSqlConstants } from "./constant.mssql";
import AppLogger from "src/core/logger/app-logger";
import { Sequelize } from "sequelize-typescript";
import { messageFactory, messages } from "src/shared/message.shared";
import { models } from "./models.connection.mssql";

export const sequelizeProvider = [
    {
        provide: MsSqlConstants.SEQUELIZE_PROVIDER,
        useFactory: async (_appConfigSvc: AppConfig, _logger: AppLogger) => {
            // 1. Declare with 'let' so it can be reassigned
            let sequelize: Sequelize|null = null;
            try {
                const dbConfig = _appConfigSvc.get('db').mssql;
                
                // 2. Reassign the outer variable instead of redeclaring it
                sequelize = new Sequelize({ ...dbConfig, logging: console.log });
                
                sequelize.addModels([...models]);
                _logger.log(messages.S3, 200);
                
                return sequelize;
            } catch (err:any) {
                _logger.log(messageFactory(messages.E4, [err.stack]), 500);
                throw err; // Ensure the application fails to start if database connection fails
            } finally {
                /* If the Node process ends, dispose the sequelize connection */
                process.on('SIGINT', async () => {
                    // 3. This now correctly refers to the active connection instance
                    if (sequelize) {
                        try {
                            await sequelize.close();
                            _logger.log(messages.E5, 200);
                        } catch (err:any) {
                            _logger.log(messageFactory(messages.E6, [err.stack]), 500);
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