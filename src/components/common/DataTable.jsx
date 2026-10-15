import { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './DataTable.css';

export default function DataTable({
  columns,
  data,
  onRowClick,
  sortable = true,
  loading = false,
  emptyMessage = 'No data available.',
  pageSize = 25,
  paginated = true,
}) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const handleSort = useCallback((colKey) => {
    if (!sortable) return;
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('desc');
    }
    setPage(1);
  }, [sortCol, sortable]);

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal === bVal) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, sortCol, sortDir]);

  const totalPages = paginated ? Math.ceil(sortedData.length / pageSize) : 1;
  const paginatedData = paginated
    ? sortedData.slice((page - 1) * pageSize, page * pageSize)
    : sortedData;

  if (loading) {
    return (
      <div className="data-table__loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <div className="data-table__empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-table__wrapper">
      <div className="data-table__scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, colIdx) => (
                <th
                  key={col.key ? `${col.key}-${colIdx}` : colIdx}
                  className={`data-table__th ${col.align === 'right' ? 'data-table__th--right' : ''} ${sortable && col.sortable !== false ? 'data-table__th--sortable' : ''}`}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {sortable && col.sortable !== false && (
                    <span className="data-table__sort-icon">
                      {sortCol === col.key ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key ? `${col.key}-${colIdx}` : colIdx}
                    className={`data-table__td ${col.align === 'right' ? 'data-table__td--right' : ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="data-table__pagination">
          <span className="data-table__pagination-info">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="data-table__pagination-controls">
            <button
              className="data-table__page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`data-table__page-btn ${page === pageNum ? 'data-table__page-btn--active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="data-table__page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
