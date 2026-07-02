import { BelongsTo, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Users } from './user.model';

export const enum ReportColumns {
  ID = 'ID',
  ReporterID = 'ReporterID',
  TargetType = 'TargetType', // 'POST', 'COMMENT', 'USER', 'OTHER'
  TargetID = 'TargetID',
  Reason = 'Reason',
  Status = 'Status', // 'PENDING', 'RESOLVED', 'DISMISSED'
  CreatedAt = 'CreatedAt',
  ResolvedAt = 'ResolvedAt',
  ResolvedBy = 'ResolvedBy',
}

@Table({ tableName: Tables.tbl_Report, timestamps: false })
export class Reports extends Model<Reports> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [ReportColumns.ID]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [ReportColumns.ReporterID]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(50)`, allowNull: false })
  [ReportColumns.TargetType]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: true })
  [ReportColumns.TargetID]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: false })
  [ReportColumns.Reason]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(20)`, allowNull: false, defaultValue: 'PENDING' })
  [ReportColumns.Status]!: string;

  @Column({
    type: SQLDataType.DATETIME,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()')
  })
  [ReportColumns.CreatedAt]!: Date;

  @Column({ type: SQLDataType.DATETIME, allowNull: true })
  [ReportColumns.ResolvedAt]!: Date;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: true })
  [ReportColumns.ResolvedBy]!: string;

  @BelongsTo(() => Users, {
    foreignKey: ReportColumns.ReporterID,
    targetKey: 'ID',
    as: 'Reporter',
    onDelete: 'NO ACTION'
  })
  Reporter!: Users;

  @BelongsTo(() => Users, {
    foreignKey: ReportColumns.ResolvedBy,
    targetKey: 'ID',
    as: 'Resolver',
    onDelete: 'NO ACTION'
  })
  Resolver!: Users;
}
