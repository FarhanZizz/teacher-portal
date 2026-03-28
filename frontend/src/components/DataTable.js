import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

export default function DataTable({ columns, data, onDelete, onRefresh, loading, title, addHref }) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [sortKey, setSortKey]   = useState('');
  const [sortDir, setSortDir]   = useState('asc');
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => {
          const val = col.accessor ? row[col.accessor] : '';
          return String(val ?? '').toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.count}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="search"
            className={styles.search}
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {onRefresh && (
            <button className={styles.iconBtn} onClick={onRefresh} title="Refresh">↻</button>
          )}
          {addHref && (
            <a href={addHref} className={styles.addBtn}>+ Add Teacher</a>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingRow}>
            <div className="spinner" />
            <span>Loading data...</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={col.sortable !== false ? styles.sortable : ''}
                    onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                  >
                    <span>{col.header}</span>
                    {col.sortable !== false && col.accessor && (
                      <span className={styles.sortIcon}>
                        {sortKey === col.accessor ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    )}
                  </th>
                ))}
                {onDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onDelete ? 1 : 0)} className={styles.empty}>
                    No records found
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.id ?? i} className={styles.row}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                      </td>
                    ))}
                    {onDelete && (
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => onDelete(row.id)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >›</button>
        </div>
      )}
    </div>
  );
}
