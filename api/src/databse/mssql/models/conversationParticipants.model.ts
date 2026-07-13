import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/sql.enum';

import { Users } from './user.model';
import { Conversation } from './conversation.model';
import { UserColumns } from 'src/core/enums/user.enum';
import { ConversationParticipantRoles, CPAlias, CPColumns } from 'src/core/enums/chat.enum';


@Table({
  tableName: 'Conversation_Participants', // Ensure this string matches exactly if Tables.tbl_Conversation_Participants is different
  timestamps: false,
})
export class CP extends Model<CP> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [CPColumns.ID]!: string;

  @ForeignKey(() => Conversation)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [CPColumns.ConversationID]!: string;

  @ForeignKey(() => Users)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [CPColumns.UserID]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(20)`,
    allowNull: false,
    defaultValue: ConversationParticipantRoles.MEMBER,
  })
  [CPColumns.Role]!: ConversationParticipantRoles;

  // Explicitly set by application code on creation
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  [CPColumns.JoinedAt]!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [CPColumns.HistoryClearedAt]!: Date | null;

  @BelongsTo(() => Users, {
    foreignKey: CPColumns.UserID,
    targetKey: UserColumns.ID,
    as: CPAlias.User,
    onDelete: 'NO ACTION',
  })
  User!: Users;

  @BelongsTo(() => Conversation, {
    foreignKey: CPColumns.ConversationID,
    targetKey: 'ID', 
    as: CPAlias.Conversation,
    onDelete: 'CASCADE',
  })
  Conversation!: Conversation;
}