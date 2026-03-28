import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teachersAPI, usersAPI } from '../services/api';
import styles from './DashboardPage.module.css';

function StatCard({ label, value, icon, accent, loading }) {
  return (
    <div className={styles.statCard} style={{ '--card-accent': accent }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>
        {loading ? <span className="spinner" style={{ width:24, height:24 }} /> : value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([teachersAPI.getAll(), usersAPI.getAll()])
      .then(([t, u]) => {
        setTeachers(t.data.data ?? []);
        setUsers(u.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const genderStats = teachers.reduce((acc, t) => {
    acc[t.gender] = (acc[t.gender] ?? 0) + 1;
    return acc;
  }, {});

  const recentTeachers = [...teachers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className={`${styles.page} page-enter`}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroHeading}>
            Good {getGreeting()},&nbsp;
            <span className={styles.heroName}>{user?.first_name}</span> 👋
          </h1>
          <p className={styles.heroSub}>Here's what's happening in TeacherHub today.</p>
        </div>
        <Link to="/teachers/add" className={styles.ctaBtn}>+ Add Teacher</Link>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Teachers" value={teachers.length} icon="◈" accent="#6c63ff" loading={loading} />
        <StatCard label="Registered Users" value={users.length}    icon="◉" accent="#34d399" loading={loading} />
        <StatCard label="Male Teachers"    value={genderStats.male ?? 0}   icon="♂" accent="#60a5fa" loading={loading} />
        <StatCard label="Female Teachers"  value={genderStats.female ?? 0} icon="♀" accent="#f472b6" loading={loading} />
      </div>

      {/* ── Recent Teachers ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recently Added</h2>
          <Link to="/teachers" className={styles.viewAll}>View all →</Link>
        </div>
        <div className={styles.recentList}>
          {loading ? (
            <div style={{ padding:'32px', textAlign:'center' }}><span className="spinner" /></div>
          ) : recentTeachers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No teachers yet.</p>
              <Link to="/teachers/add">Add your first teacher →</Link>
            </div>
          ) : (
            recentTeachers.map(t => (
              <div key={t.id} className={styles.recentRow}>
                <div className={styles.recentAvatar}>
                  {(t.first_name?.[0] ?? '?').toUpperCase()}
                </div>
                <div className={styles.recentInfo}>
                  <p className={styles.recentName}>{t.first_name} {t.last_name}</p>
                  <p className={styles.recentMeta}>{t.university_name} · {t.subject ?? 'N/A'}</p>
                </div>
                <div className={styles.recentYear}>{t.year_joined}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
