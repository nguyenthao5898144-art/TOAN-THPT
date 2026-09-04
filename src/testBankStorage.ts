import { GeneratedTest, TestConfig } from './types';

export interface StoredTestItem {
  id: string;
  fileName: string;
  displayName: string;
  grade: string;
  className?: string;
  topicName: string;
  lessonName: string;
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
  questionCountByType: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  durationMinutes: number;
  schoolName: string;
  academicYear: string;
  test: GeneratedTest;
  matrixData?: any;
  tags?: string[];
}

const STORAGE_KEY = 'toan_thpt_test_bank_v1';

export function getStoredTestBank(): StoredTestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Lỗi đọc ngân hàng đề từ localStorage:', error);
    return [];
  }
}

export function saveTestBankToStorage(items: StoredTestItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Lỗi lưu ngân hàng đề vào localStorage:', error);
  }
}

export function deleteTestFromBank(id: string): void {
  const current = getStoredTestBank();
  const updated = current.filter(item => item.id !== id);
  saveTestBankToStorage(updated);
}

export function extractTestMetadata(test: GeneratedTest) {
  const grade = test.config?.grade || '12';
  const topicName = test.config?.selectedTopics?.[0] || 'Chủ đề chung';
  const lessonName = test.config?.selectedLessons?.[0] || 'Bài học chung';
  const cleanFileName = `Toan${grade}_${Date.now()}`;
  const displayName = test.config?.title || `Đề kiểm tra Toán ${grade}`;

  return {
    grade,
    className: test.config?.className || '12A1',
    topicName,
    lessonName,
    cleanFileName,
    displayName
  };
}

export function saveTestToBank(test: GeneratedTest, options?: {
  fileName?: string;
  displayName?: string;
  grade?: string;
  className?: string;
  topicName?: string;
  lessonName?: string;
  tags?: string[];
  allowDuplicateSequence?: boolean;
}): StoredTestItem {
  const meta = extractTestMetadata(test);
  const currentBank = getStoredTestBank();

  const newItem: StoredTestItem = {
    id: `test_item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fileName: options?.fileName || meta.cleanFileName,
    displayName: options?.displayName || meta.displayName,
    grade: options?.grade || meta.grade,
    className: options?.className || meta.className,
    topicName: options?.topicName || meta.topicName,
    lessonName: options?.lessonName || meta.lessonName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalQuestions: test.questions.length,
    questionCountByType: {
      multipleChoice: test.questions.filter(q => q.type === 'multiple_choice').length,
      trueFalse: test.questions.filter(q => q.type === 'true_false').length,
      shortAnswer: test.questions.filter(q => q.type === 'short_answer').length,
    },
    durationMinutes: test.config?.durationMinutes || 45,
    schoolName: test.config?.schoolName || 'TRƯỜNG THPT MAI THANH THẾ',
    academicYear: test.config?.academicYear || '2026 - 2027',
    test: JSON.parse(JSON.stringify(test)),
    tags: options?.tags || [meta.grade, 'Đề Kiểm Tra'],
  };

  const updatedBank = [newItem, ...currentBank];
  saveTestBankToStorage(updatedBank);
  return newItem;
}
