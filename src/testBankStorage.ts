import { GeneratedTest, Question, TestConfig } from './types';
import { createDefaultTest } from './testGenerator';
import { MATH_12_SYLLABUS } from './math12Syllabus';

export interface StoredTestItem {
  id: string;
  fileName: string; // e.g. "Toan12-UngDungDaoHam-TinhDonDieuHamSo"
  displayName: string; // e.g. "Toán 12 - Ứng dụng đạo hàm để khảo sát hàm số - Tính đơn điệu của hàm số"
  grade: string; // "Toán 12" | "Toán 11" | "Toán 10"
  className?: string; // "Lớp 12" (hoặc "12A1", "12A2"...)
  topicName: string; // "Tên chủ đề" (e.g. "Ứng dụng đạo hàm để khảo sát hàm số")
  lessonName: string; // "Tên bài học" (e.g. "Tính đơn điệu của hàm số")
  topicLesson?: string; // backward-compatibility alias
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
  tags?: string[];
}

const STORAGE_KEY = 'math12_stored_test_bank_repository_v2';

/**
 * Remove Vietnamese accents and special characters for clean PascalCase
 */
export function slugifyVietnamese(str: string): string {
  if (!str) return 'DeKiemTra';
  const clean = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();

  // Convert to PascalCase words
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'DeKiemTra';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Generates the standardized filename following user requirement:
 * Tiêu đề của file: Toán (10, 11, 12)-tên chủ đề-tên bài học.
 * (e.g. "Toan12-UngDungDaoHam-TinhDonDieuHamSo" or "Toán 12 - Ứng dụng đạo hàm - Tính đơn điệu của hàm số")
 */
export function formatStandardTestFileName(
  grade: string = 'Toán 12',
  topicName: string = 'UngDungDaoHam',
  lessonName: string = 'TinhDonDieuHamSo',
  forFileSystem = true
): string {
  if (forFileSystem) {
    const g = slugifyVietnamese(grade);
    const t = slugifyVietnamese(topicName);
    const l = slugifyVietnamese(lessonName);
    return `${g}-${t}-${l}`;
  } else {
    const g = grade || 'Toán 12';
    const t = topicName || 'Chủ đề môn Toán';
    const l = lessonName || 'Bài học môn Toán';
    return `${g} - ${t} - ${l}`;
  }
}

/**
 * Extract Grade, Topic, and Lesson from GeneratedTest
 */
export function extractTestMetadata(test: GeneratedTest): {
  grade: string;
  className: string;
  topicName: string;
  lessonName: string;
  topicLesson: string;
  cleanFileName: string;
  displayName: string;
} {
  const config = test.config;

  // Grade detection: "Toán 12" | "Toán 11" | "Toán 10"
  let grade = 'Toán 12';
  let className = 'Lớp 12';

  if (config.title?.includes('TOÁN 11') || config.title?.includes('Toán 11') || config.title?.includes('Lớp 11')) {
    grade = 'Toán 11';
    className = 'Lớp 11';
  } else if (config.title?.includes('TOÁN 10') || config.title?.includes('Toán 10') || config.title?.includes('Lớp 10')) {
    grade = 'Toán 10';
    className = 'Lớp 10';
  }

  // Topic & Lesson derivation
  let topicName = 'Ứng dụng đạo hàm để khảo sát hàm số';
  let lessonName = 'Tính đơn điệu của hàm số';

  if (config.selectedLessonIds && config.selectedLessonIds.length > 0) {
    const matchedLesson = MATH_12_SYLLABUS.flatMap((t) => t.lessons).find((l) =>
      config.selectedLessonIds!.includes(l.id)
    );
    if (matchedLesson) {
      lessonName = matchedLesson.name;
      const matchedTopic = MATH_12_SYLLABUS.find((t) =>
        t.lessons.some((l) => l.id === matchedLesson.id)
      );
      if (matchedTopic) topicName = matchedTopic.name;
    }
  } else if (config.selectedLessonId) {
    const matchedLesson = MATH_12_SYLLABUS.flatMap((t) => t.lessons).find(
      (l) => l.id === config.selectedLessonId
    );
    if (matchedLesson) {
      lessonName = matchedLesson.name;
      const matchedTopic = MATH_12_SYLLABUS.find((t) =>
        t.lessons.some((l) => l.id === matchedLesson.id)
      );
      if (matchedTopic) topicName = matchedTopic.name;
    }
  } else if (config.selectedTopicIds && config.selectedTopicIds.length > 0) {
    const matchedTopic = MATH_12_SYLLABUS.find((t) => config.selectedTopicIds.includes(t.id));
    if (matchedTopic) {
      topicName = matchedTopic.name;
      if (matchedTopic.lessons.length > 0) lessonName = matchedTopic.lessons[0].name;
    }
  } else if (test.questions.length > 0) {
    topicName = test.questions[0].topicName || 'Ứng dụng đạo hàm để khảo sát hàm số';
    lessonName = test.questions[0].lessonName || 'Tính đơn điệu của hàm số';
  }

  const cleanFileName = formatStandardTestFileName(grade, topicName, lessonName, true);
  const displayName = formatStandardTestFileName(grade, topicName, lessonName, false);

  return {
    grade,
    className,
    topicName,
    lessonName,
    topicLesson: `${topicName} - ${lessonName}`,
    cleanFileName,
    displayName,
  };
}

/**
 * Pre-seeded sample tests for the test repository adhering strictly to:
 * Toán (10, 11, 12) - tên chủ đề - tên bài học
 */
export function generateSeedBank(): StoredTestItem[] {
  const seeds: StoredTestItem[] = [];

  // Sample 1: Toán 12 - Ứng dụng đạo hàm để khảo sát hàm số - Tính đơn điệu của hàm số
  const config1: TestConfig = {
    mode: 'kt_dinh_ky',
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN 12 - TÍNH ĐƠN ĐIỆU HÀM SỐ',
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    departmentName: 'TỔ TOÁN',
    academicYear: '2026 - 2027',
    durationMinutes: 45,
    selectedTopicIds: ['topic_dao_ham'],
    selectedLessonId: 'lesson_don_dieu',
    counts: {
      multipleChoice: { nhanBiet: 3, thongHieu: 2, vanDung: 1 },
      trueFalse: { nhanBiet: 0, thongHieu: 1, vanDung: 1 },
      shortAnswer: { nhanBiet: 0, thongHieu: 1, vanDung: 1 },
    },
  };
  const test1 = createDefaultTest(config1);
  seeds.push({
    id: 'seed_test_1',
    fileName: 'Toan12-UngDungDaoHam-TinhDonDieuHamSo',
    displayName: 'Toán 12 - Ứng dụng đạo hàm để khảo sát hàm số - Tính đơn điệu của hàm số',
    grade: 'Toán 12',
    className: 'Lớp 12',
    topicName: 'Ứng dụng đạo hàm để khảo sát hàm số',
    lessonName: 'Tính đơn điệu của hàm số',
    topicLesson: 'Ứng dụng đạo hàm - Tính đơn điệu của hàm số',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    totalQuestions: test1.questions.length,
    questionCountByType: {
      multipleChoice: test1.questions.filter((q) => q.type === 'multiple_choice').length,
      trueFalse: test1.questions.filter((q) => q.type === 'true_false').length,
      shortAnswer: test1.questions.filter((q) => q.type === 'short_answer').length,
    },
    durationMinutes: 45,
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    academicYear: '2026 - 2027',
    test: test1,
    tags: ['Toán 12', 'Đạo hàm', 'Đơn điệu'],
  });

  // Sample 2: Toán 12 - Ứng dụng đạo hàm để khảo sát hàm số - Khảo sát và vẽ đồ thị của hàm số
  const config2: TestConfig = {
    mode: 'kt_dinh_ky',
    title: 'ĐỀ KIỂM TRA MÔN TOÁN 12 - KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    departmentName: 'TỔ TOÁN',
    academicYear: '2026 - 2027',
    durationMinutes: 45,
    selectedTopicIds: ['topic_dao_ham'],
    selectedLessonId: 'lesson_khao_sat_do_thi',
    counts: {
      multipleChoice: { nhanBiet: 4, thongHieu: 2, vanDung: 2 },
      trueFalse: { nhanBiet: 0, thongHieu: 2, vanDung: 1 },
      shortAnswer: { nhanBiet: 0, thongHieu: 1, vanDung: 1 },
    },
  };
  const test2 = createDefaultTest(config2);
  seeds.push({
    id: 'seed_test_2',
    fileName: 'Toan12-UngDungDaoHam-KhaoSatVaVeDoThiHamSo',
    displayName: 'Toán 12 - Ứng dụng đạo hàm để khảo sát hàm số - Khảo sát và vẽ đồ thị của hàm số',
    grade: 'Toán 12',
    className: 'Lớp 12',
    topicName: 'Ứng dụng đạo hàm để khảo sát hàm số',
    lessonName: 'Khảo sát và vẽ đồ thị của hàm số',
    topicLesson: 'Ứng dụng đạo hàm - Khảo sát và vẽ đồ thị của hàm số',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalQuestions: test2.questions.length,
    questionCountByType: {
      multipleChoice: test2.questions.filter((q) => q.type === 'multiple_choice').length,
      trueFalse: test2.questions.filter((q) => q.type === 'true_false').length,
      shortAnswer: test2.questions.filter((q) => q.type === 'short_answer').length,
    },
    durationMinutes: 45,
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    academicYear: '2026 - 2027',
    test: test2,
    tags: ['Toán 12', 'Đồ thị', 'Tiệm cận'],
  });

  // Sample 3: Toán 12 - Phương pháp tọa độ trong không gian - Tọa độ của vectơ trong không gian Oxyz
  const config3: TestConfig = {
    mode: 'kt_dinh_ky',
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ TOÁN 12 - TOẠ ĐỘ VÀ VECTƠ TRONG KHÔNG GIAN',
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    departmentName: 'TỔ TOÁN',
    academicYear: '2026 - 2027',
    durationMinutes: 45,
    selectedTopicIds: ['topic_oxyz'],
    selectedLessonId: 'lesson_toa_do_vecto',
    counts: {
      multipleChoice: { nhanBiet: 3, thongHieu: 3, vanDung: 1 },
      trueFalse: { nhanBiet: 0, thongHieu: 1, vanDung: 1 },
      shortAnswer: { nhanBiet: 0, thongHieu: 1, vanDung: 1 },
    },
  };
  const test3 = createDefaultTest(config3);
  seeds.push({
    id: 'seed_test_3',
    fileName: 'Toan12-ToaDoVaVectorTrongKhongGian-ToaDoCuaVectoOxyz',
    displayName: 'Toán 12 - Tọa độ và Vectơ trong không gian - Tọa độ của vectơ trong không gian Oxyz',
    grade: 'Toán 12',
    className: 'Lớp 12',
    topicName: 'Tọa độ và Vectơ trong không gian',
    lessonName: 'Tọa độ của vectơ trong không gian Oxyz',
    topicLesson: 'Tọa độ vectơ - Không gian Oxyz',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    totalQuestions: test3.questions.length,
    questionCountByType: {
      multipleChoice: test3.questions.filter((q) => q.type === 'multiple_choice').length,
      trueFalse: test3.questions.filter((q) => q.type === 'true_false').length,
      shortAnswer: test3.questions.filter((q) => q.type === 'short_answer').length,
    },
    durationMinutes: 45,
    schoolName: 'TRƯỜNG THPT MAI THANH THẾ',
    academicYear: '2026 - 2027',
    test: test3,
    tags: ['Toán 12', 'Hình học Oxyz', 'Vectơ'],
  });

  return seeds;
}

/**
 * Load all stored tests from localStorage
 */
export function getStoredTestBank(): StoredTestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored test bank:', err);
  }

  // Fallback to initial seeds only on very first launch when key does not exist in localStorage
  const initialSeeds = generateSeedBank();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeeds));
  } catch (e) {
    console.warn('Failed to save initial test bank:', e);
  }
  return initialSeeds;
}

