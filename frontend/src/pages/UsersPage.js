import React, { useEffect, useState, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { usersAPI } from '../services/api';
import { showToast } from '../components/Toast';
import styles from './TablePage.module.css';

const COLUMNS = [
  {
    key: 'name', header: 'Name', accessor: 'first_name',
    render: row => (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background:'linear-gradient(135deg,#34d399,#6c63ff)',
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
  { key: 'email', header: 'Email', accessor: 'email' },
  { key: 'phone', header: 'Phone', accessor: 'phone',
    render: row => row.phone ?? <span style={{ color:'var(--text-3)' }}>—</span>
  },
  {
    key: 'created', header: 'Registered', accessor: 'created_at',
    render: row => (
      <span style={{ color:'var(--text-3)', fontSize:'0.82rem' }}>
        {row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', {
          year:'numeric', month:'short', day:'numeric'
        }) : '—'}
      </span>
    )
  },
  { key: 'id', header: 'ID', accessor: 'id',
    render: row => (
      <span style={{
        fontFamily:'var(--font-display)', fontWeight:700,
        color:'var(--text-3)', fontSize:'0.8rem'
      }}>#{row.id}</span>
    )
  },
];

export default function UsersPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    usersAPI.getAll()
      .then(r => setData(r.data.data ?? []))
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Auth Users</h1>
        <p className={styles.pageSub}>All registered accounts in auth_user table</p>
      </div>
      <DataTable
        title="Auth Users"
        columns={COLUMNS}
        data={data}
        loading={loading}
        onRefresh={load}
      />
    </div>
  );
}
