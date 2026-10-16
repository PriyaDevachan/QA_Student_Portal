import { Router, Request, Response } from 'express';
import { dbService } from '../db.ts';
import { CreateStudentInput, Department, YearLevel, AcademicStatus } from '../types.ts';

export const studentsRouter = Router();

const VALID_DEPARTMENTS: Department[] = [
  'Computer Science',
  'Data Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Biology',
  'Mathematics',
  'Psychology'
];

const VALID_YEAR_LEVELS: YearLevel[] = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate'
];

const VALID_STATUSES: AcademicStatus[] = [
  'Active',
  'Inactive',
  'Probation',
  'Graduated',
  'Suspended'
];

// Validation Helper function
function validateStudentInput(input: any, isUpdate = false, existingId?: string): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // First name
  if (!isUpdate || input.firstName !== undefined) {
    if (!input.firstName || typeof input.firstName !== 'string' || input.firstName.trim().length < 2) {
      errors.firstName = 'First name is required and must be at least 2 characters.';
    } else if (input.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters.';
    }
  }

  // Last name
  if (!isUpdate || input.lastName !== undefined) {
    if (!input.lastName || typeof input.lastName !== 'string' || input.lastName.trim().length < 2) {
      errors.lastName = 'Last name is required and must be at least 2 characters.';
    } else if (input.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters.';
    }
  }

  // Student ID
  if (!isUpdate || input.studentId !== undefined) {
    if (!input.studentId || typeof input.studentId !== 'string' || input.studentId.trim().length < 3) {
      errors.studentId = 'Student ID is required (e.g. STU-2024-001).';
    } else if (!/^[A-Za-z0-9\-_]{3,20}$/.test(input.studentId.trim())) {
      errors.studentId = 'Student ID must only contain alphanumeric characters, hyphens, or underscores (3-20 chars).';
    }
  }

  // Email
  if (!isUpdate || input.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || typeof input.email !== 'string' || !emailRegex.test(input.email.trim())) {
      errors.email = 'A valid university or personal email address is required.';
    }
  }

  // Phone
  if (!isUpdate || input.phone !== undefined) {
    if (!input.phone || typeof input.phone !== 'string') {
      errors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = input.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        errors.phone = 'Phone number must contain between 7 and 15 digits.';
      }
    }
  }

  // Date of Birth
  if (!isUpdate || input.dateOfBirth !== undefined) {
    if (!input.dateOfBirth || typeof input.dateOfBirth !== 'string') {
      errors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dob = new Date(input.dateOfBirth);
      const now = new Date();
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = 'Invalid date format (must be YYYY-MM-DD).';
      } else {
        const ageYears = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (ageYears < 15) {
          errors.dateOfBirth = 'Student must be at least 15 years old for university enrollment.';
        } else if (ageYears > 100) {
          errors.dateOfBirth = 'Please check the date of birth year.';
        }
      }
    }
  }

  // Department
  if (!isUpdate || input.department !== undefined) {
    if (!VALID_DEPARTMENTS.includes(input.department)) {
      errors.department = `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`;
    }
  }

  // Year level
  if (!isUpdate || input.yearLevel !== undefined) {
    if (!VALID_YEAR_LEVELS.includes(input.yearLevel)) {
      errors.yearLevel = `Invalid year level. Must be one of: ${VALID_YEAR_LEVELS.join(', ')}`;
    }
  }

  // Status
  if (!isUpdate || input.status !== undefined) {
    if (!VALID_STATUSES.includes(input.status)) {
      errors.status = `Invalid academic status. Must be one of: ${VALID_STATUSES.join(', ')}`;
    }
  }

  // GPA
  if (!isUpdate || input.gpa !== undefined) {
    const gpaNum = Number(input.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      errors.gpa = 'GPA must be a decimal number between 0.00 and 4.00.';
    }
  }

  // Credits Earned
  if (!isUpdate || input.creditsEarned !== undefined) {
    const credits = Number(input.creditsEarned);
    if (isNaN(credits) || credits < 0 || credits > 250) {
      errors.creditsEarned = 'Credits earned must be a positive integer between 0 and 250.';
    }
  }

  // Emergency contact name and phone
  if (!isUpdate || input.emergencyContact !== undefined) {
    if (!input.emergencyContact?.name || input.emergencyContact.name.trim().length < 2) {
      errors['emergencyContact.name'] = 'Emergency contact person name is required.';
    }
    if (!input.emergencyContact?.phone || input.emergencyContact.phone.trim().length < 7) {
      errors['emergencyContact.phone'] = 'Emergency contact telephone number is required.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * GET /api/students
 * Retrieve student records with filtering, search, pagination, and sorting
 */
studentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      department,
      status,
      yearLevel,
      minGpa,
      maxGpa,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const result = await dbService.getStudents({
      search: search as string,
      department: department as string,
      status: status as string,
      yearLevel: yearLevel as string,
      minGpa: minGpa ? parseFloat(minGpa as string) : undefined,
      maxGpa: maxGpa ? parseFloat(maxGpa as string) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10
    });

    res.json({
      success: true,
      message: `Retrieved ${result.students.length} student records.`,
      data: result.students,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching student records',
      details: error.message
    });
  }
});

/**
 * GET /api/students/stats/summary
 * Aggregate metrics and department breakdowns
 */
