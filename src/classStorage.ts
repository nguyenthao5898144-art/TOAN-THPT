export interface Student {
  id: string;
  name: string;
  code?: string;
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

const DEFAULT_CLASSES: ClassRoom[] = [
  { id: '12A1', name: '12A1', students: [{ id: 'hs_1', name: 'Học sinh 1' }, { id: 'hs_2', name: 'Học sinh 2' }] },
  { id: '12A2', name: '12A2', students: [{ id: 'hs_3', name: 'Học sinh 3' }] },
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

export const saveAssignment = (assignment: Assignment): void => {
  try {
    const existingStr = localStorage.getItem('assignments_data');
    const existing: Assignment[] = existingStr ? JSON.parse(existingStr) : [];
    const index = existing.findIndex((a) => a.id === assignment.id);
    if (index >= 0) {
      existing[index] = assignment;
    } else {
      existing.push(assignment);
    }
    localStorage.setItem('assignments_data', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save assignment', e);
  }
};
