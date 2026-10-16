import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { StudentList } from './components/StudentList.tsx';
import { StudentModal } from './components/StudentModal.tsx';
import { StudentDetailModal } from './components/StudentDetailModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ApiExplorerView } from './components/ApiExplorerView.tsx';
import { DbStatusModal } from './components/DbStatusModal.tsx';
import { Student, StudentFormData } from './types/student.ts';
import { api } from './services/api.ts';

function MainPortal() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error, info } = useToast();

  const [currentTab, setCurrentTab] = useState<'students' | 'analytics' | 'api-explorer' | 'db-status'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Fetch all students
  const loadStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const res = await api.getStudents({ limit: 100 });
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err: any) {
      error('Failed to Load Student Records', err.error || 'Server error occurred while loading students.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    }
  }, [isAuthenticated, loadStudents]);

  // Handle Create or Update
  const handleSaveStudent = async (formData: StudentFormData, studentIdToEdit?: string): Promise<boolean> => {
    try {
      if (studentIdToEdit) {
        // Edit existing student
        const res = await api.updateStudent(studentIdToEdit, formData);
        if (res.success) {
          success('Student Record Updated', `${formData.firstName} ${formData.lastName} (${formData.studentId}) was updated in MongoDB.`);
          await loadStudents();
          return true;
        }
      } else {
        // Create new student
        const res = await api.createStudent(formData);
        if (res.success) {
          success('Student Enrolled Successfully', `${formData.firstName} ${formData.lastName} was registered and persisted.`);
          await loadStudents();
          return true;
        }
      }
      return false;
    } catch (err: any) {
      // Re-throw so modal can display field-level validation errors
      throw err;
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteStudent(studentToDelete._id);
      if (res.success) {
        success('Student Record Deleted', `Removed ${studentToDelete.firstName} ${studentToDelete.lastName} from database.`);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        await loadStudents();
      }
    } catch (err: any) {
      error('Delete Failed', err.error || 'Could not delete student record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reseed default sample data
  const handleReseed = async () => {
    try {
      const res = await api.seedDefaultStudents();
      if (res.success) {
        info('Database Reseeded', `Restored ${res.data?.length || 12} default student records.`);
        await loadStudents();
      }
    } catch (err: any) {
      error('Reseed Failed', err.error || 'Failed to reseed database.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Checking administrative session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'db-status') {
            setIsDbModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'students' && (
          <StudentList
            students={students}
            isLoading={isLoadingStudents}
            onRefresh={loadStudents}
            onAddStudent={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
            onEditStudent={(s) => {
              setStudentToEdit(s);
              setIsFormModalOpen(true);
            }}
            onDeleteStudent={(s) => {
              setStudentToDelete(s);
              setIsDeleteModalOpen(true);
            }}
            onViewStudent={(s) => {
              setStudentToView(s);
              setIsDetailModalOpen(true);
            }}
            onReseed={handleReseed}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView students={students} />
        )}

        {currentTab === 'api-explorer' && (
          <ApiExplorerView
            students={students}
            onDataChanged={loadStudents}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AcademyOS Student Management System &copy; 2026</span>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>Node.js / Express</span>
            <span aria-hidden="true">·</span>
            <span>React 19</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB Document Store</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStudentToEdit(null);
        }}
        onSubmit={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        student={studentToView}
        onClose={() => {
          setIsDetailModalOpen(false);
          setStudentToView(null);
        }}
        onEdit={(s) => {
          setStudentToEdit(s);
          setIsFormModalOpen(true);
        }}
        onDelete={(s) => {
          setStudentToDelete(s);
          setIsDeleteModalOpen(true);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        student={studentToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DbStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainPortal />
      </AuthProvider>
    </ToastProvider>
  );
}
