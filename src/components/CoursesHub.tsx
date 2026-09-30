import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  ExternalLink,
  Users,
  Video,
  Clock,
  BookOpen
} from 'lucide-react';
import { Course } from '../types';

interface CoursesHubProps {
  onNavigate: (route: string) => void;
}

export const CoursesHub: React.FC<CoursesHubProps> = ({ onNavigate }) => {
  const { courses, addCourse, deleteCourse, profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1499);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80');

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addCourse({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      price: Number(price),
      currency: profile?.currency || '₹',
      coverImage: coverImage.trim(),
      level: 'All Levels',
      published: true,
      chapters: [
        {
          id: 'chap-' + Date.now(),
          title: 'Module 1: Getting Started',
          lessons: [
            {
              id: 'les-1',
              title: 'Course Introduction & Mindset',
              duration: '10:00',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              content: 'Welcome to this masterclass! Follow step-by-step guidance provided in the curriculum.',
            }
          ]
        }
      ]
    });

    setTitle('');
    setSubtitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Courses & Masterclasses</h1>
          <p className="text-xs text-slate-500 mt-1">Host and sell full-fledged video masterclasses with chapters and student management.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const totalLessons = course.chapters.reduce((sum, c) => sum + c.lessons.length, 0);

          return (
            <div
              key={course.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Video className="w-3 h-3 text-blue-400" />
                    <span>{totalLessons} Lessons</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrolledStudentsCount} Enrolled</span>
                    <span className="text-blue-600 font-bold">{course.level}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{course.currency}{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {course.currency}{course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`course-${course.id}`)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>View Course Portal</span>
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Launch New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0 to 1 Lakh/Month: E-Commerce & Instagram Masterclass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Master wholesale sourcing and organic bio funnels"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed curriculum overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
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
                  Create & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
