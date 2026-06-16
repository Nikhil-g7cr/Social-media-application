import { BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';
import { Users } from './user.model';
import { Comments } from './comments.model';
import { Likes } from './like.model';

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

export enum PostTypes {
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
	@Default(DataType.UUIDV4)
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

	// @Default(DataType.NOW)
	@Column({
		type: DataType.DATE,
		allowNull: true
	})
	[PostsColumns.CreatedAt]!: Date;

	@Column({
		type: DataType.DATE,
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


	// Inside the Posts class:
	@HasMany(() => Comments, { foreignKey: 'PostID' })

	Comments!: Comments[];

	@HasMany(() => Likes, { foreignKey: 'PostsID' }) // Use whatever exact string your Likes model uses
	Likes!: Likes[];


}

export { Posts };
