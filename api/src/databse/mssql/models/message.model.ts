import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Users } from './user.model';
import { Conversation } from './conversation.model';
import { MessageAttachment } from './messageAttachment.model';
import { MessageColumns } from 'src/core/enums/message.enum';



@Table({ tableName: Tables.tbl_Message, timestamps: false })
export class Message extends Model<Message> {
  // ✅ Explicit generic parameter to prevent overload errors
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [MessageColumns.ID]!: string;

  @ForeignKey(() => Conversation)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [MessageColumns.ConversationID]!: string;

  @ForeignKey(() => Users)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [MessageColumns.SenderID]!: string;

  @Column({ type: `${SQLDataType.NVARCHAR}(4000)`, allowNull: true })
  [MessageColumns.Message]?: string;

  @Column({ type: SQLDataType.BIT, allowNull: false, defaultValue: false })
  [MessageColumns.IsRead]!: boolean; // Maps to your 'bit' data type with a default of 0

  @Column({ type: DataType.DATE, allowNull: false })
  [MessageColumns.CreatedAt]!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  [MessageColumns.ModifiedAt]!: Date;

  // ==========================================
  // Relationships
  // ==========================================

  @BelongsTo(() => Conversation, {
    foreignKey: 'ConversationID',
    targetKey: 'ID', // Links up directly to ConversationId inside conversation.model.ts
    as: 'Conversation',
    onDelete: 'CASCADE',
  })
  conversation!: Conversation;

  @BelongsTo(() => Users, {
    foreignKey: 'SenderID',
    targetKey: 'ID', // Links up directly to ID inside user.model.ts
    as: 'Sender',
    onDelete: 'NO ACTION',
  })
  sender!: Users;

  @HasMany(() => MessageAttachment, {
    foreignKey: 'Message_id',
    sourceKey: 'ID',
    as: 'attachments',
  })
  attachments!: MessageAttachment[];
}
