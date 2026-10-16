import React, { useState, useMemo } from 'react';
import { Student, Department, AcademicStatus, YearLevel } from '../types/student.ts';
import { 
  Search, 
  Plus, 
  RotateCw, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onReseed: () => void;
}

const DEPARTMENTS: (Department | 'All')[] = [
  'All',
  'Computer Science',
  'Data Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Biology',
  'Mathematics',
  'Psychology'
];

const STATUS_FILTERS: (AcademicStatus | 'All')[] = ['All', 'Active', 'Inactive', 'Probation', 'Graduated'];

export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading,
  onRefresh,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onViewStudent,
  onReseed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AcademicStatus | 'All'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [sortBy, setSortBy] = useState<'studentId' | 'lastName' | 'gpa' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Search locally for immediate responsiveness
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const matches = 
          s.studentId.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'All' && s.status !== statusFilter) {
        return false;
      }

      // Department
      if (departmentFilter !== 'All' && s.department !== departmentFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [students, searchTerm, statusFilter, departmentFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Handle export to CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['StudentID', 'FirstName', 'LastName', 'Email', 'Phone', 'Department', 'YearLevel', 'Status', 'GPA', 'Credits', 'EnrollmentDate'];
    const rows = students.map(s => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.email,
      s.phone,
      s.department,
      s.yearLevel,
      s.status,
      s.gpa.toFixed(2),
      s.creditsEarned,
      s.enrollmentDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Student Academic Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <span className="font-mono tabular-nums font-semibold text-slate-800">{filteredStudents.length}</span> records persisted in MongoDB
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onReseed}
            title="Reset to default seed data"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reseed Default Data</span>
          </button>

          <button
            onClick={onAddStudent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, ID (e.g. STU-2023), email, or department..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="gpa-desc">Highest GPA</option>
              <option value="gpa-asc">Lowest GPA</option>
              <option value="lastName-asc">Name (A-Z)</option>
              <option value="studentId-asc">Student ID (Asc)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Cards view"
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Segmented Buttons (Interactive Filter Controls as approved in Section 1.A) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mr-2">Status:</span>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Student Data Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading && students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
            <p>Loading records from MongoDB...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">No student records match your query</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing active filters to view records.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setDepartmentFilter('All');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={onAddStudent}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Add New Student
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department & Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">GPA</th>
                  <th className="py-3 px-4 text-right">Credits</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Student ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {student.studentId}
                    </td>

                    {/* Name & Email (Zero pill discipline: unboxed metadata) */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{student.email}</span>
                        <span aria-hidden="true">·</span>
                        <span>{student.phone}</span>
                      </div>
                    </td>

                    {/* Department & Level */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-800">{student.department}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {student.yearLevel} · Admitted {student.enrollmentDate.slice(0, 4)}
                      </div>
                    </td>

                    {/* Status (Unboxed semantic text, no pill box!) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'Active'
                              ? 'bg-emerald-500'
                              : student.status === 'Probation'
                              ? 'bg-amber-500'
                              : student.status === 'Graduated'
                              ? 'bg-sky-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span
                          className={
                            student.status === 'Active'
                              ? 'text-emerald-700'
                              : student.status === 'Probation'
                              ? 'text-amber-700 font-semibold'
                              : student.status === 'Graduated'
                              ? 'text-sky-700'
                              : 'text-slate-600'
                          }
                        >
                          {student.status}
                        </span>
                      </div>
                    </td>

                    {/* GPA */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {student.gpa.toFixed(2)}
                    </td>

                    {/* Credits */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                      {student.creditsEarned}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewStudent(student)}
                          title="View Profile Details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          title="Edit Student Record"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student)}
                          title="Delete Student"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Card View */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStudents.map((student) => (
              <div
                key={student._id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span className="font-semibold text-slate-900">{student.studentId}</span>
                    <span
                      className={`text-xs font-medium ${
                        student.status === 'Active'
                          ? 'text-emerald-700'
                          : student.status === 'Probation'
                          ? 'text-amber-700 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {student.firstName} {student.lastName}
                  </h3>

                  {/* Unboxed metadata with typographic separators */}
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>{student.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{student.yearLevel}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Cumulative GPA</div>
                      <div className="font-mono tabular-nums font-bold text-slate-800 text-sm">{student.gpa.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Credits Completed</div>
                      <div className="font-mono tabular-nums font-bold text-slate-800 text-sm">{student.creditsEarned}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{student.email}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewStudent(student)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50/75 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>{' '}
            of{' '}
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {filteredStudents.length}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-xs text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono tabular-nums font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-xs text-slate-700"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
