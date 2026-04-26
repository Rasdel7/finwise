import { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const iconMap = { warning: AlertTriangle, success: CheckCircle, tip: Lightbulb };
const colorMap = {
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
  success: { bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.2)', icon: '#00d4aa' },
  tip: { bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.2)', icon: '#6c63ff' }
};

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/insights');
      setInsights(data.insights);
      setSnapshot(data.financialSnapshot);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate insights. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex-1 p-8 overflow-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">AI Insights</h1>
        <p className="text-slate-400 mt-1">Powered by Claude — personalized financial advice</p>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.08))', border: '1px solid rgba(108,99,255,0.2)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Claude Financial Advisor</h2>
              <p className="text-slate-400 text-sm">Analyzes your real spending data and gives you 3 personalized insights</p>
            </div>
          </div>
          <button onClick={generate} disabled={loading}
            className="btn-primary flex items-center gap-2 mt-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                </svg>
                Analyzing your finances...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {insights ? 'Regenerate Insights' : 'Generate My Insights'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Snapshot */}
      {snapshot && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'This Month Income', value: fmt(snapshot.income), color: '#00d4aa' },
            { label: 'This Month Expenses', value: fmt(snapshot.expenses), color: '#ef4444' },
            { label: 'Net Savings', value: fmt(snapshot.savings), color: snapshot.savings >= 0 ? '#6c63ff' : '#ef4444' }
          ].map((s, i) => (
            <div key={i} className="stat-card text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
              <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {insights && (
        <div className="space-y-4 animate-slide-up">
          <h3 className="font-display font-semibold text-white text-lg mb-4">Your Personalized Insights</h3>
          {insights.map((ins, i) => {
            const colors = colorMap[ins.type] || colorMap.tip;
            const Icon = iconMap[ins.type] || Lightbulb;
            return (
              <div key={i} className="flex gap-4 p-5 rounded-2xl transition-all"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, animationDelay: `${i * 0.15}s` }}>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    {ins.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{ins.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{ins.message}</p>
                </div>
                <div className="flex-shrink-0 flex items-start">
                  <Icon size={16} style={{ color: colors.icon }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-slate-600 text-center pt-4">
            Insights generated by Claude AI based on your actual transaction data · Not financial advice
          </p>
        </div>
      )}

      {!insights && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-slate-400 font-display font-semibold text-lg">Ready to analyze your finances</p>
          <p className="text-slate-500 text-sm mt-2">Click the button above to get your personalized AI insights</p>
        </div>
      )}
    </div>
  );
}
