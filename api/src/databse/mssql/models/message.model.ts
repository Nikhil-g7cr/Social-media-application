import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Users } from './user.model';
import { Conversation } from './conversation.model';

@Table({ tableName: Tables.tbl_Message, timestamps: false })
export class Message extends Model<Message> { // ✅ Explicit generic parameter to prevent overload errors
  @PrimaryKey
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  ID!: string;

  @ForeignKey(() => Conversation)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  ConversationID!: string;

  @ForeignKey(() => Users)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  SenderID!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(4000)`, allowNull: true })
  Message?: string;

  @Column({ type: SQLDataType.BIT, allowNull: false, defaultValue: false })
  IsRead!: boolean; // Maps to your 'bit' data type with a default of 0

  @Column({ type: SQLDataType.DATETIME, allowNull: false })
  CreatedAt!: Date;

  @Column({ type: SQLDataType.DATETIME, allowNull: false })
  modefiedAt!: Date; // ✅ Kept the 'modefiedAt' spelling consistent with your Comments model typo

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
}