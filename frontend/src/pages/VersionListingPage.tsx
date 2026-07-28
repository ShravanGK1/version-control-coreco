import React, { useCallback, useEffect, useState } from 'react';
import {
  Pagination as PaginationType,
  VersionFilters,
  VersionRecord,
} from '../types/version';
import { versionService } from '../services/versionService';
import { VersionFiltersBar } from '../components/versions/VersionFilters';
import { VersionTable } from '../components/versions/VersionTable';
import { PaginationControls } from '../components/versions/Pagination';
import { ModalMode, VersionModal } from '../components/versions/VersionModal';
import { AlertTriangle, CheckCircle2, GitBranch, Layers, Plus, RefreshCw, Trash2 } from 'lucide-react';

export const VersionListingPage: React.FC = () => {
  // Version records & list state
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<VersionFilters>({
    search: '',
    projectId: undefined,
    versionType: undefined,
    startDate: '',
    endDate: '',
    showDeleted: false,
    page: 1,
    limit: 10,
  });

  // Pagination State
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);

  // Status Toggling State
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Confirmation Modal State
  const [confirmToggleTarget, setConfirmToggleTarget] = useState<VersionRecord | null>(null);

  // Fetch Versions from GET /versions
  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await versionService.getVersions(filters);
      setVersions(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch versions:', err);
      const msg = err.response?.data?.message || err.message || 'Error loading release version records from API.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Handle filter changes (Resets page to 1 whenever filters change)
  const handleFilterChange = (newFilters: Partial<VersionFilters>) => {
    setFilters((prev) => {
      // Check if non-pagination filter changed
      const isSearchChanged = 'search' in newFilters && newFilters.search !== prev.search;
      const isProjectChanged = 'projectId' in newFilters && newFilters.projectId !== prev.projectId;
      const isTypeChanged = 'versionType' in newFilters && newFilters.versionType !== prev.versionType;
      const isStartChanged = 'startDate' in newFilters && newFilters.startDate !== prev.startDate;
      const isEndChanged = 'endDate' in newFilters && newFilters.endDate !== prev.endDate;
      const isDeletedChanged = 'showDeleted' in newFilters && newFilters.showDeleted !== prev.showDeleted;

      const resetPage =
        isSearchChanged ||
        isProjectChanged ||
        isTypeChanged ||
        isStartChanged ||
        isEndChanged ||
        isDeletedChanged;

      return {
        ...prev,
        ...newFilters,
        page: resetPage ? 1 : newFilters.page || prev.page,
      };
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      projectId: undefined,
      versionType: undefined,
      startDate: '',
      endDate: '',
      showDeleted: false,
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setSelectedVersion(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (record: VersionRecord) => {
    setSelectedVersion(record);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: VersionRecord) => {
    setSelectedVersion(record);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Soft Delete / Restore Trigger (Prompt confirmation first)
  const handleInitiateToggleStatus = (record: VersionRecord) => {
    setConfirmToggleTarget(record);
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmToggleTarget) return;

    const target = confirmToggleTarget;
    setConfirmToggleTarget(null);
    setTogglingId(target.id);

    try {
      // Call PATCH /versions/:id/toggle-status
      await versionService.toggleVersionStatus(target.id);
      fetchVersions();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(`Failed to change status: ${err.response?.data?.message || err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Stats calculation
  const activeCount = versions.filter((v) => v.isActive).length;
  const inactiveCount = versions.filter((v) => !v.isActive).length;

  return (
    <div className="version-listing-container">
      {/* Page Header Banner */}
      <div className="page-header">
        <div>
          <h2>Release Versions</h2>
          <p>Track, manage, and inspect all microservice and project version deployments.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add New Version</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-total">
            <Layers size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Total Filtered Releases</span>
            <span className="kpi-value">{pagination.total}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-active">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Active Records</span>
            <span className="kpi-value">{activeCount}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-deleted">
            <Trash2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Inactive / Soft Deleted</span>
            <span className="kpi-value">{inactiveCount}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-branch">
            <GitBranch size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Current Page</span>
            <span className="kpi-value">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <VersionFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* API Error Message Banner */}
      {errorMessage && (
        <div className="alert alert-danger mb-4">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
          <button className="btn-link ml-auto" onClick={fetchVersions}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Main Version Table */}
      <VersionTable
        versions={versions}
        isLoading={isLoading}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleInitiateToggleStatus}
        togglingId={togglingId}
      />

      {/* Pagination Controls */}
      <PaginationControls
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Version Modal (Add / View / Edit) */}
      <VersionModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedVersion}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchVersions}
      />

      {/* Confirmation Dialog Modal for Soft Delete / Restore */}
      {confirmToggleTarget && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-dialog-sm">
            <div className="modal-header">
              <div className="modal-title-group">
                <AlertTriangle size={22} className="text-warning" />
                <h2>Confirm Status Change</h2>
              </div>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to{' '}
                <strong>{confirmToggleTarget.isActive ? 'soft delete (deactivate)' : 'restore (reactivate)'}</strong>{' '}
                version record <code>{confirmToggleTarget.versionNumber}</code> (
                {confirmToggleTarget.versionTitle})?
              </p>
              <small className="text-muted">
                Note: This invokes <code>PATCH /versions/{confirmToggleTarget.id}/toggle-status</code>. No records are permanently deleted from database.
              </small>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmToggleTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn-primary ${confirmToggleTarget.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={handleConfirmToggleStatus}
              >
                Confirm {confirmToggleTarget.isActive ? 'Soft Delete' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
