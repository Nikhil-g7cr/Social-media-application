export enum Schema {
	Security = 'Security',
	Customers = 'Customers',
	Users = 'Users',
	Readonly = 'Readonly',
	Masters = 'Masters'
}

export class SchemaGrp {
	static readonly ALL_SCHEMAS: Schema[] = [Schema.Security];
}