/**
 * Save all tests back to localStorage
 */
export function saveTestBankToStorage(items: StoredTestItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to write test bank to localStorage:', err);
  }
}

/**
 * Helper to check if a test with matching fileName or topic+lesson exists in bank
 */
export function findDuplicateStoredTest(
  fileName: string,
  topicName?: string,
  lessonName?: string
): StoredTestItem | undefined {
  const currentBank = getStoredTestBank();
  const cleanTarget = fileName.trim().toLowerCase();

  return currentBank.find((item) => {
    const itemFileClean = item.fileName.trim().toLowerCase();
    if (itemFileClean === cleanTarget) return true;
    if (topicName && lessonName && item.topicName && item.lessonName) {
      if (
        item.topicName.trim().toLowerCase() === topicName.trim().toLowerCase() &&
        item.lessonName.trim().toLowerCase() === lessonName.trim().toLowerCase() &&
        itemFileClean === cleanTarget
      ) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Generate a non-colliding file name with sequential suffix e.g. Toan12-UngDungDaoHam-TinhDonDieuHamSo_1
 */
export function generateSequencedFileName(baseFileName: string): string {
  const currentBank = getStoredTestBank();
  const existingFileNames = new Set(currentBank.map((i) => i.fileName.trim().toLowerCase()));

  if (!existingFileNames.has(baseFileName.trim().toLowerCase())) {
    return baseFileName;
  }

  // If baseFileName ends with _<number>, extract base and start counting
  const match = baseFileName.match(/^(.*)_(\d+)$/);
  const root = match ? match[1] : baseFileName;
  let counter = match ? parseInt(match[2], 10) + 1 : 1;

  while (existingFileNames.has(`${root}_${counter}`.toLowerCase())) {
    counter++;
  }

  return `${root}_${counter}`;
}

/**
 * Save a new test to the Bank repository with auto-sequenced name support
 */
export function saveTestToBank(
  test: GeneratedTest,
  customDetails?: {
    grade?: string;
    className?: string;
    topicName?: string;
    lessonName?: string;
    topicLesson?: string;
    fileName?: string;
    displayName?: string;
    tags?: string[];
    allowDuplicateSequence?: boolean;
  }
): StoredTestItem {
  const currentBank = getStoredTestBank();
  const meta = extractTestMetadata(test);

  const grade = customDetails?.grade || meta.grade;
  const className = customDetails?.className || meta.className;
  const topicName = customDetails?.topicName || meta.topicName;
  const lessonName = customDetails?.lessonName || meta.lessonName;

  let fileName =
    customDetails?.fileName ||
    formatStandardTestFileName(grade, topicName, lessonName, true);

  if (customDetails?.allowDuplicateSequence) {
    fileName = generateSequencedFileName(fileName);
  }

  const displayName =
    customDetails?.displayName ||
    (fileName.includes('_')
      ? `${formatStandardTestFileName(grade, topicName, lessonName, false)} (Bản ${fileName.split('_').pop()})`
      : formatStandardTestFileName(grade, topicName, lessonName, false));

  const mcqCount = test.questions.filter((q) => q.type === 'multiple_choice').length;
  const tfCount = test.questions.filter((q) => q.type === 'true_false').length;
  const saCount = test.questions.filter((q) => q.type === 'short_answer').length;

  const newItem: StoredTestItem = {
    id: `test_saved_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fileName,
    displayName,
    grade,
    className,
    topicName,
    lessonName,
    topicLesson: `${topicName} - ${lessonName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalQuestions: test.questions.length,
    questionCountByType: {
      multipleChoice: mcqCount,
      trueFalse: tfCount,
      shortAnswer: saCount,
    },
    durationMinutes: test.config.durationMinutes || 45,
    schoolName: test.config.schoolName || 'TRƯỜNG THPT MAI THANH THẾ',
    academicYear: test.config.academicYear || '2026 - 2027',
    test: JSON.parse(JSON.stringify(test)),
    tags: customDetails?.tags || [grade, topicName.split(' ')[0], lessonName.split(' ')[0]],
  };

  // Add to front of bank
  const updatedBank = [newItem, ...currentBank];
  saveTestBankToStorage(updatedBank);
  return newItem;
}

/**
 * Delete a test from the repository by ID
 */
export function deleteStoredTest(id: string): StoredTestItem[] {
  const currentBank = getStoredTestBank();
  const targetId = String(id).trim();
  const filtered = currentBank.filter((item) => String(item.id).trim() !== targetId);
  saveTestBankToStorage(filtered);
  return filtered;
}

/**
 * Delete multiple tests from the repository by list of IDs
 */
export function deleteMultipleStoredTests(ids: string[]): StoredTestItem[] {
  const currentBank = getStoredTestBank();
  const idSet = new Set(ids.map((id) => String(id).trim()));
  const filtered = currentBank.filter((item) => !idSet.has(String(item.id).trim()));
  saveTestBankToStorage(filtered);
  return filtered;
}

/**
 * Clear all tests in the repository
 */
export function clearAllStoredTests(): void {
  saveTestBankToStorage([]);
}

/**
 * Update details of a stored test in the repository
 */
export function updateStoredTest(id: string, updates: Partial<StoredTestItem>): StoredTestItem[] {
  const currentBank = getStoredTestBank();
  const updated = currentBank.map((item) => {
    if (item.id === id) {
      const grade = updates.grade || item.grade;
      const topicName = updates.topicName || item.topicName || item.topicLesson?.split(' - ')[0] || 'Chủ đề môn Toán';
      const lessonName = updates.lessonName || item.lessonName || item.topicLesson?.split(' - ')[1] || 'Bài học môn Toán';

      const updatedItem: StoredTestItem = {
        ...item,
        ...updates,
        grade,
        topicName,
        lessonName,
        topicLesson: `${topicName} - ${lessonName}`,
        updatedAt: new Date().toISOString(),
      };

      if (!updates.fileName) {
        updatedItem.fileName = formatStandardTestFileName(grade, topicName, lessonName, true);
      }
      if (!updates.displayName) {
        updatedItem.displayName = formatStandardTestFileName(grade, topicName, lessonName, false);
      }

      return updatedItem;
    }
    return item;
  });

  saveTestBankToStorage(updated);
  return updated;
}

/**
 * Duplicate a stored test in the bank
 */
export function duplicateStoredTest(id: string): StoredTestItem | null {
  const currentBank = getStoredTestBank();
  const found = currentBank.find((item) => item.id === id);
  if (!found) return null;

  const duplicated: StoredTestItem = {
    ...JSON.parse(JSON.stringify(found)),
    id: `test_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fileName: `${found.fileName}_BanSao`,
    displayName: `${found.displayName} (Bản sao)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedBank = [duplicated, ...currentBank];
  saveTestBankToStorage(updatedBank);
  return duplicated;
}

/**
 * Export entire test repository as JSON file
 */
export function exportTestBankToJson(): void {
  const bank = getStoredTestBank();
  const jsonStr = JSON.stringify(bank, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NganHangDe_ToanTHPT_GDPT2018_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import test repository from JSON string
 */
export function importTestBankFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Dữ liệu không phải là danh sách đề thi hợp lệ.' };
    }

    const validItems: StoredTestItem[] = [];
    parsed.forEach((item: any, idx: number) => {
      if (item && item.test && Array.isArray(item.test.questions)) {
        const id = item.id || `imported_test_${Date.now()}_${idx}`;
        const grade = item.grade || 'Toán 12';
        const topicName = item.topicName || item.topicLesson || 'Chủ đề môn Toán';
        const lessonName = item.lessonName || 'Bài học môn Toán';
        const fileName = item.fileName || formatStandardTestFileName(grade, topicName, lessonName, true);
        const displayName = item.displayName || formatStandardTestFileName(grade, topicName, lessonName, false);

        validItems.push({
          id,
          fileName,
          displayName,
          grade,
          className: item.className || 'Lớp 12',
          topicName,
          lessonName,
          topicLesson: `${topicName} - ${lessonName}`,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalQuestions: item.test.questions.length,
          questionCountByType: {
            multipleChoice: item.test.questions.filter((q: any) => q.type === 'multiple_choice').length,
            trueFalse: item.test.questions.filter((q: any) => q.type === 'true_false').length,
            shortAnswer: item.test.questions.filter((q: any) => q.type === 'short_answer').length,
          },
          durationMinutes: item.test.config?.durationMinutes || 45,
          schoolName: item.test.config?.schoolName || 'TRƯỜNG THPT MAI THANH THẾ',
          academicYear: item.test.config?.academicYear || '2026 - 2027',
          test: item.test,
          tags: item.tags || [grade, topicName.split(' ')[0]],
        });
      }
    });

    if (validItems.length === 0) {
      return { success: false, count: 0, error: 'Không tìm thấy đề thi hợp lệ trong file.' };
    }

    const currentBank = getStoredTestBank();
    const merged = [...validItems, ...currentBank];
    saveTestBankToStorage(merged);

    return { success: true, count: validItems.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Lỗi đọc file JSON.' };
  }
}

