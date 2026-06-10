import { Follow, Likes, Posts, Users } from '../models';
import { MsSqlConstants } from './constant.mssql';

const msSqlDBModelsProvider = [
		{
			provide:MsSqlConstants.USER,
			useValue: Users
			
		},

		{
			provide:MsSqlConstants.POST,
			useValue:Posts
		},
		{
			provide:MsSqlConstants.LIKE,
			useValue:Likes
		},
		{
			provide:MsSqlConstants.FOLLOW,
			useValue:Follow
		}
		
	],
	models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { 
    models,
     msSqlDBModelsProvider };
