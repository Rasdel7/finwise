import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const fmtB = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return fmt(n);
};

export default function Markets() {
  const [market, setMarket] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('top');

  const load = async () => {
    try {
      const [mRes, wRes] = await Promise.all([api.get('/market'), api.get('/market/watchlist')]);
      setMarket(mRes.data);
      setWatchlist(wRes.data);
    } catch { toast.error('Failed to load market data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (coin) => {
    const inWatchlist = watchlist.find(w => w.id === coin.id);
    try {
      if (inWatchlist) {
        await api.delete(`/market/watchlist/${coin.id}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post('/market/watchlist', { symbol: coin.id, type: 'crypto' });
        toast.success('Added to watchlist ⭐');
      }
      load();
    } catch { toast.error('Failed'); }
  };

  const display = tab === 'top' ? market : watchlist;

  return (
    <div className="flex-1 p-8 overflow-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Markets</h1>
        <p className="text-slate-400 mt-1">Live crypto prices via CoinGecko</p>
      </div>

      <div className="flex gap-3 mb-6">
        {['top', 'watchlist'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${tab === t ? 'bg-accent-primary text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {t === 'top' ? '🔥 Top 10' : '⭐ Watchlist'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : display.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          {tab === 'watchlist' ? 'No coins in watchlist. Star coins from Top 10 to track them.' : 'No data available.'}
        </div>
      ) : (
        <div className="card">
          <div className="grid grid-cols-6 text-xs text-slate-500 uppercase tracking-wider pb-3 border-b border-white/5 mb-2 px-2">
            <span className="col-span-2">Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h Change</span>
            <span className="text-right">Market Cap</span>
            <span className="text-right">Action</span>
          </div>
          {display.map((coin, i) => {
            const change = coin.price_change_percentage_24h;
            const isUp = change >= 0;
            const inWatchlist = watchlist.find(w => w.id === coin.id);
            return (
              <div key={coin.id} className="grid grid-cols-6 items-center py-3 px-2 rounded-xl hover:bg-white/3 transition-all group border-b border-white/3 last:border-0">
                <div className="col-span-2 flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-4 font-mono">{i + 1}</span>
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-white text-sm">{coin.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <p className="text-right font-mono text-sm text-white">{fmt(coin.current_price)}</p>
                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isUp ? 'text-accent-secondary' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  {Math.abs(change).toFixed(2)}%
                </div>
                <p className="text-right text-sm text-slate-400 font-mono">{fmtB(coin.market_cap)}</p>
                <div className="flex justify-end">
                  <button onClick={() => toggle(coin)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${inWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-yellow-400 bg-white/5'}`}>
                    <Star size={15} fill={inWatchlist ? 'currentColor' : 'none'}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
