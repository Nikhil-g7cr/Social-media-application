import React, { useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Modal,
  Input,
  Spin,
  message,
  Tag,
  Table,
  Tooltip,
  Badge,
  Empty,
  Divider,
} from 'antd';
import type { TabsProps, TableColumnsType } from 'antd';
import {
  MdDelete,
  MdDescription,
  MdDownload,
  MdOutlineArticle,
  MdErrorOutline,
  MdSearch,
} from 'react-icons/md';
import { VscFileSubmodule } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import {
  useGetFilesQuery,
  useDeleteFileMutation,
  useCreateFileRequestMutation,
  useGetLogFilesQuery,
  useLazyGetLogFileContentQuery,
} from '../../redux/features/gallery/galleryApiSlice';
import type { LogFileItem } from '../../redux/features/gallery/galleryApiSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Meta } = Card;

interface FileItem {
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdOn: string;
}

// ─── Level → color / label mapping ────────────────────────────────────────────
const LOG_LEVEL_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  error:   { color: '#ff4d4f', bg: '#fff1f0', label: 'ERROR' },
  warn:    { color: '#fa8c16', bg: '#fff7e6', label: 'WARN' },
  info:    { color: '#52c41a', bg: '#f6ffed', label: 'INFO' },
  http:    { color: '#1677ff', bg: '#e6f4ff', label: 'HTTP' },
  verbose: { color: '#722ed1', bg: '#f9f0ff', label: 'VERBOSE' },
  debug:   { color: '#13c2c2', bg: '#e6fffb', label: 'DEBUG' },
  silly:   { color: '#8c8c8c', bg: '#fafafa', label: 'SILLY' },
  unknown: { color: '#8c8c8c', bg: '#fafafa', label: '???' },
};

function getLevelConfig(level: string) {
  return LOG_LEVEL_CONFIG[level?.toLowerCase()] ?? LOG_LEVEL_CONFIG.unknown;
}

