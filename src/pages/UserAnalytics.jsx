import { exportToCSV } from '../utils/exportCSV';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';
import useUserStore from '../store/userStore';

const pageStyle = { padding: '24px', maxWidth: '1200px', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' };

const badgeStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', background: color + '22', color,
});

const STATUS_COLORS = {
  Active: '#22c55e', Dormant: '#f59e0b', 'At Risk': '#f97316',
  Deactivated: '#9ca3af', Deleted: '#ef4444', Banned: '#1a1a1a',
};

const DEFAULTS = {
  weekLabel: '', totalSignups: '', newSignupsWeek: '',
  dau: '', mau: '', deactivated: '', deleted: '',
  startupUsers: '', investorUsers: '', creatorUsers: '', studentUsers: '',
  signupSourceTop: '', profileCompletionRate: '', connectionsMade: '',
  postsCreated: '', notes: '',
};

export default function UserAnalytics() {
  const { snapshots, addSnapshot, updateSnapshot, deleteSnapshot, fetchSnapshots, loading } = useUserStore();

useEffect(() => { fetchSnapshots(); }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULTS);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ ...DEFAULTS, weekLabel: `Week of ${dayjs().format('DD MMM YYYY')}` }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...DEFAULTS, ...r }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.weekLabel?.trim()) { alert('Week label is required.'); return; }
    if (editing) updateSnapshot(editing.id, form);
    else addSnapshot(form);
    setModalOpen(false);
  };

  // ── Latest snapshot for current stats ──
  const latest = snapshots[0] || null;
  const previous = snapshots[1] || null;

  const trend = (curr, prev, key) => {
    if (!curr || !prev) return null;
    const diff = Number(curr[key]) - Number(prev[key]);
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  // ── Chart data ──
  const chartData = [...snapshots].reverse().map((s) => ({
    week: s.weekLabel,
    Signups: Number(s.totalSignups) || 0,
    DAU: Number(s.dau) || 0,
    MAU: Number(s.mau) || 0,
    Deleted: Number(s.deleted) || 0,
  }));

  const dauMauRatio = latest && latest.mau > 0
    ? ((Number(latest.dau) / Number(latest.mau)) * 100).toFixed(1)
    : '—';

  const churnCheck = latest && latest.newSignupsWeek > 0
    ? ((Number(latest.deleted) / Number(latest.newSignupsWeek)) * 100).toFixed(1)
    : '—';

  return (
    <div style={pageStyle}>

      <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => exportToCSV(snapshots, 'user_analytics')}
    style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
  >
    Export CSV
  </button>
  <button onClick={openAdd} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
    + Log This Week
  </button>
</div>

      {/* Current Stats */}
      {latest ? (
        <>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
            Latest snapshot: <strong>{latest.weekLabel}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Signups', value: latest.totalSignups, key: 'totalSignups', color: '#3b82f6' },
              { label: 'New This Week', value: latest.newSignupsWeek, key: 'newSignupsWeek', color: '#8b5cf6' },
              { label: 'Daily Active (DAU)', value: latest.dau, key: 'dau', color: '#22c55e' },
              { label: 'Monthly Active (MAU)', value: latest.mau, key: 'mau', color: '#10b981' },
            ].map((s) => {
              const t = trend(latest, previous, s.key);
              return (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>{s.value || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
                  {t && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: t.startsWith('+') ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                      {t} vs last week
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Deactivated', value: latest.deactivated, color: '#9ca3af' },
              { label: 'Deleted', value: latest.deleted, color: '#ef4444' },
              { label: 'DAU / MAU Ratio', value: `${dauMauRatio}%`, color: dauMauRatio >= 20 ? '#22c55e' : '#f59e0b' },
              { label: 'Weekly Churn %', value: `${churnCheck}%`, color: churnCheck <= 5 ? '#22c55e' : '#ef4444' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{s.value || '—'}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Weekly Review Checklist */}
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Weekly Review Checklist</div>
            {[
              { check: Number(latest.newSignupsWeek) > 0, pass: 'Growth is positive this week', fail: 'No new signups logged this week' },
              { check: churnCheck !== '—' && Number(churnCheck) <= 5, pass: `Churn is healthy at ${churnCheck}%`, fail: `Churn is ${churnCheck}% — above 5% threshold, check onboarding` },
              { check: dauMauRatio !== '—' && Number(dauMauRatio) >= 15, pass: `DAU/MAU ratio is ${dauMauRatio}% — users returning daily`, fail: `DAU/MAU is ${dauMauRatio}% — below 15%, users not returning daily` },
              { check: !!latest.signupSourceTop, pass: `Top signup source: ${latest.signupSourceTop}`, fail: 'Top signup source not logged — double down on best channel' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.check ? '✅' : '⚠️'}</span>
                <span style={{ fontSize: '13px', color: item.check ? '#333' : '#ef4444' }}>
                  {item.check ? item.pass : item.fail}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '48px', textAlign: 'center', color: '#aaa', marginBottom: '24px' }}>
          No data yet. Click "Log This Week" to record your first snapshot.
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>User Growth Over Time</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Signups" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="DAU" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="MAU" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Deletions Per Week</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Deleted" fill="#ef444433" stroke="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Snapshot History Table */}
      {snapshots.length > 0 && (
        <>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Snapshot History</div>
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  <th style={thStyle}>Week</th>
                  <th style={thStyle}>Total Signups</th>
                  <th style={thStyle}>New This Week</th>
                  <th style={thStyle}>DAU</th>
                  <th style={thStyle}>MAU</th>
                  <th style={thStyle}>Deleted</th>
                  <th style={thStyle}>DAU/MAU</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((r) => {
                  const ratio = r.mau > 0 ? ((Number(r.dau) / Number(r.mau)) * 100).toFixed(1) : '—';
                  return (
                    <tr key={r.id}>
                      <td style={tdStyle}><div style={{ fontWeight: '600' }}>{r.weekLabel}</div></td>
                      <td style={tdStyle}>{r.totalSignups || '—'}</td>
                      <td style={tdStyle}>{r.newSignupsWeek || '—'}</td>
                      <td style={tdStyle}>{r.dau || '—'}</td>
                      <td style={tdStyle}>{r.mau || '—'}</td>
                      <td style={tdStyle}>{r.deleted || '—'}</td>
                      <td style={tdStyle}>
                        {ratio !== '—' && (
                          <span style={badgeStyle(Number(ratio) >= 20 ? '#22c55e' : Number(ratio) >= 15 ? '#f59e0b' : '#ef4444')}>
                            {ratio}%
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEdit(r)} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Edit</button>
                          <button onClick={() => { if (window.confirm('Delete this snapshot?')) deleteSnapshot(r.id); }}
                            style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#ef4444' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '560px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editing ? 'Edit' : 'Log'} Weekly Snapshot</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div>
              <label style={labelStyle}>Week Label *</label>
              <input style={inputStyle} name="weekLabel" value={form.weekLabel} onChange={handle} placeholder="e.g. Week of 18 Mar 2026" />
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Total Signups (Cumulative)</label><input style={inputStyle} type="number" name="totalSignups" value={form.totalSignups} onChange={handle} /></div>
              <div><label style={labelStyle}>New Signups This Week</label><input style={inputStyle} type="number" name="newSignupsWeek" value={form.newSignupsWeek} onChange={handle} /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Daily Active Users (DAU)</label><input style={inputStyle} type="number" name="dau" value={form.dau} onChange={handle} /></div>
              <div><label style={labelStyle}>Monthly Active Users (MAU)</label><input style={inputStyle} type="number" name="mau" value={form.mau} onChange={handle} /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Deactivated Accounts</label><input style={inputStyle} type="number" name="deactivated" value={form.deactivated} onChange={handle} /></div>
              <div><label style={labelStyle}>Deleted Accounts</label><input style={inputStyle} type="number" name="deleted" value={form.deleted} onChange={handle} /></div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '700', color: '#444', borderTop: '1px solid #eee', paddingTop: '10px' }}>User Type Breakdown</div>
            <div style={rowStyle}>
              <div><label style={labelStyle}>Startup Users</label><input style={inputStyle} type="number" name="startupUsers" value={form.startupUsers} onChange={handle} /></div>
              <div><label style={labelStyle}>Investor Users</label><input style={inputStyle} type="number" name="investorUsers" value={form.investorUsers} onChange={handle} /></div>
            </div>
            <div style={rowStyle}>
              <div><label style={labelStyle}>Creator Users</label><input style={inputStyle} type="number" name="creatorUsers" value={form.creatorUsers} onChange={handle} /></div>
              <div><label style={labelStyle}>Student Users</label><input style={inputStyle} type="number" name="studentUsers" value={form.studentUsers} onChange={handle} /></div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '700', color: '#444', borderTop: '1px solid #eee', paddingTop: '10px' }}>Engagement Metrics</div>
            <div style={rowStyle}>
              <div><label style={labelStyle}>Top Signup Source</label><input style={inputStyle} name="signupSourceTop" value={form.signupSourceTop} onChange={handle} placeholder="e.g. Instagram" /></div>
              <div><label style={labelStyle}>Profile Completion Rate (%)</label><input style={inputStyle} name="profileCompletionRate" value={form.profileCompletionRate} onChange={handle} placeholder="e.g. 68" /></div>
            </div>
            <div style={rowStyle}>
              <div><label style={labelStyle}>Connections Made</label><input style={inputStyle} type="number" name="connectionsMade" value={form.connectionsMade} onChange={handle} /></div>
              <div><label style={labelStyle}>Posts / Content Created</label><input style={inputStyle} type="number" name="postsCreated" value={form.postsCreated} onChange={handle} /></div>
            </div>

            <div><label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} placeholder="What changed this week, what to investigate..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                {editing ? 'Save Changes' : 'Save Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}