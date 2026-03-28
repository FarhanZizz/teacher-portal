import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import styles from './AuthPage.module.css';

const INIT = { email: '', first_name: '', last_name: '', password: '', confirm_password: '', phone: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email)          e.email    = 'Email is required';
    if (!form.first_name)     e.first_name = 'First name is required';
    if (!form.last_name)      e.last_name  = 'Last name is required';
    if (!form.password)       e.password   = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      const { confirm_password, ...payload } = form;
      await register(payload);
      showToast('Account created! Welcome!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Registration failed';
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

      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>T</div>
          <h1 className={styles.heading}>Create account</h1>
          <p className={styles.sub}>Join TeacherHub today</p>
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}

        <form onSubmit={submit} className={styles.form} noValidate>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>First name</label>
              <input
                type="text" name="first_name"
                className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
                placeholder="Alice"
                value={form.first_name} onChange={change}
              />
              {errors.first_name && <span className={styles.errorMsg}>{errors.first_name}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input
                type="text" name="last_name"
                className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
                placeholder="Johnson"
                value={form.last_name} onChange={change}
              />
              {errors.last_name && <span className={styles.errorMsg}>{errors.last_name}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email" name="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@university.edu"
              value={form.email} onChange={change}
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone <span className={styles.optional}>(optional)</span></label>
            <input
              type="tel" name="phone"
              className={styles.input}
              placeholder="+1-555-0100"
              value={form.phone} onChange={change}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password" name="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Min. 6 characters"
                value={form.password} onChange={change}
              />
              {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm password</label>
              <input
                type="password" name="confirm_password"
                className={`${styles.input} ${errors.confirm_password ? styles.inputError : ''}`}
                placeholder="••••••••"
                value={form.confirm_password} onChange={change}
              />
              {errors.confirm_password && <span className={styles.errorMsg}>{errors.confirm_password}</span>}
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
