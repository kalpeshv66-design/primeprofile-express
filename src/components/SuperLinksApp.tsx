import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  MousePointer,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const SuperLinksApp: React.FC = () => {
  const [linksList, setLinksList] = useState([
    {
      id: 'sl-1',
      title: 'YouTube Direct App Link',
      shortUrl: 'primeprofile.bio/go/yt-drop',
      destUrl: 'https://youtube.com/watch?v=sample',
      clicks: 840,
      openInApp: true,
    },
    {
      id: 'sl-2',
      title: 'Telegram VIP Channel Deep Link',
      shortUrl: 'primeprofile.bio/go/vip-tele',
      destUrl: 'https://t.me/primevip',
      clicks: 1250,
      openInApp: true,
    },
  ]);

  const [title, setTitle] = useState('');
  const [destUrl, setDestUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destUrl) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 16);
    const newL = {
      id: 'sl-' + Date.now(),
      title,
      shortUrl: `primeprofile.bio/go/${slug}`,
      destUrl,
      clicks: 0,
      openInApp: true,
    };

    setLinksList([newL, ...linksList]);
    setTitle('');
    setDestUrl('');
  };

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">PrimeLinks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create smart shortened links that bypass Instagram in-app browsers and open directly in native mobile apps (YouTube, Telegram, Spotify, Amazon).
        </p>
      </div>

      {/* Creator Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Create New PrimeLink</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. My New YouTube Video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Long URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
            >
              Generate SuperLink
            </button>
          </div>
        </form>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Active SuperLinks</h3>
        {linksList.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span>{item.title}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Open-in-App Enabled
                </span>
              </div>
              <div className="text-[11px] text-blue-600 font-mono mt-0.5 truncate">{item.shortUrl}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{item.destUrl}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                {item.clicks} clicks
              </span>
              <button
                onClick={() => copyLink(item.id, item.shortUrl)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl cursor-pointer"
                title="Copy Link"
              >
                {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLinksList(linksList.filter(l => l.id !== item.id))}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                title="Delete Link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
