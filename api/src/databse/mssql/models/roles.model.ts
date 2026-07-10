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
import { RolesColumns, RoleType } from 'src/core/enums/role.enum';


@Table({ tableName: Tables.tbl_Roles, timestamps: false })
export class Roles extends Model<Roles> {
  @PrimaryKey
  @Column({ type: SQLDataType.TINYINT, allowNull: false,})
  [RolesColumns.ID]!: number;

  @Unique
  @Column({ type: `${SQLDataType.VARCHAR}(100)`, allowNull: false })
  [RolesColumns.Name]!: RoleType;

  @Column({ type: `${SQLDataType.VARCHAR}(255)`, allowNull: true })
  [RolesColumns.Description]!: string;

  @HasMany(() => Users, { foreignKey: 'RoleID' })
  Users!: Users[];
}
