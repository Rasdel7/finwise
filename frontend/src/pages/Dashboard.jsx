import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const COLORS = ['#6c63ff', '#00d4aa', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, txRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions?limit=5')
        ]);
        setSummary(summaryRes.data);
        setTransactions(txRes.data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your finances...</p>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Income', value: fmt(summary?.income || 0), icon: TrendingUp, color: '#00d4aa', bg: 'rgba(0,212,170,0.1)', change: '+12%' },
    { label: 'Total Expenses', value: fmt(summary?.expenses || 0), icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', change: '-3%' },
    { label: 'Net Savings', value: fmt(summary?.savings || 0), icon: PiggyBank, color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', change: null },
    { label: 'Budget Used', value: `${Math.round(summary?.budgetUsed || 0)}%`, icon: Wallet, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', change: null },
  ];

  return (
    <div className="flex-1 p-8 overflow-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Good {getTimeOfDay()}, <span className="glow-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              {s.change && (
                <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
                  {s.change}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-display text-2xl font-bold text-white">{s.value}</p>
            {s.label === 'Budget Used' && summary?.budget > 0 && (
              <div className="mt-3 h-1.5 bg-dark-900 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min(summary.budgetUsed, 100)}%`,
                  background: summary.budgetUsed > 90 ? '#ef4444' : summary.budgetUsed > 70 ? '#f59e0b' : '#00d4aa'
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-white">Income vs Expenses</h2>
            <span className="text-xs text-slate-500">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={summary?.trend || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="income" stroke="#00d4aa" strokeWidth={2} fill="url(#income)" />
              <Area type="monotone" dataKey="expenses" stroke="#6c63ff" strokeWidth={2} fill="url(#expenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-white mb-6">Spending</h2>
          {summary?.categoryBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={summary.categoryBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0}>
                    {summary.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {summary.categoryBreakdown.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-400">{c.category}</span>
                    </div>
                    <span className="text-white font-mono">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-slate-500 text-sm text-center mt-8">No expense data yet</p>}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-lg text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{
                  background: t.type === 'income' ? 'rgba(0,212,170,0.1)' : 'rgba(108,99,255,0.1)'
                }}>
                  {getCategoryEmoji(t.category)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.category} · {t.date}</p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${t.type === 'income' ? 'text-accent-secondary' : 'text-white'}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prompt */}
      <Link to="/insights" className="mt-6 flex items-center gap-4 p-5 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 hover:bg-accent-primary/10 transition-all group block">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">Get AI-powered financial insights</p>
          <p className="text-sm text-slate-400">Claude analyzes your spending and gives personalized advice</p>
        </div>
        <ArrowRight size={20} className="text-accent-primary group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getCategoryEmoji(cat) {
  const map = { Food: '🍔', Transport: '🚗', Entertainment: '🎮', Shopping: '🛍️', Health: '💊', Bills: '📄', Salary: '💼', Freelance: '💻', Investment: '📈' };
  return map[cat] || '💰';
}
