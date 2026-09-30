import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Video,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  MapPin,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { BookingService } from '../types';
import { CoursesHub } from './CoursesHub';

interface BookingsManagerProps {
  onNavigate: (route: string) => void;
  initialTab?: 'bookings' | 'courses';
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ onNavigate, initialTab = 'bookings' }) => {
  const { bookings, courses, addBooking, deleteBooking, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'courses'>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [price, setPrice] = useState(999);
  const [locationType, setLocationType] = useState<'Google Meet' | 'Zoom' | 'Phone Call'>('Google Meet');

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addBooking({
      title: title.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      currency: profile?.currency || '₹',
      locationType,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timeSlots: ['11:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'],
      published: true,
      coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Section Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1:1 Call Bookings</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'bookings' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Courses & Masterclasses</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'courses' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
            {courses.length}
          </span>
        </button>
      </div>

      {activeTab === 'courses' ? (
        <CoursesHub onNavigate={onNavigate} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">1:1 Call Bookings</h1>
              <p className="text-xs text-slate-500 mt-1">Monetize your expertise with paid 1-on-1 consultations, audits, and mentorship.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> {b.durationMinutes} mins
                </span>
                <span className="text-emerald-600 font-bold">{b.bookedCount} Bookings</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{b.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{b.description}</p>

              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Video className="w-4 h-4 text-slate-400" />
                  <span>{b.locationType}</span>
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  {b.timeSlots.length} daily slots
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{b.currency}{b.price}</span>
                <span className="text-xs text-slate-500">/session</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNavigate(`booking-${b.id}`)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Booking Flow</span>
              </button>
              <button
                onClick={() => deleteBooking(b.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                title="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Booking Service</h3>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1:1 Private Store Audit & Strategy Call"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What will you discuss with your client?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
