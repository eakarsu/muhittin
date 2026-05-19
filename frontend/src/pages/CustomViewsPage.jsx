import ActivityChart from '../components/ActivityChart';
import EngagementHeatmap from '../components/EngagementHeatmap';
import SummaryPdfPanel from '../components/SummaryPdfPanel';
import PreferenceRulesEditor from '../components/PreferenceRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', marginBottom: 4 }}>Custom Views</h1>
      <p style={{ color: '#9aa', marginTop: 0, marginBottom: 20 }}>
        Cross-cutting analytics and configuration: activity timeline, engagement heatmap,
        downloadable executive summary, and editable automation rules.
      </p>
      <ActivityChart />
      <EngagementHeatmap />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
        <SummaryPdfPanel />
        <PreferenceRulesEditor />
      </div>
    </div>
  );
}
