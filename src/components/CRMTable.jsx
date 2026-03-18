import { useState } from 'react';
import dayjs from 'dayjs';

const thStyle = {
  padding: '10px 12px', textAlign: 'left', fontSize: '12px',
  fontWeight: '700', color: '#666', textTransform: 'uppercase',
  borderBottom: '2px solid #eee', whiteSpace: 'nowrap',
};
const tdStyle = {
  padding: '10px 12px', fontSize: '13px', color: '#333',
  borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle',
};
const badgeStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', background: color + '22', color: color,
});

const STAGE_COLORS = {
  Identified: '#888', Contacted: '#f59e0b', Responded: '#3b82f6',
  'Demo Done': '#8b5cf6', Interested: '#06b6d4', Validated: '#10b981',
  Onboarded: '#22c55e', Rejected: '#ef4444', Ghosted: '#9ca3af',
  'Call Done': '#8b5cf6', Reviewing: '#06b6d4', 'Not Interested': '#ef4444',
  'Follow Later': '#f59e0b',
};

const STATUS_COLORS = {
  Active: '#22c55e', Onboarded: '#3b82f6', Rejected: '#ef4444',
  Ghosted: '#9ca3af', Paused: '#f59e0b', 'Not Interested': '#ef4444',
  'Follow Later': '#f59e0b',
};

export default function CRMTable({ records, type, onEdit, onDelete, onStageChange, stages }) {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const isStartup = type === 'startup';

  // ── Filter logic ──
  const filtered = records.filter((r) => {
    const name = isStartup ? r.startupName : r.investorName;
    const matchSearch = name?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase()) ||
      r.source?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'All' || r.pipelineStage === filterStage;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchStage && matchStatus;
  });

  // ── Follow-up alert ──
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return dayjs(dateStr).isBefore(dayjs(), 'day');
  };

  return (
    <div>
      {/* ── Search + Filters ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, source, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px',
            fontSize: '14px', width: '260px',
          }}
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        >
          <option value="All">All Stages</option>
          {stages.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        >
          {['All', 'Active', 'Onboarded', 'Rejected', 'Ghosted', 'Paused', 'Not Interested', 'Follow Later'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888', alignSelf: 'center' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>
          No records found. Add one using the button above.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead style={{ background: '#fafafa' }}>
              <tr>
                <th style={thStyle}>{isStartup ? 'Startup' : 'Investor'}</th>
                <th style={thStyle}>{isStartup ? 'Founder' : 'Fund / Firm'}</th>
                <th style={thStyle}>{isStartup ? 'Industry' : 'Type'}</th>
                <th style={thStyle}>Pipeline Stage</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Next Follow-up</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const followUp = isStartup ? r.nextFollowUpDate : r.nextFollowUp;
                const overdue = isOverdue(followUp);
                return (
                  <tr key={r.id} style={{ background: overdue ? '#fff8f8' : '#fff' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>
                        {isStartup ? r.startupName : r.investorName}
                      </div>
                      {overdue && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                          ⚠ Follow-up overdue
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{isStartup ? r.founderName : r.fund || '—'}</td>
                    <td style={tdStyle}>{isStartup ? (r.industry || '—') : (r.type || '—')}</td>
                    <td style={tdStyle}>
                      <select
                        value={r.pipelineStage}
                        onChange={(e) => onStageChange(r.id, e.target.value)}
                        style={{
                          ...badgeStyle(STAGE_COLORS[r.pipelineStage] || '#888'),
                          border: 'none', cursor: 'pointer', outline: 'none',
                        }}
                      >
                        {stages.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(STATUS_COLORS[r.status] || '#888')}>
                        {r.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {followUp ? (
                        <span style={{ color: overdue ? '#ef4444' : '#333', fontWeight: overdue ? '600' : '400' }}>
                          {dayjs(followUp).format('DD MMM YYYY')}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>{r.source || '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onEdit(r)}
                          style={{
                            padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd',
                            borderRadius: '4px', cursor: 'pointer', background: '#fff',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this record?')) onDelete(r.id);
                          }}
                          style={{
                            padding: '4px 12px', fontSize: '12px', border: '1px solid #fca5a5',
                            borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#ef4444',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}