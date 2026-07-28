import React from 'react';
import { Pagination as PaginationType } from '../../types/version';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const PaginationControls: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const { page, limit, total, totalPages } = pagination;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span>
          Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
          <strong>{total}</strong> records
        </span>
        <div className="limit-selector">
          <label htmlFor="limit-select">Per page:</label>
          <select
            id="limit-select"
            className="form-control form-control-sm"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button
          className="btn-pagination"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span className="pagination-page-indicator">
          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <button
          className="btn-pagination"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
