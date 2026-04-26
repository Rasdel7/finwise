import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', monthly_budget: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, parseFloat(form.monthly_budget) || 0);
      }
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-2xl shadow-lg shadow-accent-glow">
              💎
            </div>
            <span className="font-display text-3xl font-bold glow-text">FinWise</span>
          </div>
          <p className="text-slate-400 text-sm">Your personal finance command center</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tabs */}
          <div className="flex bg-dark-900 rounded-xl p-1 mb-8">
            {['login','register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  mode === m ? 'bg-accent-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                <input className="input-field" placeholder="Jyotiraditya" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Monthly Budget (optional)</label>
                <input type="number" className="input-field" placeholder="e.g. 3000" value={form.monthly_budget}
                  onChange={e => setForm({...form, monthly_budget: e.target.value})} />
              </div>
            )}
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating...'}
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-slate-500 mt-6">
              Demo: register with any email to get pre-loaded data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
