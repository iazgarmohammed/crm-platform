import { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/exportCSV';
import dayjs from 'dayjs';
import useEducationStore, {
  EDUCATION_STAGES, INSTITUTION_TYPES, CONTACT_ROLES,
  PROGRAM_INTERESTS, EDUCATION_STATUS, REFERRAL_SOURCES,
} from '../store/educationStore';

const pageStyle = { padding: '24px', maxWidth: '1200px', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' };

const STAGE_COLORS = {
  Identified: '#888', Contacted: '#f59e0b', Responded: '#3b82f6',
  'Deck Sent': '#06b6d4', 'Meeting Requested': '#8b5cf6',
  'Proposal Submitted': '#f97316', Negotiating: '#eab308',
  Confirmed: '#22c55e', Delivered: '#10b981', 'Not Interested': '#ef4444',
};

const badgeStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', background: color + '22', color,
});

const DEFAULTS = {
  institutionName: '', type: '', city: '', contactPerson: '',
  role: '', phone: '', email: '', linkedIn: '',
  programInterest: [], batchSize: '', pipelineStage: 'Identified',
  lastContact: '', nextFollowUp: '', programDate: '',
  feeAgreed: '', referralSource: '', notes: '', status: 'Active',
};

export default function EducationCRM() {
  const { institutions, addInstitution, updateInstitution, deleteInstitution, updateInstitutionStage, fetchInstitutions, loading } = useEducationStore();
    useEffect(() => { fetchInstitutions(); }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULTS);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleProgram = (prog) => {
    setForm((f) => ({
      ...f,
      programInterest: f.programInterest.includes(prog)
        ? f.programInterest.filter((p) => p !== prog)
        : [...f.programInterest, prog],
    }));
  };

  const openAdd = () => { setEditing(null); setForm(DEFAULTS); setModalOpen(true); };
  const openEdit = (record) => { setEditing(record); setForm({ ...DEFAULTS, ...record }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.institutionName.trim()) { alert('Institution name is required.'); return; }
    if (editing) updateInstitution(editing.id, form);
    else addInstitution(form);
    setModalOpen(false);
  };

  const isOverdue = (date) => date && dayjs(date).isBefore(dayjs(), 'day');

  const filtered = institutions.filter((r) => {
    const matchSearch = r.institutionName?.toLowerCase().includes(search.toLowerCase()) ||
      r.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'All' || r.pipelineStage === filterStage;
    return matchSearch && matchStage;
  });

  // ── Stats ──
  const total = institutions.length;
  const confirmed = institutions.filter((i) => i.pipelineStage === 'Confirmed').length;
  const delivered = institutions.filter((i) => i.pipelineStage === 'Delivered').length;
  const overdueCount = institutions.filter((i) => isOverdue(i.nextFollowUp)).length;

  return (
    <div style={pageStyle}>

      <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => exportToCSV(institutions, 'institutions')}
    style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
  >
    Export CSV
  </button>
  <button onClick={openAdd} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
    + Add Institution
  </button>
</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Institutions', value: total, color: '#f59e0b' },
          { label: 'Confirmed Programs', value: confirmed, color: '#22c55e' },
          { label: 'Delivered', value: delivered, color: '#3b82f6' },
          { label: 'Overdue Follow-ups', value: overdueCount, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by institution, contact, city..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '280px' }}
        />
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
          <option value="All">All Stages</option>
          {EDUCATION_STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888', alignSelf: 'center' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>
          No institutions found. Add one using the button above.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead style={{ background: '#fafafa' }}>
              <tr>
                <th style={thStyle}>Institution</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Programs</th>
                <th style={thStyle}>Pipeline Stage</th>
                <th style={thStyle}>Next Follow-up</th>
                <th style={thStyle}>Fee Agreed</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const overdue = isOverdue(r.nextFollowUp);
                return (
                  <tr key={r.id} style={{ background: overdue ? '#fff8f8' : '#fff' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{r.institutionName}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{r.type} {r.city ? `· ${r.city}` : ''}</div>
                      {overdue && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>⚠ Follow-up overdue</div>}
                    </td>
                    <td style={tdStyle}>
                      <div>{r.contactPerson || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{r.role || ''}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(r.programInterest || []).map((p) => (
                          <span key={p} style={{ fontSize: '11px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>{p}</span>
                        ))}
                        {(!r.programInterest || r.programInterest.length === 0) && '—'}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={r.pipelineStage}
                        onChange={(e) => updateInstitutionStage(r.id, e.target.value)}
                        style={{ ...badgeStyle(STAGE_COLORS[r.pipelineStage] || '#888'), border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        {EDUCATION_STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      {r.nextFollowUp ? (
                        <span style={{ color: overdue ? '#ef4444' : '#333', fontWeight: overdue ? '600' : '400' }}>
                          {dayjs(r.nextFollowUp).format('DD MMM YYYY')}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>{r.feeAgreed ? `₹${Number(r.feeAgreed).toLocaleString('en-IN')}` : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(r)} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Edit</button>
                        <button onClick={() => { if (window.confirm('Delete this record?')) deleteInstitution(r.id); }}
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
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '580px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editing ? 'Edit' : 'Add'} Institution</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Institution Name *</label><input style={inputStyle} name="institutionName" value={form.institutionName} onChange={handle} placeholder="School or college name" /></div>
              <div><label style={labelStyle}>Type</label>
                <select style={inputStyle} name="type" value={form.type} onChange={handle}>
                  <option value="">Select</option>
                  {INSTITUTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>City / Location</label><input style={inputStyle} name="city" value={form.city} onChange={handle} placeholder="City and area" /></div>
              <div><label style={labelStyle}>Batch Size</label><input style={inputStyle} type="number" name="batchSize" value={form.batchSize} onChange={handle} placeholder="Approx student count" /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Contact Person</label><input style={inputStyle} name="contactPerson" value={form.contactPerson} onChange={handle} placeholder="Decision maker name" /></div>
              <div><label style={labelStyle}>Role</label>
                <select style={inputStyle} name="role" value={form.role} onChange={handle}>
                  <option value="">Select</option>
                  {CONTACT_ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Phone</label><input style={inputStyle} name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} name="email" value={form.email} onChange={handle} placeholder="contact@institution.edu" /></div>
            </div>

            <div>
              <label style={labelStyle}>Program Interest</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {PROGRAM_INTERESTS.map((p) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.programInterest.includes(p)} onChange={() => toggleProgram(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Pipeline Stage</label>
                <select style={inputStyle} name="pipelineStage" value={form.pipelineStage} onChange={handle}>
                  {EDUCATION_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Status</label>
                <select style={inputStyle} name="status" value={form.status} onChange={handle}>
                  {EDUCATION_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Last Contact Date</label><input style={inputStyle} type="date" name="lastContact" value={form.lastContact} onChange={handle} /></div>
              <div><label style={labelStyle}>Next Follow-up Date</label><input style={inputStyle} type="date" name="nextFollowUp" value={form.nextFollowUp} onChange={handle} /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Program Date (if confirmed)</label><input style={inputStyle} type="date" name="programDate" value={form.programDate} onChange={handle} /></div>
              <div><label style={labelStyle}>Fee Agreed (₹)</label><input style={inputStyle} type="number" name="feeAgreed" value={form.feeAgreed} onChange={handle} placeholder="Revenue from this institution" /></div>
            </div>

            <div style={rowStyle}>
              <div><label style={labelStyle}>Referral Source</label>
                <select style={inputStyle} name="referralSource" value={form.referralSource} onChange={handle}>
                  <option value="">Select</option>
                  {REFERRAL_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>LinkedIn</label><input style={inputStyle} name="linkedIn" value={form.linkedIn} onChange={handle} placeholder="https://linkedin.com/in/..." /></div>
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} placeholder="Conversation history, requirements, objections..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                {editing ? 'Save Changes' : 'Add Institution'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}