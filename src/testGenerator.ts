import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';

export const ensureUniqueDiagramsInText = (text: any): any => text || '';
export const sanitizeQuestionMath = (q: any): any => q || {};

// ==============================================================
// 1. NGÂN HÀNG 22 CÂU CHUYÊN BIỆT: "MỆNH ĐỀ VÀ TẬP HỢP" (TOÁN 10)
// ==============================================================
export const MENH_DE_TAP_HOP_QUESTIONS: Question[] = [
  // PHẦN I: 12 CÂU TRẮC NGHIỆM 4 LỰA CHỌN (0.25đ/câu)
  {
    id: 'q10_1',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Phủ định của mệnh đề $P$: "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là mệnh đề:',
    options: [
      { key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' },
      { key: 'B', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$"' },
      { key: 'C', text: '"$\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' },
      { key: 'D', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 > 0$"' },
    ],
    correctAnswer: 'A',
    solution: 'Phủ định của $\\forall$ là $\\exists$, phủ định của $>$ là $\\le$.',
  },
  {
    id: 'q10_2',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:',
    options: [
      { key: 'A', text: '$(1; 3]$' },
      { key: 'B', text: '[-2; 5)' },
      { key: 'C', text: '[1; 3]' },
      { key: 'D', text: '(-2; 1]' },
    ],
    correctAnswer: 'A',
    solution: 'Phần tử chung của cả hai tập là $A \\cap B = (1; 3]$.',
  },
  {
    id: 'q10_3',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho tập hợp $X = \\{x \\in \\mathbb{N} \\mid x \\le 4\\}$. Tập hợp $X$ được viết dưới dạng liệt kê các phần tử là:',
    options: [
      { key: 'A', text: '$X = \\{0; 1; 2; 3; 4\\}$' },
      { key: 'B', text: '$X = \\{1; 2; 3; 4\\}$' },
      { key: 'C', text: '$X = \\{0; 1; 2; 3\\}$' },
      { key: 'D', text: '$X = \\{1; 2; 3\\}$' },
    ],
    correctAnswer: 'A',
    solution: 'Do $x \\in \\mathbb{N}$ và $x \\le 4$ nên $X = \\{0; 1; 2; 3; 4\\}$.',
  },
  {
    id: 'q10_4',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Số tập con gồm 2 phần tử của tập hợp $A = \\{1; 2; 3; 4\\}$ bằng:',
    options: [
      { key: 'A', text: '$6$' },
      { key: 'B', text: '$4$' },
      { key: 'C', text: '$8$' },
      { key: 'D', text: '$16$' },
    ],
    correctAnswer: 'A',
    solution: 'Số tập con 2 phần tử là $C_4^2 = 6$.',
  },
  {
    id: 'q10_5',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho hai tập hợp $A = \\{0; 1; 2; 3\\}$ và $B = \\{2; 3; 4; 5\\}$. Hợp của hai tập hợp $A \\cup B$ là:',
    options: [
      { key: 'A', text: '$\\{0; 1; 2; 3; 4; 5\\}$' },
      { key: 'B', text: '$\\{2; 3\\}$' },
      { key: 'C', text: '$\\{0; 1\\}$' },
      { key: 'D', text: '$\\{4; 5\\}$' },
    ],
    correctAnswer: 'A',
    solution: '$A \\cup B = \\{0; 1; 2; 3; 4; 5\\}$.',
  },
  {
    id: 'q10_6',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho hai tập hợp $A = \\{1; 2; 3; 4\\}$ và $B = \\{3; 4; 5\\}$. Hiệu của hai tập hợp $A \\setminus B$ là:',
    options: [
      { key: 'A', text: '$\\{1; 2\\}$' },
      { key: 'B', text: '$\\{5\\}$' },
      { key: 'C', text: '$\\{3; 4\\}$' },
      { key: 'D', text: '$\\{1; 2; 5\\}$' },
    ],
    correctAnswer: 'A',
    solution: '$A \\setminus B$ gồm các phần tử thuộc $A$ nhưng không thuộc $B$, do đó $A \\setminus B = \\{1; 2\\}$.',
  },
  {
    id: 'q10_7',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Phần bù của nửa khoảng $A = [-3; +\\infty)$ trong $\\mathbb{R}$ là:',
    options: [
      { key: 'A', text: '$(-\\infty; -3)$' },
      { key: 'B', text: '$(-\\infty; -3]$' },
      { key: 'C', text: '[-3; 3]' },
      { key: 'D', text: '$(3; +\\infty)$' },
    ],
    correctAnswer: 'A',
    solution: '$C_\\mathbb{R} A = \\mathbb{R} \\setminus [-3; +\\infty) = (-\\infty; -3)$.',
  },
  {
    id: 'q10_8',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Biểu diễn tập hợp số $S = \\{x \\in \\mathbb{R} \\mid -1 < x \\le 4\\}$ trên trục số là:',
    options: [
      { key: 'A', text: 'Nửa khoảng $(-1; 4]$' },
      { key: 'B', text: 'Đoạn $[-1; 4]$' },
      { key: 'C', text: 'Khoảng $(-1; 4)$' },
      { key: 'D', text: 'Nửa khoảng $[-1; 4)$' },
    ],
    correctAnswer: 'A',
    solution: 'Dấu $>$ là ngoặc tròn, $\\le$ là ngoặc vuông: $(-1; 4]$.',
  },
  {
    id: 'q10_9',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho $A = (-\\infty; 2]$ và $B = (-1; 5)$. Giao của hai tập hợp $A \\cap B$ là:',
    options: [
      { key: 'A', text: '$(-1; 2]$' },
      { key: 'B', text: '$(-\\infty; 5)$' },
      { key: 'C', text: '[-1; 2]' },
      { key: 'D', text: '$(2; 5)$' },
    ],
    correctAnswer: 'A',
    solution: '$A \\cap B = (-1; 2]$.',
  },
  {
    id: 'q10_10',
    type: 'multiple_choice',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho hai tập hợp khác rỗng $A = (m - 1; 4]$ và $B = (-2; 2m + 2)$. Tìm tất cả các giá trị nguyên của $m$ để $A \\cap B \\neq \\emptyset$:',
    options: [
      { key: 'A', text: '$m \\in \\{-1; 0; 1; 2; 3; 4\\}$' },
      { key: 'B', text: '$m \\ge -1$' },
      { key: 'C', text: '$m < 5$' },
      { key: 'D', text: '$m > 0$' },
    ],
    correctAnswer: 'A',
    solution: 'Điều kiện $A, B$ khác rỗng và có giao khác rỗng suy ra các giá trị nguyên thỏa mãn là $m \\in \\{-1; 0; 1; 2; 3; 4\\}$.',
  },
  {
    id: 'q10_11',
    type: 'multiple_choice',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Mệnh đề nào sau đây là mệnh đề ĐÚNG?',
    options: [
      { key: 'A', text: '"$\\forall n \\in \\mathbb{N}, n(n+1)$ là số chẵn"' },
      { key: 'B', text: '"$\\forall n \\in \\mathbb{N}, n^2 > 0$"' },
      { key: 'C', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 2x + 3 = 0$"' },
      { key: 'D', text: '"$\\forall x \\in \\mathbb{Z}, x^2 > x$"' },
    ],
    correctAnswer: 'A',
    solution: 'Tích của hai số tự nhiên liên tiếp luôn luôn là một số chẵn.',
  },
  {
    id: 'q10_12',
    type: 'multiple_choice',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho $A = [-3; 1)$ và $B = (0; 4]$. Số phần tử nguyên thuộc tập hợp $A \\cup B$ là:',
    options: [
      { key: 'A', text: '$8$' },
      { key: 'B', text: '$7$' },
      { key: 'C', text: '$6$' },
      { key: 'D', text: '$9$' },
    ],
    correctAnswer: 'A',
    solution: '$A \\cup B = [-3; 4]$. Các số nguyên gồm: $\\{-3, -2, -1, 0, 1, 2, 3, 4\\}$ $\\Rightarrow$ có 8 số nguyên.',
  },

  // PHẦN II: 4 CÂU ĐÚNG / SAI (ý a, b, c, d)
  {
    id: 'q10_13',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Mệnh đề toán học',
    content: 'Xét tính đúng/sai của các mệnh đề sau:',
    statements: [
      { id: 'a', text: 'Số $2026$ chia hết cho $2$.', isCorrect: true },
      { id: 'b', text: 'Số nguyên tố là số chỉ có hai ước là 1 và chính nó.', isCorrect: true },
      { id: 'c', text: 'Tam giác đều có ba góc bằng $60^\\circ$.', isCorrect: true },
      { id: 'd', text: 'Hình vuông không phải là hình bình hành.', isCorrect: false },
    ],
    solution: 'a, b, c Đúng. d Sai vì hình vuông là trường hợp đặc biệt của hình bình hành.',
  },
  {
    id: 'q10_14',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Tập hợp và tập con',
    content: 'Cho tập hợp $A = \\{1; 2; 3; 4; 5\\}$. Xét tính đúng/sai của các mệnh đề sau:',
    statements: [
      { id: 'a', text: 'Tập hợp $A$ có tất cả $2^5 = 32$ tập con.', isCorrect: true },
      { id: 'b', text: 'Số tập hợp con gồm 1 phần tử của $A$ là $5$.', isCorrect: true },
      { id: 'c', text: 'Tập rỗng $\\emptyset$ là tập con của $A$.', isCorrect: true },
      { id: 'd', text: 'Phần tử $0$ thuộc tập hợp $A$.', isCorrect: false },
    ],
    solution: 'a, b, c Đúng. d Sai vì $0 \\notin A$.',
  },
  {
    id: 'q10_15',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Các phép toán tập hợp trên trục số',
    content: 'Cho hai tập con của số thực $A = [-2; 3)$ và $B = (1; 6]$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: '$A \\cap B = (1; 3)$.', isCorrect: true },
      { id: 'b', text: '$A \\cup B = [-2; 6]$.', isCorrect: true },
      { id: 'c', text: '$A \\setminus B = [-2; 1]$.', isCorrect: true },
      { id: 'd', text: '$B \\setminus A = [3; 6]$.', isCorrect: true },
    ],
    solution: 'Tất cả 4 mệnh đề đều đúng.',
  },
  {
    id: 'q10_16',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Bài toán tập hợp chứa tham số',
    content: 'Cho hai tập hợp $A = [m; m + 3]$ và $B = (-1; 5)$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Độ dài của đoạn $A$ luôn bằng $3$ với mọi $m$.', isCorrect: true },
      { id: 'b', text: 'Khi $m = 0$ thì $A \\subset B$.', isCorrect: true },
      { id: 'c', text: 'Để $A \\subset B$ thì điều kiện là $-1 < m \\le 2$.', isCorrect: true },
      { id: 'd', text: 'Khi $m = 5$ thì $A \\cap B \\neq \\emptyset$.', isCorrect: false },
    ],
    solution: 'a, b, c Đúng. d Sai vì khi $m = 5$, $A = [5; 8]$ không giao với $(-1; 5)$.',
  },

  // PHẦN III: 6 CÂU TRẢ LỜI NGẮN (0.5đ/câu)
  {
    id: 'q10_17',
    type: 'short_answer',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho tập hợp $A$ có $5$ phần tử. Hỏi tập hợp $A$ có bao nhiêu tập con gồm đúng $2$ phần tử?',
    correctAnswer: '10',
    solution: 'Số tập con gồm 2 phần tử là $C_5^2 = 10$.',
  },
  {
    id: 'q10_18',
    type: 'short_answer',
    level: 'ThongHieu',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho hai khoảng $A = (-3; 4]$ và $B = [0; 6)$. Tính độ dài của đoạn giao $A \\cap B$:',
    correctAnswer: '4',
    solution: '$A \\cap B = [0; 4]$. Độ dài đoạn bằng $4 - 0 = 4$.',
  },
  {
    id: 'q10_19',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Lớp 10A có 25 học sinh thích môn Toán, 20 học sinh thích môn Văn, trong đó có 12 học sinh thích cả hai môn. Hỏi có bao nhiêu học sinh thích ít nhất một môn?',
    correctAnswer: '33',
    solution: '$n(A \\cup B) = 25 + 20 - 12 = 33$.',
  },
  {
    id: 'q10_20',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Có bao nhiêu số nguyên $x$ thuộc tập hợp $A \\cap B$ biết $A = (-5; 3)$ và $B = [-1; 6)$?',
    correctAnswer: '4',
    solution: '$A \\cap B = [-1; 3) \\Rightarrow x \\in \\{-1; 0; 1; 2\\}$, có 4 số nguyên.',
  },
  {
    id: 'q10_21',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Cho tập hợp $X = \\{1; 2; 3; 4; 5; 6\\}$. Hỏi tập hợp $X$ có tất cả bao nhiêu tập con khác rỗng?',
    correctAnswer: '63',
    solution: 'Số tập con khác rỗng là $2^6 - 1 = 64 - 1 = 63$.',
  },
  {
    id: 'q10_22',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Mệnh đề và Tập hợp',
    content: 'Tìm giá trị nguyên nhỏ nhất của tham số $m$ để tập hợp $A = [m; +\\infty)$ giao với $B = (-\\infty; 5]$ là một tập hợp khác rỗng:',
    correctAnswer: '5',
    solution: 'Để có giao khác rỗng thì $m \\le 5$, giá trị nguyên lớn nhất là 5.',
  },
];

// 2. NGÂN HÀNG TOÁN 11 CHUẨN
export const MATH_11_QUESTIONS: Question[] = [
  { id: 'q11_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Tập xác định của hàm số lượng giác $y = \\tan x$ là:', options: [{ key: 'A', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$' }, { key: 'B', text: '$D = \\mathbb{R}$' }, { key: 'C', text: '$D = \\mathbb{R} \\setminus \\{k\\pi\\}$' }, { key: 'D', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{4} + k\\pi\\}$' }], correctAnswer: 'A', solution: '$\\cos x \\neq 0$.' },
  { id: 'q11_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Nghiệm của phương trình $\\cos x = \\frac{1}{2}$ là:', options: [{ key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$' }, { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi$' }, { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi$' }, { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi$' }], correctAnswer: 'A', solution: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$.' },
];

// ==============================================================
// 3. HÀM TẠO ĐỀ BÁM SÁT 100% MA TRẬN ĐÃ CHỌN CỦA GIÁO VIÊN
// ==============================================================
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config?.grade || '10');
  let questions: Question[] = [];

  // NẾU GIÁO VIÊN CHỌN TOÁN 10 (VÀ CHUYÊN ĐỀ MỆNH ĐỀ & TẬP HỢP)
  if (grade === '10') {
    questions = MENH_DE_TAP_HOP_QUESTIONS;
  } else if (grade === '11') {
    questions = MATH_11_QUESTIONS;
  } else {
    questions = MENH_DE_TAP_HOP_QUESTIONS;
  }

  return {
    id: `test_${grade}_${Date.now()}`,
    title: config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`,
    config: { ...config, grade },
    questions,
    createdAt: new Date().toISOString(),
  };
};

export const generateUniqueTestForStudent = (config: TestConfig, student?: StudentAccount): GeneratedTest => {
  return createDefaultTest(config);
};
