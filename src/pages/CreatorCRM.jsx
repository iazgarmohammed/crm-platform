import { exportToCSV } from '../utils/exportCSV';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import useCreatorStore, {
  CREATOR_STAGES, CONTENT_NICHES, CREATOR_STATUS,
  QUALITY_OPTIONS, SOURCE_OPTIONS,
} from '../store/creatorStore';

const pageStyle = { padding: '24px', maxWidth: '1200px', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' };

const STAGE_COLORS = {
  Identified: '#888', Contacted: '#f59e0b', Responded: '#3b82f6',
  Briefed: '#06b6d4', Agreed: '#8b5cf6', Onboarded: '#10b981',
  Active: '#22c55e', Inactive: '#f97316', Churned: '#ef4444',
};

const badgeStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', background: color + '22', color,
});

const DEFAULTS = {
  creatorName: '', platformHandle: '', contentNiche: [],
  followerCount: '', contact: '', source: '',
  pipelineStage: 'Identified', onboardDate: '',
  totalPosts: 0, lastPostDate: '', postsThisWeek: 0,
  contentQuality: '', engagementRate: '', notes: '', status: 'Active',
};

export default function CreatorCRM() {
 const { creators, addCreator, updateCreator, deleteCreator, updateCreatorStage, fetchCreators, loading } = useCreatorStore();

useEffect(() => { fetchCreators(); }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULTS);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleNiche = (niche) => {
    setForm((f) => ({
      ...f,
      contentNiche: f.contentNiche.includes(niche)
        ? f.contentNiche.filter((n) => n !== niche)
        : [...f.contentNiche, niche],
    }));
  };

  const openAdd = () => { setEditing(null); setForm(DEFAULTS); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...DEFAULTS, ...r }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.creatorName?.trim()) { alert('Creator name is required.'); return; }
    if (editing) updateCreator(editing.id, form);
    else addCreator(form);
    setModalOpen(false);
  };

  const isInactive = (dateStr) => {
    if (!dateStr) return false;
    return dayjs().diff(dayjs(dateStr), 'day') >= 14;
  };

  const filtered = creators.filter((r) => {
    const matchSearch =
      r.creatorName?.toLowerCase().includes(search.toLowerCase()) ||
      r.platformHandle?.toLowerCase().includes(search.toLowerCase()) ||
      r.source?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'All' || r.pipelineStage === filterStage;
    return matchSearch && matchStage;
  });

  // ── Stats ──
  const total = creators.length;
  const active = creators.filter((c) => c.pipelineStage === 'Active').length;
  const onboarded = creators.filter((c) => ['Onboarded', 'Active'].includes(c.pipelineStage)).length;
  const inactive = creators.filter((c) => isInactive(c.lastPostDate) && c.pipelineStage === 'Active').length;
  const totalPosts = creators.reduce((sum, c) => sum + (Number(c.totalPosts) || 0), 0);
  const churnRate = onboarded > 0
    ? ((creators.filter((c) => c.pipelineStage === 'Churned').length / onboarded) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={pageStyle}>

      <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => exportToCSV(creators, 'creators')}
    style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
  >
    Export CSV
  </button>
  <button onClick={openAdd} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
    + Add Creator
  </button>
