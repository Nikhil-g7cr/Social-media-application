import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/sql.enum';
import { Tables } from '../connection/tables.mssql';

export const enum HashtagsColumns {
  ID = 'ID',
  Name = 'Name',
  Category = 'Category',
  CreatedAt = 'CreatedAt',
}

@Table({
  tableName: Tables.tbl_Hashtag,
  timestamps: false,
})
export class Hashtags extends Model<Hashtags> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [HashtagsColumns.ID]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: false,
    unique: true,
  })
  [HashtagsColumns.Name]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: true,
    defaultValue: 'Trending',
  })
  [HashtagsColumns.Category]?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
  })
  [HashtagsColumns.CreatedAt]!: Date;
}
