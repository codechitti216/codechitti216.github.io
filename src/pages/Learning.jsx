import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, FileText, Mic } from 'lucide-react';
import learningData from '../data/learning.json';

export default function Learning() {
  const { courses, textbooks, papers, talks } = learningData;

  return (
    <div className="py-8 space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Learning</h1>
        <p className="mt-1 text-sm text-gray-500">
          What I'm studying, reading, and watching. Full history with notes.
        </p>
      </div>

      {/* Courses */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-gray-400" />
          <h2 className="font-serif text-lg font-semibold text-gray-900">Courses</h2>
        </div>
        <p className="text-xs text-gray-400">Lecture series I'm watching. Progress and notes per lecture.</p>

        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <Link
                key={course.id}
                to={`/learning/${course.id}`}
                className="block group border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''} watched
                    </span>
                  </div>
                </div>
                {course.lectures.length > 0 && (
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-gray-900 h-1.5 rounded-full"
                      style={{ width: `${Math.min((course.lectures.length / (course.totalLectures || 27)) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Textbooks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <h2 className="font-serif text-lg font-semibold text-gray-900">Textbooks</h2>
        </div>
        <p className="text-xs text-gray-400">Books I'm reading. Chapter progress and notes.</p>

        {textbooks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {textbooks.map((book, i) => (
              <div key={i} className="py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{book.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Papers */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <h2 className="font-serif text-lg font-semibold text-gray-900">Papers</h2>
        </div>
        <p className="text-xs text-gray-400">Research papers I've read. Reactions, not summaries.</p>

        {papers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {papers.map((paper, i) => (
              <div key={i} className="py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{paper.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Talks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-gray-400" />
          <h2 className="font-serif text-lg font-semibold text-gray-900">Talks</h2>
        </div>
        <p className="text-xs text-gray-400">One-off videos, seminars, and blog posts worth noting.</p>

        {talks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {talks.map((talk, i) => (
              <div key={i} className="py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{talk.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
      <p className="text-sm text-gray-300">Nothing here yet.</p>
    </div>
  );
}
