import {
  Column,
  Model,
  PrimaryKey,
  Table,
  HasMany,
  Unique,
  IsIn,
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Users } from './user.model';

export const enum RoleType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export const enum RolesColumns {
  ID = 'ID',
  Name = 'Name',
  Description = 'Description',
}

@Table({ tableName: Tables.tbl_Roles, timestamps: false })
export class Roles extends Model<Roles> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [RolesColumns.ID]!: string;

  @Unique
  @Column({ type: `${SQLDataType.VARCHAR}(100)`, allowNull: false })
  [RolesColumns.Name]!: RoleType;

  @Column({ type: `${SQLDataType.VARCHAR}(255)`, allowNull: true })
  [RolesColumns.Description]!: string;

  @HasMany(() => Users, { foreignKey: 'RoleID' })
  Users!: Users[];
}
