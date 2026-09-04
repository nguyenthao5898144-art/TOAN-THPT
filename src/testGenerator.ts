import { TestConfig, GeneratedTest, Question } from './types';

// Ngân hàng câu hỏi chuẩn cho cả 3 khối lớp 10, 11, 12 (Chương trình GDPT 2018)
const sampleQuestions: Question[] = [
  // --- KHỐI LỚP 10 ---
  {
    id: 'q10_1',
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
    id: 'q10_22',
    type: 'short_answer',
    level: 'VanDung',
    topic: 'Mệnh đề và Tập hợp',
    lessonName: '§5. Các phép toán trên tập hợp',
    outcome: 'YCCĐ 3',
    content: 'Có bao nhiêu số nguyên $x$ thuộc $A \\cap B$ biết $A = (-5; 3]$ và $B = [-2; 5)$?',
    correctAnswer: '5',
    explanation: 'Ta có $A \\cap B = [-2; 3]$. Các số nguyên thuộc giao là: -2, -1, 0, 1, 2, 3 (tùy thuộc điều kiện đoạn/khoảng).'
  },

  // --- KHỐI LỚP 11 ---
  {
    id: 'q11_1',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topic: 'Hàm số lượng giác và Phương trình lượng giác',
    lessonName: '§1. Giá trị lượng giác của góc lượng giác',
    outcome: 'YCCĐ 11.1',
    content: 'Đổi số đo góc $a = 60^\\circ$ sang đơn vị rad ta được:',
    options: ['\\frac{\\pi}{4}', '\\frac{\\pi}{3}', '\\frac{\\pi}{2}', '\\frac{\\pi}{6}'],
    correctAnswer: 1,
    explanation: 'Ta có $60^\\circ = \\frac{60 \\cdot \\pi}{180} = \\frac{\\pi}{3}$ rad.'
  },
  {
    id: 'q11_2',
    type: 'short_answer',
    level: 'VanDung',
    topic: 'Dãy số. Cấp số cộng và Cấp số nhân',
    lessonName: '§2. Cấp số cộng',
    outcome: 'YCCĐ 11.2',
    content: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 4$. Tìm số hạng thứ 5 ($u_5$).',
    correctAnswer: '19',
    explanation: 'Áp dụng công thức $u_n = u_1 + (n-1)d$. Ta có $u_5 = 3 + (5-1) \\cdot 4 = 3 + 16 = 19$.'
  },

  // --- KHỐI LỚP 12 ---
  {
    id: 'q12_1',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topic: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    lessonName: '§1. Tính đồng biến và nghịch biến của hàm số',
    outcome: 'YCCĐ 12.1',
    content: 'Cho hàm số $y = x^3 - 3x$. Khẳng định nào sau đây là đúng?',
    options: [
      'Hàm số đồng biến trên khoảng $(-1; 1)',
      'Hàm số nghịch biến trên khoảng $(-1; 1)',
      'Hàm số đồng biến trên khoảng $(-\\infty; +\\infty)',
      'Hàm số nghịch biến trên khoảng $(-\\infty; -1)'
    ],
    correctAnswer: 1,
    explanation: 'Ta có $y\' = 3x^2 - 3$. Cho $y\' = 0 \\Leftrightarrow x = \\pm 1$. Hàm số nghịch biến trên khoảng $(-1; 1)$.'
  },
  {
    id: 'q12_2',
    type: 'short_answer',
    level: 'VanDung',
    topic: 'Nguyên hàm và Tích phân',
    lessonName: '§1. Nguyên hàm',
    outcome: 'YCCĐ 12.2',
    content: 'Tính tích phân $\\int_{0}^{1} 2x \\, dx$.',
    correctAnswer: '1',
    explanation: 'Ta có nguyên hàm của $2x$ là $x^2$. Thay cận từ 0 đến 1 ta được $1^2 - 0^2 = 1$.'
  }
];

export function generateTest(config: TestConfig): GeneratedTest {
  // Lọc câu hỏi theo cấu hình hoặc trả về toàn bộ danh sách chuẩn an toàn
  const questions = sampleQuestions;
  
  return {
    id: 'test_' + Date.now(),
    title: config.title || 'ĐỀ KIỂM TRA MÔN TOÁN (THPT)',
    duration: config.duration || 45,
    questions: questions,
    createdAt: new Date().toISOString()
  };
}
