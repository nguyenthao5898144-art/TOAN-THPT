import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';

// ==============================================================
// 1. CÁC HÀM TIỆN ÍCH CHO FILEUPLOADMODAL & EDITORMODAL
// ==============================================================
export function ensureUniqueDiagramsInText(text?: any): any {
  return text || '';
}

export function sanitizeQuestionMath(question?: any): any {
  return question || {};
}

export const ensureUniqueDiagramInText = ensureUniqueDiagramsInText;

// ==============================================================
// 2. NGÂN HÀNG CÂU HỎI TOÁN 11 CHUẨN GDPT 2018 (KHÔNG CÓ ĐẠO HÀM LỚP 12)
// ==============================================================
export const MATH_11_QUESTIONS: Question[] = [
  {
    id: 'q11_1',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Hàm số lượng giác',
    content: 'Tập xác định của hàm số lượng giác $y = \\tan x$ là:',
    options: [
      { key: 'A', text: '$D = \\mathbb{R} \\setminus \\left\\{ \\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z} \\right\\}$' },
      { key: 'B', text: '$D = \\mathbb{R} \\setminus \\{k\\pi, k \\in \\mathbb{Z}\\}$' },
      { key: 'C', text: '$D = \\mathbb{R}$' },
      { key: 'D', text: '$D = \\mathbb{R} \\setminus \\left\\{ \\frac{\\pi}{4} + k\\pi, k \\in \\mathbb{Z} \\right\\}$' },
    ],
    correctAnswer: 'A',
    solution: 'Hàm số $y = \\tan x$ xác định khi $\\cos x \\neq 0 \\Leftrightarrow x \\neq \\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}$.',
  },
  {
    id: 'q11_2',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Phương trình lượng giác',
    content: 'Nghiệm của phương trình lượng giác cơ bản $\\cos x = \\frac{1}{2}$ là:',
    options: [
      { key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$' },
      { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi, k \\in \\mathbb{Z}$' },
      { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi, k \\in \\mathbb{Z}$' },
      { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$' },
    ],
    correctAnswer: 'A',
    solution: '$\\cos x = \\frac{1}{2} = \\cos \\frac{\\pi}{3} \\Leftrightarrow x = \\pm \\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$.',
  },
  {
    id: 'q11_3',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Cấp số cộng',
    content: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 4$. Số hạng thứ hai $u_2$ bằng:',
    options: [
      { key: 'A', text: '$7$' },
      { key: 'B', text: '$12$' },
      { key: 'C', text: '$-1$' },
      { key: 'D', text: '$1$' },
    ],
    correctAnswer: 'A',
    solution: '$u_2 = u_1 + d = 3 + 4 = 7$.',
  },
  {
    id: 'q11_4',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Cấp số nhân',
    content: 'Cho cấp số nhân $(u_n)$ có $u_1 = 2$ và công bội $q = 3$. Giá trị của $u_3$ bằng:',
    options: [
      { key: 'A', text: '$18$' },
      { key: 'B', text: '$6$' },
      { key: 'C', text: '$24$' },
      { key: 'D', text: '$54$' },
    ],
    correctAnswer: 'A',
    solution: '$u_3 = u_1 \\cdot q^2 = 2 \\cdot 3^2 = 18$.',
  },
  {
    id: 'q11_5',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Giới hạn dãy số',
    content: 'Tính giới hạn dãy số $L = \\lim \\frac{2n + 1}{n + 3}$:',
    options: [
      { key: 'A', text: '$2$' },
      { key: 'B', text: '$1$' },
      { key: 'C', text: '$0$' },
      { key: 'D', text: '$\\frac{1}{3}$' },
    ],
    correctAnswer: 'A',
    solution: '$\\lim \\frac{2 + 1/n}{1 + 3/n} = 2$.',
  },
  {
    id: 'q11_6',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Giới hạn hàm số',
    content: 'Tính giới hạn hàm số $L = \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$:',
    options: [
      { key: 'A', text: '$4$' },
      { key: 'B', text: '$2$' },
      { key: 'C', text: '$0$' },
      { key: 'D', text: '$1$' },
    ],
    correctAnswer: 'A',
    solution: '$\\lim_{x \\to 2} (x+2) = 4$.',
  },
  {
    id: 'q11_7',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Đường thẳng vuông góc mặt phẳng',
    content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông tâm $O$, $SA \\perp (ABCD)$. Mệnh đề nào sau đây SAI?',
    options: [
      { key: 'A', text: '$SC \\perp (ABCD)$' },
      { key: 'B', text: '$SA \\perp BD$' },
      { key: 'C', text: '$BD \\perp (SAC)$' },
      { key: 'D', text: '$BC \\perp (SAB)$' },
    ],
    correctAnswer: 'A',
    solution: '$SC$ là đường xiên nên không vuông góc với $(ABCD)$.',
  },
  {
    id: 'q11_8',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Quy tắc tính đạo hàm lớp 11',
    content: 'Đạo hàm của hàm số $y = x^3 - 3x^2 + 2x - 1$ là:',
    options: [
      { key: 'A', text: '$y\' = 3x^2 - 6x + 2$' },
      { key: 'B', text: '$y\' = 3x^2 - 6x$' },
      { key: 'C', text: '$y\' = x^2 - 3x + 2$' },
      { key: 'D', text: '$y\' = 3x^2 - 3x + 2$' },
    ],
    correctAnswer: 'A',
    solution: '$y\' = 3x^2 - 6x + 2$.',
  },
  {
    id: 'q11_9',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Hệ số góc tiếp tuyến',
    content: 'Hệ số góc của tiếp tuyến của parabol $y = x^2 - 2x + 3$ tại điểm có hoành độ $x_0 = 2$ bằng:',
    options: [
      { key: 'A', text: '$2$' },
      { key: 'B', text: '$3$' },
      { key: 'C', text: '$4$' },
      { key: 'D', text: '$0$' },
    ],
    correctAnswer: 'A',
    solution: '$y\' = 2x - 2 \\Rightarrow k = y\'(2) = 2(2) - 2 = 2$.',
  },
  {
    id: 'q11_10',
    type: 'multiple_choice',
    level: 'VanDung',
    topicName: 'Phương trình logarit 11',
    content: 'Nghiệm của phương trình logarit $\\log_2(x - 1) = 3$ là:',
    options: [
      { key: 'A', text: '$x = 9$' },
      { key: 'B', text: '$x = 8$' },
      { key: 'C', text: '$x = 7$' },
      { key: 'D', text: '$x = 10$' },
    ],
    correctAnswer: 'A',
    solution: '$x - 1 = 2^3 = 8 \\Leftrightarrow x = 9$.',
  },
  {
    id: 'q11_11',
    type: 'multiple_choice',
    level: 'VanDung',
    topicName: 'Quy tắc nhân xác suất',
    content: 'Một xạ thủ bắn vào bia hai lần độc lập. Xác suất bắn trúng lần 1 là $0.8$, lần 2 là $0.7$. Xác suất để xạ thủ bắn trúng cả hai lần là:',
    options: [
      { key: 'A', text: '$0.56$' },
      { key: 'B', text: '$0.75$' },
      { key: 'C', text: '$0.15$' },
      { key: 'D', text: '$0.94$' },
    ],
    correctAnswer: 'A',
    solution: '$P(A \\cap B) = 0.8 \\times 0.7 = 0.56$.',
  },
  {
    id: 'q11_12',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Góc giữa hai đường thẳng',
    content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$. Góc giữa hai đường thẳng $A\'B$ và $B\'C$ bằng:',
    options: [
      { key: 'A', text: '$60^\\circ$' },
      { key: 'B', text: '$90^\\circ$' },
      { key: 'C', text: '$45^\\circ$' },
      { key: 'D', text: '$30^\\circ$' },
    ],
    correctAnswer: 'A',
    solution: 'Góc $\\widehat{B\'CD\'} = 60^\\circ$ của tam giác đều $B\'CD\'$.',
  },

  // PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI
  {
    id: 'q11_13',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Cấp số cộng',
    content: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 2$ và công sai $d = 3$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Số hạng thứ năm là $u_5 = 14$.', isCorrect: true },
      { id: 'b', text: 'Công thức tổng quát là $u_n = 3n - 1$.', isCorrect: true },
      { id: 'c', text: 'Số $100$ là một số hạng của cấp số cộng.', isCorrect: false },
      { id: 'd', text: 'Tổng mười số hạng đầu tiên $S_{10} = 155$.', isCorrect: true },
    ],
    solution: 'a) $u_5 = 14$. b) $u_n = 3n - 1$. c) $3n = 101$ vô nghiệm nguyên. d) $S_{10} = 155$.',
  },
  {
    id: 'q11_14',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Hình học không gian vuông góc',
    content: 'Cho hình chóp $S.ABC$ có đáy $ABC$ vuông tại $B$, $SA \\perp (ABC)$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: '$SA \\perp BC$', isCorrect: true },
      { id: 'b', text: '$BC \\perp (SAB)$', isCorrect: true },
      { id: 'c', text: 'Tam giác $SBC$ vuông tại $C$', isCorrect: false },
      { id: 'd', text: 'Góc giữa $SC$ và $(ABC)$ là góc $\\widehat{SCA}$.', isCorrect: true },
    ],
    solution: 'a) Đúng. b) Đúng. c) Tam giác $SBC$ vuông tại $B$ chứ không phải $C$ (Sai). d) Đúng.',
  },
  {
    id: 'q11_15',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Đạo hàm và tiếp tuyến',
    content: 'Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Đạo hàm của hàm số là $f\'(x) = 3x^2 - 3$.', isCorrect: true },
      { id: 'b', text: 'Phương trình $f\'(x) = 0$ có hai nghiệm $x = \\pm 1$.', isCorrect: true },
      { id: 'c', text: 'Hệ số góc tiếp tuyến tại $x = 0$ bằng $k = -3$.', isCorrect: true },
      { id: 'd', text: 'Tiếp tuyến tại $x = 1$ có hệ số góc bằng $0$.', isCorrect: true },
    ],
    solution: 'a) Đúng. b) Đúng. c) $f\'(0) = -3$. d) $f\'(1) = 0$.',
  },
  {
    id: 'q11_16',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Quy tắc xác suất',
    content: 'Một hộp đựng 4 quả cầu đỏ và 6 quả cầu xanh. Chọn ngẫu nhiên 3 quả cầu. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Số phần tử không gian mẫu $n(\\Omega) = C_{10}^3 = 120$.', isCorrect: true },
      { id: 'b', text: 'Xác suất chọn được 3 quả đỏ bằng $\\frac{1}{30}$.', isCorrect: true },
      { id: 'c', text: 'Xác suất chọn được 3 quả cùng màu bằng $\\frac{1}{5}$.', isCorrect: true },
      { id: 'd', text: 'Xác suất có ít nhất 1 quả xanh bằng $\\frac{29}{30}$.', isCorrect: true },
    ],
    solution: 'a) Đúng. b) Đúng. c) Đúng. d) Đúng.',
  },

  // PHẦN III: TRẢ LỜI NGẮN
  { id: 'q11_17', type: 'short_answer', level: 'ThongHieu', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 5$ và $d = 3$. Tìm giá trị $u_{10}$:', correctAnswer: '32', solution: '$u_{10} = 5 + 9(3) = 32$.' },
  { id: 'q11_18', type: 'short_answer', level: 'ThongHieu', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{2x^2 - x - 1}{x - 1}$:', correctAnswer: '3', solution: '$\\lim_{x \\to 1} (2x+1) = 3$.' },
  { id: 'q11_19', type: 'short_answer', level: 'VanDung', topicName: 'Góc đường và mặt', content: 'Cho hình chóp $S.ABCD$ có đáy vuông cạnh $a$, $SA \\perp (ABCD), SA = a\\sqrt{2}$. Tính tang góc giữa $SC$ và $(ABCD)$:', correctAnswer: '1', solution: '$\\tan = \\frac{a\\sqrt{2}}{a\\sqrt{2}} = 1$.' },
  { id: 'q11_20', type: 'short_answer', level: 'VanDung', topicName: 'Tiếp tuyến', content: 'Tìm hệ số góc của tiếp tuyến của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ tại $x_0 = 1$:', correctAnswer: '0.75', solution: '$y\'(1) = 3/4 = 0.75$.' },
  { id: 'q11_2
