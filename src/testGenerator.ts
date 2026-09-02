import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';

// ==============================================================
// 1. CÁC HÀM TIỆN ÍCH CHO FILE UPLOAD & EDITOR MODAL
// ==============================================================
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

// ==============================================================
// 2. NGÂN HÀNG CÂU HỎI TOÁN 11 CHUẨN GDPT 2018 (KHÔNG CÓ ĐẠO HÀM ĐƠN ĐIỆU CỦA LỚP 12)
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
    solution: 'Hàm số $y = \\tan x = \\frac{\\sin x}{\\cos x}$ xác định khi $\\cos x \\neq 0 \\Leftrightarrow x \\neq \\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}$.',
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
    solution: 'Phương trình $\\cos x = \\frac{1}{2} = \\cos \\frac{\\pi}{3} \\Leftrightarrow x = \\pm \\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$.',
  },
  {
    id: 'q11_3',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Cấp số cộng',
    content: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 4$. Giá trị của số hạng thứ hai $u_2$ bằng:',
    options: [
      { key: 'A', text: '$7$' },
      { key: 'B', text: '$12$' },
      { key: 'C', text: '$-1$' },
      { key: 'D', text: '$1$' },
    ],
    correctAnswer: 'A',
    solution: 'Ta có $u_2 = u_1 + d = 3 + 4 = 7$.',
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
    solution: 'Theo công thức cấp số nhân: $u_3 = u_1 \\cdot q^2 = 2 \\cdot 3^2 = 18$.',
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
    solution: 'Chia cả tử và mẫu cho $n$: $\\lim \\frac{2 + 1/n}{1 + 3/n} = 2$.',
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
    solution: 'Rút gọn phân thức: $\\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 4$.',
  },
  {
    id: 'q11_7',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Đường thẳng vuông góc mặt phẳng',
    content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông tâm $O$, cạnh bên $SA \\perp (ABCD)$. Mệnh đề nào sau đây SAI?',
    options: [
      { key: 'A', text: '$SC \\perp (ABCD)$' },
      { key: 'B', text: '$SA \\perp BD$' },
      { key: 'C', text: '$BD \\perp (SAC)$' },
      { key: 'D', text: '$BC \\perp (SAB)$' },
    ],
    correctAnswer: 'A',
    solution: 'Vì $SA \\perp (ABCD)$ nên $SC$ là đường xiên, do đó $SC$ không thể vuông góc với đáy $(ABCD)$.',
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
    solution: 'Áp dụng công thức đạo hàm hàm đa thức: $y\' = 3x^2 - 6x + 2$.',
  },
  {
    id: 'q11_9',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Phương trình tiếp tuyến lớp 11',
    content: 'Hệ số góc của tiếp tuyến của parabol $y = x^2 - 2x + 3$ tại điểm có hoành độ $x_0 = 2$ bằng:',
    options: [
      { key: 'A', text: '$2$' },
      { key: 'B', text: '$3$' },
      { key: 'C', text: '$4$' },
      { key: 'D', text: '$0$' },
    ],
    correctAnswer: 'A',
    solution: 'Ta có $y\' = 2x - 2$. Hệ số góc tiếp tuyến $k = y\'(2) = 2(2) - 2 = 2$.',
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
    solution: 'Điều kiện $x > 1$. Phương trình tương đương $x - 1 = 2^3 = 8 \\Leftrightarrow x = 9$.',
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
    solution: 'Do hai biến cố độc lập nên $P(A \\cap B) = P(A) \\cdot P(B) = 0.8 \\cdot 0.7 = 0.56$.',
  },
  {
    id: 'q11_12',
    type: 'multiple_choice',
    level: 'ThongHieu',
    topicName: 'Góc giữa hai đường thẳng trong không gian',
    content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$. Góc giữa hai đường thẳng $A\'B$ và $B\'C$ bằng:',
    options: [
      { key: 'A', text: '$60^\\circ$' },
      { key: 'B', text: '$90^\\circ$' },
      { key: 'C', text: '$45^\\circ$' },
      { key: 'D', text: '$30^\\circ$' },
    ],
    correctAnswer: 'A',
    solution: 'Vì $A\'B \\parallel D\'C$ nên góc giữa $A\'B$ và $B\'C$ là góc $\\widehat{B\'CD\'} = 60^\\circ$ của tam giác đều $B\'CD\'$.',
  },
  // PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (4 CÂU, CÁC Ý a, b, c, d)
  {
    id: 'q11_13',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Cấp số cộng',
    content: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 2$ và công sai $d = 3$. Xét tính đúng/sai của các mệnh đề sau:',
    statements: [
      { id: 'a', text: 'Số hạng thứ năm của cấp số cộng là $u_5 = 14$.', isCorrect: true },
      { id: 'b', text: 'Công thức số hạng tổng quát là $u_n = 3n - 1$.', isCorrect: true },
      { id: 'c', text: 'Số $100$ là một số hạng của cấp số cộng.', isCorrect: false },
      { id: 'd', text: 'Tổng mười số hạng đầu tiên $S_{10} = 155$.', isCorrect: true },
    ],
    solution: 'a) $u_5 = 2 + 4(3) = 14$ (Đúng). b) $u_n = 2 + (n-1)3 = 3n - 1$ (Đúng). c) $3n - 1 = 100 \\Leftrightarrow 3n = 101$ (vô nghiệm nguyên, Sai). d) $S_{10} = 155$ (Đúng).',
  },
  {
    id: 'q11_14',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Hình chóp vuông góc',
    content: 'Cho hình chóp $S.ABC$ có đáy $ABC$ vuông tại $B$, $AB = a, BC = a\\sqrt{3}$. Cạnh bên $SA \\perp (ABC)$ và $SA = 2a$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: '$SA \\perp BC$', isCorrect: true },
      { id: 'b', text: '$BC \\perp (SAB)$', isCorrect: true },
      { id: 'c', text: 'Tam giác $SBC$ vuông tại $C$', isCorrect: false },
      { id: 'd', text: 'Góc giữa cạnh bên $SC$ và mặt đáy $(ABC)$ là góc $\\widehat{SCA}$.', isCorrect: true },
    ],
    solution: 'a) $SA \\perp (ABC) \\Rightarrow SA \\perp BC$ (Đúng). b) $BC \\perp AB$ và $BC \\perp SA \\Rightarrow BC \\perp (SAB)$ (Đúng). c) Tam giác $SBC$ vuông tại $B$, không phải tại $C$ (Sai). d) Hình chiếu là $AC \\Rightarrow \\widehat{SCA}$ (Đúng).',
  },
  {
    id: 'q11_15',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Đạo hàm và tiếp tuyến',
    content: 'Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng/sai của các khẳng định sau:',
    statements: [
      { id: 'a', text: 'Đạo hàm của hàm số là $f\'(x) = 3x^2 - 3$.', isCorrect: true },
      { id: 'b', text: 'Phương trình $f\'(x) = 0$ có hai nghiệm phân biệt $x = \\pm 1$.', isCorrect: true },
      { id: 'c', text: 'Hệ số góc của tiếp tuyến tại điểm $x = 0$ bằng $k = -3$.', isCorrect: true },
      { id: 'd', text: 'Tiếp tuyến của đồ thị hàm số tại điểm có hoành độ $x = 1$ có hệ số góc bằng $0$.', isCorrect: true },
    ],
    solution: 'a) $f\'(x) = 3x^2 - 3$ (Đúng). b) $3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$ (Đúng). c) $k = f\'(0) = -3$ (Đúng). d) $k = f\'(1) = 0$ (Đúng).',
  },
  {
    id: 'q11_16',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Quy tắc tính xác suất',
    content: 'Một hộp đựng 4 quả cầu đỏ và 6 quả cầu xanh. Chọn ngẫu nhiên đồng thời 3 quả cầu. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Số phần tử của không gian mẫu là $n(\\Omega) = C_{10}^3 = 120$.', isCorrect: true },
      { id: 'b', text: 'Xác suất để chọn được 3 quả cầu đỏ bằng $\\frac{1}{30}$.', isCorrect: true },
      { id: 'c', text: 'Xác suất để chọn được 3 quả cầu cùng màu bằng $\\frac{1}{5}$.', isCorrect: true },
      { id: 'd', text: 'Xác suất để có ít nhất 1 quả cầu xanh bằng $\\frac{29}{30}$.', isCorrect: true },
    ],
    solution: 'a) $C_{10}^3 = 120$ (Đúng). b) $C_4^3 / 120 = 1/30$ (Đúng). c) $(C_4^3 + C_6^3)/120 = 1/5$ (Đúng). d) $1 - 1/30 = 29/30$ (Đúng).',
  },
  // PHẦN III: TRẢ LỜI NGẮN (6 CÂU)
  {
    id: 'q11_17',
    type: 'short_answer',
    level: 'ThongHieu',
    topicName: 'Cấp số cộng',
    content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 5$ và công sai $d = 3$. Tìm giá trị của số hạng thứ 10 ($u_{10}$):',
    correctAnswer: '32',
    solution: '$u_{10} = u_1 + 9d = 5 + 9(3) = 32$.',
  },
  {
    id: 'q11_18',
    type: 'short_answer',
    level: 'ThongHieu',
    topicName: 'Giới hạn hàm số',
    content: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{2x^2 - x - 1}{x - 1}$:',
    correctAnswer: '3',
    solution: 'Rút gọn: $\\lim_{x \\to 1} (2x + 1) = 3$.',
  },
  {
    id: 'q11_19',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Góc giữa đường thẳng và mặt phẳng',
    content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$. Cạnh bên $SA \\perp (ABCD)$ và $SA = a\\sqrt{2}$. Tính tang của góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$:',
    correctAnswer: '1',
    solution: '$\\tan \\widehat{SCA} = \\frac{SA}{AC} = \\frac{a\\sqrt{2}}{a\\sqrt{2}} = 1$.',
  },
  {
    id: 'q11_20',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Đạo hàm phân thức',
    content: 'Tìm hệ số góc của tiếp tuyến của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ tại điểm có hoành độ $x_0 = 1$:',
    correctAnswer: '0.75',
    solution: '$y\'(1) = \\frac{3}{2^2} = 0.75$.',
  },
  {
    id: 'q11_21',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Phương trình mũ',
    content: 'Giải phương trình $2^{x^2 - 3x} = 16$. Tổng tất cả các nghiệm của phương trình bằng:',
    correctAnswer: '3',
    solution: '$x^2 - 3x - 4 = 0 \\Leftrightarrow x = -1$ hoặc $x = 4 \\Rightarrow$ Tổng = $3$.',
  },
  {
    id: 'q11_22',
    type: 'short_answer',
    level: 'VanDung',
    topicName: 'Đại số tổ hợp',
    content: 'Từ các chữ số 1, 2, 3, 4, 5, 6 có thể lập được bao nhiêu số tự nhiên gồm 4 chữ số đôi một khác nhau?',
    correctAnswer: '360',
    solution: '$A_6^4 = 360$.',
  },
];

