import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';

@Table({
  tableName: Tables.tbl_Hashtag,
  timestamps: false,
})
export class Hashtags extends Model<Hashtags> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  ID!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: false,
    unique: true,
  })
  Name!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: true,
    defaultValue: 'Trending',
  })
  Category?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
  })
  CreatedAt!: Date;
}
