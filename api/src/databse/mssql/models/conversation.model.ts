import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Message } from './message.model';
import { Tables } from '../connection/tables.mssql';
import { ConversationColumns, conversationTypes } from 'src/core/enums/chat.enum';


@Table({
  tableName: Tables.tbl_Conversation,
  timestamps: false,
})
export class Conversation extends Model<Conversation> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  [ConversationColumns.ID]!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  [ConversationColumns.Title]!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'single',
    validate: {
      isIn: [[conversationTypes.SINGLE, conversationTypes.GROUP, conversationTypes.BROADCAST]],
    },
  })
  [ConversationColumns.Type]!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  [ConversationColumns.CreatedBy]!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  [ConversationColumns.CreatedAt]!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [ConversationColumns.ModifiedAt]!: Date;

  @HasMany(() => Message, {
    foreignKey: 'ConversationID',
    onDelete: 'CASCADE',
  })
  messages!: Message[];
}