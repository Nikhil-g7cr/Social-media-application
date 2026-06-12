import { Injectable } from '@nestjs/common';
import { AuthAbstractSQLDao } from './mssql/abstract/auth.abstract.mssql';
import { UserAbsSQLDAO } from './mssql/abstract/user.abstract.mssql';
@Injectable()
export class DatabaseService {
	constructor(
		public authSqlTxn: AuthAbstractSQLDao,
		public userSqltxn: UserAbsSQLDAO
	) {}
}
