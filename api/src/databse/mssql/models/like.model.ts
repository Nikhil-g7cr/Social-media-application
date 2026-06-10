import { BelongsTo, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Users } from './user.model';
import { Posts } from './post.model';

export const enum LikesColumns {
  ID = 'ID',
  USerID = 'USerID',
  PostsID = 'PostsID',
  CreatedBy = 'CreatedBy',
  CreatedAt = 'CreatedAt',
  ModifiedBy = 'ModifiedBy',
  ModifiedAt = 'ModifiedAt',
}

@Table({ tableName: Tables.tbl_Like, timestamps: false })
export class Likes extends Model<Likes> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.ID]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.USerID]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.PostsID]!: string;

  @Column({
    type: SQLDataType.DATETIME,
    allowNull: false,
  })
  [LikesColumns.CreatedAt]!: Date;

  @Column({
    type: SQLDataType.DATETIME,
    allowNull: true,
  })
  [LikesColumns.ModifiedAt]?: Date;

  
    @Column({type: SQLDataType.DATETIME,allowNull: false})
    [LikesColumns.CreatedBy]!: Date;
  
    @Column({type: SQLDataType.DATETIME,allowNull: true})
    [LikesColumns.ModifiedBy]?: Date;

    @BelongsTo(()=>Users,{
        foreignKey: LikesColumns.USerID,
        targetKey: 'ID',
        as: 'User',
        onDelete: 'NO ACTION'
    })
    User!: Users;

    @BelongsTo(()=>Posts,{
        foreignKey: LikesColumns.PostsID,
        targetKey: 'ID',
        as: 'Posts',
        onDelete: 'NO ACTION'
    })
    Post!: Posts;
}
