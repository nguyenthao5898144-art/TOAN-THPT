import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';
import { getMath11Test, MATH_11_QUESTIONS } from './math11TestBank';
import { getMath10Test, MATH_10_QUESTIONS } from './math10TestBank';

// Hàm tiện ích cho EditorModal và FileUploadModal
export const sanitizeQuestionMath = (question: Question | any): Question => {
  if (!question) return question;
  return {
    ...question,
    content: question.content ? String(question.content).trim() : '',
    solution: question.solution ? String(question.solution).trim() : '',
  };
};

export const ensureUniqueDiagramsInText = (text: string | any): any => {
  if (typeof text !== 'string') return text;
  return text;
};

// ĐỀ TOÁN 12 (CÓ BẢNG BIẾN THIÊN & BẢNG XÉT DẤU)
export const MATH_12_QUESTIONS: Question[] = [
  {
    id: 'q12_1',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Tính đơn điệu của hàm số (Có Bảng xét dấu)',
    content: 'Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm như sau:\n$$\\begin{array}{c|ccccccc} x & -\\infty & & -1 & & 2 & & +\\infty \\\\ \\hline f\'(x) & & + & 0 & - & 0 & + & \\end{array}$$\nHàm số đã cho nghịch biến trên khoảng nào dưới đây?',
    options: [
      { key: 'A', text: '$(-1; 2)$' },
      { key: 'B', text: '$(2; +\\infty)$' },
      { key: 'C', text: '$(-\\infty; -1)$' },
      { key: 'D', text: '$(-1; +\\infty)$' },
    ],
    correctAnswer: 'A',
    solution: 'Dựa vào bảng xét dấu, $f\'(x) < 0$ trên $(-1; 2)$ nên hàm số nghịch biến trên $(-1; 2)$.',
  },
  {
    id: 'q12_2',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Cực trị của hàm số (Có Bảng biến thiên)',
    content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như sau:\n$$\\begin{array}{c|ccccc} x & -\\infty & & 1 & & +\\infty \\\\ \\hline f\'(x) & & + & 0 & - & \\\\ \\hline f(x) & -\\infty & \\nearrow & 3 & \\searrow & -\\infty \\end{array}$$\nĐiểm cực đại của hàm số đã cho là:',
    options: [
      { key: 'A', text: '$x = 1$' },
      { key: 'B', text: '$y = 3$' },
      { key: 'C', text: '$x = 3$' },
      { key: 'D', text: '$y = 1$' },
    ],
    correctAnswer: 'A',
    solution: 'Đạo hàm đổi dấu từ dương sang âm tại $x = 1$, do đó điểm cực đại là $x = 1$.',
  },
];

// HÀM ĐIỀU PHỐI GỌI ĐÚNG FILE TOÁN 10, TOÁN 11 HOẶC TOÁN 12
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config?.grade || '11');

  // 1. NẾU LÀ TOÁN 11 -> GỌI FILE math11TestBank.ts
  if (grade === '11') {
    return getMath11Test(config);
  }

  // 2. NẾU LÀ TOÁN 10 -> GỌI FILE math10TestBank.ts
  if (grade === '10') {
    return getMath10Test(config);
  }

  // 3. MẶC ĐỊNH TOÁN 12
  return {
    id: `test_12_${Date.now()}`,
    title: config?.title || 'BÀI KIỂM TRA TOÁN 12 - GDPT 2018',
    config: { ...config, grade: '12' },
    questions: [...MATH_12_QUESTIONS, ...MATH_11_QUESTIONS.slice(2, 22)],
    createdAt: new Date().toISOString(),
  };
};

export const generateUniqueTestForStudent = (config: TestConfig, student?: StudentAccount): GeneratedTest => {
  return createDefaultTest(config);
};
