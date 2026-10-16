import React from 'react';
import { Student } from '../types/student.ts';
import { GraduationCap, Award, Users, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';

interface AnalyticsViewProps {
  students: Student[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ students }) => {
  const total = students.length;

  const activeCount = students.filter(s => s.status === 'Active').length;
  const probationCount = students.filter(s => s.status === 'Probation').length;
  const graduatedCount = students.filter(s => s.status === 'Graduated').length;

  const totalGpa = students.reduce((acc, s) => acc + s.gpa, 0);
  const avgGpa = total > 0 ? (totalGpa / total).toFixed(2) : '0.00';

  const deansListStudents = students
    .filter(s => s.gpa >= 3.8)
    .sort((a, b) => b.gpa - a.gpa);

  // Group by department
  const deptCounts: Record<string, number> = {};
  students.forEach(s => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
  });

  const deptList = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {total}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>{activeCount} active in current term</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Campus Average GPA</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {avgGpa}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Standard 4.00 grading scale</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Dean's Honor List</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {deansListStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>GPA $\ge$ 3.80 requirement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Academic Probation</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-red-600 mt-2">
            {probationCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Flagged for advising intervention</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Enrollment Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Enrollment</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of students by academic faculty</p>
            </div>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            {deptList.map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{dept}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {count} student{count !== 1 ? 's' : ''} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dean's Honor Roll Spotlight */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dean's Honor Roll Students</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top performing students with cumulative GPA $\ge$ 3.80</p>
            </div>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {deansListStudents.slice(0, 6).map((student) => (
              <div key={student._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">{student.studentId}</span>
                    <span aria-hidden="true">·</span>
                    <span>{student.department}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold tabular-nums text-slate-900 text-sm">
                    {student.gpa.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Honor Roll</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
