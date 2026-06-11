import { AppConfig } from "src/config/AppConfig";
import AppLogger from "./logger/app-logger";
import {ConfigModule} from "@nestjs/config"
import { DatabaseModule } from "src/databse/database.module";



const getProviders = (): any[] => {
		return [
			AppConfig,
			AppLogger,
			// { provide: APP_GUARD, useClass: AuthGuard },
			// { provide: APP_GUARD, useClass: RolesGuard },
			// { provide: AbstractAuthSvc, useClass: AuthService },
			// JwtService
		];
	},
	importProviders = (): any[] => {
		return [ConfigModule.forRoot({ envFilePath: '.env' }), DatabaseModule];
	},
	exportProviders = (): any[] => {
		return [AppConfig, AppLogger, DatabaseModule];
	};

export { exportProviders, getProviders, importProviders };
