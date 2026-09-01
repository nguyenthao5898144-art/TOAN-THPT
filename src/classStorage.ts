export interface Student {
  id: string;
  name: string;
  code?: string;
  phone?: string;
}

export interface StudentAccount {
  id: string;
  name: string;
  className?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  students?: Student[];
}

export interface Assignment {
  id: string;
  title: string;
  config: any;
  openAt?: string;
  closeAt?: string;
  durationMinutes: number;
  maxAttempts: number;
  targetType: 'class' | 'specific_students';
  targetClasses?: string[];
  targetStudentIds?: string[];
  allowReviewSolution?: boolean;
  createdAt: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  testId?: string;
  score?: number;
  submittedAt: string;
  answers: any;
}

export const DEFAULT_CLASSES: ClassRoom[] = [
  {
    id: '12A1',
    name: '12A1',
    students: [
      { id: 'hs_1', name: 'Nguyễn Văn An', code: 'HS01' },
      { id: 'hs_2', name: 'Trần Thị Bình', code: 'HS02' },
    ],
  },
  {
    id: '12A2',
    name: '12A2',
    students: [
      { id: 'hs_3', name: 'Lê Hoàng Cường', code: 'HS03' },
    ],
  },
  { id: '12A3', name: '12A3', students: [] },
];

export const getStoredClasses = (): ClassRoom[] => {
  try {
    const data = localStorage.getItem('classrooms_data');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load classrooms', e);
  }
  return DEFAULT_CLASSES;
};

export const saveClasses = (classes: ClassRoom[]): void => {
  try {
    localStorage.setItem('classrooms_data', JSON.stringify(classes));
  } catch (e) {
    console.error('Failed to save classrooms', e);
  }
};

/**
 * Tự động phân tích danh sách học sinh dán từ Excel / Word
 */
export const parseStudentListText = (rawText: string): Student[] => {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line, index) => {
    const cleanName = line.replace(/^[0-9]+[\.\-\/\)\s]+/, '').trim();
    return {
      id: `std_${Date.now()}_${index}`,
      name: cleanName || line,
      code: `HS${index + 1 < 10 ? '0' : ''}${index + 1}`,
    };
  });
};

export const getStoredAssignments = (): Assignment[] => {
  try {
    const data = localStorage.getItem('assignments_data') || localStorage.getItem('stored_assignments');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getAssignments = getStoredAssignments;

export const saveAssignment = (assignment: Assignment): void => {
  try {
    const existing: Assignment[] = getStoredAssignments();
    const index = existing.findIndex((a) => a.id === assignment.id);
    if (index >= 0) {
      existing[index] = assignment;
    } else {
      existing.push(assignment);
    }
    localStorage.setItem('assignments_data', JSON.stringify(existing));
    localStorage.setItem('stored_assignments', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save assignment', e);
  }
};

export const saveStoredAssignment = saveAssignment;

export const deleteStoredAssignment = (id: string): void => {
  try {
    const existing: Assignment[] = getStoredAssignments();
    const filtered = existing.filter((a) => a.id !== id);
    localStorage.setItem('assignments_data', JSON.stringify(filtered));
    localStorage.setItem('stored_assignments', JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete assignment', e);
  }
};

export const deleteAssignment = deleteStoredAssignment;
