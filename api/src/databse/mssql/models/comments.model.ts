import { BelongsTo, Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Tables } from "../connection/tables.mssql";
import { SQLDataType } from "../../../core/enums/sql.enum";
import { Sequelize } from "sequelize";
import { Users } from "./user.model";
import { CommentsColumns } from "src/core/enums/comment.enum";

@Table({ tableName: Tables.tbl_Comment, timestamps: false })
export class Comments extends Model<Comments> {

    @PrimaryKey
    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    [CommentsColumns.ID]!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    [CommentsColumns.PostID]!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    [CommentsColumns.UserID]!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: true
    })
    [CommentsColumns.ParentCommentID]?: string;

    @Column({
        type: `${SQLDataType.VARCHAR}(2000)`,
        allowNull: false
    })
    [CommentsColumns.Content]!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("GETDATE()")
    })
    [CommentsColumns.CreatedAt]!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    [CommentsColumns.ModifiedAt]?: Date;

    @BelongsTo(() => Users, {
        foreignKey: CommentsColumns.UserID,
        targetKey: 'ID',
        as: 'User'
    })
    User!: Users;
}