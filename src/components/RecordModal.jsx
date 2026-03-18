import { useState, useEffect } from 'react';
import {
  STARTUP_STAGES, INVESTOR_STAGES,
  INDUSTRIES, STARTUP_STAGE_OPTIONS,
  INVESTOR_TYPES, STATUS_OPTIONS
} from '../store/investmentStore';

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  background: '#fff', borderRadius: '8px', padding: '24px',
  width: '560px', maxHeight: '85vh', overflowY: 'auto',
  display: 'flex', flexDirection: 'column', gap: '16px',
};
const inputStyle = {
  width: '100%', padding: '8px 10px', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '14px',
};
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

const STARTUP_DEFAULTS = {
  startupName: '', founderName: '', phone: '', email: '', linkedIn: '',
  industry: '', startupStage: '', source: '', pipelineStage: 'Identified',
  lastContactDate: '', nextFollowUpDate: '', validationScore: '',
  investorMatch: 'No', notes: '', status: 'Active',
};

const INVESTOR_DEFAULTS = {
  investorName: '', fund: '', email: '', linkedIn: '',
  type: '', ticketSizeMin: '', ticketSizeMax: '', sectors: '',
  source: '', pipelineStage: 'Identified', lastContact: '',
  nextFollowUp: '', startupsShown: 0, matchesMade: 0, notes: '', status: 'Active',
};

export default function RecordModal({ isOpen, onClose, onSave, type, existing }) {
  const isStartup = type === 'startup';
  const defaults = isStartup ? STARTUP_DEFAULTS : INVESTOR_DEFAULTS;

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (existing) setForm({ ...defaults, ...existing });
    else setForm(defaults);
  }, [existing, isOpen]);

  if (!isOpen) return null;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    const required = isStartup
      ? [form.startupName, form.founderName, form.pipelineStage]
      : [form.investorName, form.pipelineStage];
    if (required.some((v) => !v || v.trim() === '')) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
            {existing ? 'Edit' : 'Add'} {isStartup ? 'Startup' : 'Investor'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* ── STARTUP FORM ── */}
        {isStartup && (
          <>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Startup Name *</label>
                <input style={inputStyle} name="startupName" value={form.startupName} onChange={handle} placeholder="Company name" />
              </div>
              <div>
                <label style={labelStyle}>Founder Name *</label>
                <input style={inputStyle} name="founderName" value={form.founderName} onChange={handle} placeholder="Primary contact" />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} name="email" value={form.email} onChange={handle} placeholder="founder@startup.com" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input style={inputStyle} name="linkedIn" value={form.linkedIn} onChange={handle} placeholder="https://linkedin.com/in/..." />
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Industry</label>
                <select style={inputStyle} name="industry" value={form.industry} onChange={handle}>
                  <option value="">Select</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Startup Stage</label>
                <select style={inputStyle} name="startupStage" value={form.startupStage} onChange={handle}>
                  <option value="">Select</option>
                  {STARTUP_STAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Pipeline Stage *</label>
                <select style={inputStyle} name="pipelineStage" value={form.pipelineStage} onChange={handle}>
                  {STARTUP_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} name="status" value={form.status} onChange={handle}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Last Contact Date</label>
                <input style={inputStyle} type="date" name="lastContactDate" value={form.lastContactDate} onChange={handle} />
              </div>
              <div>
                <label style={labelStyle}>Next Follow-up Date</label>
                <input style={inputStyle} type="date" name="nextFollowUpDate" value={form.nextFollowUpDate} onChange={handle} />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Source (Intern Name)</label>
                <input style={inputStyle} name="source" value={form.source} onChange={handle} placeholder="Who found this lead" />
              </div>
              <div>
                <label style={labelStyle}>Investor Match</label>
                <select style={inputStyle} name="investorMatch" value={form.investorMatch} onChange={handle}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Validation Score</label>
              <input style={inputStyle} type="number" name="validationScore" value={form.validationScore} onChange={handle} placeholder="Auto-generated score" />
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} placeholder="Conversation details, objections, commitments..." />
            </div>
          </>
        )}

        {/* ── INVESTOR FORM ── */}
        {!isStartup && (
          <>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Investor Name *</label>
                <input style={inputStyle} name="investorName" value={form.investorName} onChange={handle} placeholder="Full name" />
              </div>
              <div>
                <label style={labelStyle}>Fund / Firm</label>
                <input style={inputStyle} name="fund" value={form.fund} onChange={handle} placeholder="Firm name if applicable" />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} name="email" value={form.email} onChange={handle} placeholder="investor@firm.com" />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn</label>
                <input style={inputStyle} name="linkedIn" value={form.linkedIn} onChange={handle} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Investor Type</label>
                <select style={inputStyle} name="type" value={form.type} onChange={handle}>
                  <option value="">Select</option>
                  {INVESTOR_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sectors (comma separated)</label>
                <input style={inputStyle} name="sectors" value={form.sectors} onChange={handle} placeholder="Fintech, Edtech, SaaS" />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Ticket Size Min (₹)</label>
                <input style={inputStyle} name="ticketSizeMin" value={form.ticketSizeMin} onChange={handle} placeholder="e.g. 500000" />
              </div>
              <div>
                <label style={labelStyle}>Ticket Size Max (₹)</label>
                <input style={inputStyle} name="ticketSizeMax" value={form.ticketSizeMax} onChange={handle} placeholder="e.g. 5000000" />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Pipeline Stage *</label>
                <select style={inputStyle} name="pipelineStage" value={form.pipelineStage} onChange={handle}>
                  {INVESTOR_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} name="status" value={form.status} onChange={handle}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Last Contact Date</label>
                <input style={inputStyle} type="date" name="lastContact" value={form.lastContact} onChange={handle} />
              </div>
              <div>
                <label style={labelStyle}>Next Follow-up Date</label>
                <input style={inputStyle} type="date" name="nextFollowUp" value={form.nextFollowUp} onChange={handle} />
              </div>
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Source (Intern Name)</label>
                <input style={inputStyle} name="source" value={form.source} onChange={handle} placeholder="Who found this lead" />
              </div>
              <div>
                <label style={labelStyle}>Startups Shown</label>
                <input style={inputStyle} type="number" name="startupsShown" value={form.startupsShown} onChange={handle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handle} placeholder="What they said, what they want, objections..." />
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            {existing ? 'Save Changes' : 'Add Record'}
          </button>
        </div>

      </div>
    </div>
  );
}