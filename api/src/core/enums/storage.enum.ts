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
