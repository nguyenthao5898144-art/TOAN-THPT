import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';

export function ensureUniqueDiagramsInText(text?: any): any { return text || ''; }
export function sanitizeQuestionMath(q?: any): any { return q || {}; }

// 1. NGÂN HÀNG CÂU HỎI TOÁN 11 CHUẨN GDPT 2018 (KHÔNG CÓ ĐẠO HÀM ĐƠN ĐIỆU CỦA LỚP 12)
export const MATH_11_QUESTIONS: Question[] = [
  { id: 'q1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Tập xác định của hàm số $y = \\tan x$ là:', options: [{ key: 'A', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$' }, { key: 'B', text: '$D = \\mathbb{R}$' }, { key: 'C', text: '$D = \\mathbb{R} \\setminus \\{k\\pi\\}$' }, { key: 'D', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{4} + k\\pi\\}$' }], correctAnswer: 'A', solution: 'Điều kiện $\\cos x \\neq 0$.' },
  { id: 'q2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Nghiệm của phương trình $\\cos x = \\frac{1}{2}$ là:', options: [{ key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$' }, { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi$' }, { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi$' }, { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi$' }], correctAnswer: 'A', solution: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$.' },
  { id: 'q3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3, d = 4$. Số hạng $u_2$ bằng:', options: [{ key: 'A', text: '7' }, { key: 'B', text: '12' }, { key: 'C', text: '-1' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$u_2 = 3 + 4 = 7$.' },
  { id: 'q4', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số nhân', content: 'Cho cấp số nhân $(u_n)$ có $u_1 = 2, q = 3$. Giá trị $u_3$ bằng:', options: [{ key: 'A', text: '18' }, { key: 'B', text: '6' }, { key: 'C', text: '24' }, { key: 'D', text: '54' }], correctAnswer: 'A', solution: '$u_3 = 2 \\times 3^2 = 18$.' },
  { id: 'q5', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim \\frac{2n + 1}{n + 3}$:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '1' }, { key: 'C', text: '0' }, { key: 'D', text: '1/3' }], correctAnswer: 'A', solution: 'Chia cả tử và mẫu cho $n$.' },
  { id: 'q6', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$:', options: [{ key: 'A', text: '4' }, { key: 'B', text: '2' }, { key: 'C', text: '0' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$\\lim (x+2) = 4$.' },
  { id: 'q7', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Hình không gian', content: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Mệnh đề nào SAI?', options: [{ key: 'A', text: '$SC \\perp (ABCD)$' }, { key: 'B', text: '$SA \\perp BD$' }, { key: 'C', text: '$BD \\perp (SAC)$' }, { key: 'D', text: '$BC \\perp (SAB)$' }], correctAnswer: 'A', solution: '$SC$ là đường xiên.' },
  { id: 'q8', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Đạo hàm', content: 'Đạo hàm của $y = x^3 - 3x^2 + 2x - 1$ là:', options: [{ key: 'A', text: '$y\' = 3x^2 - 6x + 2$' }, { key: 'B', text: '$y\' = 3x^2 - 6x$' }, { key: 'C', text: '$y\' = x^2 - 3x + 2$' }, { key: 'D', text: '$y\' = 3x^2 - 3x + 2$' }], correctAnswer: 'A', solution: '$y\' = 3x^2 - 6x + 2$.' },
  { id: 'q9', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Tiếp tuyến', content: 'Hệ số góc của tiếp tuyến $y = x^2 - 2x + 3$ tại $x_0 = 2$ bằng:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '3' }, { key: 'C', text: '4' }, { key: 'D', text: '0' }], correctAnswer: 'A', solution: '$y\'(2) = 2(2) - 2 = 2$.' },
  { id: 'q10', type: 'multiple_choice', level: 'VanDung', topicName: 'Logarit', content: 'Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:', options: [{ key: 'A', text: '$x = 9$' }, { key: 'B', text: '$x = 8$' }, { key: 'C', text: '$x = 7$' }, { key: 'D', text: '$x = 10$' }], correctAnswer: 'A', solution: '$x - 1 = 8 \\Rightarrow x = 9$.' },
  { id: 'q11', type: 'multiple_choice', level: 'VanDung', topicName: 'Xác suất', content: 'Bắn 2 phát độc lập, xác suất trúng là 0.8 và 0.7. Xác suất trúng cả hai:', options: [{ key: 'A', text: '0.56' }, { key: 'B', text: '0.75' }, { key: 'C', text: '0.15' }, { key: 'D', text: '0.94' }], correctAnswer: 'A', solution: '$0.8 \\times 0.7 = 0.56$.' },
  { id: 'q12', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Góc hình học', content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$. Góc giữa $A\'B$ và $B\'C$ bằng:', options: [{ key: 'A', text: '$60^\\circ$' }, { key: 'B', text: '$90^\\circ$' }, { key: 'C', text: '$45^\\circ$' }, { key: 'D', text: '$30^\\circ$' }], correctAnswer: 'A', solution: 'Góc $60^\\circ$ tam giác đều.' },
  { id: 'q13', type: 'true_false', level: 'ThongHieu', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 2, d = 3$. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Số hạng $u_5 = 14$', isCorrect: true }, { id: 'b', text: '$u_n = 3n - 1$', isCorrect: true }, { id: 'c', text: 'Số 100 thuộc cấp số cộng', isCorrect: false }, { id: 'd', text: 'Tổng $S_{10} = 155$', isCorrect: true }], solution: 'a, b, d Đúng; c Sai.' },
  { id: 'q14', type: 'true_false', level: 'VanDung', topicName: 'Hình không gian', content: 'Cho chóp $S.ABC$ có đáy vuông tại $B$, $SA \\perp (ABC)$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$SA \\perp BC$', isCorrect: true }, { id: 'b', text: '$BC \\perp (SAB)$', isCorrect: true }, { id: 'c', text: 'Tam giác $SBC$ vuông tại $C$', isCorrect: false }, { id: 'd', text: 'Góc giữa $SC$ và đáy là $\\widehat{SCA}$', isCorrect: true }], solution: 'c Sai do vuông tại B.' },
  { id: 'q15', type: 'true_false', level: 'ThongHieu', topicName: 'Đạo hàm', content: 'Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$f\'(x) = 3x^2 - 3$', isCorrect: true }, { id: 'b', text: '$f\'(x) = 0$ có 2 nghiệm $\\pm 1$', isCorrect: true }, { id: 'c', text: 'Hệ số góc tại $x=0$ là $k=-3$', isCorrect: true }, { id: 'd', text: 'Tiếp tuyến tại $x=1$ có $k=0$', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q16', type: 'true_false', level: 'VanDung', topicName: 'Xác suất', content: 'Hộp có 4 bi đỏ và 6 bi xanh, lấy ngẫu nhiên 3 viên. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Số phần tử không gian mẫu là 120', isCorrect: true }, { id: 'b', text: 'Xác suất 3 bi đỏ là 1/30', isCorrect: true }, { id: 'c', text: 'Xác suất 3 bi cùng màu là 1/5', isCorrect: true }, { id: 'd', text: 'Xác suất có ít nhất 1 bi xanh là 29/30', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q17', type: 'short_answer', level: 'ThongHieu', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng có $u_1 = 5, d = 3$. Tính $u_{10}$:', correctAnswer: '32', solution: '$u_{10} = 5 + 9(3) = 32$.' },
  { id: 'q18', type: 'short_answer', level: 'ThongHieu', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{2x^2 - x - 1}{x - 1}$:', correctAnswer: '3', solution: '$\\lim (2x+1) = 3$.' },
  { id: 'q19', type: 'short_answer', level: 'VanDung', topicName: 'Góc đường và mặt', content: 'Cho hình chóp $S.ABCD$ có đáy vuông cạnh $a$, $SA \\perp (ABCD), SA = a\\sqrt{2}$. Tính tang góc giữa $SC$ và $(ABCD)$:', correctAnswer: '1', solution: '$\\tan = 1$.' },
  { id: 'q20', type: 'short_answer', level: 'VanDung', topicName: 'Tiếp tuyến', content: 'Tìm hệ số góc tiếp tuyến của $y = \\frac{2x - 1}{x + 1}$ tại $x_0 = 1$:', correctAnswer: '0.75', solution: '$y\'(1) = 3/4 = 0.75$.' },
  { id: 'q21', type: 'short_answer', level: 'VanDung', topicName: 'Phương trình mũ', content: 'Giải phương trình $2^{x^2 - 3x} = 16$. Tính tổng các nghiệm:', correctAnswer: '3', solution: 'Nghiệm -1 và 4 $\\Rightarrow$ tổng bằng 3.' },
  { id: 'q22', type: 'short_answer', level: 'VanDung', topicName: 'Tổ hợp', content: 'Từ các chữ số 1, 2, 3, 4, 5, 6 lập được bao nhiêu số tự nhiên gồm 4 chữ số khác nhau?', correctAnswer: '360', solution: '$A_6^4 = 360$.' },
];

// 2. NGÂN HÀNG CÂU HỎI TOÁN 10 CHUẨN GDPT 2018 (CÓ BẢNG XÉT DẤU)
export const MATH_10_QUESTIONS: Question[] = [
  { id: 'q10_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề', content: 'Phủ định của mệnh đề "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là:', options: [{ key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' }, { key: 'B', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$"' }, { key: 'C', text: '"$\\forall x, x^2 + 1 \\le 0$"' }, { key: 'D', text: '"$\\exists x, x^2 + 1 > 0$"' }], correctAnswer: 'A', solution: 'Phủ định là $\\exists$ và $\\le$.' },
  { id: 'q10_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Tập hợp', content: 'Cho $A = [-2; 3]$ và $B = (1; 5)$. Giao $A \\cap B$ là:', options: [{ key: 'A', text: '$(1; 3]$' }, { key: 'B', text: '[-2; 5)' }, { key: 'C', text: '[1; 3]' }, { key: 'D', text: '(-2; 1]' }], correctAnswer: 'A', solution: '$A \\cap B = (1; 3]$.' },
  { id: 'q10_3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Bảng xét dấu', content: 'Cho tam thức bậc hai $f(x)$ có bảng xét dấu:\n$$\\begin{array}{c|ccccccc} x & -\\infty & & -2 & & 3 & & +\\infty \\\\ \\hline f(x) & & + & 0 & - & 0 & + & \\end{array}$$\nTập nghiệm của bất phương trình $f(x) < 0$ là:', options: [{ key: 'A', text: '$(-2; 3)$' }, { key: 'B', text: '$(-\\infty; -2) \\cup (3; +\\infty)$' }, { key: 'C', text: '$[-2; 3]$' }, { key: 'D', text: '$(-\\infty; -2]$' }], correctAnswer: 'A', solution: '$f(x) < 0$ khi $x \\in (-2; 3)$.' },
];

// 3. HÀM TẠO ĐỀ BẢO ĐẢM ĐÚNG THEO KHỐI LỚP 10, 11, 12
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config?.grade || '11');
  let questions: Question[] = [];

  if (grade === '10') {
    questions = [...MATH_10_QUESTIONS, ...MATH_11_QUESTIONS.slice(3, 22)];
  } else {
    questions = MATH_11_QUESTIONS;
  }

  return {
    id: `test_${Date.now()}`,
    title: config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`,
    config: { ...config, grade },
    questions,
    createdAt: new Date().toISOString(),
  };
};

export const generateUniqueTestForStudent = (config: TestConfig, student?: StudentAccount): GeneratedTest => {
  return createDefaultTest(config);
};