studentsRouter.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const stats = await dbService.getSummaryStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to compute student analytics summary.',
      details: error.message
    });
  }
});

/**
 * GET /api/students/:id
 * Retrieve a single student record by MongoDB _id or studentId
 */
studentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await dbService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student record with identifier '${id}' was not found in the database.`
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving student record',
      details: error.message
    });
  }
});

/**
 * POST /api/students
 * Add a new student record
 */
studentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const input = req.body;

    // Validate inputs
    const { isValid, errors } = validateStudentInput(input);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${Object.keys(errors).length} input error(s) detected.`,
        errors
      });
    }

    // Check unique Student ID
    const existingById = await dbService.findByStudentId(input.studentId);
    if (existingById) {
      return res.status(400).json({
        success: false,
        error: `Conflict: Student ID '${input.studentId.toUpperCase()}' is already assigned to ${existingById.firstName} ${existingById.lastName}.`,
        errors: {
          studentId: `Student ID '${input.studentId.toUpperCase()}' already exists in database.`
        }
      });
    }

    // Check unique Email
    const existingByEmail = await dbService.findByEmail(input.email);
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        error: `Conflict: Email address '${input.email.toLowerCase()}' is already in use by student ID ${existingByEmail.studentId}.`,
        errors: {
          email: `Email address '${input.email.toLowerCase()}' is already registered.`
        }
      });
    }

    // Default structure for nested objects if missing
    const cleanStudent: CreateStudentInput = {
      studentId: input.studentId.trim().toUpperCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      dateOfBirth: input.dateOfBirth.trim(),
      gender: input.gender || 'Prefer not to say',
      department: input.department,
      yearLevel: input.yearLevel,
      status: input.status || 'Active',
      gpa: Number(Number(input.gpa).toFixed(2)),
      creditsEarned: Number(input.creditsEarned) || 0,
      address: {
        street: input.address?.street?.trim() || '',
        city: input.address?.city?.trim() || '',
        state: input.address?.state?.trim() || '',
        zipCode: input.address?.zipCode?.trim() || ''
      },
      emergencyContact: {
        name: input.emergencyContact?.name?.trim() || '',
        relationship: input.emergencyContact?.relationship?.trim() || 'Parent/Guardian',
        phone: input.emergencyContact?.phone?.trim() || ''
      },
      enrollmentDate: input.enrollmentDate?.trim() || new Date().toISOString().split('T')[0],
      notes: input.notes?.trim() || ''
    };

    const created = await dbService.createStudent(cleanStudent);

    res.status(201).json({
      success: true,
      message: `Student ${created.firstName} ${created.lastName} (${created.studentId}) successfully registered.`,
      data: created
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating student record.',
      details: error.message
    });
  }
});

/**
 * PUT /api/students/:id
 * Edit/Update an existing student record
 */
studentsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input = req.body;

    // Check if student exists
    const current = await dbService.getStudentById(id);
    if (!current) {
      return res.status(404).json({
        success: false,
        error: `Cannot update: Student record '${id}' was not found.`
      });
    }

    // Validate inputs
    const { isValid, errors } = validateStudentInput(input, true, current._id);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${Object.keys(errors).length} input error(s) detected.`,
        errors
      });
    }

    // Check studentId collision if changed
    if (input.studentId && input.studentId.trim().toUpperCase() !== current.studentId) {
      const collision = await dbService.findByStudentId(input.studentId);
      if (collision && collision._id !== current._id) {
        return res.status(400).json({
          success: false,
          error: `Conflict: Student ID '${input.studentId.toUpperCase()}' is already assigned to ${collision.firstName} ${collision.lastName}.`,
          errors: {
            studentId: `Student ID '${input.studentId.toUpperCase()}' already in use.`
          }
        });
      }
    }

    // Check email collision if changed
    if (input.email && input.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const emailCollision = await dbService.findByEmail(input.email);
      if (emailCollision && emailCollision._id !== current._id) {
        return res.status(400).json({
          success: false,
          error: `Conflict: Email address '${input.email.toLowerCase()}' is already in use by student ${emailCollision.studentId}.`,
          errors: {
            email: `Email address '${input.email.toLowerCase()}' already in use.`
          }
        });
      }
    }

    const updated = await dbService.updateStudent(current._id, input);

    res.json({
      success: true,
      message: `Student ${updated?.firstName} ${updated?.lastName} (${updated?.studentId}) updated successfully.`,
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating student record.',
      details: error.message
    });
  }
});

/**
 * DELETE /api/students/:id
 * Delete a student record
 */
studentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deleteStudent(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Cannot delete: Student record with identifier '${id}' was not found in the database.`
      });
    }

    res.json({
      success: true,
      message: `Student record for ${deleted.firstName} ${deleted.lastName} (${deleted.studentId}) was permanently removed.`,
      deletedStudent: deleted
    });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting student record.',
      details: error.message
    });
  }
});

/**
 * POST /api/students/seed
 * Reseed initial default student records
 */
studentsRouter.post('/seed', async (_req: Request, res: Response) => {
  try {
    const seeded = await dbService.seedDefaultStudents();
    res.json({
      success: true,
      message: `Successfully reseeded ${seeded.length} default student records into database.`,
      count: seeded.length,
      data: seeded
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to seed student records.',
      details: error.message
    });
  }
});
