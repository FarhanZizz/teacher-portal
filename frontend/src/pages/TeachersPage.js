import React, { useEffect, useState, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { teachersAPI } from '../services/api';
import { showToast } from '../components/Toast';
import styles from './TablePage.module.css';

const COLUMNS = [
  {
    key: 'name', header: 'Name', accessor: 'first_name',
    render: row => (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background:'linear-gradient(135deg,#6c63ff,#a78bfa)',
          display:'grid', placeItems:'center',
          fontFamily:'var(--font-display)', fontWeight:700,
          fontSize:'0.7rem', color:'#fff', flexShrink:0
        }}>
          {(row.first_name?.[0] ?? '?').toUpperCase()}
        </div>
        <span style={{ color:'var(--text-1)', fontWeight:500 }}>
          {row.first_name} {row.last_name}
        </span>
      </div>
    )
  },
  { key: 'email',      header: 'Email',      accessor: 'email' },
  { key: 'university', header: 'University', accessor: 'university_name' },
  { key: 'subject',    header: 'Subject',    accessor: 'subject',
    render: row => row.subject ?? <span style={{ color:'var(--text-3)' }}>—</span>
  },
  {
    key: 'gender', header: 'Gender', accessor: 'gender',
    render: row => (
      <span style={{
        padding:'3px 10px',
        borderRadius:20,
        fontSize:'0.75rem',
        fontWeight:600,
        background: row.gender === 'female'
          ? 'rgba(244,114,182,0.12)' : row.gender === 'male'
          ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.06)',
        color: row.gender === 'female' ? '#f472b6'
             : row.gender === 'male'   ? '#60a5fa' : 'var(--text-2)',
      }}>
        {row.gender}
      </span>
    )
  },
  {
    key: 'year', header: 'Year Joined', accessor: 'year_joined',
    render: row => (
      <span style={{
        fontFamily:'var(--font-display)', fontWeight:700,
        color:'var(--accent-2)',
        background:'rgba(108,99,255,0.12)',
        padding:'3px 10px', borderRadius:20, fontSize:'0.8rem'
      }}>
        {row.year_joined}
      </span>
    )
  },
  { key: 'phone', header: 'Phone', accessor: 'phone',
    render: row => row.phone ?? <span style={{ color:'var(--text-3)' }}>—</span>
  },
];

export default function TeachersPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    teachersAPI.getAll()
      .then(r => setData(r.data.data ?? []))
      .catch(() => showToast('Failed to load teachers', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher and their account?')) return;
    try {
      await teachersAPI.delete(id);
      showToast('Teacher deleted', 'success');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Teachers</h1>
        <p className={styles.pageSub}>Manage teacher records linked to auth accounts</p>
      </div>
      <DataTable
        title="All Teachers"
        columns={COLUMNS}
        data={data}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={load}
        addHref="/teachers/add"
      />
    </div>
  );
}
