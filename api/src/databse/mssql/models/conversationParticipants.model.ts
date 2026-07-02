import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';

import { Users, UserColumns } from './user.model';
import { Conversation } from './conversation.model';

export const enum CPColumns {
  ID = 'ID',
  ConversationID = 'ConversationID',
  UserID = 'UserID',
  Role = 'Role',
  JoinedAt = 'JoinedAt',
  HistoryClearedAt = 'HistoryClearedAt',
}

export const enum CPAlias {
  User = 'User',
  Conversation = 'Conversation',
}

export const enum ConversationParticipantRoles {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner', // Although only member and admin are in the check constraint, we'll keep owner if it's used elsewhere, but we'll use 'admin' instead of 'owner' for new chats.
}

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