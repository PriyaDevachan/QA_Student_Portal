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
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  department: Department;
  yearLevel: YearLevel;
  status: AcademicStatus;
  gpa: number;
  creditsEarned: number;
  address: Address;
  emergencyContact: EmergencyContact;
  enrollmentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentFormData = Omit<Student, '_id' | 'createdAt' | 'updatedAt'>;

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
  details?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl: string;
}

export interface DatabaseStatus {
  mode: string;
  isConnectedToMongoServer: boolean;
  databaseName: string;
  collectionName: string;
  documentCount: number;
  storageFile: string;
  lastModified: string;
  mongoUriConfigured: boolean;
}
