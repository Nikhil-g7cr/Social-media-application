import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AbstractAuthSvc } from './auth.abstract';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
	controllers: [AuthController],
	providers: [
		{
			provide: AbstractAuthSvc,
			useClass: AuthService
		},
		JwtService
	]
})
export class AuthModule {}
