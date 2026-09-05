import { GeneratedTest, Question, TestConfig } from './types';
import * as Math10Module from './math10Syllabus';
import * as Math11Module from './math11Syllabus';
import * as Math12Module from './math12Syllabus';

export const ensureUniqueDiagramsInText = (text: any): any => text || '';
export const sanitizeQuestionMath = (q: any): any => q || {};

// Lấy đúng dữ liệu syllabus theo từng khối lớp từ các file nguồn
export const getSyllabusForGrade = (grade: string | number): Question[] => {
  try {
    const gStr = String(grade);
    let moduleData: any = null;

    if (gStr === '10') {
      moduleData = Math10Module;
    } else if (gStr === '11') {
      moduleData = Math11Module;
    } else {
      moduleData = Math12Module;
    }

    // Tự động quét các dạng tên biến xuất khẩu phổ biến trong file syllabus
    const questions = 
      moduleData.MATH_10_SYLLABUS || moduleData.math10Syllabus ||
      moduleData.MATH_11_SYLLABUS || moduleData.math11Syllabus ||
      moduleData.MATH_12_SYLLABUS || moduleData.math12Syllabus ||
      moduleData.default || [];

    return Array.isArray(questions) ? questions : [];
  } catch (err) {
    return [];
  }
};

export function generateTest(config: TestConfig): GeneratedTest {
  const gradeStr = String(config.grade || '10');
  let questionsPool = getSyllabusForGrade(gradeStr);

  // Nếu file syllabus chưa có dữ liệu, dùng mảng dự phòng an toàn để không crash hệ thống
  if (!questionsPool || questionsPool.length === 0) {
    questionsPool = [
      {
        id: `q${gradeStr}_fallback`,
        type: 'multiple_choice',
        level: 'NhanBiet',
        topicName: `Chương trình Toán ${gradeStr}`,
        lessonName: 'Khung ma trận chuẩn GDPT 2018',
        outcome: 'YCCĐ cơ bản',
        content: `Đề kiểm tra định kì môn Toán lớp ${gradeStr} theo chuẩn Công văn 7991.`,
        options: [
          { key: 'A', text: 'Đáp án A' },
          { key: 'B', text: 'Đáp án B' },
          { key: 'C', text: 'Đáp án C' },
          { key: 'D', text: 'Đáp án D' }
        ],
        correctAnswer: 'A',
        solution: 'Đáp án chuẩn theo ma trận đề.'
      }
    ];
  }

  const durationValue = config.duration ? Number(config.duration) : 45;

  return {
    id: 'test_' + Date.now(),
    title: config.title || `ĐỀ KIỂM TRA MÔN TOÁN LỚP ${gradeStr}`,
    duration: durationValue,
    questions: questionsPool,
    createdAt: new Date().toISOString()
  };
}
export function createDefaultTest(config?: Partial<TestConfig>): GeneratedTest {
  return generateTest({
    grade: 10,
    title: 'ĐỀ KIỂM TRA MÔN TOÁN (THPT)',
    duration: 45,
    ...config
  });
}