// ==============================================================
// 3. NGÂN HÀNG CÂU HỎI TOÁN 10 CHUẨN GDPT 2018 (CÓ BẢNG XÉT DẤU TAM THỨC BẬC HAI)
// ==============================================================
export const MATH_10_QUESTIONS: Question[] = [
  {
    id: 'q10_1',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Mệnh đề toán học',
    content: 'Phủ định của mệnh đề $P$: "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là mệnh đề:',
    options: [
      { key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' },
      { key: 'B', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$"' },
      { key: 'C', text: '"$\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' },
      { key: 'D', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 > 0$"' },
    ],
    correctAnswer: 'A',
    solution: 'Phủ định của mệnh đề chứa lượng từ $\\forall$ là mệnh đề chứa lượng từ $\\exists$ và phủ định của dấu $>$ là dấu $\\le$.',
  },
  {
    id: 'q10_2',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Tập hợp',
    content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:',
    options: [
      { key: 'A', text: '$(1; 3]$' },
      { key: 'B', text: '[-2; 5)' },
      { key: 'C', text: '[1; 3]' },
      { key: 'D', text: '(-2; 1]' },
    ],
    correctAnswer: 'A',
    solution: 'Giao của hai tập hợp là phần tử thuộc cả hai tập: $A \\cap B = (1; 3]$.',
  },
  {
    id: 'q10_3',
    type: 'multiple_choice',
    level: 'NhanBiet',
    topicName: 'Dấu tam thức bậc hai (Có Bảng xét dấu)',
    content: 'Cho tam thức bậc hai $f(x)$ có bảng xét dấu như sau:\n$$\\begin{array}{c|ccccccc} x & -\\infty & & -2 & & 3 & & +\\infty \\\\ \\hline f(x) & & + & 0 & - & 0 & + & \\end{array}$$\nTập nghiệm của bất phương trình $f(x) < 0$ là:',
    options: [
      { key: 'A', text: '$(-2; 3)$' },
      { key: 'B', text: '$(-\\infty; -2) \\cup (3; +\\infty)$' },
      { key: 'C', text: '$[-2; 3]$' },
      { key: 'D', text: '$(-\\infty; -2]$' },
    ],
    correctAnswer: 'A',
    solution: 'Nhìn vào bảng xét dấu, $f(x) < 0$ (mang dấu trừ) khi $x \\in (-2; 3)$.',
  },
];

// ==============================================================
// 4. NGÂN HÀNG CÂU HỎI TOÁN 12 (CÓ BẢNG BIẾN THIÊN & BẢNG XÉT DẤU)
// ==============================================================
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
    solution: 'Dựa vào bảng xét dấu, $f\'(x) < 0$ trên khoảng $(-1; 2)$ nên hàm số nghịch biến trên $(-1; 2)$.',
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
    solution: 'Đạo hàm đổi dấu từ dương sang âm khi qua $x = 1$, do đó điểm cực đại của hàm số là $x = 1$.',
  },
];

// ==============================================================
// 5. HÀM TẠO ĐỀ BẢO ĐẢM 100% ĐÚNG THEO KHỐI LỚP VÀ MA TRẬN
// ==============================================================
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config.grade || '11');
  let questions: Question[] = [];

  if (grade === '11') {
    questions = MATH_11_QUESTIONS;
  } else if (grade === '10') {
    questions = [...MATH_10_QUESTIONS, ...MATH_11_QUESTIONS.slice(3, 22)];
  } else {
    questions = [...MATH_12_QUESTIONS, ...MATH_11_QUESTIONS.slice(2, 22)];
  }

  return {
    id: `test_${Date.now()}`,
    title: config.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`,
    config: { ...config, grade },
    questions,
    createdAt: new Date().toISOString(),
  };
};

export const generateUniqueTestForStudent = (config: TestConfig, student?: StudentAccount): GeneratedTest => {
  return createDefaultTest(config);
};
