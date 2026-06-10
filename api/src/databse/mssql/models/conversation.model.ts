import { Table, Column, Model, DataType, HasMany, CreatedAt } from 'sequelize-typescript';
import { Message } from 'src/modules/message/entities/message.entity';

@Table({
  tableName: 'Conversations',
  timestamps: false, // Disabling default timestamps so we can manage customized DATETIME2 columns
})
export class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  ConversationId: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'single',
    validate: {
      isIn: [['single', 'group', 'broadcast']], // Emulates the CHECK constraint at runtime
    },
  })
  chat_type: 'single' | 'group' | 'broadcast';

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  title: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW, // Maps to GETDATE() or current time in MS SQL
  })
  created_at: Date;

  // Relationships
  @HasMany(() => Message, { onDelete: 'CASCADE' })
  messages: Message[];
}