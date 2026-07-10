import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Users } from './user.model';
import { Posts } from './post.model';

export const enum NotificationColumns {
  ID = 'ID',
  UserID = 'UserID',
  ActorUserID = 'ActorUserID',
  PostID = 'PostID',
  NotificationType = 'NotificationType',
  IsRead = 'IsRead',
  CreatedAt = 'CreatedAt',
}

@Table({ tableName: Tables.tbl_Notification, timestamps: false })
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [NotificationColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [NotificationColumns.UserID]!: string; // The user who receives the notification

  @ForeignKey(() => Users)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [NotificationColumns.ActorUserID]!: string; // The user who triggered the notification

  @ForeignKey(() => Posts)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: true })
  [NotificationColumns.PostID]?: string; // Optional, related to likes etc.

  @Column({ type: `${SQLDataType.VARCHAR}(255)`, allowNull: false })
  [NotificationColumns.NotificationType]!: string; // LIKE, FOLLOW, MESSAGE

  @Column({ type: SQLDataType.BIT, allowNull: false, defaultValue: false })
  [NotificationColumns.IsRead]!: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  [NotificationColumns.CreatedAt]!: Date;

  // ==========================================
  // Relationships
  // ==========================================

  @BelongsTo(() => Users, {
    foreignKey: 'UserID',
    targetKey: 'ID',
    as: 'User',
    onDelete: 'NO ACTION',
  })
  user!: Users;

  @BelongsTo(() => Users, {
    foreignKey: 'ActorUserID',
    targetKey: 'ID',
    as: 'Actor',
    onDelete: 'NO ACTION',
  })
  actor!: Users;

  @BelongsTo(() => Posts, {
    foreignKey: 'PostID',
    targetKey: 'ID',
    as: 'Post',
    onDelete: 'NO ACTION',
  })
  post?: Posts;
}
