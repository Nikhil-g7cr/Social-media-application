import { Posts, Users } from '../models';
import { MsSqlConstants } from './constant.mssql';

const msSqlDBModelsProvider = [
		{
			provide:MsSqlConstants.USER,
			useValue: Users
			
		},

		{
			provide:MsSqlConstants.POST,
			useValue:Posts
		}
		
	],
	models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { 
    models,
     msSqlDBModelsProvider };
