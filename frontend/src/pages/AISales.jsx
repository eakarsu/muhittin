import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { key: 'deal', label: 'Deal Close Prediction' },
  { key: 'territory', label: 'Territory Optimizer' },
  { key: 'revenue', label: 'Revenue Forecast' },
  { key: 'workflow', label: 'Workflow Automation' },
  { key: 'commission', label: 'Commission Tracking' },
  { key: 'churn', label: 'Customer Churn Prediction' },
];

export default function AISales() {
  const [active, setActive] = useState('deal');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Sales Intelligence</h1>
          <p className="subtitle">Deal predictions, territory optimization, and revenue forecasting</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: active === t.key ? '#fff' : '#f9fafb',
                fontWeight: active === t.key ? 700 : 500,
                borderBottom: active === t.key ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 20 }}>
          {active === 'deal' && <DealClosePrediction />}
          {active === 'territory' && <TerritoryOptimizer />}
          {active === 'revenue' && <RevenueForecast />}
          {active === 'workflow' && <WorkflowAutomation />}
          {active === 'commission' && <CommissionTracking />}
          {active === 'churn' && <CustomerChurnPrediction />}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result, error, loading }) {
  if (loading) return <div className="card" style={{ marginTop: 12 }}><div className="spinner" /> Working...</div>;
  if (error) return <div className="card" style={{ marginTop: 12, color: '#b91c1c' }}>{error}</div>;
  if (!result) return null;
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Result</h3>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function JsonInput({ label, value, onChange, rows = 8, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 13 }}
        placeholder={placeholder}
      />
    </div>
  );
}

function useAI(endpoint) {
  const { api } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (body) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      setResult(data.content || data);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, submit };
}

