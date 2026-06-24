import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Users } from './user.model';

export const enum FileDeleteRequestColumns {
  ID = 'ID',
  FileName = 'FileName',
  FileUrl = 'FileUrl',
  RequestReason = 'RequestReason',
  RequestedBy = 'RequestedBy',
  Status = 'Status',
  CreatedAt = 'CreatedAt',
  UpdatedAt = 'UpdatedAt',
}

export const enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: Tables.tbl_FileDeleteRequest,
  timestamps: false,
})
export class FileDeleteRequest extends Model<FileDeleteRequest> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  [FileDeleteRequestColumns.ID]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(255)`,
    allowNull: false,
  })
  [FileDeleteRequestColumns.FileName]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(1000)`,
    allowNull: false,
  })
  [FileDeleteRequestColumns.FileUrl]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(1000)`,
    allowNull: false,
  })
  [FileDeleteRequestColumns.RequestReason]!: string;

  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [FileDeleteRequestColumns.RequestedBy]!: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(50)`,
    allowNull: false,
    defaultValue: RequestStatus.PENDING,
  })
  [FileDeleteRequestColumns.Status]!: RequestStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [FileDeleteRequestColumns.CreatedAt]!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [FileDeleteRequestColumns.UpdatedAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: FileDeleteRequestColumns.RequestedBy,
    targetKey: 'ID',
    as: 'RequestedByUser',
  })
  RequestedByUser!: Users;
}
