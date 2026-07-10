
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