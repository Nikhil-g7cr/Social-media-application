import { exportProviders, getProviders, importProviders } from './providers';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
	providers: [...getProviders()],
	imports: [...importProviders()],
	exports: [...exportProviders()]
})
export class CoreModule {}
