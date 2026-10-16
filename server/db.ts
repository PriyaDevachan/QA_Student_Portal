import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection } from 'mongodb';
import { Student, CreateStudentInput, UpdateStudentInput, StudentFilterParams, PaginationMeta } from './types.ts';
import { initialStudents } from './seedData.ts';

// Helper to generate a 24-character hexadecimal MongoDB ObjectId string
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineAndPid = Math.floor(Math.random() * 0xffffffffff)
    .toString(16)
    .padStart(10, '0');
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return (timestamp + machineAndPid + counter).slice(0, 24);
}

class DatabaseService {
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private mongoCollection: Collection<Student> | null = null;
  private isConnectedToMongo: boolean = false;
  private dataDir: string;
  private dataFilePath: string;
  private inMemoryStudents: Student[] = [];
  private currentMode: 'MongoDB Atlas / Network' | 'MongoDB Persistent Document Store' = 'MongoDB Persistent Document Store';
  private lastModified: string = new Date().toISOString();

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.dataFilePath = path.join(this.dataDir, 'students.json');
    this.ensureDataDirectory();
    this.loadFromFile();
  }

  private ensureDataDirectory() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err) {
      console.error('Error creating data directory:', err);
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inMemoryStudents = parsed;
          this.lastModified = new Date().toISOString();
          console.log(`Loaded ${this.inMemoryStudents.length} students from persistent store: ${this.dataFilePath}`);
          return;
        }
      }
      // If file doesn't exist or is empty, seed initial data
      this.inMemoryStudents = [...initialStudents];
      this.saveToFile();
      console.log(`Initialized and seeded ${this.inMemoryStudents.length} default students into ${this.dataFilePath}`);
    } catch (err) {
      console.error('Failed to load from file store, falling back to defaults:', err);
      this.inMemoryStudents = [...initialStudents];
    }
  }

  private saveToFile() {
    try {
      this.ensureDataDirectory();
      const tmpPath = `${this.dataFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.inMemoryStudents, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.dataFilePath);
      this.lastModified = new Date().toISOString();
    } catch (err) {
      console.error('Failed to persist student records to disk:', err);
    }
  }

  public async init() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim() !== '') {
      try {
        console.log(`Attempting connection to external MongoDB instance: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
        this.mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 3000 });
        await this.mongoClient.connect();
        this.mongoDb = this.mongoClient.db('student_portal');
        this.mongoCollection = this.mongoDb.collection<Student>('students');
        this.isConnectedToMongo = true;
        this.currentMode = 'MongoDB Atlas / Network';
        console.log('Connected to MongoDB database successfully.');

        // Check if collection is empty, if so, seed it
        const count = await this.mongoCollection.countDocuments();
        if (count === 0) {
          await this.mongoCollection.insertMany(this.inMemoryStudents as any);
          console.log(`Seeded ${this.inMemoryStudents.length} initial students into MongoDB.`);
        }
      } catch (err: any) {
        console.warn(`Could not connect to external MongoDB URI (${err.message}). Using persistent MongoDB-compatible file engine.`);
        this.isConnectedToMongo = false;
        this.currentMode = 'MongoDB Persistent Document Store';
      }
    } else {
      console.log('No MONGODB_URI specified. Operating with persistent MongoDB document engine at ./data/students.json');
      this.currentMode = 'MongoDB Persistent Document Store';
    }
  }

  public getStatus() {
    return {
      mode: this.currentMode,
      isConnectedToMongoServer: this.isConnectedToMongo,
      databaseName: 'student_portal',
      collectionName: 'students',
      documentCount: this.inMemoryStudents.length,
      storageFile: this.dataFilePath,
      lastModified: this.lastModified,
      mongoUriConfigured: Boolean(process.env.MONGODB_URI)
    };
  }

  public async getStudents(params: StudentFilterParams): Promise<{ students: Student[]; pagination: PaginationMeta }> {
    let filtered = [...this.inMemoryStudents];

    // Search filter across studentId, firstName, lastName, email, department
    if (params.search && params.search.trim() !== '') {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(s => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return (
          s.studentId.toLowerCase().includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q)
        );
      });
    }

    // Filter by department
    if (params.department && params.department !== 'All') {
      filtered = filtered.filter(s => s.department === params.department);
    }

    // Filter by status
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(s => s.status === params.status);
    }

    // Filter by year level
    if (params.yearLevel && params.yearLevel !== 'All') {
      filtered = filtered.filter(s => s.yearLevel === params.yearLevel);
    }

    // Filter by GPA range
    if (params.minGpa !== undefined && !isNaN(params.minGpa)) {
      filtered = filtered.filter(s => s.gpa >= params.minGpa!);
    }
    if (params.maxGpa !== undefined && !isNaN(params.maxGpa)) {
      filtered = filtered.filter(s => s.gpa <= params.maxGpa!);
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof Student];
      let valB: any = b[sortBy as keyof Student];

      if (typeof valA === 'string') {
        return sortOrder * valA.localeCompare(valB || '');
      }
      if (typeof valA === 'number') {
        return sortOrder * (valA - (valB || 0));
      }
      return 0;
    });

    const total = filtered.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  public async getStudentById(id: string): Promise<Student | null> {
    const student = this.inMemoryStudents.find(s => s._id === id || s.studentId === id);
    return student || null;
  }

  public async findByStudentId(studentId: string): Promise<Student | null> {
    const student = this.inMemoryStudents.find(s => s.studentId.toUpperCase() === studentId.trim().toUpperCase());
    return student || null;
  }

  public async findByEmail(email: string): Promise<Student | null> {
    const student = this.inMemoryStudents.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
    return student || null;
  }

  public async createStudent(input: CreateStudentInput): Promise<Student> {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...input,
      _id: generateObjectId(),
      studentId: input.studentId.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
      gpa: Number(Number(input.gpa).toFixed(2)),
      creditsEarned: Number(input.creditsEarned) || 0,
      createdAt: now,
      updatedAt: now
    };

    // Prepend new student so it appears on top
    this.inMemoryStudents.unshift(newStudent);
    this.saveToFile();

    // If connected to Mongo collection, sync
    if (this.isConnectedToMongo && this.mongoCollection) {
      try {
        await this.mongoCollection.insertOne(newStudent as any);
      } catch (err) {
        console.error('MongoDB sync insert error:', err);
      }
    }

    return newStudent;
  }

  public async updateStudent(id: string, updates: UpdateStudentInput): Promise<Student | null> {
    const index = this.inMemoryStudents.findIndex(s => s._id === id || s.studentId === id);
    if (index === -1) {
      return null;
    }

    const current = this.inMemoryStudents[index];
    const now = new Date().toISOString();

    const updated: Student = {
      ...current,
      ...updates,
      _id: current._id, // preserve immutable _id
      studentId: updates.studentId ? updates.studentId.trim().toUpperCase() : current.studentId,
      email: updates.email ? updates.email.trim().toLowerCase() : current.email,
      gpa: updates.gpa !== undefined ? Number(Number(updates.gpa).toFixed(2)) : current.gpa,
      creditsEarned: updates.creditsEarned !== undefined ? Number(updates.creditsEarned) : current.creditsEarned,
      address: {
        ...current.address,
        ...(updates.address || {})
      },
      emergencyContact: {
        ...current.emergencyContact,
        ...(updates.emergencyContact || {})
      },
      updatedAt: now
    };

    this.inMemoryStudents[index] = updated;
    this.saveToFile();

    if (this.isConnectedToMongo && this.mongoCollection) {
      try {
        await this.mongoCollection.updateOne({ _id: current._id as any }, { $set: updated as any });
      } catch (err) {
        console.error('MongoDB sync update error:', err);
      }
    }

    return updated;
  }

  public async deleteStudent(id: string): Promise<Student | null> {
    const index = this.inMemoryStudents.findIndex(s => s._id === id || s.studentId === id);
    if (index === -1) {
      return null;
    }

    const [deleted] = this.inMemoryStudents.splice(index, 1);
    this.saveToFile();

    if (this.isConnectedToMongo && this.mongoCollection) {
      try {
        await this.mongoCollection.deleteOne({ _id: deleted._id as any });
      } catch (err) {
        console.error('MongoDB sync delete error:', err);
      }
    }

    return deleted;
  }

  public async seedDefaultStudents(): Promise<Student[]> {
    this.inMemoryStudents = JSON.parse(JSON.stringify(initialStudents));
    this.saveToFile();

    if (this.isConnectedToMongo && this.mongoCollection) {
      try {
        await this.mongoCollection.deleteMany({});
        await this.mongoCollection.insertMany(this.inMemoryStudents as any);
      } catch (err) {
        console.error('MongoDB seed error:', err);
      }
    }

    return this.inMemoryStudents;
  }

  public async getSummaryStats() {
    const total = this.inMemoryStudents.length;
    if (total === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        probationStudents: 0,
        graduatedStudents: 0,
        averageGpa: 0,
        departmentDistribution: {},
        yearDistribution: {}
      };
    }

    let activeStudents = 0;
    let probationStudents = 0;
    let graduatedStudents = 0;
    let sumGpa = 0;
    const departmentDistribution: Record<string, number> = {};
    const yearDistribution: Record<string, number> = {};

    for (const s of this.inMemoryStudents) {
      if (s.status === 'Active') activeStudents++;
      if (s.status === 'Probation') probationStudents++;
      if (s.status === 'Graduated') graduatedStudents++;

      sumGpa += s.gpa;

      departmentDistribution[s.department] = (departmentDistribution[s.department] || 0) + 1;
      yearDistribution[s.yearLevel] = (yearDistribution[s.yearLevel] || 0) + 1;
    }

    const averageGpa = Number((sumGpa / total).toFixed(2));

    return {
      totalStudents: total,
      activeStudents,
      probationStudents,
      graduatedStudents,
      averageGpa,
      departmentDistribution,
      yearDistribution
    };
  }
}

export const dbService = new DatabaseService();
