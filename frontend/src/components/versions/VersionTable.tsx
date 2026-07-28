import React from 'react';
import { VersionRecord } from '../../types/version';
import { Edit2, Eye, GitCommit, Info, RefreshCw, Trash2 } from 'lucide-react';

interface VersionTableProps {
  versions: VersionRecord[];
  isLoading: boolean;
  onView: (version: VersionRecord) => void;
  onEdit: (version: VersionRecord) => void;
  onToggleStatus: (version: VersionRecord) => void;
  togglingId: number | null;
}

export const VersionTable: React.FC<VersionTableProps> = ({
  versions,
  isLoading,
  onView,
  onEdit,
  onToggleStatus,
  togglingId,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderVersionInfoPreview = (info: unknown) => {
    if (info === null || info === undefined) return <span className="text-muted">None</span>;
    if (typeof info === 'string') {
      return <code className="code-snippet">{info.length > 35 ? info.slice(0, 35) + '...' : info}</code>;
    }
    try {
      const jsonStr = JSON.stringify(info);
      return (
        <code className="code-snippet" title={jsonStr}>
          {jsonStr.length > 35 ? jsonStr.slice(0, 35) + '...' : jsonStr}
        </code>
      );
    } catch {
      return <span className="text-muted">[Complex Data]</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="table-card">
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Fetching version records from server...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="table-card">
        <div className="table-empty-container">
          <GitCommit size={48} className="empty-icon" />
          <h3>No Version Records Found</h3>
          <p>No software release versions match your current filters or search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Version Type</th>
              <th>Version Number</th>
              <th>Title</th>
              <th>Version Info</th>
              <th>Status</th>
              <th>Created At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((item) => {
              const isInactive = !item.isActive;
              const isToggling = togglingId === item.id;

              return (
                <tr key={item.id} className={isInactive ? 'row-inactive' : ''}>
                  <td className="fw-medium">{item.projectName}</td>
                  <td>
                    <span className={`badge badge-type badge-${item.version}`}>
                      {item.version}
                    </span>
                  </td>
                  <td>
                    <span className="version-number-tag">{item.versionNumber}</span>
                  </td>
                  <td className="fw-semibold text-primary">{item.versionTitle}</td>
                  <td>{renderVersionInfoPreview(item.versionInfo)}</td>
                  <td>
                    {item.isActive ? (
                      <span className="status-badge status-active">
                        <span className="dot"></span> Active
                      </span>
                    ) : (
                      <span className="status-badge status-inactive">
                        <span className="dot"></span> Inactive / Soft Deleted
                      </span>
                    )}
                  </td>
                  <td className="text-muted text-sm">{formatDate(item.createdAt)}</td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      <button
                        className="btn-icon btn-icon-view"
                        onClick={() => onView(item)}
                        title="View Version Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-edit"
                        onClick={() => onEdit(item)}
                        title="Edit Version"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`btn-icon ${isInactive ? 'btn-icon-restore' : 'btn-icon-delete'}`}
                        onClick={() => onToggleStatus(item)}
                        disabled={isToggling}
                        title={isInactive ? 'Restore / Reactivate Record' : 'Soft Delete Record'}
                      >
                        {isToggling ? (
                          <RefreshCw size={16} className="spin" />
                        ) : isInactive ? (
                          <RefreshCw size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
