import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Lock,
  ArrowLeft,
  BookOpen,
  Clock,
  Video,
  FileText,
  Sparkles
} from 'lucide-react';
import { CourseLesson } from '../types';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface CoursePortalProps {
  courseId: string;
  onNavigate: (route: string) => void;
}

export const CoursePortal: React.FC<CoursePortalProps> = ({ courseId, onNavigate }) => {
  const { courses, profile } = useAuth();
  const course = courses.find(c => c.id === courseId) || courses[0];

  const firstLesson = course?.chapters[0]?.lessons[0];
  const [activeLesson, setActiveLesson] = useState<CourseLesson | undefined>(firstLesson);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-1']);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p>Course not found.</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const toggleLessonComplete = (id: string) => {
    setCompletedLessonIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div onClick={() => onNavigate('dashboard')} className="cursor-pointer">
            <PrimeProfileLogo variant="dark" size="xs" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="font-bold text-xs sm:text-sm truncate max-w-xs sm:max-w-md text-slate-200">
            {course.title}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">Progress:</span>
          <span className="bg-blue-600/30 text-blue-400 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
            {completedLessonIds.length} lessons finished
          </span>
        </div>
      </header>

      {/* Main Course Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video & Lesson Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <iframe
              src={activeLesson?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title={activeLesson?.title || 'Lesson Video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Lesson Details */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Current Lesson
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">{activeLesson?.title}</h2>
              </div>

              {activeLesson && (
                <button
                  onClick={() => toggleLessonComplete(activeLesson.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    completedLessonIds.includes(activeLesson.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedLessonIds.includes(activeLesson.id) ? 'Completed' : 'Mark as Complete'}</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
              {activeLesson?.content || 'Follow along with the video lesson above. Take notes and execute each step.'}
            </p>
          </div>
        </div>

        {/* Right: Modules & Lessons Curriculum Sidebar */}
        <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">Curriculum</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {course.chapters.map((chapter, chapIndex) => (
              <div key={chapter.id} className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  {chapter.title}
                </div>
                <div className="space-y-1">
                  {chapter.lessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isDone ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'} shrink-0`} />
                          ) : (
                            <Play className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'} shrink-0`} />
                          )}
                          <span className="truncate font-medium">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] opacity-70 shrink-0 font-mono ml-2">
                          {lesson.duration}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
