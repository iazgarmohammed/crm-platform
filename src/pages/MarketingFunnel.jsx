import { exportToCSV } from '../utils/exportCSV';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import useMarketingStore, {
  FUNNEL_STAGES, LEAD_TYPES, SOURCE_CHANNELS, MARKETING_STATUS,
} from '../store/marketingStore';

const pageStyle = { padding: '24px', maxWidth: '1200px', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' };

const STAGE_COLORS = {
  Awareness: '#888', Interest: '#f59e0b', Lead: '#3b82f6',
  Nurturing: '#8b5cf6', Converted: '#22c55e', Lost: '#ef4444',
};

const badgeStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', background: color + '22', color,
});

const LEAD_DEFAULTS = {
  leadName: '', leadType: '', contact: '', sourceChannel: '',
  campaignName: '', assignedTo: '', funnelStage: 'Lead',
  leadDate: '', lastTouchpoint: '', nextActionDate: '',
  conversionDate: '', notes: '', status: 'Active',
};

const CAMPAIGN_DEFAULTS = {
  campaignName: '', channel: '', targetAudience: '', startDate: '',
  endDate: '', reach: '', clicks: '', leadsGenerated: '',
  conversions: '', cost: '', notes: '',
};

export default function MarketingFunnel() {
  const { leads, campaigns, addLead, updateLead, deleteLead, updateLeadStage, addCampaign, updateCampaign, deleteCampaign, fetchLeads, fetchCampaigns, loading } = useMarketingStore();

useEffect(() => { fetchLeads(); fetchCampaigns(); }, []);
  const [activeTab, setActiveTab] = useState('leads');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('lead');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(LEAD_DEFAULTS);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openAddLead = () => { setModalType('lead'); setEditing(null); setForm(LEAD_DEFAULTS); setModalOpen(true); };
  const openAddCampaign = () => { setModalType('campaign'); setEditing(null); setForm(CAMPAIGN_DEFAULTS); setModalOpen(true); };
  const openEdit = (record, type) => { setModalType(type); setEditing(record); setForm({ ...(type === 'lead' ? LEAD_DEFAULTS : CAMPAIGN_DEFAULTS), ...record }); setModalOpen(true); };

  const handleSave = () => {
    if (modalType === 'lead') {
      if (!form.leadName?.trim()) { alert('Lead name is required.'); return; }
      if (editing) updateLead(editing.id, form);
      else addLead(form);
    } else {
      if (!form.campaignName?.trim()) { alert('Campaign name is required.'); return; }
      if (editing) updateCampaign(editing.id, form);
      else addCampaign(form);
    }
    setModalOpen(false);
  };

  const isOverdue = (date) => date && dayjs(date).isBefore(dayjs(), 'day');

  const filteredLeads = leads.filter((r) => {
    const matchSearch = r.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      r.assignedTo?.toLowerCase().includes(search.toLowerCase()) ||
      r.campaignName?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'All' || r.funnelStage === filterStage;
    return matchSearch && matchStage;
  });

  // ── Stats ──
  const totalLeads = leads.length;
  const converted = leads.filter((l) => l.funnelStage === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;
  const overdueCount = leads.filter((l) => isOverdue(l.nextActionDate)).length;

  // ── Funnel counts ──
  const funnelCounts = FUNNEL_STAGES.map((s) => ({
    stage: s,
    count: leads.filter((l) => l.funnelStage === s).length,
    color: STAGE_COLORS[s],
  }));

  const tabStyle = (active) => ({
    padding: '10px 24px', fontSize: '14px', fontWeight: active ? '700' : '500',
    color: active ? '#1a1a1a' : '#888', background: 'none', border: 'none',
    borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent',
    marginBottom: '-2px', cursor: 'pointer',
  });

  return (
    <div style={pageStyle}>

      <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => exportToCSV(activeTab === 'leads' ? leads : campaigns, activeTab === 'leads' ? 'leads' : 'campaigns')}
    style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
  >
    Export CSV
  </button>
  <button onClick={openAddCampaign} style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
    + Add Campaign
  </button>
  <button onClick={openAddLead} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
    + Add Lead
  </button>
</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Leads', value: totalLeads, color: '#3b82f6' },
          { label: 'Converted', value: converted, color: '#22c55e' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#8b5cf6' },
          { label: 'Overdue Actions', value: overdueCount, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel Visual */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Funnel Breakdown</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '80px' }}>
          {funnelCounts.map(({ stage, count, color }) => {
            const max = Math.max(...funnelCounts.map((f) => f.count), 1);
            const height = count === 0 ? 8 : Math.max(16, (count / max) * 72);
            return (
              <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{count}</div>
                <div style={{ width: '100%', height: `${height}px`, background: color + '33', borderRadius: '4px 4px 0 0', border: `1px solid ${color}` }} />
                <div style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>{stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
        <button style={tabStyle(activeTab === 'leads')} onClick={() => setActiveTab('leads')}>Leads ({leads.length})</button>
        <button style={tabStyle(activeTab === 'campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns ({campaigns.length})</button>
      </div>

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input placeholder="Search by name, intern, campaign..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '280px' }} />
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
              <option value="All">All Stages</option>
              {FUNNEL_STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888', alignSelf: 'center' }}>
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>No leads found. Add one above.</div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead style={{ background: '#fafafa' }}>
                  <tr>
                    <th style={thStyle}>Lead</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Assigned To</th>
                    <th style={thStyle}>Funnel Stage</th>
                    <th style={thStyle}>Next Action</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((r) => {
                    const overdue = isOverdue(r.nextActionDate);
                    return (
                      <tr key={r.id} style={{ background: overdue ? '#fff8f8' : '#fff' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600' }}>{r.leadName}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{r.contact || ''}</div>
                          {overdue && <div style={{ fontSize: '11px', color: '#ef4444' }}>⚠ Action overdue</div>}
                        </td>
                        <td style={tdStyle}><span style={badgeStyle('#3b82f6')}>{r.leadType || '—'}</span></td>
                        <td style={tdStyle}>{r.sourceChannel || '—'}</td>
                        <td style={tdStyle}>{r.assignedTo || '—'}</td>
                        <td style={tdStyle}>
                          <select value={r.funnelStage} onChange={(e) => updateLeadStage(r.id, e.target.value)}
                            style={{ ...badgeStyle(STAGE_COLORS[r.funnelStage] || '#888'), border: 'none', cursor: 'pointer', outline: 'none' }}>
                            {FUNNEL_STAGES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={tdStyle}>
                          {r.nextActionDate ? (
                            <span style={{ color: overdue ? '#ef4444' : '#333', fontWeight: overdue ? '600' : '400' }}>
                              {dayjs(r.nextActionDate).format('DD MMM YYYY')}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEdit(r, 'lead')} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Edit</button>
                            <button onClick={() => { if (window.confirm('Delete this lead?')) deleteLead(r.id); }} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#ef4444' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>No campaigns yet. Add one above.</div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead style={{ background: '#fafafa' }}>
                  <tr>
                    <th style={thStyle}>Campaign</th>
                    <th style={thStyle}>Channel</th>
                    <th style={thStyle}>Target</th>
                    <th style={thStyle}>Reach</th>
                    <th style={thStyle}>Leads</th>
                    <th style={thStyle}>Conversions</th>
                    <th style={thStyle}>Conv. Rate</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const rate = c.leadsGenerated > 0
                      ? ((c.conversions / c.leadsGenerated) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={c.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600' }}>{c.campaignName}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {c.startDate ? dayjs(c.startDate).format('DD MMM') : ''}{c.endDate ? ` → ${dayjs(c.endDate).format('DD MMM')}` : ''}
                          </div>
                        </td>
                        <td style={tdStyle}>{c.channel || '—'}</td>
                        <td style={tdStyle}>{c.targetAudience || '—'}</td>
                        <td style={tdStyle}>{c.reach ? Number(c.reach).toLocaleString() : '—'}</td>
                        <td style={tdStyle}>{c.leadsGenerated || '—'}</td>
                        <td style={tdStyle}>{c.conversions || '—'}</td>
                        <td style={tdStyle}>
                          <span style={badgeStyle(Number(rate) >= 20 ? '#22c55e' : Number(rate) >= 10 ? '#f59e0b' : '#ef4444')}>
                            {rate}%
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEdit(c, 'campaign')} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Edit</button>
                            <button onClick={() => { if (window.confirm('Delete this campaign?')) deleteCampaign(c.id); }} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#ef4444' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '560px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editing ? 'Edit' : 'Add'} {modalType === 'lead' ? 'Lead' : 'Campaign'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {modalType === 'lead' ? (
              <>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Lead Name *</label><input style={inputStyle} name="leadName" value={form.leadName} onChange={handle} placeholder="Full name" /></div>
                  <div><label style={labelStyle}>Lead Type</label>
                    <select style={inputStyle} name="leadType" value={form.leadType} onChange={handle}>
                      <option value="">Select</option>
                      {LEAD_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Contact (Phone / Email)</label><input style={inputStyle} name="contact" value={form.contact} onChange={handle} /></div>
                  <div><label style={labelStyle}>Source Channel</label>
                    <select style={inputStyle} name="sourceChannel" value={form.sourceChannel} onChange={handle}>
                      <option value="">Select</option>
                      {SOURCE_CHANNELS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Campaign Name</label><input style={inputStyle} name="campaignName" value={form.campaignName} onChange={handle} /></div>
                  <div><label style={labelStyle}>Assigned To (Intern)</label><input style={inputStyle} name="assignedTo" value={form.assignedTo} onChange={handle} /></div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Funnel Stage</label>
                    <select style={inputStyle} name="funnelStage" value={form.funnelStage} onChange={handle}>
                      {FUNNEL_STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label style={labelStyle}>Status</label>
                    <select style={inputStyle} name="status" value={form.status} onChange={handle}>
                      {MARKETING_STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Lead Date</label><input style={inputStyle} type="date" name="leadDate" value={form.leadDate} onChange={handle} /></div>
                  <div><label style={labelStyle}>Next Action Date</label><input style={inputStyle} type="date" name="nextActionDate" value={form.nextActionDate} onChange={handle} /></div>
                </div>
                <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} /></div>
              </>
            ) : (
              <>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Campaign Name *</label><input style={inputStyle} name="campaignName" value={form.campaignName} onChange={handle} /></div>
                  <div><label style={labelStyle}>Channel</label>
                    <select style={inputStyle} name="channel" value={form.channel} onChange={handle}>
                      <option value="">Select</option>
                      {SOURCE_CHANNELS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Target Audience</label><input style={inputStyle} name="targetAudience" value={form.targetAudience} onChange={handle} /></div>
                  <div><label style={labelStyle}>Cost (₹)</label><input style={inputStyle} type="number" name="cost" value={form.cost} onChange={handle} /></div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Start Date</label><input style={inputStyle} type="date" name="startDate" value={form.startDate} onChange={handle} /></div>
                  <div><label style={labelStyle}>End Date</label><input style={inputStyle} type="date" name="endDate" value={form.endDate} onChange={handle} /></div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Reach / Impressions</label><input style={inputStyle} type="number" name="reach" value={form.reach} onChange={handle} /></div>
                  <div><label style={labelStyle}>Clicks / Responses</label><input style={inputStyle} type="number" name="clicks" value={form.clicks} onChange={handle} /></div>
                </div>
                <div style={rowStyle}>
                  <div><label style={labelStyle}>Leads Generated</label><input style={inputStyle} type="number" name="leadsGenerated" value={form.leadsGenerated} onChange={handle} /></div>
                  <div><label style={labelStyle}>Conversions</label><input style={inputStyle} type="number" name="conversions" value={form.conversions} onChange={handle} /></div>
                </div>
                <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} /></div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                {editing ? 'Save Changes' : `Add ${modalType === 'lead' ? 'Lead' : 'Campaign'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}