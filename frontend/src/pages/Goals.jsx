import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Target } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#6c63ff','#00d4aa','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const emptyForm = { title: '', target_amount: '', current_amount: '', deadline: '', color: '#6c63ff' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get('/goals');
    setGoals(data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/goals/${editing}`, form); toast.success('Goal updated!'); }
      else { await api.post('/goals', form); toast.success('Goal created! 🎯'); }
      setForm(emptyForm); setShowForm(false); setEditing(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`); toast.success('Deleted'); load();
  };

  const startEdit = (g) => {
    setForm({ title: g.title, target_amount: g.target_amount, current_amount: g.current_amount, deadline: g.deadline || '', color: g.color });
    setEditing(g.id); setShowForm(true);
  };

  return (
    <div className="flex-1 p-8 overflow-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Savings Goals</h1>
          <p className="text-slate-400 mt-1">Track your financial milestones</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <Plus size={18}/> New Goal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-white">{editing ? 'Edit' : 'New'} Goal</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Goal Title</label>
                <input className="input-field" placeholder="e.g. Emergency Fund" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Target Amount ($)</label>
                  <input type="number" min="1" className="input-field" placeholder="10000" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Current Savings ($)</label>
                  <input type="number" min="0" className="input-field" placeholder="0" value={form.current_amount} onChange={e => setForm({...form, current_amount: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Target Date (optional)</label>
                <input type="date" className="input-field" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className="w-8 h-8 rounded-full transition-all border-2"
                      style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Target size={48} className="text-slate-600 mb-4" />
          <p className="text-xl font-display font-semibold text-slate-400">No goals yet</p>
          <p className="text-slate-500 text-sm mt-2">Create your first savings goal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {goals.map(g => {
            const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
            const remaining = g.target_amount - g.current_amount;
            return (
              <div key={g.id} className="card group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: g.color }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: g.color + '20' }}>
                    🎯
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(g)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-accent-primary">
                      <Pencil size={13}/>
                    </button>
                    <button onClick={() => del(g.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-white mb-1">{g.title}</h3>
                {g.deadline && <p className="text-xs text-slate-500 mb-4">Due {g.deadline}</p>}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{fmt(g.current_amount)} saved</span>
                    <span className="font-semibold" style={{ color: g.color }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-500">{fmt(remaining)} to go</span>
                    <span className="text-xs text-slate-500">Goal: {fmt(g.target_amount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
