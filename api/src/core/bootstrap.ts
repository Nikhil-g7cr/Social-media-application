import { INestApplication, ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppConfig } from "../config/AppConfig";
import cors from 'cors';
import { corsOptions } from "../core/cors.config" // Pre-configured CORS options
import { ResponseHandler } from "./response-handler";
import { ErrorHandler } from "./middleware/error-handler";
import AppLogger from "./logger/app-logger";
import { setupSwagger } from "./swagger/doc.swagger";

export default function bootstrap(app: INestApplication, appConfigSvcObj: AppConfig) {
	app.setGlobalPrefix('api');
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ limit: '50mb', extended: true }));

	app.use(helmet());
	app.use(cors(corsOptions));
		
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strip unknown properties
			forbidNonWhitelisted: true // Throw error if unknown properties present
		})
	);

	app.useGlobalInterceptors(new ResponseHandler());

	app.useGlobalFilters(new ErrorHandler(app.get(AppLogger)));

	const appConfig = appConfigSvcObj.get('app'),
		{ environment } = appConfig;
	if (environment && environment.toLowerCase() !== 'production') {
		setupSwagger(app);
	}
}
