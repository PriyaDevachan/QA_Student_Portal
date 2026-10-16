import React from 'react';
import { Student } from '../types/student.ts';
import { X, Edit2, Trash2, Mail, Phone, Calendar, BookOpen, GraduationCap, MapPin, User, ShieldAlert, Award } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span>{student.studentId}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">MongoDB _id: {student._id.slice(0, 10)}...</span>
            </div>
            <h2 className="text-2xl font-bold mt-1 text-white">
              {student.firstName} {student.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span>{student.department}</span>
              <span aria-hidden="true">·</span>
              <span>{student.yearLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-400">{student.status}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Academic Highlights */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cumulative GPA</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {student.gpa.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Scale: 4.00</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Credits Earned</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {student.creditsEarned}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Required: 120</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Admitted</div>
              <div className="text-base font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {student.enrollmentDate}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Standard Fall Cohort</div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Direct Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${student.email}`} className="hover:underline text-slate-900">
                  {student.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>DOB: {student.dateOfBirth} ({student.gender})</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {student.address.street || 'Campus Residence'}, {student.address.city || 'Cambridge'}, {student.address.state || 'MA'} {student.address.zipCode}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/70">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Emergency Contact On File
            </h3>
            <div className="text-sm text-slate-800 space-y-1">
              <div>
                <span className="font-semibold">{student.emergencyContact.name}</span>
                <span className="text-slate-500 text-xs ml-2">({student.emergencyContact.relationship})</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.emergencyContact.phone}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {student.notes && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Advising & Academic Notes
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {student.notes}
              </p>
            </div>
          )}

          {/* System Metadata */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Created: {new Date(student.createdAt).toLocaleDateString()}</span>
            <span>Last Modified: {new Date(student.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(student);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Student</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit(student);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
