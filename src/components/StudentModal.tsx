import React, { useState, useEffect } from 'react';
import { Student, StudentFormData, Department, YearLevel, AcademicStatus } from '../types/student.ts';
import { X, AlertCircle, Save, UserPlus, Check } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: StudentFormData, studentIdToEdit?: string) => Promise<boolean>;
  studentToEdit?: Student | null;
}

const DEPARTMENTS: Department[] = [
  'Computer Science',
  'Data Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Biology',
  'Mathematics',
  'Psychology'
];

const YEAR_LEVELS: YearLevel[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const STATUSES: AcademicStatus[] = ['Active', 'Inactive', 'Probation', 'Graduated', 'Suspended'];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit
}) => {
  const isEditing = Boolean(studentToEdit);

  const initialForm: StudentFormData = {
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '2004-01-01',
    gender: 'Prefer not to say',
    department: 'Computer Science',
    yearLevel: 'Freshman',
    status: 'Active',
    gpa: 3.5,
    creditsEarned: 30,
    address: {
      street: '',
      city: '',
      state: 'MA',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: 'Parent',
      phone: ''
    },
    enrollmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [formData, setFormData] = useState<StudentFormData>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        studentId: studentToEdit.studentId,
        firstName: studentToEdit.firstName,
        lastName: studentToEdit.lastName,
        email: studentToEdit.email,
        phone: studentToEdit.phone,
        dateOfBirth: studentToEdit.dateOfBirth,
        gender: studentToEdit.gender,
        department: studentToEdit.department,
        yearLevel: studentToEdit.yearLevel,
        status: studentToEdit.status,
        gpa: studentToEdit.gpa,
        creditsEarned: studentToEdit.creditsEarned,
        address: { ...studentToEdit.address },
        emergencyContact: { ...studentToEdit.emergencyContact },
        enrollmentDate: studentToEdit.enrollmentDate,
        notes: studentToEdit.notes || ''
      });
    } else {
      // Suggest next auto ID
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        ...initialForm,
        studentId: `STU-2026-${randomNum}`
      });
    }
    setFieldErrors({});
    setServerError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required.';
    } else if (!/^[A-Za-z0-9\-_]{3,20}$/.test(formData.studentId.trim())) {
      errors.studentId = 'Student ID must be 3-20 characters (alphanumeric/hyphens).';
    }

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim() || phoneClean.length < 7) {
      errors.phone = 'Phone must contain at least 7 digits.';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 15) {
        errors.dateOfBirth = 'Student must be at least 15 years old.';
      }
    }

    const gpaNum = Number(formData.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      errors.gpa = 'GPA must be between 0.00 and 4.00.';
    }

    const creditsNum = Number(formData.creditsEarned);
    if (isNaN(creditsNum) || creditsNum < 0 || creditsNum > 250) {
      errors.creditsEarned = 'Credits earned must be between 0 and 250.';
    }

    if (!formData.emergencyContact.name.trim()) {
      errors['emergencyContact.name'] = 'Emergency contact name is required.';
    }
    if (!formData.emergencyContact.phone.trim()) {
      errors['emergencyContact.phone'] = 'Emergency contact telephone number is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData, studentToEdit?._id);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setServerError(err.error || 'Failed to save student record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? `Edit Student: ${studentToEdit?.firstName} ${studentToEdit?.lastName}` : 'Enroll New Student'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? `Update academic information for ID ${studentToEdit?.studentId}` : 'Create an administrative student profile and persist to MongoDB'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Backend Validation Rejection:</span> {serverError}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section 1: Identity & Personal Information */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-100">
              1. Personal & Identity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="STU-2026-001"
                  className={`w-full px-3 py-1.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.studentId
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.studentId && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.studentId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jane"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.firstName
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.lastName
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@university.edu"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telephone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.dateOfBirth
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Academic Standing */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-100">
              2. Academic Program & Standing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department / Major <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Academic Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value as YearLevel })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Enrollment Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AcademicStatus })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cumulative GPA (0.00 - 4.00) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-1.5 text-sm tabular-nums border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.gpa
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                />
                {fieldErrors.gpa && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors.gpa}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Credits Completed
                </label>
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={formData.creditsEarned}
                  onChange={(e) => setFormData({ ...formData, creditsEarned: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-1.5 text-sm tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact & Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-100">
              3. Emergency Contact & Residence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })
                  }
                  placeholder="Parent / Guardian"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors['emergencyContact.name']
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900'
                  }`}
                />
                {fieldErrors['emergencyContact.name'] && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors['emergencyContact.name']}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                    })
                  }
                  placeholder="Mother, Father, Spouse"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })
                  }
                  placeholder="(555) 987-6543"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors['emergencyContact.phone']
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-slate-900'
                  }`}
                />
                {fieldErrors['emergencyContact.phone'] && (
                  <p className="mt-1 text-[11px] text-red-600">{fieldErrors['emergencyContact.phone']}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })
                  }
                  placeholder="123 University Quad Rd"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City / State / Zip
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })
                    }
                    placeholder="Cambridge"
                    className="w-1/2 px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })
                    }
                    placeholder="MA"
                    className="w-1/4 px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value }
                      })
                    }
                    placeholder="02138"
                    className="w-1/4 px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Academic Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Administrative & Academic Advising Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Honors status, lab affiliations, scholarships, or advising check-ins..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving to MongoDB...</span>
            ) : (
              <>
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Save Changes' : 'Enroll Student'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
