import React, { useEffect, useState } from 'react';
import { Project } from '../../types/project';
import { VersionFilters, VersionType } from '../../types/version';
import { Calendar, Filter, RefreshCw, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { projectService } from '../../services/projectService';

interface VersionFiltersProps {
  filters: VersionFilters;
  onChange: (newFilters: Partial<VersionFilters>) => void;
  onReset: () => void;
}

export const VersionFiltersBar: React.FC<VersionFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>(filters.search || '');

  // Load Projects from GET /projects
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const data = await projectService.getProjects();
        if (isMounted) setProjects(data);
      } catch (err) {
        console.error('Failed to load projects for dropdown:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync external search filter changes to searchInput state
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounce search change by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.search || '') !== searchInput) {
        onChange({ search: searchInput });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="filters-card">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={18} />
          <span>Filters & Search</span>
        </div>
        <button className="btn-secondary btn-sm" onClick={onReset} title="Reset all filters">
          <RefreshCw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="filters-grid">
        {/* Search input */}
        <div className="filter-group search-group">
          <label htmlFor="search-input">Search Title / Number</label>
          <div className="input-with-icon">
            <Search size={16} className="input-icon" />
            <input
              id="search-input"
              type="text"
              className="form-control"
              placeholder="Search title, version number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Project dropdown */}
        <div className="filter-group">
          <label htmlFor="project-select">Project</label>
          <select
            id="project-select"
            className="form-control"
            value={filters.projectId !== undefined ? filters.projectId : ''}
            onChange={(e) =>
              onChange({ projectId: e.target.value ? Number(e.target.value) : undefined })
            }
            disabled={isLoadingProjects}
          >
            <option value="">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Version Type dropdown MUST BE: major, minor, bug-fix */}
        <div className="filter-group">
          <label htmlFor="version-type-select">Version Type</label>
          <select
            id="version-type-select"
            className="form-control"
            value={filters.versionType || ''}
            onChange={(e) =>
              onChange({ versionType: (e.target.value as VersionType) || undefined })
            }
          >
            <option value="">All Types</option>
            <option value="major">major</option>
            <option value="minor">minor</option>
            <option value="bug-fix">bug-fix</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="filter-group">
          <label htmlFor="start-date-input">Start Date</label>
          <div className="input-with-icon">
            <Calendar size={16} className="input-icon" />
            <input
              id="start-date-input"
              type="date"
              className="form-control"
              value={filters.startDate || ''}
              onChange={(e) => onChange({ startDate: e.target.value || undefined })}
            />
          </div>
        </div>

        {/* End Date */}
        <div className="filter-group">
          <label htmlFor="end-date-input">End Date</label>
          <div className="input-with-icon">
            <Calendar size={16} className="input-icon" />
            <input
              id="end-date-input"
              type="date"
              className="form-control"
              value={filters.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            />
          </div>
        </div>

        {/* Show Deleted Toggle */}
        <div className="filter-group toggle-group">
          <label>Include Inactive Records</label>
          <button
            type="button"
            className={`toggle-switch ${filters.showDeleted ? 'active' : ''}`}
            onClick={() => onChange({ showDeleted: !filters.showDeleted })}
            aria-label="Toggle Show Deleted"
          >
            {filters.showDeleted ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            <span>{filters.showDeleted ? 'Show Deleted (ON)' : 'Show Deleted (OFF)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
