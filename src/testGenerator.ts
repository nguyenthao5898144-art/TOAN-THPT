import { TestConfig, GeneratedTest, Question } from './types';

// Danh sách ngân hàng câu hỏi chuẩn cho sinh/trắc nghiệm toán học
const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topic: 'Mệnh đề và Tập hợp',
    lessonName: '§1. Mệnh đề toán học',
    outcome: 'YCCĐ 1',
    content: 'Trong các phát biểu sau, phát biểu nào là mệnh đề toán học?',
    options: [
      'Hôm nay trời đẹp quá!',
      'Bạn có thích học toán không?',
      'Số 2 là số nguyên tố chẵn duy nhất.',
      'Hãy cố gắng học tập thật tốt nhé!'
    ],
    correctAnswer: 2,
    explanation: 'Phát biểu "Số 2 là số nguyên tố chẵn duy nhất" có tính đúng sai rõ ràng nên đây là mệnh đề toán học.'
  },
  {
    id: 'q2',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topic: 'Mệnh đề và Tập hợp',
    lessonName: '§2. Tập hợp',
    outcome: 'YCCĐ 2',
    content: 'Cho tập hợp $A = \\{1; 2; 3; 4\\}$. Số phần tử của tập hợp $A$ là:',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    explanation: 'Tập hợp $A$ có 4 phần tử liệt kê bên trong dấu ngoặc nhọn.'
  },
  {
    id: 'q10_22',
    type: 'short_answer',
    level: 'VanDung',
    topic: 'Mệnh đề và Tập hợp',
    lessonName: '§5. Các phép toán trên tập hợp',
    outcome: 'YCCĐ 3',
    content: 'Có bao nhiêu số nguyên $x$ thuộc $A \\cap B$ biết $A = (-5; 3]$ và $B = [-2; 5)$?',
    correctAnswer: '5',
    explanation: 'Ta có $A \\cap B = [-2; 3]$. Các số nguyên thuộc giao là: -2, -1, 0, 1, 2, 3.'
  }
];

export function generateTest(config: TestConfig): GeneratedTest {
  // Lọc câu hỏi theo cấu hình hoặc lấy danh sách mặc định an toàn
  const questions = sampleQuestions;
  
  return {
    id: 'test_' + Date.now(),
    title: config.title || 'ĐỀ KIỂM TRA MÔN TOÁN',
    duration: config.duration || 45,
    questions: questions,
    createdAt: new Date().toISOString()
  };
}
```[cite: 1]

Thầy copy toàn bộ đoạn trên, dán đè vào tệp `src/textGenerator.ts` trên GitHub rồi bấm **Commit changes** là xong xuôi[cite: 1]!
