import React, { useEffect, useState } from 'react';
import { Project } from '../../types/project';
import { CreateVersionRequest, UpdateVersionRequest, VersionRecord, VersionType } from '../../types/version';
import { projectService } from '../../services/projectService';
import { versionService } from '../../services/versionService';
import { AlertCircle, Code, GitCommit, Loader2, X } from 'lucide-react';

export type ModalMode = 'create' | 'edit' | 'view';

interface VersionModalProps {
  isOpen: boolean;
  mode: ModalMode;
  initialData?: VersionRecord | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSaveSuccess,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Form State
  const [projectId, setProjectId] = useState<string>('');
  const [versionType, setVersionType] = useState<VersionType | ''>('');
  const [computedVersionNumber, setComputedVersionNumber] = useState<string>('');
  const [versionTitle, setVersionTitle] = useState<string>('');
  const [versionInfoText, setVersionInfoText] = useState<string>('');

  // Status & Validation State
  const [isFetchingNextNumber, setIsFetchingNextNumber] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);

  const isReadOnly = mode === 'view';

  // Load Projects for dropdown
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const list = await projectService.getProjects();
        if (isMounted) setProjects(list);
      } catch (err) {
        console.error('Failed to load projects list in modal:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Populate form state when initialData changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setJsonValidationError(null);

    if ((mode === 'edit' || mode === 'view') && initialData) {
      setProjectId(String(initialData.projectId));
      setVersionType(initialData.version);
      setComputedVersionNumber(initialData.versionNumber);
      setVersionTitle(initialData.versionTitle);

      // Convert versionInfo to formatted JSON string
      if (initialData.versionInfo !== undefined && initialData.versionInfo !== null) {
        if (typeof initialData.versionInfo === 'string') {
          setVersionInfoText(initialData.versionInfo);
        } else {
          setVersionInfoText(JSON.stringify(initialData.versionInfo, null, 2));
        }
      } else {
        setVersionInfoText('{\n  "notes": ""\n}');
      }
    } else {
      // Create mode reset
      setProjectId('');
      setVersionType('');
      setComputedVersionNumber('');
      setVersionTitle('');
      setVersionInfoText('{\n  "description": "",\n  "author": "Engineering Team"\n}');
    }
  }, [isOpen, mode, initialData]);

  // Trigger GET /versions/next-number when BOTH Project and Version are selected (or changed)
  useEffect(() => {
    if (!isOpen || isReadOnly) return;
    if (!projectId || !versionType) {
      if (mode === 'create') setComputedVersionNumber('');
      return;
    }

    let isMounted = true;
    const fetchNextNumber = async () => {
      setIsFetchingNextNumber(true);
      try {
        const res = await versionService.getNextVersionNumber(Number(projectId), versionType as VersionType);
        if (isMounted) {
          setComputedVersionNumber(res.versionNumber || '');
        }
      } catch (err: any) {
        console.error('Failed to fetch next version number:', err);
      } finally {
        if (isMounted) setIsFetchingNextNumber(false);
      }
    };

    fetchNextNumber();
    return () => {
      isMounted = false;
    };
  }, [projectId, versionType, isOpen, isReadOnly, mode]);

  // Validate JSON string
  const handleVersionInfoChange = (value: string) => {
    setVersionInfoText(value);
    if (!value.trim()) {
      setJsonValidationError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonValidationError(null);
    } catch (err: any) {
      setJsonValidationError(`Invalid JSON syntax: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!projectId) {
      setErrorMessage('Please select a project.');
      return;
    }
    if (!versionType) {
      setErrorMessage('Please select a version type (major, minor, or bug-fix).');
      return;
    }
    if (!versionTitle.trim()) {
      setErrorMessage('Please enter a version title.');
      return;
    }

    // JSON parsing validation
    let parsedVersionInfo: unknown = {};
    if (versionInfoText.trim()) {
      try {
        parsedVersionInfo = JSON.parse(versionInfoText);
      } catch (err) {
        setErrorMessage('Version Info must be valid JSON format.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const payload: CreateVersionRequest = {
          projectId: Number(projectId),
          version: versionType as VersionType,
          versionTitle: versionTitle.trim(),
          versionInfo: parsedVersionInfo,
        };
        await versionService.createVersion(payload);
      } else if (mode === 'edit' && initialData) {
        const payload: UpdateVersionRequest = {
          projectId: Number(projectId),
          version: versionType as VersionType,
          versionTitle: versionTitle.trim(),
          versionInfo: parsedVersionInfo,
        };
        await versionService.updateVersion(initialData.id, payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'An unexpected API error occurred.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <GitCommit className="modal-title-icon" size={22} />
            <h2>
              {mode === 'create' && 'Add New Release Version'}
              {mode === 'edit' && `Edit Version (${initialData?.versionNumber})`}
              {mode === 'view' && `Version Release Specification (${initialData?.versionNumber})`}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Project Dropdown */}
              <div className="form-group">
                <label htmlFor="modal-project">
                  Project <span className="text-danger">*</span>
                </label>
                <select
                  id="modal-project"
                  className="form-control"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={isReadOnly || isLoadingProjects}
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version Type Dropdown */}
              <div className="form-group">
                <label htmlFor="modal-version-type">
                  Version Type <span className="text-danger">*</span>
                </label>
                <select
                  id="modal-version-type"
                  className="form-control"
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value as VersionType)}
                  disabled={isReadOnly}
                  required
                >
                  <option value="">-- Select Type --</option>
                  <option value="major">major</option>
                  <option value="minor">minor</option>
                  <option value="bug-fix">bug-fix</option>
                </select>
              </div>

              {/* Version Number (STRICTLY READ-ONLY) */}
              <div className="form-group full-width">
                <label htmlFor="modal-version-number">
                  Calculated Version Number <span className="badge-readonly">READ-ONLY</span>
                </label>
                <div className="input-with-icon">
                  <input
                    id="modal-version-number"
                    type="text"
                    className="form-control readonly-input"
                    value={
                      isFetchingNextNumber
                        ? 'Fetching next number from backend...'
                        : computedVersionNumber || (projectId && versionType ? 'Pending calculation...' : 'Select Project & Version Type first')
                    }
                    readOnly
                    disabled
                  />
                  {isFetchingNextNumber && <Loader2 size={16} className="input-icon spin" />}
                </div>
                <small className="help-text">
                  Calculated automatically by <code>GET /versions/next-number</code>. Real value computed by backend on save.
                </small>
              </div>

              {/* Title */}
              <div className="form-group full-width">
                <label htmlFor="modal-title">
                  Release Title <span className="text-danger">*</span>
                </label>
                <input
                  id="modal-title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Auth System Overhaul & RBAC Integration"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>

              {/* Version Info (JSON format) */}
              <div className="form-group full-width">
                <div className="label-with-badge">
                  <label htmlFor="modal-version-info">
                    Version Info (JSON Format)
                  </label>
                  <span className="json-badge">
                    <Code size={12} /> JSON Object
                  </span>
                </div>
                <textarea
                  id="modal-version-info"
                  rows={6}
                  className={`form-control code-textarea ${jsonValidationError ? 'input-error' : ''}`}
                  placeholder="Enter JSON metadata..."
                  value={versionInfoText}
                  onChange={(e) => handleVersionInfoChange(e.target.value)}
                  disabled={isReadOnly}
                />
                {jsonValidationError && (
                  <span className="error-text">{jsonValidationError}</span>
                )}
              </div>
            </div>

            {/* Readonly View Metadata */}
            {mode === 'view' && initialData && (
              <div className="view-metadata-box">
                <h4>System Audit Metadata</h4>
                <div className="meta-grid">
                  <div>
                    <span className="meta-label">Status:</span>
                    <span className={initialData.isActive ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                      {initialData.isActive ? 'Active' : 'Soft Deleted'}
                    </span>
                  </div>
                  <div>
                    <span className="meta-label">Created At:</span>
                    <span>{new Date(initialData.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="meta-label">Created By User ID:</span>
                    <span>#{initialData.createdBy}</span>
                  </div>
                  {initialData.updatedAt && (
                    <div>
                      <span className="meta-label">Last Updated:</span>
                      <span>{new Date(initialData.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !!jsonValidationError || isFetchingNextNumber}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{mode === 'create' ? 'Create Version' : 'Save Changes'}</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
