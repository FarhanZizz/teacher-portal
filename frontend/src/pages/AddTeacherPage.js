import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teachersAPI } from '../services/api';
import { showToast } from '../components/Toast';
import styles from './AddTeacherPage.module.css';

const GENDERS = ['male', 'female', 'other'];
const SUBJECTS = [
  'Computer Science','Mathematics','Physics','Chemistry','Biology',
  'History','Literature','Economics','Engineering','Philosophy','Other'
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

const INIT = {
  email: '', first_name: '', last_name: '', password: '', phone: '',
  university_name: '', gender: '', year_joined: '', subject: '', bio: ''
};

export default function AddTeacherPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const change = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(e2 => { const c = { ...e2 }; delete c[e.target.name]; return c; });
  };

  const validate = () => {
    const e = {};
    if (!form.email)           e.email           = 'Required';
    if (!form.first_name)      e.first_name      = 'Required';
    if (!form.last_name)       e.last_name       = 'Required';
    if (!form.password)        e.password        = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.university_name) e.university_name = 'Required';
    if (!form.gender)          e.gender          = 'Required';
    if (!form.year_joined)     e.year_joined     = 'Required';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await teachersAPI.create({ ...form, year_joined: parseInt(form.year_joined) });
      showToast('Teacher added successfully!', 'success');
      navigate('/teachers');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to add teacher';
      const apiErrs = err.response?.data?.errors ?? {};
      showToast(msg, 'error');
      setErrors(apiErrs);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, as, children, required }) => (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {!required && <span className={styles.optional}> (optional)</span>}
      </label>
      {as === 'select' ? (
        <select
          name={name}
          className={`${styles.input} ${errors[name] ? styles.inputError : ''}`}
          value={form[name]} onChange={change}
        >
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          name={name}
          rows={3}
          className={`${styles.input} ${styles.textarea} ${errors[name] ? styles.inputError : ''}`}
          placeholder={placeholder}
          value={form[name]} onChange={change}
        />
      ) : (
        <input
          type={type} name={name}
          className={`${styles.input} ${errors[name] ? styles.inputError : ''}`}
          placeholder={placeholder}
          value={form[name]} onChange={change}
        />
      )}
      {errors[name] && <span className={styles.errorMsg}>{errors[name]}</span>}
    </div>
  );

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/teachers')}>← Back</button>
        <div>
          <h1 className={styles.pageTitle}>Add Teacher</h1>
          <p className={styles.pageSub}>Creates both auth_user and teacher records in one request</p>
        </div>
      </div>

      <form onSubmit={submit} className={styles.formCard} noValidate>
        {/* ── Section 1: Account Info ── */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionNum}>01</span>
            Account Information
          </div>
          <div className={styles.grid2}>
            <Field name="first_name" label="First Name" placeholder="Alice" required />
            <Field name="last_name"  label="Last Name"  placeholder="Johnson" required />
          </div>
          <Field name="email" label="Email Address" type="email" placeholder="alice@university.edu" required />
          <div className={styles.grid2}>
            <Field name="password" label="Password" type="password" placeholder="Min 6 characters" required />
            <Field name="phone" label="Phone Number" type="tel" placeholder="+1-555-0100" />
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Section 2: Teacher Info ── */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionNum}>02</span>
            Teacher Details
          </div>
          <Field name="university_name" label="University Name" placeholder="Massachusetts Institute of Technology" required />
          <div className={styles.grid3}>
            <Field name="gender" label="Gender" as="select" required>
              <option value="">Select gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
            </Field>
            <Field name="year_joined" label="Year Joined" as="select" required>
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </Field>
            <Field name="subject" label="Subject" as="select">
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Field>
          </div>
          <Field name="bio" label="Bio" as="textarea" placeholder="Brief biography or description..." />
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/teachers')}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><span className="spinner" /> Saving...</> : '✓ Save Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
}
