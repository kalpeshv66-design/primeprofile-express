import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Zap,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { AudienceContact } from '../types';

export const AudienceManager: React.FC = () => {
  const { audience, orders } = useAuth();
  const [activeTab, setActiveTab] = useState<'segments' | 'contacts'>('segments');
  const [searchQuery, setSearchQuery] = useState('');

  const customerCount = audience.filter(a => a.segment === 'Customers').length;
  const followersCount = audience.filter(a => a.segment === 'Followers').length;
  const abandonedCount = audience.filter(a => a.segment === 'Abandoned Carts').length;

  const filteredContacts = audience.filter(contact => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(q) ||
      contact.email.toLowerCase().includes(q) ||
      (contact.phone && contact.phone.includes(q)) ||
      contact.segment.toLowerCase().includes(q)
    );
  });

  const exportContacts = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Phone,Segment,Source,TotalSpent'].join(',') +
      '\n' +
      audience
        .map(a => `"${a.name}","${a.email}","${a.phone || ''}","${a.segment}","${a.source}",${a.totalSpent}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primeprofile_audience_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header matching screenshot #8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Audience</h1>
          <p className="text-xs text-slate-500 mt-1">Manage contact segments, customers, subscribers, and automated CRM lists.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportContacts}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Pill Toggle matching screenshot #8: Segments (3) vs All Contacts (X) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'segments'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Segments (3)
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Contacts ({audience.length})
        </button>
      </div>

      {/* Search Bar matching screenshot #8 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search contacts, segments, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border-none focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort
          </button>
        </div>
      </div>

      {/* VIEW 1: SEGMENTS LIST (matching screenshot #8) */}
      {activeTab === 'segments' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Segments</th>
                <th className="py-3 px-5 text-center">Contacts</th>
                <th className="py-3 px-5 text-center">Campaigns</th>
                <th className="py-3 px-5">Last Updated</th>
                <th className="py-3 px-5">Created On</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Segment 1: Customers */}
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Customers</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Dynamic</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Buyers who completed at least one payment</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 text-center font-bold text-slate-900">{customerCount}</td>
                <td className="py-4 px-5 text-center font-semibold text-slate-500">0</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">Today, 03:09 PM</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">28 Sep 2026</td>
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              {/* Segment 2: Followers */}
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Followers</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Dynamic</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Audience collected via free lead magnets</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 text-center font-bold text-slate-900">{followersCount}</td>
                <td className="py-4 px-5 text-center font-semibold text-slate-500">0</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">Today, 03:27 PM</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">28 Sep 2026</td>
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              {/* Segment 3: Abandoned Carts */}
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Abandoned Carts</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Dynamic</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Initiated checkout without completing payment</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 text-center font-bold text-slate-900">{abandonedCount}</td>
                <td className="py-4 px-5 text-center font-semibold text-slate-500">0</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">Today, 01:03 PM</td>
                <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">28 Sep 2026</td>
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: ALL CONTACTS LIST */}
      {activeTab === 'contacts' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Contact Name</th>
                <th className="py-3 px-5">Email & Phone</th>
                <th className="py-3 px-5">Segment</th>
                <th className="py-3 px-5">Source</th>
                <th className="py-3 px-5">Total Spent</th>
                <th className="py-3 px-5 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{contact.name}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-mono text-slate-600">{contact.email}</div>
                      {contact.phone && (
                        <div className="font-mono text-[11px] text-blue-600">{contact.phone}</div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        contact.segment === 'Customers'
                          ? 'bg-emerald-100 text-emerald-800'
                          : contact.segment === 'Followers'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {contact.segment}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-medium">
                      {contact.source}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      ₹{contact.totalSpent}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contact.phone && (
                          <a
                            href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${contact.email}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
