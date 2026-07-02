import { Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';
import { Posts } from './post.model';
import { Hashtags } from './hashtag.model';

@Table({
  tableName: Tables.tbl_PostHashtag,
  timestamps: false,
})
export class PostHashtags extends Model<PostHashtags> {
  @ForeignKey(() => Posts)
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  PostID!: string;

  @ForeignKey(() => Hashtags)
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  HashtagID!: string;
}
