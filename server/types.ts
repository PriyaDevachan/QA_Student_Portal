export type AcademicStatus = 'Active' | 'Inactive' | 'Probation' | 'Graduated' | 'Suspended';
export type YearLevel = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
export type Department = 
  | 'Computer Science' 
  | 'Data Science' 
  | 'Mechanical Engineering' 
  | 'Electrical Engineering' 
  | 'Business Administration' 
  | 'Biology' 
  | 'Mathematics' 
  | 'Psychology';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Student {
  _id: string; // 24-char hex MongoDB ObjectId
  studentId: string; // e.g., 'STU-2024-001'
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  department: Department;
  yearLevel: YearLevel;
  status: AcademicStatus;
  gpa: number; // 0.00 to 4.00
  creditsEarned: number;
  address: Address;
  emergencyContact: EmergencyContact;
  enrollmentDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStudentInput = Omit<Student, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentInput = Partial<CreateStudentInput>;

export interface StudentFilterParams {
  search?: string;
  department?: string;
  status?: string;
  yearLevel?: string;
  minGpa?: number;
  maxGpa?: number;
  sortBy?: 'studentId' | 'lastName' | 'gpa' | 'createdAt' | 'enrollmentDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  error?: string;
  errors?: Record<string, string>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'System Administrator' | 'Academic Dean' | 'Registrar';
  department: string;
  avatarUrl: string;
}
