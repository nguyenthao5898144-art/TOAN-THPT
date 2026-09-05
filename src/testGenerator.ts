import { GeneratedTest, Question, TestConfig } from './types';
import * as Math10Module from './math10Syllabus';
import * as Math11Module from './math11Syllabus';
import * as Math12Module from './math12Syllabus';

export const ensureUniqueDiagramsInText = (text: any): any => text || '';
export const sanitizeQuestionMath = (q: any): any => q || {};

// ==============================================================
// 1. LIÊN KẾT ĐÚNG FILE NGUỒN THEO TỪNG KHỐI LỚP (10, 11, 12)
// ==============================================================
export const getSyllabusForGrade = (grade: string) => {
  try {
    if (grade === '10') {
      return (Math10Module as any).MATH_10_SYLLABUS || (Math10Module as any).math10Syllabus || (Math10Module as any).default || [];
    }
    if (grade === '11') {
      return (Math11Module as any).MATH_11_SYLLABUS || (Math11Module as any).math11Syllabus || (Math11Module as any).default || [];
    }
    return (Math12Module as any).MATH_12_SYLLABUS || (Math12Module as any).math12Syllabus || (Math12Module as any).default || [];
  } catch {
    return [];
  }
};

// ==============================================================
// 2. NGÂN HÀNG TRỌN BỘ CÂU HỎI TOÁN 10 CHUẨN GDPT 2018
// ==============================================================
export const MATH_10_QUESTIONS: Question[] = [
  { id: 'q10_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Mệnh đề toán học', outcome: 'YCCĐ 1', content: 'Phủ định của mệnh đề $P$: "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là mệnh đề:', options: [{ key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' }, { key: 'B', text: '"$\\exists x, x^2 + 1 < 0$"' }, { key: 'C', text: '"$\\forall x, x^2 + 1 \\le 0$"' }, { key: 'D', text: '"$\\exists x, x^2 + 1 > 0$"' }], correctAnswer: 'A', solution: 'Phủ định là $\\exists$ và $\\le$.' },
  { id: 'q10_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tập hợp', outcome: 'YCCĐ 1', content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:', options: [{ key: 'A', text: '$(1; 3]$' }, { key: 'B', text: '[-2; 5)' }, { key: 'C', text: '[1; 3]' }, { key: 'D', text: '(-2; 1]' }], correctAnswer: 'A', solution: '$A \\cap B = (1; 3]$.' }
];

// ==============================================================
// 3. HÀM SINH ĐỀ CHÍNH THEO CẤU HÌNH
// ==============================================================
export function generateTest(config: TestConfig): GeneratedTest {
  const gradeStr = String(config.grade || '10');
  let questionsPool = getSyllabusForGrade(gradeStr);
  
  if (!questionsPool || questionsPool.length === 0) {
    questionsPool = MATH_10_QUESTIONS;
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