</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Creators', value: total, color: '#8b5cf6' },
          { label: 'Onboarded', value: onboarded, color: '#3b82f6' },
          { label: 'Posting Weekly', value: active, color: '#22c55e' },
          { label: 'Gone Inactive', value: inactive, color: '#f97316' },
          { label: 'Total Posts', value: totalPosts, color: '#10b981' },
          { label: 'Churn Rate', value: `${churnRate}%`, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '14px 16px', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Q2 Targets */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Targets</div>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Creators Onboarded', current: onboarded, target: 15 },
            { label: 'Active (posting weekly)', current: active, target: 10 },
            { label: 'Total Posts Published', current: totalPosts, target: 60 },
          ].map((t) => {
            const pct = Math.min(100, Math.round((t.current / t.target) * 100));
            return (
              <div key={t.label} style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600' }}>{t.label}</span>
                  <span style={{ color: '#888' }}>{t.current} / {t.target}</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                  <div style={{ width: `${pct}%`, background: pct >= 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444', height: '8px', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{pct}% of target</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input placeholder="Search by name, handle, source..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '260px' }} />
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
          <option value="All">All Stages</option>
          {CREATOR_STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888', alignSelf: 'center' }}>
          {filtered.length} creator{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>No creators found. Add one above.</div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead style={{ background: '#fafafa' }}>
              <tr>
                <th style={thStyle}>Creator</th>
                <th style={thStyle}>Niche</th>
                <th style={thStyle}>Followers</th>
                <th style={thStyle}>Pipeline Stage</th>
                <th style={thStyle}>Last Post</th>
                <th style={thStyle}>Total Posts</th>
                <th style={thStyle}>Quality</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const gone = isInactive(r.lastPostDate) && r.pipelineStage === 'Active';
                return (
                  <tr key={r.id} style={{ background: gone ? '#fff8f0' : '#fff' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{r.creatorName}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{r.platformHandle || ''}</div>
                      {gone && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '2px' }}>⚠ No post in 14+ days</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(r.contentNiche || []).map((n) => (
                          <span key={n} style={{ fontSize: '11px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>{n}</span>
                        ))}
                        {(!r.contentNiche || r.contentNiche.length === 0) && '—'}
                      </div>
                    </td>
                    <td style={tdStyle}>{r.followerCount ? Number(r.followerCount).toLocaleString() : '—'}</td>
                    <td style={tdStyle}>
                      <select value={r.pipelineStage} onChange={(e) => updateCreatorStage(r.id, e.target.value)}
                        style={{ ...badgeStyle(STAGE_COLORS[r.pipelineStage] || '#888'), border: 'none', cursor: 'pointer', outline: 'none' }}>
                        {CREATOR_STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      {r.lastPostDate ? (
                        <span style={{ color: gone ? '#f97316' : '#333', fontWeight: gone ? '600' : '400' }}>
                          {dayjs(r.lastPostDate).format('DD MMM YYYY')}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>{r.totalPosts || 0}</td>
                    <td style={tdStyle}>
                      {r.contentQuality ? (
                        <span style={badgeStyle(r.contentQuality === 'High' ? '#22c55e' : r.contentQuality === 'Medium' ? '#f59e0b' : '#ef4444')}>
                          {r.contentQuality}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(r)} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Edit</button>
                        <button onClick={() => { if (window.confirm('Delete this creator?')) deleteCreator(r.id); }}
                          style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#ef4444' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '560px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editing ? 'Edit' : 'Add'} Creator</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Creator Name *</label><input style={inputStyle} name="creatorName" value={form.creatorName} onChange={handle} placeholder="Full name or handle" /></div>
              <div><label style={labelStyle}>Platform Handle</label><input style={inputStyle} name="platformHandle" value={form.platformHandle} onChange={handle} placeholder="@username" /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Follower Count</label><input style={inputStyle} type="number" name="followerCount" value={form.followerCount} onChange={handle} placeholder="Audience size" /></div>
              <div><label style={labelStyle}>Contact (DM / Email)</label><input style={inputStyle} name="contact" value={form.contact} onChange={handle} /></div>
            </div>

            <div>
              <label style={labelStyle}>Content Niche</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {CONTENT_NICHES.map((n) => (
                  <label key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={(form.contentNiche || []).includes(n)} onChange={() => toggleNiche(n)} />
                    {n}
                  </label>
                ))}
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Source</label>
                <select style={inputStyle} name="source" value={form.source} onChange={handle}>
                  <option value="">Select</option>
                  {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Pipeline Stage</label>
                <select style={inputStyle} name="pipelineStage" value={form.pipelineStage} onChange={handle}>
                  {CREATOR_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Status</label>
                <select style={inputStyle} name="status" value={form.status} onChange={handle}>
                  {CREATOR_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Content Quality</label>
                <select style={inputStyle} name="contentQuality" value={form.contentQuality} onChange={handle}>
                  <option value="">Select</option>
                  {QUALITY_OPTIONS.map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Onboard Date</label><input style={inputStyle} type="date" name="onboardDate" value={form.onboardDate} onChange={handle} /></div>
              <div><label style={labelStyle}>Last Post Date</label><input style={inputStyle} type="date" name="lastPostDate" value={form.lastPostDate} onChange={handle} /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Total Posts</label><input style={inputStyle} type="number" name="totalPosts" value={form.totalPosts} onChange={handle} /></div>
              <div><label style={labelStyle}>Posts This Week</label><input style={inputStyle} type="number" name="postsThisWeek" value={form.postsThisWeek} onChange={handle} /></div>
            </div>

            <div><label style={labelStyle}>Engagement Rate (%)</label><input style={inputStyle} name="engagementRate" value={form.engagementRate} onChange={handle} placeholder="e.g. 4.5" /></div>

            <div><label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} placeholder="What they want, what they're struggling with..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                {editing ? 'Save Changes' : 'Add Creator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}