import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Magnet,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  Key,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Download
} from 'lucide-react';
import { LeadMagnet, LockedContentItem } from '../types';

interface LeadAndLockManagerProps {
  initialType?: 'lead' | 'locked';
  onNavigate: (route: string) => void;
}

export const LeadAndLockManager: React.FC<LeadAndLockManagerProps> = ({ initialType = 'lead', onNavigate }) => {
  const { leadMagnets, addLeadMagnet, deleteLeadMagnet, lockedContents, addLockedContent, deleteLockedContent, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'lead' | 'locked'>(initialType);

  // Lead modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadTitle, setLeadTitle] = useState('');
  const [leadDesc, setLeadDesc] = useState('');
  const [leadButtonText, setLeadButtonText] = useState('Get Instant Free Access 🎁');
  const [leadUrl, setLeadUrl] = useState('');

  // Lock modal
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockTitle, setLockTitle] = useState('');
  const [lockPreview, setLockPreview] = useState('');
  const [lockSecret, setLockSecret] = useState('');
  const [lockPrice, setLockPrice] = useState(199);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadTitle.trim()) return;

    await addLeadMagnet({
      title: leadTitle.trim(),
      description: leadDesc.trim(),
      buttonText: leadButtonText.trim(),
      freebieType: 'pdf',
      freebieUrl: leadUrl.trim() || 'https://samplefreebie.pdf',
      fields: [
        { name: 'Full Name', required: true },
        { name: 'Email Address', required: true },
        { name: 'WhatsApp Number', required: true }
      ],
      published: true
    });

    setLeadTitle('');
    setLeadDesc('');
    setIsLeadModalOpen(false);
  };

  const handleCreateLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockTitle.trim()) return;

    await addLockedContent({
      title: lockTitle.trim(),
      previewText: lockPreview.trim(),
      secretContent: lockSecret.trim(),
      price: Number(lockPrice),
      currency: profile?.currency || '₹',
      published: true,
    });

    setLockTitle('');
    setLockPreview('');
    setLockSecret('');
    setIsLockModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Growth & Paywalls</h1>
          <p className="text-xs text-slate-500 mt-1">Collect high-intent leads via freebies or lock exclusive resources behind a micro-paywall.</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'lead' ? (
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead Magnet</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLockModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Locked Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('lead')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'lead' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          Lead Magnets ({leadMagnets.length})
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'locked' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          Locked Content Paywalls ({lockedContents.length})
        </button>
      </div>

      {/* LEAD MAGNETS VIEW */}
      {activeTab === 'lead' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadMagnets.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                    <Magnet className="w-3.5 h-3.5" /> Giveaway Freebie
                  </span>
                  <span className="text-blue-600 font-bold">{m.leadsCount} Leads</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{m.description}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-slate-700">Collects from visitors:</div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {m.fields.map((f, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`lead-${m.id}`)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Opt-In Flow</span>
                </button>
                <button
                  onClick={() => deleteLeadMagnet(m.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Delete Lead Magnet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOCKED CONTENT VIEW */}
      {activeTab === 'locked' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lockedContents.map((l) => (
            <div
              key={l.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Lock className="w-3.5 h-3.5" /> Micro Paywall
                  </span>
                  <span className="text-emerald-600 font-bold">{l.unlockedCount} Unlocked</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{l.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{l.previewText}</p>

                <div className="mt-4 p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Secret Content (Gated):</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 blur-[2px] select-none">
                    {l.secretContent.slice(0, 60)}...
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{l.currency}{l.price}</span>
                  <span className="text-xs text-slate-500">to unlock</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`lock-${l.id}`)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Paywall</span>
                </button>
                <button
                  onClick={() => deleteLockedContent(l.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Delete Paywall"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Lead Magnet */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Lead Magnet</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free PDF: Top 25 Wholesale Hubs"
                  value={leadTitle}
                  onChange={(e) => setLeadTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Why should the visitor subscribe?"
                  value={leadDesc}
                  onChange={(e) => setLeadDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Button CTA Text</label>
                <input
                  type="text"
                  required
                  value={leadButtonText}
                  onChange={(e) => setLeadButtonText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Download / Freebie URL</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={leadUrl}
                  onChange={(e) => setLeadUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Locked Content */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Locked Content</h3>
            <form onSubmit={handleCreateLock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive High-Profit Supplier Contacts"
                  value={lockTitle}
                  onChange={(e) => setLockTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teaser / Preview Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe what secrets will be unlocked..."
                  value={lockPreview}
                  onChange={(e) => setLockPreview(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secret Content (Visible after payment)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the secret URLs, phone numbers, or passwords..."
                  value={lockSecret}
                  onChange={(e) => setLockSecret(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={lockPrice}
                  onChange={(e) => setLockPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
                >
                  Publish Paywall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
