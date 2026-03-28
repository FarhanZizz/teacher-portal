import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login failed';
      setErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>T</div>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>Sign in to TeacherHub</p>
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}

        <form onSubmit={submit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@university.edu"
              value={form.email}
              onChange={change}
              autoComplete="email"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={change}
              autoComplete="current-password"
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
