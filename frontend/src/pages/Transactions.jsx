import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Transport','Entertainment','Shopping','Health','Bills','Salary','Freelance','Investment','Other'];
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const emptyForm = { title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], note: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ type: '', category: '' });

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.category) params.append('category', filter.category);
      params.append('limit', '50');
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/transactions/${editing}`, form);
        toast.success('Updated!');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction added!');
      }
      setForm(emptyForm); setShowForm(false); setEditing(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    toast.success('Deleted'); load();
  };

  const startEdit = (t) => {
    setForm({ title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date, note: t.note || '' });
    setEditing(t.id); setShowForm(true);
  };

  return (
    <div className="flex-1 p-8 overflow-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">{total} total records</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {['', 'income', 'expense'].map(t => (
          <button key={t} onClick={() => setFilter(f => ({...f, type: t}))}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter.type === t ? 'bg-accent-primary text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {t || 'All'}
          </button>
        ))}
        <select value={filter.category} onChange={e => setFilter(f => ({...f, category: e.target.value}))}
          className="input-field w-auto px-4 py-2 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-white">{editing ? 'Edit' : 'New'} Transaction</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Title</label>
                <input className="input-field" placeholder="e.g. Groceries" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Amount (₹)</label>
                  <input type="number" step="0.01" min="0" className="input-field" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Date</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Note (optional)</label>
                <input className="input-field" placeholder="Any extra detail..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"/></div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No transactions found. Add your first one!</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: t.type === 'income' ? 'rgba(0,212,170,0.1)' : 'rgba(108,99,255,0.1)' }}>
                  {getCatEmoji(t.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.category} · {t.date}</p>
                </div>
                <span className={`font-mono font-semibold text-sm ${t.type === 'income' ? 'text-accent-secondary' : 'text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => startEdit(t)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-accent-primary transition-colors">
                    <Pencil size={13}/>
                  </button>
                  <button onClick={() => del(t.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCatEmoji(cat) {
  const map = { Food:'🍔', Transport:'🚗', Entertainment:'🎮', Shopping:'🛍️', Health:'💊', Bills:'📄', Salary:'💼', Freelance:'💻', Investment:'📈', Other:'💰' };
  return map[cat] || '💰';
}
