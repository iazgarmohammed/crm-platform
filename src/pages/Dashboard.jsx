import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useInvestmentStore from '../store/investmentStore';
import useEducationStore from '../store/educationStore';
import useMarketingStore from '../store/marketingStore';
import useCreatorStore from '../store/creatorStore';
import useUserStore from '../store/userStore';

const pageStyle = { padding: '24px', maxWidth: '1200px', margin: '0 auto' };

const statCardStyle = (color) => ({
  background: '#fff', border: '1px solid #eee', borderRadius: '10px',
  padding: '18px 20px', borderLeft: `4px solid ${color}`,
});

const moduleCardStyle = (color) => ({
  background: '#fff', border: '1px solid #eee', borderRadius: '10px',
  padding: '20px', borderLeft: `4px solid ${color}`, cursor: 'pointer',
});

const alertCardStyle = {
  background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: '8px',
  padding: '12px 16px', marginBottom: '10px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const sectionTitle = {
  fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#1a1a1a',
};

export default function Dashboard() {
  const navigate = useNavigate();

  // ── Pull from all stores ──
  const { startups, investors } = useInvestmentStore();
  const { institutions } = useEducationStore();
  const { leads, campaigns } = useMarketingStore();
  const { creators } = useCreatorStore();
  const { snapshots } = useUserStore();

  const today = dayjs().startOf('day');
  const latest = snapshots[0] || null;

  // ── Investment ──
  const totalStartups = startups.length;
  const totalInvestors = investors.length;
  const onboardedStartups = startups.filter((s) => s.pipelineStage === 'Onboarded').length;
  const onboardedInvestors = investors.filter((i) => i.pipelineStage === 'Onboarded').length;

  const overdueStartups = startups.filter((s) => s.nextFollowUpDate && dayjs(s.nextFollowUpDate).isBefore(today));
  const overdueInvestors = investors.filter((i) => i.nextFollowUp && dayjs(i.nextFollowUp).isBefore(today));
  const overdueEducation = institutions.filter((i) => i.nextFollowUp && dayjs(i.nextFollowUp).isBefore(today));
  const overdueLeads = leads.filter((l) => l.nextActionDate && dayjs(l.nextActionDate).isBefore(today));

  const allOverdue = [
    ...overdueStartups.map((s) => ({ name: s.startupName, type: 'Startup', date: s.nextFollowUpDate, stage: s.pipelineStage, path: '/investment' })),
    ...overdueInvestors.map((i) => ({ name: i.investorName, type: 'Investor', date: i.nextFollowUp, stage: i.pipelineStage, path: '/investment' })),
    ...overdueEducation.map((i) => ({ name: i.institutionName, type: 'Institution', date: i.nextFollowUp, stage: i.pipelineStage, path: '/education' })),
    ...overdueLeads.map((l) => ({ name: l.leadName, type: 'Lead', date: l.nextActionDate, stage: l.funnelStage, path: '/marketing' })),
  ].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  // ── Education ──
  const totalInstitutions = institutions.length;
  const confirmedPrograms = institutions.filter((i) => i.pipelineStage === 'Confirmed').length;
  const deliveredPrograms = institutions.filter((i) => i.pipelineStage === 'Delivered').length;

  // ── Marketing ──
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.funnelStage === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // ── Creators ──
  const totalCreators = creators.length;
  const activeCreators = creators.filter((c) => c.pipelineStage === 'Active').length;
  const inactiveCreators = creators.filter((c) => {
    if (!c.lastPostDate || c.pipelineStage !== 'Active') return false;
    return dayjs().diff(dayjs(c.lastPostDate), 'day') >= 14;
  }).length;

  // ── Analytics ──
  const dauMauRatio = latest && Number(latest.mau) > 0
    ? ((Number(latest.dau) / Number(latest.mau)) * 100).toFixed(1)
    : null;

  // ── Startup pipeline breakdown ──
  const pipelineStages = ['Identified', 'Contacted', 'Responded', 'Demo Done', 'Interested', 'Validated', 'Onboarded'];
  const startupsByStage = pipelineStages.map((stage) => ({
    stage,
    count: startups.filter((s) => s.pipelineStage === stage).length,
  }));

  const TYPE_COLORS = {
    Startup: '#3b82f6', Investor: '#8b5cf6',
    Institution: '#f59e0b', Lead: '#ef4444',
  };

  return (
    <div style={pageStyle}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>SPREZOX CRM</h1>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
          {dayjs().format('dddd, DD MMMM YYYY')} — Live overview of all 5 modules
        </p>
      </div>

      {/* ── Overdue Alert Banner ── */}
      {allOverdue.length > 0 && (
        <div style={{ background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444', marginBottom: '12px' }}>
            ⚠ {allOverdue.length} Overdue Follow-up{allOverdue.length !== 1 ? 's' : ''} — Action needed today
          </div>
          {allOverdue.slice(0, 4).map((item, i) => (
            <div key={i} style={alertCardStyle}>
              <div>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</span>
                <span style={{
                  marginLeft: '10px', fontSize: '11px', padding: '2px 8px',
                  borderRadius: '10px', fontWeight: '600',
                  background: (TYPE_COLORS[item.type] || '#888') + '22',
                  color: TYPE_COLORS[item.type] || '#888',
                }}>
                  {item.type}
                </span>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Stage: {item.stage} · Due: {dayjs(item.date).format('DD MMM YYYY')}
                </div>
              </div>
              <button onClick={() => navigate(item.path)} style={{
                padding: '6px 14px', fontSize: '12px', background: '#1a1a1a',
                color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer',
              }}>
                Go to CRM
              </button>
            </div>
          ))}
          {allOverdue.length > 4 && (
            <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '8px' }}>
              +{allOverdue.length - 4} more overdue across modules
            </div>
          )}
        </div>
      )}

      {/* ── Module 1: Investment ── */}
      <div style={sectionTitle}>Investment & Startup CRM</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Startups', value: totalStartups, color: '#3b82f6' },
          { label: 'Startups Onboarded', value: onboardedStartups, color: '#22c55e' },
          { label: 'Total Investors', value: totalInvestors, color: '#8b5cf6' },
          { label: 'Investors Onboarded', value: onboardedInvestors, color: '#10b981' },
        ].map((s) => (
          <div key={s.label} style={{ ...statCardStyle(s.color), cursor: 'pointer' }} onClick={() => navigate('/investment')}>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Startup Pipeline Breakdown ── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>Startup Pipeline</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {startupsByStage.map(({ stage, count }) => (
            <div key={stage} style={{
              background: '#fafafa', border: '1px solid #eee', borderRadius: '8px',
              padding: '10px 14px', textAlign: 'center', minWidth: '90px',
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{count}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Module 2: Education ── */}
      <div style={sectionTitle}>Education Programs CRM</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Institutions', value: totalInstitutions, color: '#f59e0b' },
          { label: 'Confirmed Programs', value: confirmedPrograms, color: '#22c55e' },
          { label: 'Delivered', value: deliveredPrograms, color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} style={{ ...statCardStyle(s.color), cursor: 'pointer' }} onClick={() => navigate('/education')}>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Module 5: Marketing ── */}
      <div style={sectionTitle}>Marketing & Sales Funnel</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Leads', value: totalLeads, color: '#ef4444' },
          { label: 'Converted', value: convertedLeads, color: '#22c55e' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} style={{ ...statCardStyle(s.color), cursor: 'pointer' }} onClick={() => navigate('/marketing')}>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Module 4: Creators ── */}
      <div style={sectionTitle}>Creator Onboarding CRM</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Creators', value: totalCreators, color: '#8b5cf6' },
          { label: 'Posting Weekly', value: activeCreators, color: '#22c55e' },
          { label: 'Gone Inactive', value: inactiveCreators, color: '#f97316' },
        ].map((s) => (
          <div key={s.label} style={{ ...statCardStyle(s.color), cursor: 'pointer' }} onClick={() => navigate('/creators')}>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Module 3: Analytics ── */}
      <div style={sectionTitle}>App User Analytics</div>
      {latest ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total Signups', value: latest.totalSignups, color: '#3b82f6' },
            { label: 'DAU', value: latest.dau, color: '#22c55e' },
            { label: 'MAU', value: latest.mau, color: '#10b981' },
            { label: 'DAU/MAU Ratio', value: dauMauRatio ? `${dauMauRatio}%` : '—', color: Number(dauMauRatio) >= 20 ? '#22c55e' : '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{ ...statCardStyle(s.color), cursor: 'pointer' }} onClick={() => navigate('/analytics')}>
              <div style={{ fontSize: '26px', fontWeight: '700' }}>{s.value || '—'}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '28px', color: '#aaa', fontSize: '13px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/analytics')}>
          No analytics data yet — click to log your first weekly snapshot
        </div>
      )}

      {/* ── All Modules Quick Nav ── */}
      <div style={sectionTitle}>Quick Navigation</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { label: 'Investment & Startup CRM', desc: 'Startups + investors through acquisition pipeline', path: '/investment', color: '#3b82f6' },
          { label: 'Education Programs CRM', desc: 'Schools & colleges for seminars and workshops', path: '/education', color: '#f59e0b' },
          { label: 'App User Analytics', desc: 'Signups, actives, deletions, DAU/MAU health', path: '/analytics', color: '#10b981' },
          { label: 'Creator Onboarding CRM', desc: 'Creator acquisition, content volume, activity', path: '/creators', color: '#8b5cf6' },
          { label: 'Marketing & Sales Funnel', desc: 'Lead gen, campaigns, conversion tracking', path: '/marketing', color: '#ef4444' },
        ].map((m) => (
          <div key={m.path} style={moduleCardStyle(m.color)} onClick={() => navigate(m.path)}>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{m.desc}</div>
            <div style={{ fontSize: '12px', color: m.color, marginTop: '10px', fontWeight: '600' }}>Open →</div>
          </div>
        ))}
      </div>

    </div>
  );
}