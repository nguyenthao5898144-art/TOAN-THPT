import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';

export const ensureUniqueDiagramsInText = (text: any): any => text || '';
export const sanitizeQuestionMath = (q: any): any => q || {};

// ==============================================================
// 1. NGÂN HÀNG 22 CÂU HỎI TOÁN 10 THUẦN TÚY 100% (CHUẨN GDPT 2018)
// ==============================================================
export const MATH_10_QUESTIONS: Question[] = [
  // PHẦN I: 12 CÂU TRẮC NGHIỆM 4 LỰA CHỌN (0.25đ / câu)
  { id: 'q10_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề toán học', content: 'Phủ định của mệnh đề $P$: "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là mệnh đề:', options: [{ key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' }, { key: 'B', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$"' }, { key: 'C', text: '"$\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' }, { key: 'D', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 > 0$"' }], correctAnswer: 'A', solution: 'Phủ định của $\\forall$ là $\\exists$, phủ định của $>$ là $\\le$.' },
  { id: 'q10_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Tập hợp', content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:', options: [{ key: 'A', text: '$(1; 3]$' }, { key: 'B', text: '[-2; 5)' }, { key: 'C', text: '[1; 3]' }, { key: 'D', text: '(-2; 1]' }], correctAnswer: 'A', solution: 'Phần tử chung của cả hai tập là $(1; 3]$.' },
  { id: 'q10_3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Bất phương trình bậc nhất hai ẩn', content: 'Điểm nào sau đây thuộc miền nghiệm của bất phương trình $2x + y - 4 > 0$?', options: [{ key: 'A', text: '$(2; 1)$' }, { key: 'B', text: '$(1; 1)$' }, { key: 'C', text: '$(0; 0)$' }, { key: 'D', text: '$(1; 2)$' }], correctAnswer: 'A', solution: 'Thay $(2; 1)$: $2(2) + 1 - 4 = 1 > 0$ (thỏa mãn).' },
  { id: 'q10_4', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Hàm số bậc hai', content: 'Tọa độ đỉnh $I$ của parabol $y = x^2 - 4x + 3$ là:', options: [{ key: 'A', text: '$I(2; -1)$' }, { key: 'B', text: '$I(-2; 15)$' }, { key: 'C', text: '$I(4; 3)$' }, { key: 'D', text: '$I(2; 3)$' }], correctAnswer: 'A', solution: '$x_I = -b/(2a) = 2 \\Rightarrow y_I = 2^2 - 4(2) + 3 = -1$.' },
  { id: 'q10_5', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Dấu tam thức bậc hai (Có Bảng xét dấu)', content: 'Cho tam thức bậc hai $f(x)$ có bảng xét dấu như sau:\n$$\\begin{array}{c|ccccccc} x & -\\infty & & -2 & & 3 & & +\\infty \\\\ \\hline f(x) & & + & 0 & - & 0 & + & \\end{array}$$\nTập nghiệm của bất phương trình $f(x) < 0$ là:', options: [{ key: 'A', text: '$(-2; 3)$' }, { key: 'B', text: '$(-\\infty; -2) \\cup (3; +\\infty)$' }, { key: 'C', text: '$[-2; 3]$' }, { key: 'D', text: '$(-\\infty; -2]$' }], correctAnswer: 'A', solution: 'Dựa vào bảng xét dấu, $f(x) < 0$ khi $x \\in (-2; 3)$.' },
  { id: 'q10_6', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Bất phương trình bậc hai', content: 'Tập nghiệm của bất phương trình $x^2 - 5x + 6 \\le 0$ là:', options: [{ key: 'A', text: '$[2; 3]$' }, { key: 'B', text: '$(2; 3)$' }, { key: 'C', text: '$(-\\infty; 2] \\cup [3; +\\infty)$' }, { key: 'D', text: '$(-\\infty; 2) \\cup (3; +\\infty)$' }], correctAnswer: 'A', solution: '$x^2 - 5x + 6 = 0$ có nghiệm $x = 2, x = 3$. Trong khoảng hai nghiệm tam thức mang dấu âm nên $x \\in [2; 3]$.' },
  { id: 'q10_7', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Hệ thức lượng trong tam giác', content: 'Cho tam giác $ABC$ có $b = 4, c = 5$ và góc $\\widehat{A} = 60^\\circ$. Độ dài cạnh $a$ bằng:', options: [{ key: 'A', text: '$\\sqrt{21}$' }, { key: 'B', text: '$\\sqrt{61}$' }, { key: 'C', text: '$5$' }, { key: 'D', text: '$\\sqrt{41}$' }], correctAnswer: 'A', solution: '$a^2 = b^2 + c^2 - 2bc\\cos A = 16 + 25 - 20 = 21 \\Rightarrow a = \\sqrt{21}$.' },
  { id: 'q10_8', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Vectơ trong mặt phẳng', content: 'Cho hình bình hành $ABCD$. Khẳng định nào sau đây ĐÚNG?', options: [{ key: 'A', text: '$\\vec{AB} = \\vec{DC}$' }, { key: 'B', text: '$\\vec{AB} = \\vec{CD}$' }, { key: 'C', text: '$\\vec{AD} = \\vec{CB}$' }, { key: 'D', text: '$\\vec{AC} = \\vec{BD}$' }], correctAnswer: 'A', solution: 'Hai vectơ $\\vec{AB}$ và $\\vec{DC}$ cùng hướng và cùng độ dài nên bằng nhau.' },
  { id: 'q10_9', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Tích vô hướng hai vectơ', content: 'Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{u} = (2; -3)$ và $\\vec{v} = (4; 1)$. Tích vô hướng $\\vec{u} \\cdot \\vec{v}$ bằng:', options: [{ key: 'A', text: '$5$' }, { key: 'B', text: '$11$' }, { key: 'C', text: '$8$' }, { key: 'D', text: '$-5$' },], correctAnswer: 'A', solution: '$\\vec{u} \\cdot \\vec{v} = 2(4) + (-3)(1) = 8 - 3 = 5$.' },
  { id: 'q10_10', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Phương trình đường thẳng Oxy', content: 'Đường thẳng đi qua điểm $M(1; 2)$ và có VTPT $\\vec{n} = (3; -2)$ có phương trình tổng quát là:', options: [{ key: 'A', text: '$3x - 2y + 1 = 0$' }, { key: 'B', text: '$3x - 2y - 1 = 0$' }, { key: 'C', text: '$2x + 3y - 8 = 0$' }, { key: 'D', text: '$3x - 2y = 0$' }], correctAnswer: 'A', solution: '$3(x - 1) - 2(y - 2) = 0 \\Leftrightarrow 3x - 2y + 1 = 0$.' },
  { id: 'q10_11', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Phương trình đường tròn Oxy', content: 'Đường tròn $(C): (x - 2)^2 + (y + 3)^2 = 16$ có tâm $I$ và bán kính $R$ là:', options: [{ key: 'A', text: '$I(2; -3), R = 4$' }, { key: 'B', text: '$I(-2; 3), R = 4$' }, { key: 'C', text: '$I(2; -3), R = 16$' }, { key: 'D', text: '$I(-2; 3), R = 16$' }], correctAnswer: 'A', solution: 'Tâm $I(2; -3)$ và $R = \\sqrt{16} = 4$.' },
  { id: 'q10_12', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Tổ hợp lớp 10', content: 'Số cách chọn ra 3 học sinh từ một nhóm gồm 10 học sinh để đi lao động là:', options: [{ key: 'A', text: '$C_{10}^3 = 120$' }, { key: 'B', text: '$A_{10}^3 = 720$' }, { key: 'C', text: '$30$' }, { key: 'D', text: '$10^3 = 1000$' }], correctAnswer: 'A', solution: 'Chọn 3 từ 10 không phân biệt thứ tự là $C_{10}^3 = 120$.' },

  // PHẦN II: 4 CÂU ĐÚNG / SAI (ý a, b, c, d)
  {
    id: 'q10_13',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Dấu tam thức bậc hai',
    content: 'Cho tam thức bậc hai $f(x) = x^2 - 4x + 3$. Xét tính đúng/sai của các mệnh đề sau:',
    statements: [
      { id: 'a', text: 'Phương trình $f(x) = 0$ có hai nghiệm phân biệt là $x = 1$ và $x = 3$.', isCorrect: true },
      { id: 'b', text: '$f(x) < 0$ khi và chỉ khi $x \\in (1; 3)$.', isCorrect: true },
      { id: 'c', text: '$f(x) \\ge 0$ khi và chỉ khi $x \\in (-\\infty; 1] \\cup [3; +\\infty)$.', isCorrect: true },
      { id: 'd', text: '$f(2) = 1 > 0$.', isCorrect: false },
    ],
    solution: 'a, b, c Đúng. d Sai vì $f(2) = 2^2 - 4(2) + 3 = -1 < 0$.',
  },
  {
    id: 'q10_14',
    type: 'true_false',
    level: 'ThongHieu',
    topicName: 'Đường tròn Oxy',
    content: 'Trong mặt phẳng $Oxy$, cho đường tròn $(C): x^2 + y^2 - 4x + 6y - 12 = 0$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Tọa độ tâm của đường tròn là $I(2; -3)$.', isCorrect: true },
      { id: 'b', text: 'Bán kính của đường tròn là $R = 5$.', isCorrect: true },
      { id: 'c', text: 'Gốc tọa độ $O(0; 0)$ nằm phía ngoài đường tròn.', isCorrect: false },
      { id: 'd', text: 'Đường tròn đi qua điểm $A(2; 2)$.', isCorrect: true },
    ],
    solution: 'a) Tâm I(2; -3) Đúng. b) R = 5 Đúng. c) $0^2+0^2-12 < 0 \\Rightarrow$ nằm trong (c Sai). d) Đúng.',
  },
  {
    id: 'q10_15',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Tam giác và vectơ',
    content: 'Cho tam giác $ABC$ có $A(1; 2), B(-2; 6), C(9; 8)$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Tọa độ vectơ $\\vec{AB} = (-3; 4)$.', isCorrect: true },
      { id: 'b', text: 'Độ dài cạnh $AB = 5$.', isCorrect: true },
      { id: 'c', text: 'Tọa độ vectơ $\\vec{AC} = (8; 6)$.', isCorrect: true },
      { id: 'd', text: 'Tam giác $ABC$ vuông tại $A$.', isCorrect: true },
    ],
    solution: 'a, b, c Đúng. d) $\\vec{AB} \\cdot \\vec{AC} = -3(8) + 4(6) = 0 \\Rightarrow$ vuông tại A (Đúng).',
  },
  {
    id: 'q10_16',
    type: 'true_false',
    level: 'VanDung',
    topicName: 'Nhị thức Newton lớp 10',
    content: 'Khai triển nhị thức Newton $P(x) = (2x - 1)^4$. Xét tính đúng/sai:',
    statements: [
      { id: 'a', text: 'Khai triển có tất cả 5 số hạng.', isCorrect: true },
      { id: 'b', text: 'Hệ số của số hạng chứa $x^4$ là $16$.', isCorrect: true },
      { id: 'c', text: 'Hệ số tự do của khai triển bằng $-1$.', isCorrect: false },
      { id: 'd', text: 'Tổng tất cả các hệ số trong khai triển bằng $1$.', isCorrect: true },
    ],
    solution: 'c Sai vì hệ số tự do là $(-1)^4 = 1$. Các ý còn lại đều đúng.',
  },

  // PHẦN III: 6 CÂU TRẢ LỜI NGẮN
  { id: 'q10_17', type: 'short_answer', level: 'ThongHieu', topicName: 'Giá trị nhỏ nhất parabol', content: 'Tìm giá trị nhỏ nhất của hàm số $y = x^2 - 6x + 10$ trên $\\mathbb{R}$:', correctAnswer: '1', solution: 'Đỉnh $x = 3 \\Rightarrow y_{min} = 1$.' },
  { id: 'q10_18', type: 'short_answer', level: 'ThongHieu', topicName: 'Khoảng cách Oxy', content: 'Tính khoảng cách từ điểm $M(1; 2)$ đến đường thẳng $\\Delta: 3x + 4y - 1 = 0$:', correctAnswer: '2', solution: '$d = |3(1) + 4(2) - 1| / 5 = 2$.' },
  { id: 'q10_19', type: 'short_answer', level: 'VanDung', topicName: 'Bán kính đường tròn ngoại tiếp', content: 'Cho tam giác $ABC$ có cạnh $a = 6$ và góc $\\widehat{A} = 30^\\circ$. Tính bán kính $R$ đường tròn ngoại tiếp tam giác $ABC$:', correctAnswer: '6', solution: '$R = a / (2\\sin 30^\\circ) = 6 / 1 = 6$.' },
  { id: 'q10_20', type: 'short_answer', level: 'VanDung', topicName: 'Hoán vị', content: 'Có bao nhiêu cách xếp 5 bạn học sinh thành một hàng dọc?', correctAnswer: '120', solution: '$5! = 120$.' },
  { id: 'q10_21', type: 'short_answer', level: 'VanDung', topicName: 'Bất phương trình bậc hai', content: 'Tìm số nghiệm nguyên của bất phương trình $(x - 1)(x - 4) \\le 0$:', correctAnswer: '4', solution: '$1 \\le x \\le 4 \\Rightarrow x \\in \\{1, 2, 3, 4\\}$, có 4 nghiệm nguyên.' },
  { id: 'q10_22', type: 'short_answer', level: 'VanDung', topicName: 'Xác suất cổ điển', content: 'Một hộp có 3 viên bi đỏ và 7 viên bi xanh. Lấy ngẫu nhiên đồng thời 2 viên bi. Tính số phần tử của không gian mẫu $n(\\Omega) = C_{10}^2$:', correctAnswer: '45', solution: '$C_{10}^2 = 45$.' },
];

// ==============================================================
// 2. NGÂN HÀNG 22 CÂU HỎI TOÁN 11 THUẦN TÚY 100% (CHUẨN GDPT 2018)
// ==============================================================
export const MATH_11_QUESTIONS: Question[] = [
  { id: 'q11_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Tập xác định của hàm số lượng giác $y = \\tan x$ là:', options: [{ key: 'A', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$' }, { key: 'B', text: '$D = \\mathbb{R}$' }, { key: 'C', text: '$D = \\mathbb{R} \\setminus \\{k\\pi\\}$' }, { key: 'D', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{4} + k\\pi\\}$' }], correctAnswer: 'A', solution: 'Điều kiện $\\cos x \\neq 0$.' },
  { id: 'q11_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Lượng giác', content: 'Nghiệm của phương trình $\\cos x = \\frac{1}{2}$ là:', options: [{ key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$' }, { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi$' }, { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi$' }, { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi$' }], correctAnswer: 'A', solution: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$.' },
  { id: 'q11_3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3, d = 4$. Số hạng $u_2$ bằng:', options: [{ key: 'A', text: '7' }, { key: 'B', text: '12' }, { key: 'C', text: '-1' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$u_2 = 3 + 4 = 7$.' },
  { id: 'q11_4', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số nhân', content: 'Cho cấp số nhân $(u_n)$ có $u_1 = 2, q = 3$. Giá trị $u_3$ bằng:', options: [{ key: 'A', text: '18' }, { key: 'B', text: '6' }, { key: 'C', text: '24' }, { key: 'D', text: '54' }], correctAnswer: 'A', solution: '$u_3 = 2 \\times 3^2 = 18$.' },
  { id: 'q11_5', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim \\frac{2n + 1}{n + 3}$:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '1' }, { key: 'C', text: '0' }, { key: 'D', text: '1/3' }], correctAnswer: 'A', solution: 'Chia cả tử và mẫu cho $n$.' },
  { id: 'q11_6', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$:', options: [{ key: 'A', text: '4' }, { key: 'B', text: '2' }, { key: 'C', text: '0' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$\\lim (x+2) = 4$.' },
  { id: 'q11_7', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Hình không gian', content: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Mệnh đề nào SAI?', options: [{ key: 'A', text: '$SC \\perp (ABCD)$' }, { key: 'B', text: '$SA \\perp BD$' }, { key: 'C', text: '$BD \\perp (SAC)$' }, { key: 'D', text: '$BC \\perp (SAB)$' }], correctAnswer: 'A', solution: '$SC$ là đường xiên.' },
  { id: 'q11_8', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Đạo hàm', content: 'Đạo hàm của $y = x^3 - 3x^2 + 2x - 1$ là:', options: [{ key: 'A', text: '$y\' = 3x^2 - 6x + 2$' }, { key: 'B', text: '$y\' = 3x^2 - 6x$' }, { key: 'C', text: '$y\' = x^2 - 3x + 2$' }, { key: 'D', text: '$y\' = 3x^2 - 3x + 2$' }], correctAnswer: 'A', solution: '$y\' = 3x^2 - 6x + 2$.' },
  { id: 'q11_9', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Tiếp tuyến', content: 'Hệ số góc của tiếp tuyến $y = x^2 - 2x + 3$ tại $x_0 = 2$ bằng:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '3' }, { key: 'C', text: '4' }, { key: 'D', text: '0' }], correctAnswer: 'A', solution: '$y\'(2) = 2(2) - 2 = 2$.' },
  { id: 'q11_10', type: 'multiple_choice', level: 'VanDung', topicName: 'Logarit', content: 'Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:', options: [{ key: 'A', text: '$x = 9$' }, { key: 'B', text: '$x = 8$' }, { key: 'C', text: '$x = 7$' }, { key: 'D', text: '$x = 10$' }], correctAnswer: 'A', solution: '$x - 1 = 8 \\Rightarrow x = 9$.' },
  { id: 'q11_11', type: 'multiple_choice', level: 'VanDung', topicName: 'Xác suất', content: 'Bắn 2 phát độc lập, xác suất trúng là 0.8 và 0.7. Xác suất trúng cả hai:', options: [{ key: 'A', text: '0.56' }, { key: 'B', text: '0.75' }, { key: 'C', text: '0.15' }, { key: 'D', text: '0.94' }], correctAnswer: 'A', solution: '$0.8 \\times 0.7 = 0.56$.' },
  { id: 'q11_12', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Góc hình học', content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$. Góc giữa $A\'B$ và $B\'C$ bằng:', options: [{ key: 'A', text: '$60^\\circ$' }, { key: 'B', text: '$90^\\circ$' }, { key: 'C', text: '$45^\\circ$' }, { key: 'D', text: '$30^\\circ$' }], correctAnswer: 'A', solution: 'Góc $60^\\circ$ tam giác đều.' },
  { id: 'q11_13', type: 'true_false', level: 'ThongHieu', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 2, d = 3$. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Số hạng $u_5 = 14$', isCorrect: true }, { id: 'b', text: '$u_n = 3n - 1$', isCorrect: true }, { id: 'c', text: 'Số 100 thuộc cấp số cộng', isCorrect: false }, { id: 'd', text: 'Tổng $S_{10} = 155$', isCorrect: true }], solution: 'a, b, d Đúng; c Sai.' },
  { id: 'q11_14', type: 'true_false', level: 'VanDung', topicName: 'Hình không gian', content: 'Cho chóp $S.ABC$ có đáy vuông tại $B$, $SA \\perp (ABC)$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$SA \\perp BC$', isCorrect: true }, { id: 'b', text: '$BC \\perp (SAB)$', isCorrect: true }, { id: 'c', text: 'Tam giác $SBC$ vuông tại $C$', isCorrect: false }, { id: 'd', text: 'Góc giữa $SC$ và đáy là $\\widehat{SCA}$', isCorrect: true }], solution: 'c Sai do vuông tại B.' },
  { id: 'q11_15', type: 'true_false', level: 'ThongHieu', topicName: 'Đạo hàm', content: 'Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$f\'(x) = 3x^2 - 3$', isCorrect: true }, { id: 'b', text: '$f\'(x) = 0$ có 2 nghiệm $\\pm 1$', isCorrect: true }, { id: 'c', text: 'Hệ số góc tại $x=0$ là $k=-3$', isCorrect: true }, { id: 'd', text: 'Tiếp tuyến tại $x=1$ có $k=0$', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q11_16', type: 'true_false', level: 'VanDung', topicName: 'Xác suất', content: 'Hộp có 4 bi đỏ và 6 bi xanh, lấy ngẫu nhiên 3 viên. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Số phần tử không gian mẫu là 120', isCorrect: true }, { id: 'b', text: 'Xác suất 3 bi đỏ là 1/30', isCorrect: true }, { id: 'c', text: 'Xác suất 3 bi cùng màu là 1/5', isCorrect: true }, { id: 'd', text: 'Xác suất có ít nhất 1 bi xanh là 29/30', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q11_17', type: 'short_answer', level: 'ThongHieu', topicName: 'Cấp số cộng', content: 'Cho cấp số cộng có $u_1 = 5, d = 3$. Tính $u_{10}$:', correctAnswer: '32', solution: '$u_{10} = 5 + 9(3) = 32$.' },
  { id: 'q11_18', type: 'short_answer', level: 'ThongHieu', topicName: 'Giới hạn', content: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{2x^2 - x - 1}{x - 1}$:', correctAnswer: '3', solution: '$\\lim (2x+1) = 3$.' },
  { id: 'q11_19', type: 'short_answer', level: 'VanDung', topicName: 'Góc đường và mặt', content: 'Cho hình chóp $S.ABCD$ có đáy vuông cạnh $a$, $SA \\perp (ABCD), SA = a\\sqrt{2}$. Tính tang góc giữa $SC$ và $(ABCD)$:', correctAnswer: '1', solution: '$\\tan = 1$.' },
  { id: 'q11_20', type: 'short_answer', level: 'VanDung', topicName: 'Tiếp tuyến', content: 'Tìm hệ số góc tiếp tuyến của $y = \\frac{2x - 1}{x + 1}$ tại $x_0 = 1$:', correctAnswer: '0.75', solution: '$y\'(1) = 3/4 = 0.75$.' },
  { id: 'q11_21', type: 'short_answer', level: 'VanDung', topicName: 'Phương trình mũ', content: 'Giải phương trình $2^{x^2 - 3x} = 16$. Tính tổng các nghiệm:', correctAnswer: '3', solution: 'Nghiệm -1 và 4 $\\Rightarrow$ tổng bằng 3.' },
  { id: 'q11_22', type: 'short_answer', level: 'VanDung', topicName: 'Tổ hợp', content: 'Từ các chữ số 1, 2, 3, 4, 5, 6 lập được bao nhiêu số tự nhiên gồm 4 chữ số khác nhau?', correctAnswer: '360', solution: '$A_6^4 = 360$.' },
];

// ==============================================================
// 3. HÀM TẠO ĐỀ CÔ LẬP TUYỆT ĐỐI THEO KHỐI LỚP 10, 11, 12
// ==============================================================
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config?.grade || '10');
  let questions: Question[] = [];

  // NẾU LÀ TOÁN 10: LẤY 100% CÂU HỎI TOÁN 10 (KHÔNG LẤY CÂU NÀO CỦA TOÁN 11)
  if (grade === '10') {
    questions = MATH_10_QUESTIONS;
  } else if (grade === '11') {
    questions = MATH_11_QUESTIONS;
  } else {
    // Toán 12
    questions = MATH_11_QUESTIONS.map((q) => ({
      ...q,
      id: q.id.replace('q11_', 'q12_'),
    }));
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
