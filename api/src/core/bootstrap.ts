/**
 * ============================================
 * IMPORTS - Core Application Dependencies
 * ============================================
 */

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppConfig } from "src/config/AppConfig";
import cors from 'cors';
import { corsOptions } from "../core/cors.config" // Pre-configured CORS options
import { ResponseHandler } from "./response-handler";
import { ErrorHandler } from "./middleware/error-handler";
import AppLogger from "./logger/app-logger";
import { setupSwagger } from "./swagger/doc.swagger";


/**
 * ============================================
 * BOOTSTRAP FUNCTION
 * ============================================
 *
 * This is the core bootstrap function that initializes and configures
 * all global middleware, pipes, interceptors, filters, and other
 * application-level settings before the app starts listening.
 *
 * Called from main.ts after NestFactory.create(AppModule)
 *
 * @param {INestApplication} app - The NestJS application instance
 * @param {AppConfigService} appConfigSvcObj - Service containing all environment configurations
 *
 * Configuration Order:
 * 1. Global Prefix
 * 2. Body Parsers & Security Middlewares
 * 3. Compression & CORS
 * 4. Global Validation
 * 5. Global Interceptors & Filters
 * 6. API Documentation (Swagger)
 */

export default function bootstrap(app: INestApplication, appConfigSvcObj: AppConfig) {
	/**
	 * STEP 1: SET GLOBAL API PREFIX
	 * All routes will be prefixed with '/api'
	 * Example: GET /users becomes GET /api/users
	 */
	app.setGlobalPrefix('api');

	/**
	 * STEP 2: BODY PARSERS & SIZE LIMITS
	 * Configure express to parse JSON and URL-encoded request bodies
	 *
	 * @param {string} limit: '50mb' - Maximum request body size allowed (prevents large payload attacks)
	 * @param {boolean} extended: true - Use 'qs' library for parsing (supports nested objects)
	 *
	 * Use case: File uploads, large data submissions
	 */
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ limit: '50mb', extended: true }));

	/**
	 * STEP 3: SECURITY HEADERS with HELMET
	 * Sets various HTTP headers for enhanced security
	 *
	 * Headers set by Helmet:
	 * - X-Frame-Options: Prevent clickjacking attacks
	 * - X-Content-Type-Options: Prevent MIME type sniffing
	 * - X-XSS-Protection: Enable browser XSS protections
	 * - Strict-Transport-Security: Force HTTPS
	 * - Content-Security-Policy: Restrict resource loading
	 *
	 * Security consideration: Enable in production for maximum protection
	 */
	app.use(helmet());

	/**
	 * STEP 4: RESPONSE COMPRESSION
	 * Compresses response bodies to reduce bandwidth usage
	 *
	 * Gzip compression reduces response size by ~60-70% for JSON/text
	 *
	 * Configuration:
	 * @param {Function} filter: shouldCompress - Custom function to determine which responses to compress
	 * @param {number} threshold: 0 - Compress all responses (even small ones)
	 *                 Comment: Original threshold: 1024 (only compress if > 1KB)
	 *
	 * Performance impact: Reduces bandwidth at cost of CPU for compression
	 */
	// app.use(
	// 	compression({
	// 		filter: shouldCompress,
	// 		//threshold: 1024,  // Original threshold - compress only if response > 1KB
	// 		threshold: 0 // Current: compress all responses
	// 	})
	// );

	/**
	 * STEP 5: CORS (Cross-Origin Resource Sharing) CONFIGURATION
	 * Enables/restricts cross-origin requests to protect against unauthorized API access
	 *
	 * CORS policies control:
	 * - Which domains can access this API
	 * - Which HTTP methods are allowed (GET, POST, PUT, DELETE, etc.)
	 * - Which headers can be sent in requests/responses
	 * - Whether credentials (cookies, auth tokens) are allowed
	 *
	 * corsOptions imported from: @app/core/cors.config
	 * See corsOptions configuration for allowed origins and methods
	 */
	app.use(cors(corsOptions));

	/**
	 * STEP 6: GLOBAL VALIDATION PIPE
	 *
	 * ValidationPipe automatically validates incoming request data against DTO (Data Transfer Object) rules
	 * Using class-validator library decorators (@IsEmail, @IsNotEmpty, etc.)
	 *
	 * This pipe is applied GLOBALLY to all endpoints at the application level
	 * It ensures ALL incoming requests are validated before reaching controller handlers
	 *
	 * Configuration Options:
	 *
	 * @param {boolean} whitelist: true
	 *    - Only properties defined in the DTO are allowed
	 *    - Extra properties in the request are silently stripped
	 *    - Prevents injection of unexpected fields
	 *    - Example: If DTO has {email, password}, sending {email, password, isAdmin: true} removes isAdmin
	 *
	 * @param {boolean} forbidNonWhitelisted: true
	 *    - If true, throws validation error instead of silently removing extra properties
	 *    - Combined with whitelist: true for strict validation
	 *    - Returns 400 Bad Request if extra fields detected
	 *
	 * Flow:
	 * Request → ValidationPipe → DTO Validation → Controller Handler
	 *
	 * Example DTO:
	 * class CreateUserDto {
	 *   @IsEmail() email: string;
	 *   @IsNotEmpty() password: string;
	 *   @IsOptional() firstName?: string;
	 * }
	 *
	 * Validation errors return 400 status with detailed error messages
	 */
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strip unknown properties
			forbidNonWhitelisted: true // Throw error if unknown properties present
		})
	);

	/**
	 * STEP 7: GLOBAL INTERCEPTORS
	 *
	 * Interceptors are used to bind additional logic to request/response cycle
	 * Applied GLOBALLY across all endpoints
	 *
	 * ResponseHandler (Imported from @app/core/middleware):
	 * - Intercepts ALL outgoing responses
	 * - Wraps responses in a standardized format
	 * - Standardizes status codes, messages, and error handling
	 * - Ensures consistent API response structure across all endpoints
	 *
	 * Execution order: Request → Controllers → ResponseHandler → Client
	 *
	 * Example: Controller returns { name: 'John' }
	 *          ResponseHandler wraps it to: { status: 200, data: { name: 'John' }, message: 'Success' }
	 */
	app.useGlobalInterceptors(new ResponseHandler());

	/**
	 * STEP 8: GLOBAL ERROR HANDLER FILTER
	 *
	 * Exception Filters catch ALL unhandled exceptions thrown in the application
	 * Applied GLOBALLY across all endpoints
	 *
	 * ErrorHandler (Imported from @app/core/middleware):
	 * - Catches unhandled exceptions/errors
	 * - Formats errors into standardized error responses
	 * - Logs errors using AppLogger service
	 * - Prevents server from crashing from unexpected errors
	 * - Returns appropriate HTTP status codes (400, 401, 403, 500, etc.)
	 *
	 * Dependencies:
	 * - app.get(AppLogger) - Retrieves the logger service from NestJS container
	 *
	 * Flow: Unhandled Exception → ErrorHandler → Logs Error → Returns formatted 400/500 response
	 *
	 * Example errors caught:
	 * - Validation errors (already handled by ValidationPipe)
	 * - Database errors
	 * - External API failures
	 * - Null pointer exceptions
	 * - Any uncaught runtime errors
	 */
	app.useGlobalFilters(new ErrorHandler(app.get(AppLogger)));

	/**
	 * STEP 9: API DOCUMENTATION - SWAGGER/OPENAPI SETUP
	 *
	 * Swagger UI provides interactive API documentation
	 * Automatically generates documentation from controller decorators and DTOs
	 *
	 * Environment-based Setup:
	 * - Retrieves 'app' configuration (includes environment: production/development/staging)
	 * - Only enables Swagger in NON-PRODUCTION environments for security
	 *
	 * @param {string} environment - Retrieved from AppConfigService.get('app')
	 *    Values: 'production', 'development', 'staging', etc.
	 *
	 * Conditional Logic:
	 * - IF environment is NOT 'production' → Setup Swagger
	 * - IF environment IS 'production' → Skip Swagger (security best practice)
	 *
	 * Swagger Access Point (when enabled):
	 * - URL: http://localhost:{port}/api/docs/swagger
	 * - Provides interactive API endpoint testing
	 * - Shows all routes, parameters, and request/response schemas
	 *
	 * setupSwagger() imported from: @app/core/swagger/doc.swagger
	 * Configures: Title, version, bearer auth, custom styling
	 *
	 * Security Note:
	 * - Swagger exposes API structure and endpoints to anyone with access
	 * - Should NOT be available in production environments
	 * - Recommended: Use environment variable to control Swagger access
	 */
	const appConfig = appConfigSvcObj.get('app'),
		{ environment } = appConfig;
	if (environment && environment.toLowerCase() !== 'production') {
		setupSwagger(app);
	}
}
