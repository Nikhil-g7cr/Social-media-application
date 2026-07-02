import { AppConfig } from "../config/AppConfig";
import AppLogger from "./logger/app-logger";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../databse/database.module";
import { AbstractAuthSvc } from "../modules/auth/auth.abstract";
import { AuthService } from "../modules/auth/auth.service";
import { JwtService } from "@nestjs/jwt";



const getProviders = (): any[] => {
		return [
			AppConfig,
			AppLogger,
			{ provide: AbstractAuthSvc, useClass: AuthService },
			JwtService
		];
	},
	importProviders = (): any[] => {
		return [ConfigModule.forRoot({ envFilePath: '.env' }),DatabaseModule];
	},
	exportProviders = (): any[] => {
		return [AppConfig, AppLogger,DatabaseModule];
	};

export { exportProviders, getProviders, importProviders };
