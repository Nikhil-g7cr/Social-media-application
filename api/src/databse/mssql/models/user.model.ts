import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schemas.mssql';
import { BelongsTo, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Posts } from './post.model';
import { Comments } from './comments.model';
import { Likes } from './like.model';
import { UserRoles } from 'src/core/enums/user.enums';

export const enum UserColumns {
  ID = 'ID',
  FullName = 'FullName',
  UserName = 'UserName',
  EmailAddress = 'EmailAddress',
  PasswordHash = 'PasswordHash',
  ProfilePictureUrl = 'ProfilePictureUrl',
  Bio = 'Bio',
  Gender = 'Gender',
  Role = 'Role',
  IsActive = 'IsActive',
  CreatedBy = 'CreatedBy',
  CreatedAt = 'CreatedAt',
  ModifiedBy = 'ModifiedBy',
  ModifiedAt = 'ModifiedAt',
}

export const enum UserAlias {
  CreatedByUser = 'CreatedByUser',
  ModifiedByUser = 'ModifiedByUser',
  UserRoles = 'UserRoles'
}

export const enum UserRolesColumns {
	UserRolesGuid = 'UserRolesGuid',
	UserGuid = 'UserGuid',
	RoleId = 'RoleId',
	CreatedBy = 'CreatedBy',
	EffectiveFrom = 'EffectiveFrom',
	EffectiveTill = 'EffectiveTill',
	ModifiedBy = 'ModifiedBy'
}

export const enum RecordCreatedBy {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Table({
  tableName: Tables.tbl_User,
  timestamps: false,
})
class Users extends Model<Users> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [UserColumns.ID]!: string;

  @Column({
  type: `${SQLDataType.VARCHAR}(50)`,
  allowNull: false,
  unique: true,
})
[UserColumns.UserName]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(50)`,
    allowNull: false,
  })
  [UserColumns.FullName]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: false,
    unique: true,
  })
  [UserColumns.EmailAddress]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(255)`,
    allowNull: false,
  })
  [UserColumns.PasswordHash]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(1000)`,
    allowNull: true,
  })
  [UserColumns.ProfilePictureUrl]?: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(2000)`,
    allowNull: true,
  })
  [UserColumns.Bio]?: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(300)`,
    allowNull: true,
  })
  [UserColumns.Gender]?: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(20)`,
    allowNull: false,
    defaultValue: UserRoles.USER,
  })
  [UserColumns.Role]!: UserRoles;

  @Column({
    type: SQLDataType.BIT,
    allowNull: false,
    defaultValue: false,
  })
  [UserColumns.IsActive]!: boolean;

  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: true,
  })
  [UserColumns.CreatedBy]?: string;

  @Column({
    type: DataType.DATE
  })
  [UserColumns.CreatedAt]?: Date;

  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: true,
  })
  [UserColumns.ModifiedBy]?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [UserColumns.ModifiedAt]?: Date;

  @BelongsTo(() => Users, {
    foreignKey: UserColumns.CreatedBy,
    targetKey: UserColumns.ID,
    as: UserAlias.CreatedByUser,
    onDelete: 'NO ACTION',
  })
  CreatedByUser!: Users;

  @BelongsTo(() => Users, {
    foreignKey: UserColumns.ModifiedBy,
    targetKey: UserColumns.ID,
    as: UserAlias.ModifiedByUser,
    onDelete: 'NO ACTION',
  })
  ModifiedByUser!: Users;


  @HasMany(() => Posts, { foreignKey: 'UserID' })
  Posts!: Posts[];

  @HasMany(() => Comments, { foreignKey: 'UserID' })
  Comment!: Comments[];

  @HasMany(() => Likes, { foreignKey: 'UserID' })
  Likes!: Likes[];
}

export {Users};