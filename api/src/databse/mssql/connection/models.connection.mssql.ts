import { MsSqlConstants } from './constant.mssql';

const msSqlDBModelsProvider = [
		{
			provide:MsSqlConstants.USER,
			useValue: User
			
		},
		
	]
	models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { 
    // models,
     msSqlDBModelsProvider };
