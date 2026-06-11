import { Injectable } from '@nestjs/common';
// import { AbstractAuthSqlDao } from './mssql/abstract/auth.abstract';
// import { UsersAbstractSqlDao } from './mssql/abstract/users.abstract';
@Injectable()
export class DatabaseService {
	constructor(
		// public authSqlTxn: AbstractAuthSqlDao,
		// public userSqltxn: UsersAbstractSqlDao
	) {}
}
