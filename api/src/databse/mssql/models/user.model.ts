import { Tables } from '../connection/tables.mssql';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/sql.enum';
import { Posts } from './post.model';
import { Comments } from './comments.model';
import { Likes } from './like.model';
import { UserAlias, UserColumns, UserRoles } from '../../../core/enums/user.enum';
import { Follow } from './follow.model';
import { RefreshToken } from './refreshToken.model';
import { Roles } from './roles.model';
import { RolesColumns } from 'src/core/enums/auth.enum';



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
    type: `${SQLDataType.NVARCHAR}(500)`,
    allowNull: true,
  })
  [UserColumns.Bio]?: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(300)`,
    allowNull: true,
  })
  [UserColumns.Gender]?: string;

  @ForeignKey(() => Roles)
  @Column({
    type: SQLDataType.TINYINT,
    allowNull: false,
  })
  [UserColumns.RoleID]!: number;

  @Column({
    type: SQLDataType.BIT,
    allowNull: false,
    defaultValue: false,
  })
  [UserColumns.IsActive]!: boolean;

  @Column({
    type: SQLDataType.BIT,
    allowNull: false,
    defaultValue: false,
  })
  [UserColumns.IsDeleted]!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [UserColumns.DeletedAt]?: Date | null;

  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: true,
  })
  [UserColumns.CreatedBy]?: string;

  @Column({
    type: DataType.DATE,
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

  @BelongsTo(() => Roles, {
    foreignKey: UserColumns.RoleID,
    targetKey: RolesColumns.ID,
    as: 'Role',
  })
  Role?: Roles;

  @HasMany(() => Posts, { foreignKey: 'UserID' })
  Posts!: Posts[];

  @HasMany(() => Comments, { foreignKey: 'UserID' })
  Comment!: Comments[];

  @HasMany(() => Likes, { foreignKey: 'UserID' })
  Likes!: Likes[];

  @HasMany(() => Follow, { foreignKey: 'FollowingID', as: 'Followers' })
  Followers!: Follow[];

  @HasMany(() => Follow, { foreignKey: 'FollowerID', as: 'Following' })
  Following!: Follow[];

  // Import RefreshToken at the top of the file
  @HasMany(() => RefreshToken, { foreignKey: 'UserID' })
  RefreshTokens!: RefreshToken[];
}

export { Users };