function DealClosePrediction() {
  const [deal, setDeal] = useState(JSON.stringify({
    id: 'deal-001', name: 'Acme expansion', stage: 'proposal', value: 75000, owner: 'rep-1',
    daysInStage: 14, lastActivity: '2026-04-30',
  }, null, 2));
  const [history, setHistory] = useState('[]');
  const { result, loading, error, submit } = useAI('/api/ai/deal-close-prediction');

  const onSubmit = (e) => {
    e.preventDefault();
    let dealObj, historyArr;
    try { dealObj = JSON.parse(deal); } catch { return alert('Deal must be JSON'); }
    try { historyArr = JSON.parse(history); } catch { return alert('History must be JSON array'); }
    submit({ deal: dealObj, history: historyArr });
  };

  return (
    <form onSubmit={onSubmit}>
      <JsonInput label="Deal *" value={deal} onChange={setDeal} />
      <JsonInput label="History (last 20)" value={history} onChange={setHistory} rows={6} placeholder="[]" />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Close'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}

function TerritoryOptimizer() {
  const [reps, setReps] = useState('[\n  {"id": "rep-1", "name": "Alex", "skills": ["fintech"], "region": "NW"}\n]');
  const [accounts, setAccounts] = useState('[\n  {"id": "acc-1", "name": "Acme", "industry": "fintech", "region": "NW", "size": "mid"}\n]');
  const [constraints, setConstraints] = useState('{\n  "maxAccountsPerRep": 30\n}');
  const { result, loading, error, submit } = useAI('/api/ai/territory-optimizer');

  const onSubmit = (e) => {
    e.preventDefault();
    let r, a, c;
    try { r = JSON.parse(reps); } catch { return alert('Reps must be a JSON array'); }
    try { a = JSON.parse(accounts); } catch { return alert('Accounts must be a JSON array'); }
    try { c = JSON.parse(constraints); } catch { return alert('Constraints must be JSON'); }
    submit({ reps: r, accounts: a, constraints: c });
  };

  return (
    <form onSubmit={onSubmit}>
      <JsonInput label="Reps * (array)" value={reps} onChange={setReps} />
      <JsonInput label="Accounts * (array)" value={accounts} onChange={setAccounts} />
      <JsonInput label="Constraints (object)" value={constraints} onChange={setConstraints} rows={5} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Optimizing...' : 'Optimize Territories'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}

function WorkflowAutomation() {
  const [goal, setGoal] = useState('Auto-route inbound leads and require approvals for discounts above 15%');
  const [triggers, setTriggers] = useState('[\n  {"event": "lead_created"},\n  {"event": "discount_requested", "threshold": 0.15}\n]');
  const [currentRules, setCurrentRules] = useState('[]');
  const { result, loading, error, submit } = useAI('/api/ai/workflow-automation');

  const onSubmit = (e) => {
    e.preventDefault();
    let t, r;
    try { t = JSON.parse(triggers); } catch { return alert('Triggers must be JSON array'); }
    try { r = JSON.parse(currentRules); } catch { return alert('Current rules must be JSON array'); }
    submit({ goal, triggers: t, currentRules: r });
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Goal</label>
        <input className="form-control" value={goal} onChange={(e) => setGoal(e.target.value)} />
      </div>
      <JsonInput label="Triggers (array)" value={triggers} onChange={setTriggers} rows={6} />
      <JsonInput label="Current Rules (array)" value={currentRules} onChange={setCurrentRules} rows={4} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Designing...' : 'Design Workflow'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}

function CommissionTracking() {
  const [plan, setPlan] = useState(JSON.stringify({
    name: 'Standard 2026', baseRate: 0.05, accelerator: { threshold: 100000, rate: 0.08 },
  }, null, 2));
  const [deals, setDeals] = useState('[]');
  const [payments, setPayments] = useState('[]');
  const { result, loading, error, submit } = useAI('/api/ai/commission-tracking');

  const onSubmit = (e) => {
    e.preventDefault();
    let p, d, pay;
    try { p = JSON.parse(plan); } catch { return alert('Plan must be JSON'); }
    try { d = JSON.parse(deals); } catch { return alert('Deals must be JSON array'); }
    try { pay = JSON.parse(payments); } catch { return alert('Payments must be JSON array'); }
    submit({ plan: p, deals: d, payments: pay });
  };

  return (
    <form onSubmit={onSubmit}>
      <JsonInput label="Plan *" value={plan} onChange={setPlan} rows={6} />
      <JsonInput label="Deals (array)" value={deals} onChange={setDeals} rows={5} />
      <JsonInput label="Payments (array)" value={payments} onChange={setPayments} rows={5} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Computing...' : 'Compute Commissions'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}

function CustomerChurnPrediction() {
  const [customer, setCustomer] = useState(JSON.stringify({
    id: 'cust-001', name: 'Acme', plan: 'pro', tenureMonths: 18,
  }, null, 2));
  const [usage, setUsage] = useState('[]');
  const [supportHistory, setSupportHistory] = useState('[]');
  const [payments, setPayments] = useState('[]');
  const { result, loading, error, submit } = useAI('/api/ai/customer-churn-prediction');

  const onSubmit = (e) => {
    e.preventDefault();
    let c, u, s, p;
    try { c = JSON.parse(customer); } catch { return alert('Customer must be JSON'); }
    try { u = JSON.parse(usage); } catch { return alert('Usage must be JSON array'); }
    try { s = JSON.parse(supportHistory); } catch { return alert('Support history must be JSON array'); }
    try { p = JSON.parse(payments); } catch { return alert('Payments must be JSON array'); }
    submit({ customer: c, usage: u, supportHistory: s, payments: p });
  };

  return (
    <form onSubmit={onSubmit}>
      <JsonInput label="Customer *" value={customer} onChange={setCustomer} rows={6} />
      <JsonInput label="Usage (array)" value={usage} onChange={setUsage} rows={4} />
      <JsonInput label="Support History (array)" value={supportHistory} onChange={setSupportHistory} rows={4} />
      <JsonInput label="Payments (array)" value={payments} onChange={setPayments} rows={4} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Churn'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}

function RevenueForecast() {
  const [period, setPeriod] = useState('next quarter');
  const [deals, setDeals] = useState('[]');
  const [historicalRevenue, setHistoricalRevenue] = useState('[]');
  const [productMix, setProductMix] = useState('{}');
  const { result, loading, error, submit } = useAI('/api/ai/revenue-forecast');

  const onSubmit = (e) => {
    e.preventDefault();
    let d, h, p;
    try { d = JSON.parse(deals); } catch { return alert('Deals must be a JSON array'); }
    try { h = JSON.parse(historicalRevenue); } catch { return alert('Historical revenue must be a JSON array'); }
    try { p = JSON.parse(productMix); } catch { return alert('Product mix must be JSON'); }
    submit({ period, deals: d, historicalRevenue: h, productMix: p });
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Period</label>
        <input className="form-control" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <JsonInput label="Open Deals (array)" value={deals} onChange={setDeals} />
      <JsonInput label="Historical Revenue (array)" value={historicalRevenue} onChange={setHistoricalRevenue} rows={5} />
      <JsonInput label="Product Mix (object)" value={productMix} onChange={setProductMix} rows={4} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Forecasting...' : 'Forecast Revenue'}
      </button>
      <ResultPanel result={result} error={error} loading={loading} />
    </form>
  );
}