// ─── Component ────────────────────────────────────────────────────────────────

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  // Delete Request Modal state (For Manager/User)
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Hard Delete Modal state (For Admin)
  const [openAdminDeleteModal, setOpenAdminDeleteModal] = useState(false);
  const [adminDeleteConfirmText, setAdminDeleteConfirmText] = useState('');

  // Log Preview Modal state
  const [logPreviewOpen, setLogPreviewOpen] = useState(false);
  const [logPreviewTitle, setLogPreviewTitle] = useState('');
  const [logSearchText, setLogSearchText] = useState('');
  const [previewBlobPath, setPreviewBlobPath] = useState<string | null>(null);

  // RTK Query Hooks — media
  const { data: files = [], isLoading, isFetching } = useGetFilesQuery();
  const [deleteFile] = useDeleteFileMutation();
  const [createFileRequest, { isLoading: isSubmitting }] = useCreateFileRequestMutation();

  // RTK Query Hooks — logs
  const {
    data: logFiles = [],
    isLoading: isLogLoading,
    isFetching: isLogFetching,
  } = useGetLogFilesQuery();
  const [fetchLogContent, { data: logEntries = [], isFetching: isContentFetching }] =
    useLazyGetLogFileContentQuery();

  // Snackbar state
  const [messageApi, contextHolder] = message.useMessage();

  // Get user role from Redux
  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'USER';

  // ─── Media handlers ────────────────────────────────────────────────────────

  const handleFilterChange = (key: string) => {
    setFilter(key);
  };

  const filteredFiles = files.filter((file: FileItem) => {
    if (filter === 'ALL') return true;
    if (filter === 'IMAGES') return file.contentType?.startsWith('image/');
    if (filter === 'VIDEOS') return file.contentType?.startsWith('video/');
    if (filter === 'DOCUMENTS')
      return (
        !file.contentType?.startsWith('image/') &&
        !file.contentType?.startsWith('video/')
      );
    return true;
  });

  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file);
    if (userRole === 'ADMIN') {
      setAdminDeleteConfirmText('');
      setOpenAdminDeleteModal(true);
    } else {
      setOpenDeleteModal(true);
    }
  };

  const handleDeleteFileDirectly = async (url: string) => {
    try {
      await deleteFile(url).unwrap();
      messageApi.success('File deleted successfully');
      setOpenAdminDeleteModal(false);
    } catch (error) {
      messageApi.error('Failed to delete file');
    }
  };

  const submitDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      messageApi.error('Reason is required');
      return;
    }
    try {
      await createFileRequest({
        fileName: selectedFile?.name,
        fileUrl: selectedFile?.url,
        reason: deleteReason,
      }).unwrap();
      messageApi.success('Delete request submitted successfully');
      setOpenDeleteModal(false);
      setDeleteReason('');
    } catch (error) {
      messageApi.error('Failed to submit delete request');
    }
  };

  const isImage = (type: string) => type?.startsWith('image/');
  const isVideo = (type: string) => type?.startsWith('video/');

  // ─── Log handlers ──────────────────────────────────────────────────────────

  const handleLogPreview = (logFile: LogFileItem) => {
    setPreviewBlobPath(logFile.name);
    setLogPreviewTitle(
      `${logFile.type === 'error-log' ? '🔴 Error Log' : '🟢 App Log'} — ${logFile.displayName}`,
    );
    setLogSearchText('');
    setLogPreviewOpen(true);
    fetchLogContent(logFile.name);
  };

  const filteredLogEntries = logEntries.filter((entry) => {
    if (!logSearchText.trim()) return true;
    const search = logSearchText.toLowerCase();
    const msgStr =
      typeof entry.message === 'object' && entry.message !== null
        ? JSON.stringify(entry.message)
        : String(entry.message ?? '');
    const rawStr =
      typeof entry.raw === 'object' && entry.raw !== null
        ? JSON.stringify(entry.raw)
        : String(entry.raw ?? '');
    const levelStr = String(entry.level ?? '');
    return (
      msgStr.toLowerCase().includes(search) ||
      levelStr.toLowerCase().includes(search) ||
      rawStr.toLowerCase().includes(search)
    );
  });

  // ─── Tab Items ─────────────────────────────────────────────────────────────

  const tabItems: TabsProps['items'] = [
    { key: 'ALL', label: 'All Files' },
    { key: 'IMAGES', label: 'Images' },
    { key: 'VIDEOS', label: 'Videos' },
    { key: 'DOCUMENTS', label: 'Documents / Other' },
    {
      key: 'LOGS',
      label: (
        <span>
          Logs{' '}
          <Badge
            count={logFiles.length}
            size="small"
            style={{ backgroundColor: '#1677ff', marginLeft: 4 }}
          />
        </span>
      ),
    },
  ];

  // ─── Log File Table Columns ────────────────────────────────────────────────

  const logTableColumns: TableColumnsType<LogFileItem> = [
    {
      title: 'Type',
      dataIndex: 'type',
      width: 110,
      render: (type: string) =>
        type === 'error-log' ? (
          <Tag color="red" icon={<MdErrorOutline style={{ marginRight: 4 }} />}>
            Error Log
          </Tag>
        ) : (
          <Tag color="green" icon={<MdOutlineArticle style={{ marginRight: 4 }} />}>
            App Log
          </Tag>
        ),
      filters: [
        { text: 'App Log', value: 'app-log' },
        { text: 'Error Log', value: 'error-log' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'File Name',
      dataIndex: 'displayName',
      render: (name: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{name}</span>
      ),
    },
    {
      title: 'Full Path',
      dataIndex: 'name',
      render: (name: string) => (
        <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
      render: (size?: number) =>
        size != null ? (
          <Text type="secondary">{(size / 1024).toFixed(1)} KB</Text>
        ) : (
          '—'
        ),
      sorter: (a, b) => (a.size ?? 0) - (b.size ?? 0),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      width: 180,
      render: (date?: string) =>
        date ? (
          <Text type="secondary">{new Date(date).toLocaleString()}</Text>
        ) : (
          '—'
        ),
      sorter: (a, b) =>
        new Date(a.lastModified ?? 0).getTime() -
        new Date(b.lastModified ?? 0).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      width: 160,
      render: (_, record: LogFileItem) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            type="primary"
            icon={<VscFileSubmodule />}
            onClick={() => handleLogPreview(record)}
          >
            Preview
          </Button>
          <Tooltip title="Download raw log file">
            <Button
              size="small"
              icon={<MdDownload />}
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ─── Log Entry Table Columns ───────────────────────────────────────────────

  const logEntryColumns: TableColumnsType<any> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 185,
      render: (ts?: any) => {
        if (!ts) return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
        const tsStr = typeof ts === 'object' ? JSON.stringify(ts) : String(ts);
        return (
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#595959' }}>
            {tsStr}
          </Text>
        );
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      width: 90,
      filters: Object.keys(LOG_LEVEL_CONFIG).map((k) => ({
        text: k.toUpperCase(),
        value: k,
      })),
      onFilter: (value, record) => String(record.level || '').toLowerCase() === value,
      render: (level?: any) => {
        const levelStr =
          typeof level === 'object' && level !== null
            ? JSON.stringify(level)
            : String(level || 'unknown');
        const cfg = getLevelConfig(levelStr);
        return (
          <Tag
            style={{
              color: cfg.color,
              backgroundColor: cfg.bg,
              borderColor: cfg.color,
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      render: (msg?: any, record?: any) => {
        const content =
          msg !== undefined && msg !== null ? msg : record?.raw ?? '—';
        const text =
          typeof content === 'object'
            ? JSON.stringify(content, null, 2)
            : String(content);

        return (
          <div>
            <Text
              style={{
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {text}
            </Text>
            {record?.stack && (
              <pre
                style={{
                  marginTop: 6,
                  padding: 8,
                  backgroundColor: '#fff1f0',
                  border: '1px solid #ffa39e',
                  borderRadius: 4,
                  fontSize: 11,
                  color: '#cf1322',
                  overflowX: 'auto',
                  maxHeight: 200,
                }}
              >
                {typeof record.stack === 'object'
                  ? JSON.stringify(record.stack, null, 2)
                  : String(record.stack)}
              </pre>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 80,
      render: (status?: any) => {
        if (status === undefined || status === null) return null;
        const isNum = typeof status === 'number';
        const statusText =
          typeof status === 'object' ? JSON.stringify(status) : String(status);
        return (
          <Tag
            color={
              isNum && status >= 500
                ? 'red'
                : isNum && status >= 400
                  ? 'orange'
                  : 'green'
            }
          >
            {statusText}
          </Tag>
        );
      },
    },
    {
      title: 'SID',
      dataIndex: 'sid',
      width: 80,
      render: (sid?: any) => {
        if (sid === undefined || sid === null) return null;
        const sidStr =
          typeof sid === 'object' && sid !== null
            ? JSON.stringify(sid)
            : String(sid || '');
        return sidStr ? (
          <Tooltip title={sidStr}>
            <Text copyable style={{ fontSize: 11, fontFamily: 'monospace' }}>
              {sidStr.slice(0, 8)}…
            </Text>
          </Tooltip>
        ) : null;
      },
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 16 }}>
        Gallery
      </Title>

      <div style={{ marginBottom: 24 }}>
        <Tabs activeKey={filter} onChange={handleFilterChange} items={tabItems} />
      </div>

      {/* ── Media Tabs ───────────────────────────────────────────────────── */}
      {filter !== 'LOGS' && (
        <>
          {isLoading || isFetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {filteredFiles.map((file: FileItem, index: number) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card
                    hoverable
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    styles={{ body: { flexGrow: 1 } }}
                    cover={
                      isImage(file.contentType) ? (
                        <img
                          alt={file.name}
                          src={file.url}
                          style={{ height: 140, objectFit: 'cover' }}
                        />
                      ) : isVideo(file.contentType) ? (
                        <video
                          height={140}
                          src={file.url}
                          controls
                          style={{ objectFit: 'cover', width: '100%' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                          }}
                        >
                          <MdDescription style={{ fontSize: 60, color: '#bfbfbf' }} />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preview
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<MdDelete />}
                        onClick={() => handleDeleteClick(file)}
                      />,
                    ]}
                  >
                    <Meta
                      title={<span title={file.name}>{file.name.split('/').pop()}</span>}
                      description={
                        <div>
                          <Text type="secondary" style={{ display: 'block' }}>
                            {file.contentType || 'Unknown type'}
                          </Text>
                          <Text type="secondary" style={{ display: 'block' }}>
                            {(file.size / 1024).toFixed(2)} KB
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
              {filteredFiles.length === 0 && (
                <Col span={24}>
                  <Empty description="No files found." />
                </Col>
              )}
            </Row>
          )}
        </>
      )}

      {/* ── Logs Tab ─────────────────────────────────────────────────────── */}
      {filter === 'LOGS' && (
        <>
          {isLogLoading || isLogFetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                <Badge
                  count={logFiles.filter((f) => f.type === 'app-log').length}
                  style={{ backgroundColor: '#52c41a' }}
                >
                  <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>
                    App Logs
                  </Tag>
                </Badge>
                <Badge
                  count={logFiles.filter((f) => f.type === 'error-log').length}
                  style={{ backgroundColor: '#ff4d4f' }}
                >
                  <Tag color="red" style={{ fontSize: 13, padding: '4px 10px' }}>
                    Error Logs
                  </Tag>
                </Badge>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Container: <code>tomo-logs</code> &nbsp;|&nbsp; Paths:{' '}
                  <code>app-logs/TOMO-*.log</code> &amp; <code>errors/TOMO-*.log</code>
                </Text>
              </div>

              <Table<LogFileItem>
                dataSource={logFiles}
                columns={logTableColumns}
                rowKey="name"
                size="middle"
                pagination={{ pageSize: 20 }}
                locale={{ emptyText: <Empty description="No log files found in the blob container." /> }}
              />
            </>
          )}
        </>
      )}

      {/* ── Admin Hard Delete Modal ──────────────────────────────────────── */}
      <Modal
        title="Permanently Delete File"
        open={openAdminDeleteModal}
        onCancel={() => setOpenAdminDeleteModal(false)}
        footer={[
          <Button key="back" onClick={() => setOpenAdminDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            disabled={adminDeleteConfirmText !== 'delete'}
            onClick={() => selectedFile && handleDeleteFileDirectly(selectedFile.url)}
          >
            Permanently Delete
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            Are you sure you want to permanently delete the file{' '}
            <strong>{selectedFile?.name.split('/').pop()}</strong>?
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              This action cannot be undone. Please type <strong>delete</strong> to confirm.
            </Text>
          </div>
        </div>
        <Input
          autoFocus
          placeholder="Type 'delete' to confirm"
          value={adminDeleteConfirmText}
          onChange={(e) => setAdminDeleteConfirmText(e.target.value)}
        />
      </Modal>

      {/* ── Request File Deletion Modal ──────────────────────────────────── */}
      <Modal
        title="Request File Deletion"
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        footer={[
          <Button key="back" onClick={() => setOpenDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isSubmitting}
            disabled={!deleteReason.trim()}
            onClick={submitDeleteRequest}
          >
            Submit Request
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>File: {selectedFile?.name.split('/').pop()}</Text>
        </div>
        <TextArea
          autoFocus
          placeholder="Reason for deletion"
          rows={4}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>

      {/* ── Log File Preview Modal ───────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VscFileSubmodule style={{ fontSize: 18, color: '#1677ff' }} />
            <span style={{ fontSize: 14 }}>{logPreviewTitle}</span>
          </div>
        }
        open={logPreviewOpen}
        onCancel={() => {
          setLogPreviewOpen(false);
          setPreviewBlobPath(null);
        }}
        footer={[
          <Button key="close" onClick={() => setLogPreviewOpen(false)}>
            Close
          </Button>,
        ]}
        width="85vw"
        style={{ top: 24 }}
        styles={{ body: { padding: '12px 16px', maxHeight: '75vh', overflowY: 'auto' } }}
      >
        {/* Search bar */}
        <div style={{ marginBottom: 12 }}>
          <Input
            prefix={<MdSearch />}
            placeholder="Filter by message, level…"
            value={logSearchText}
            onChange={(e) => setLogSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Divider style={{ margin: '8px 0 12px' }} />

        {isContentFetching ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" description="Loading log entries…" />
          </div>
        ) : filteredLogEntries.length === 0 ? (
          <Empty description="No log entries match your search." />
        ) : (
          <>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
              Showing {filteredLogEntries.length} of {logEntries.length} entries (last 500 from file)
            </Text>
            <Table
              dataSource={filteredLogEntries}
              columns={logEntryColumns}
              rowKey={(record: any, idx?: number) => record._id || String(idx)}
              size="small"
              pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['25', '50', '100'] }}
              scroll={{ x: 900 }}
              rowClassName={(record) => {
                const level = record.level?.toLowerCase();
                if (level === 'error') return 'log-row-error';
                if (level === 'warn') return 'log-row-warn';
                return '';
              }}
              style={{ fontSize: 12 }}
            />
          </>
        )}
      </Modal>

      {/* Inline styles for log row highlighting */}
      <style>{`
        .log-row-error td { background: #fff1f0 !important; }
        .log-row-warn td { background: #fff7e6 !important; }
      `}</style>
    </div>
  );
};

export default GalleryPage;
