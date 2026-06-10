import { BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Tables } from "../connection/tables.mssql";
import { SQLDataType } from "src/core/enums/data-type-sql.enum";
import { Users } from "./user.model";
import { Posts } from "./post.model";

export const enum CommentsColumns{
    ID="ID",
    PostID="PostID",
    UserID="USerID",
    comments = "comments",
    createdAt = "createdAt",
    modefiedAt= "modefiedAt"
} 

@Table({tableName:Tables.tbl_Comment, timestamps:false})

export class Comments extends Model{
    @PrimaryKey
    @Column({type:SQLDataType.UNIQUEIDENTIFIER, allowNull:false})
    [CommentsColumns.ID]!:string;

    @Column({type:SQLDataType.UNIQUEIDENTIFIER, allowNull:false})
    [CommentsColumns.PostID]!:string
    
    @Column({type:SQLDataType.UNIQUEIDENTIFIER, allowNull:false})
    [CommentsColumns.UserID]!:string
    
    @Column({type:`${SQLDataType.VARCHAR}(2000)`, allowNull:false})
    [CommentsColumns.comments]!:string

     @Column({type: SQLDataType.DATETIME,allowNull: false})
    [CommentsColumns.createdAt]!: Date;
    
    @Column({type: SQLDataType.DATETIME,allowNull: true})
    [CommentsColumns.modefiedAt]?: Date;

    @BelongsTo(()=>Users,{
        foreignKey: CommentsColumns.UserID,
        targetKey: 'ID',
        as: 'User',
        onDelete: 'NO ACTION'
    })
    User!: Users;

    @BelongsTo(()=>Posts,{
        foreignKey: CommentsColumns.PostID,
        targetKey: 'ID',
        as: 'Posts',
        onDelete: 'NO ACTION'
    })
    Post!: Posts;

    
    

}