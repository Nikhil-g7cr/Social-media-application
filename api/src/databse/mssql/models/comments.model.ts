import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Tables } from "../connection/tables.mssql";
import { SQLDataType } from "src/core/enums/data-type-sql.enum";
import { Sequelize } from "sequelize";

export const enum CommentsColumns {
    ID = "ID",
    PostID = "PostID",
    UserID = "UserID",
    ParentCommentID = "ParentCommentID",
    Content = "Content",
    CreatedAt = "CreatedAt",
    ModifiedAt = "ModifiedAt"
}

@Table({ tableName: Tables.tbl_Comment, timestamps: false })
export class Comments extends Model<Comments> {

    @PrimaryKey
    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    ID!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    PostID!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: false
    })
    UserID!: string;

    @Column({
        type: SQLDataType.UNIQUEIDENTIFIER,
        allowNull: true
    })
    ParentCommentID?: string;

    @Column({
        type: `${SQLDataType.VARCHAR}(2000)`,
        allowNull: false
    })
    Content!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("GETDATE()")
    })
    CreatedAt!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    ModifiedAt?: Date;
}