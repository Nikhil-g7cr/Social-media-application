import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize'; // <-- Added this
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';

import { Users, UserColumns } from './user.model';
import { Conversation } from './conversation.model';

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

  // Let SQL handle the exact time they joined
  @Column({
    type: SQLDataType.DATETIME,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'),
  })
  [CPColumns.JoinedAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: CPColumns.UserID,
    targetKey: UserColumns.ID,
    as: CPAlias.User,
    onDelete: 'NO ACTION',
  })
  User!: Users;

  @BelongsTo(() => Conversation, {
    foreignKey: CPColumns.ConversationID,
    targetKey: 'ID', // <-- Fixed this to match the newly corrected Conversation model
    as: CPAlias.Conversation,
    onDelete: 'CASCADE',
  })
  Conversation!: Conversation;
}