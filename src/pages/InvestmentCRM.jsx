import { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/exportCSV';
import useInvestmentStore, {
  STARTUP_STAGES,
  INVESTOR_STAGES,
} from '../store/investmentStore';
import CRMTable from '../components/CRMTable';
import RecordModal from '../components/RecordModal';

const pageStyle = {
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
};
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};
const tabContainerStyle = {
  display: 'flex',
  gap: '0',
  marginBottom: '24px',
  borderBottom: '2px solid #eee',
};
const tabStyle = (active) => ({
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: active ? '700' : '500',
  color: active ? '#1a1a1a' : '#888',
  borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent',
  marginBottom: '-2px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent',
});
const addBtnStyle = {
  padding: '10px 20px',
  background: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};
const statRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginBottom: '24px',
};
const statCardStyle = (color) => ({
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '16px 20px',
  borderLeft: `4px solid ${color}`,
});

export default function InvestmentCRM() {
  const {
  startups, investors, activeTab, setActiveTab,
  addStartup, updateStartup, deleteStartup, updateStartupStage,
  addInvestor, updateInvestor, deleteInvestor, updateInvestorStage,
  fetchStartups, fetchInvestors, loading,
} = useInvestmentStore();

useEffect(() => {
  fetchStartups();
  fetchInvestors();
}, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const isStartup = activeTab === 'startups';
  const records = isStartup ? startups : investors;

  // ── Stats ──
  const total = records.length;
  const active = records.filter((r) => r.status === 'Active').length;
  const onboarded = records.filter((r) => r.pipelineStage === 'Onboarded').length;
  const overdue = records.filter((r) => {
    const date = isStartup ? r.nextFollowUpDate : r.nextFollowUp;
    if (!date) return false;
    return new Date(date) < new Date(new Date().toDateString());
  }).length;

  // ── Handlers ──
  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleSave = (formData) => {
    if (isStartup) {
      if (editingRecord) updateStartup(editingRecord.id, formData);
      else addStartup(formData);
    } else {
      if (editingRecord) updateInvestor(editingRecord.id, formData);
      else addInvestor(formData);
    }
  };

  const handleDelete = (id) => {
    if (isStartup) deleteStartup(id);
    else deleteInvestor(id);
  };

  const handleStageChange = (id, newStage) => {
    if (isStartup) updateStartupStage(id, newStage);
    else updateInvestorStage(id, newStage);
  };

 return (
  <div style={pageStyle}>
    {loading && (
      <div style={{ textAlign: 'center', padding: '48px', color: '#888', fontSize: '14px' }}>
        Loading...
      </div>
    )}

<div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => exportToCSV(records, isStartup ? 'startups' : 'investors')}
    style={{ padding: '10px 20px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
  >
    Export CSV
  </button>
  <button style={addBtnStyle} onClick={handleAdd}>
    + Add {isStartup ? 'Startup' : 'Investor'}
  </button>
</div>

      {/* ── Stat Cards ── */}
      <div style={statRowStyle}>
        <div style={statCardStyle('#3b82f6')}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{total}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Total {isStartup ? 'Startups' : 'Investors'}</div>
        </div>
        <div style={statCardStyle('#22c55e')}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{active}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Active</div>
        </div>
        <div style={statCardStyle('#8b5cf6')}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{onboarded}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Onboarded</div>
        </div>
        <div style={statCardStyle('#ef4444')}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{overdue}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Overdue Follow-ups</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={tabContainerStyle}>
        <button style={tabStyle(activeTab === 'startups')} onClick={() => setActiveTab('startups')}>
          Startups ({startups.length})
        </button>
        <button style={tabStyle(activeTab === 'investors')} onClick={() => setActiveTab('investors')}>
          Investors ({investors.length})
        </button>
      </div>

      {/* ── Table ── */}
      <CRMTable
        records={records}
        type={isStartup ? 'startup' : 'investor'}
        stages={isStartup ? STARTUP_STAGES : INVESTOR_STAGES}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStageChange={handleStageChange}
      />

      {/* ── Modal ── */}
      <RecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        type={isStartup ? 'startup' : 'investor'}
        existing={editingRecord}
      />

    </div>
  );
}