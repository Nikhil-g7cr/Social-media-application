import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Users } from './user.model';
import { Posts } from './post.model';

@Table({ tableName: Tables.tbl_Post_View, timestamps: false })
export class PostView extends Model<PostView> { // ✅ Explicit generic to bypass any Sequelize type overload errors
  @PrimaryKey
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  ID!: string;

  @ForeignKey(() => Posts)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  Post_id!: string; // Foreign key referencing the parent post

  @ForeignKey(() => Users)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: true })
  User_id?: string; // Nullable to easily support guest views

  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  Ip_address!: string; // Helps track unique views for non-logged-in users

  @Column({ type: SQLDataType.DATETIME, allowNull: false })
  Viewd_at!: Date; // Matches spelling in your database specification

  // ==========================================
  // Relationships
  // ==========================================

  @BelongsTo(() => Posts, {
    foreignKey: 'Post_id',
    targetKey: 'ID',
    as: 'Post',
    onDelete: 'CASCADE',
  })
  post!: Posts;

  @BelongsTo(() => Users, {
    foreignKey: 'User_id',
    targetKey: 'ID',
    as: 'User',
    onDelete: 'SET NULL',
  })
  user?: Users;
}