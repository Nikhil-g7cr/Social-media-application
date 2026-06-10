import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';

import { Users, UserColumns } from './user.model';
import { Conversation } from './conversation.model';
// import { Conversations, ConversationColumns } from './conversation.model';

export const enum CPColumns {
  ID = 'ID',
  ConversationID = 'ConversationID',
  UserID = 'UserID',
  Role = 'Role',
  JoinedAt = 'JoinedAt',
}

export const enum CPAlias {
  User = 'User',
  Conversation = 'Conversation',
}

export const enum ConversationParticipantRoles {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

@Table({
  tableName: Tables.tbl_Conversation_Participants,
  timestamps: false,
})
export class CP extends Model<CP> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [CPColumns.ID]!: string;

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

  @Column({
    type: SQLDataType.DATETIME,
    allowNull: false,
  })
  [CPColumns.JoinedAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: CPColumns.UserID,
    targetKey: UserColumns.ID,
    as: CPAlias.User,
    onDelete: 'NO ACTION',
  })
  User!: Users;

  // Uncomment this after creating the Conversation model
  @ForeignKey(() => Conversation)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [CPColumns.ConversationID]!: string;

  @BelongsTo(() => Conversation, {
    foreignKey: CPColumns.ConversationID,
    targetKey: 'ConversationId', // Note: your Conversation model uses 'ConversationId'
    as: CPAlias.Conversation,
    onDelete: 'CASCADE',
  })
  Conversation!: Conversation;
}
