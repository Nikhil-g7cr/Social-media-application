import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { Message } from './message.model';

export const enum ConversationColumns {
  ID = 'ID',
  Title = 'title', // Changed to match lowercase SQL 'title'
  Type = 'type',   // Changed to match lowercase SQL 'type'
  CreatedAt = 'CreatedAt',
  // Removed CreatedBy and ModifiedAt because they are not in the SQL table
}

@Table({
  tableName: 'Conversation', // Changed from 'tbl_Conversation' to match SQL exactly
  timestamps: false,
})
export class Conversation extends Model<Conversation> {
  @Column({ type: DataType.UUID, primaryKey: true })
  [ConversationColumns.ID]!: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  [ConversationColumns.Title]!: string;

  @Column({ 
    type: DataType.STRING(20), 
    allowNull: false, 
    defaultValue: 'single',
    validate: { isIn: [['single', 'group', 'broadcast']] }
  })
  [ConversationColumns.Type]!: string;

  // Let SQL handle the exact time the conversation was created
  @Column({ 
    type: DataType.DATE, 
    allowNull: false, 
    defaultValue: Sequelize.literal('GETDATE()') 
  })
  [ConversationColumns.CreatedAt]!: Date;

  // Relationships
  @HasMany(() => Message, { onDelete: 'CASCADE' })
  messages!: Message[];
}