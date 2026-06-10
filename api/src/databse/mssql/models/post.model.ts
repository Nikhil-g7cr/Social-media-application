import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';
import { Users } from './user.model';

export const enum PostsColumns {
  ID = 'ID',
  UserID = 'UserID',
  Type = 'Type',
  Content = 'Content',
  MediaURL = 'MediaURL',
  CreatedBy = 'CreatedBy',
  CreatedAt = 'CreatedAt',
  ModifiedBy = 'ModifiedBy',
  ModifiedAt = 'ModifiedAt',
}

export const enum PostsAlias {
	User = 'User'
}

export const enum PostTypes {
	TEXT = 'TEXT',
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO'
}

@Table({
	tableName: Tables.tbl_Post,
	timestamps: false
})
class Posts extends Model<Posts> {
	@PrimaryKey
	@Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
	[PostsColumns.ID]!: string;

	@Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
	[PostsColumns.UserID]!: string;

	@Column({
		type: `${SQLDataType.VARCHAR}(20)`,
		allowNull: false
	})
	[PostsColumns.Type]!: PostTypes;

	@Column({
		type: `${SQLDataType.VARCHAR}(3000)`,
		allowNull: true
	})
	[PostsColumns.Content]?: string;

	@Column({
		type: `${SQLDataType.VARCHAR}(1000)`,
		allowNull: true
	})
	[PostsColumns.MediaURL]?: string;

	@Column({
		type: SQLDataType.DATETIME,
		allowNull: false
	})
	[PostsColumns.CreatedAt]!: Date;

	@Column({
		type: SQLDataType.DATETIME,
		allowNull: true
	})
	[PostsColumns.ModifiedAt]?: Date;

	@BelongsTo(() => Users, {
		foreignKey: PostsColumns.UserID,
		targetKey: 'ID',
		as: PostsAlias.User,
		onDelete: 'NO ACTION'
	})
	User!: Users;
}

export { Posts };
