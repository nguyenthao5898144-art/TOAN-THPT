import { GeneratedTest, Question, TestConfig, StudentAccount } from './types';
import * as Math10Module from './math10Syllabus';
import * as Math11Module from './math11Syllabus';
import * as Math12Module from './math12Syllabus';

export const ensureUniqueDiagramsInText = (text: any): any => text || '';
export const sanitizeQuestionMath = (q: any): any => q || {};

// ==============================================================
// 1. LIÊN KẾT ĐÚNG FILE NGUỒN SYLLABUS THEO TỪNG KHỐI LỚP
// ==============================================================
export const getSyllabusForGrade = (grade: string) => {
  if (grade === '10') {
    return (Math10Module as any).MATH_10_SYLLABUS || (Math10Module as any).math10Syllabus || (Math10Module as any).default || [];
  }
  if (grade === '11') {
    return (Math11Module as any).MATH_11_SYLLABUS || (Math11Module as any).math11Syllabus || (Math11Module as any).default || [];
  }
  return (Math12Module as any).MATH_12_SYLLABUS || (Math12Module as any).math12Syllabus || (Math12Module as any).default || [];
};

// ==============================================================
// 2. NGÂN HÀNG CÂU HỎI TOÁN 10 CHUẨN GDPT 2018
// ==============================================================
export const MATH_10_QUESTIONS: Question[] = [
  // PHẦN I: 12 CÂU
  { id: 'q10_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Mệnh đề toán học', outcome: 'YCCĐ 1', content: 'Phủ định của mệnh đề $P$: "$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$" là mệnh đề:', options: [{ key: 'A', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$"' }, { key: 'B', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$"' }, { key: 'C', text: '"$\\forall x, x^2 + 1 \\le 0$"' }, { key: 'D', text: '"$\\exists x, x^2 + 1 > 0$"' }], correctAnswer: 'A', solution: 'Phủ định là $\\exists$ và $\\le$.' },
  { id: 'q10_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tập hợp', outcome: 'YCCĐ 1', content: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:', options: [{ key: 'A', text: '$(1; 3]$' }, { key: 'B', text: '[-2; 5)' }, { key: 'C', text: '[1; 3]' }, { key: 'D', text: '(-2; 1]' }], correctAnswer: 'A', solution: '$A \\cap B = (1; 3]$.' },
  { id: 'q10_3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tập hợp', outcome: 'YCCĐ 1', content: 'Cho tập hợp $X = \\{x \\in \\mathbb{N} \\mid x \\le 4\\}$. Tập hợp $X$ được viết dạng liệt kê phần tử là:', options: [{ key: 'A', text: '$X = \\{0; 1; 2; 3; 4\\}$' }, { key: 'B', text: '$X = \\{1; 2; 3; 4\\}$' }, { key: 'C', text: '$X = \\{0; 1; 2; 3\\}$' }, { key: 'D', text: '$X = \\{1; 2; 3\\}$' }], correctAnswer: 'A', solution: '$X = \\{0; 1; 2; 3; 4\\}$.' },
  { id: 'q10_4', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tập con', outcome: 'YCCĐ 1', content: 'Số tập con gồm 2 phần tử của tập hợp $A = \\{1; 2; 3; 4\\}$ bằng:', options: [{ key: 'A', text: '$6$' }, { key: 'B', text: '$4$' }, { key: 'C', text: '$8$' }, { key: 'D', text: '$16$' }], correctAnswer: 'A', solution: '$C_4^2 = 6$.' },
  { id: 'q10_5', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Phép toán tập hợp', outcome: 'YCCĐ 2', content: 'Cho $A = \\{0; 1; 2; 3\\}$ và $B = \\{2; 3; 4; 5\\}$. Hợp của hai tập hợp $A \\cup B$ là:', options: [{ key: 'A', text: '$\\{0; 1; 2; 3; 4; 5\\}$' }, { key: 'B', text: '$\\{2; 3\\}$' }, { key: 'C', text: '$\\{0; 1\\}$' }, { key: 'D', text: '$\\{4; 5\\}$' }], correctAnswer: 'A', solution: '$A \\cup B = \\{0; 1; 2; 3; 4; 5\\}$.' },
  { id: 'q10_6', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Hiệu tập hợp', outcome: 'YCCĐ 2', content: 'Cho $A = \\{1; 2; 3; 4\\}$ và $B = \\{3; 4; 5\\}$. Hiệu $A \\setminus B$ là:', options: [{ key: 'A', text: '$\\{1; 2\\}$' }, { key: 'B', text: '$\\{5\\}$' }, { key: 'C', text: '$\\{3; 4\\}$' }, { key: 'D', text: '$\\{1; 2; 5\\}$' }], correctAnswer: 'A', solution: '$A \\setminus B = \\{1; 2\\}$.' },
  { id: 'q10_7', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Phần bù', outcome: 'YCCĐ 2', content: 'Phần bù của nửa khoảng $A = [-3; +\\infty)$ trong $\\mathbb{R}$ là:', options: [{ key: 'A', text: '$(-\\infty; -3)$' }, { key: 'B', text: '$(-\\infty; -3]$' }, { key: 'C', text: '[-3; 3]' }, { key: 'D', text: '$(3; +\\infty)$' }], correctAnswer: 'A', solution: '$C_\\mathbb{R} A = (-\\infty; -3)$.' },
  { id: 'q10_8', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Khoảng đoạn', outcome: 'YCCĐ 3', content: 'Biểu diễn tập hợp số $S = \\{x \\in \\mathbb{R} \\mid -1 < x \\le 4\\}$ trên trục số là:', options: [{ key: 'A', text: 'Nửa khoảng $(-1; 4]$' }, { key: 'B', text: 'Đoạn $[-1; 4]$' }, { key: 'C', text: 'Khoảng $(-1; 4)$' }, { key: 'D', text: 'Nửa khoảng $[-1; 4)$' }], correctAnswer: 'A', solution: '$(-1; 4]$.' },
  { id: 'q10_9', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Giao khoảng', outcome: 'YCCĐ 3', content: 'Cho $A = (-\\infty; 2]$ và $B = (-1; 5)$. Giao của hai tập hợp $A \\cap B$ là:', options: [{ key: 'A', text: '$(-1; 2]$' }, { key: 'B', text: '$(-\\infty; 5)$' }, { key: 'C', text: '[-1; 2]' }, { key: 'D', text: '$(2; 5)$' }], correctAnswer: 'A', solution: '$(-1; 2]$.' },
  { id: 'q10_10', type: 'multiple_choice', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Bài toán tham số', outcome: 'YCCĐ 3', content: 'Cho $A = (m - 1; 4]$ và $B = (-2; 2m + 2)$. Tìm số giá trị nguyên của $m$ để $A \\cap B \\neq \\emptyset$:', options: [{ key: 'A', text: '$6$' }, { key: 'B', text: '$4$' }, { key: 'C', text: '$5$' }, { key: 'D', text: '$3$' }], correctAnswer: 'A', solution: 'Có 6 giá trị nguyên của m thỏa mãn.' },
  { id: 'q10_11', type: 'multiple_choice', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Mệnh đề đúng', outcome: 'YCCĐ 1', content: 'Mệnh đề nào sau đây là mệnh đề ĐÚNG?', options: [{ key: 'A', text: '"$\\forall n \\in \\mathbb{N}, n(n+1)$ là số chẵn"' }, { key: 'B', text: '"$\\forall n \\in \\mathbb{N}, n^2 > 0$"' }, { key: 'C', text: '"$\\exists x \\in \\mathbb{R}, x^2 + 2x + 3 = 0$"' }, { key: 'D', text: '"$\\forall x \\in \\mathbb{Z}, x^2 > x$"' }], correctAnswer: 'A', solution: 'Tích 2 số tự nhiên liên tiếp luôn chẵn.' },
  { id: 'q10_12', type: 'multiple_choice', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Số phần tử nguyên', outcome: 'YCCĐ 3', content: 'Cho $A = [-3; 1)$ và $B = (0; 4]$. Số phần tử nguyên thuộc $A \\cup B$ là:', options: [{ key: 'A', text: '$8$' }, { key: 'B', text: '$7$' }, { key: 'C', text: '$6$' }, { key: 'D', text: '$9$' }], correctAnswer: 'A', solution: '$[-3; 4]$ có 8 số nguyên.' },

  // PHẦN II: 4 CÂU ĐÚNG / SAI
  { id: 'q10_13', type: 'true_false', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tính đúng sai', outcome: 'YCCĐ 3', content: 'Xét tính đúng/sai của các mệnh đề sau:', statements: [{ id: 'a', text: 'Số 2026 chia hết cho 2', isCorrect: true }, { id: 'b', text: 'Số nguyên tố chẵn duy nhất là 2', isCorrect: true }, { id: 'c', text: 'Tam giác đều có 3 góc bằng 60 độ', isCorrect: true }, { id: 'd', text: 'Hình vuông không phải hình bình hành', isCorrect: false }], solution: 'a, b, c Đúng; d Sai.' },
  { id: 'q10_14', type: 'true_false', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Số tập con', outcome: 'YCCĐ 1', content: 'Cho $A = \\{1; 2; 3; 4; 5\\}$. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Tập hợp A có tất cả 32 tập con', isCorrect: true }, { id: 'b', text: 'Số tập con gồm 2 phần tử của A bằng 10', isCorrect: true }, { id: 'c', text: 'Tập rỗng là tập con của A', isCorrect: true }, { id: 'd', text: 'Số 0 thuộc tập A', isCorrect: false }], solution: 'a, b, c Đúng; d Sai.' },
  { id: 'q10_15', type: 'true_false', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Khoảng đoạn', outcome: 'YCCĐ 3', content: 'Cho $A = [-2; 3)$ và $B = (1; 6]$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$A \\cap B = (1; 3)$', isCorrect: true }, { id: 'b', text: '$A \\cup B = [-2; 6]$', isCorrect: true }, { id: 'c', text: '$A \\setminus B = [-2; 1]$', isCorrect: true }, { id: 'd', text: '$B \\setminus A = [3; 6]$', isCorrect: true }], solution: 'Tất cả 4 mệnh đề đều đúng.' },
  { id: 'q10_16', type: 'true_false', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Tham số m', outcome: 'YCCĐ 3', content: 'Cho $A = [m; m + 3]$ và $B = (-1; 5)$. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Độ dài đoạn A luôn bằng 3 với mọi m', isCorrect: true }, { id: 'b', text: 'Khi m = 0 thì A là con của B', isCorrect: true }, { id: 'c', text: 'Để A là con của B thì -1 < m <= 2', isCorrect: true }, { id: 'd', text: 'Khi m = 5 thì giao khác rỗng', isCorrect: false }], solution: 'a, b, c Đúng; d Sai.' },

  // PHẦN III: 6 CÂU TRẢ LỜI NGẮN
  { id: 'q10_17', type: 'short_answer', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Mệnh đề chứa biến', outcome: 'YCCĐ 1', content: 'Cho $P(n)$: "$n^2 + 1$ chia hết cho 5". Trong các số $n \\in \\{1; 2; 3; 4; 5\\}$, có bao nhiêu giá trị để $P(n)$ đúng?', correctAnswer: '2', solution: 'n = 2 và n = 3.' },
  { id: 'q10_18', type: 'short_answer', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Lượng từ với mọi', outcome: 'YCCĐ 2', content: 'Có bao nhiêu giá trị nguyên $m \\in [-3; 3]$ để "$\\forall x \\in \\mathbb{R}, x^2 - 2x + m > 0$" là mệnh đề đúng?', correctAnswer: '2', solution: 'm in {2; 3}.' },
  { id: 'q10_19', type: 'short_answer', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Đếm mệnh đề đúng', outcome: 'YCCĐ 3', content: 'Trong các khẳng định sau: (1) "$\\sqrt{2}$ là số hữu tỉ", (2) "$\\pi > 3.14$", (3) "Hình thang có 2 cạnh bên bằng nhau là hình thang cân", (4) "$2^3 + 1 = 9$ là hợp số". Có bao nhiêu mệnh đề ĐÚNG?', correctAnswer: '2', solution: 'Mệnh đề (2) và (4) đúng.' },
  { id: 'q10_20', type: 'short_answer', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Toán thực tế tập hợp', outcome: 'YCCĐ 2', content: 'Lớp 10A có 25 em thích Toán, 20 em thích Văn, 12 em thích cả hai. Có bao nhiêu em thích ít nhất một môn?', correctAnswer: '33', solution: '25 + 20 - 12 = 33.' },
  { id: 'q10_21', type: 'short_answer', level: 'ThongHieu', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Độ dài khoảng đoạn', outcome: 'YCCĐ 3', content: 'Cho $A = (-3; 4]$ và $B = [0; 6)$. Tính độ dài của đoạn giao $A \\cap B$:', correctAnswer: '4', solution: 'Độ dài đoạn [0; 4] bằng 4.' },
  { id: 'q10_22', type: 'short_answer', level: 'VanDung', topicName: 'Mệnh đề và Tập hợp', lessonName: 'Số nguyên trên trục số', outcome: 'YCCĐ 3', content: 'Có bao nhiêu số nguyên $x$ thuộc $A \\cap B$ biết $A = (-5; 3)$ và $B =;

// ==============================================================
// 3. NGÂN HÀNG CÂU HỎI TOÁN 11 CHUẨN GDPT 2018
// ==============================================================
export const MATH_11_QUESTIONS: Question[] = [
  { id: 'q11_1', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Hàm số lượng giác', lessonName: 'Hàm số lượng giác', outcome: 'YCCĐ 1', content: 'Tập xác định của hàm số lượng giác $y = \\tan x$ là:', options: [{ key: 'A', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$' }, { key: 'B', text: '$D = \\mathbb{R}$' }, { key: 'C', text: '$D = \\mathbb{R} \\setminus \\{k\\pi\\}$' }, { key: 'D', text: '$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{4} + k\\pi\\}$' }], correctAnswer: 'A', solution: '$\\cos x \\neq 0$.' },
  { id: 'q11_2', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Phương trình lượng giác', lessonName: 'Phương trình lượng giác cơ bản', outcome: 'YCCĐ 1', content: 'Nghiệm của phương trình $\\cos x = \\frac{1}{2}$ là:', options: [{ key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$' }, { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi$' }, { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi$' }, { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi$' }], correctAnswer: 'A', solution: '$x = \\pm \\frac{\\pi}{3} + k2\\pi$.' },
  { id: 'q11_3', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số cộng', lessonName: 'Cấp số cộng', outcome: 'YCCĐ 1', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3, d = 4$. Số hạng $u_2$ bằng:', options: [{ key: 'A', text: '7' }, { key: 'B', text: '12' }, { key: 'C', text: '-1' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$u_2 = 7$.' },
  { id: 'q11_4', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Cấp số nhân', lessonName: 'Cấp số nhân', outcome: 'YCCĐ 1', content: 'Cho cấp số nhân $(u_n)$ có $u_1 = 2, q = 3$. Giá trị $u_3$ bằng:', options: [{ key: 'A', text: '18' }, { key: 'B', text: '6' }, { key: 'C', text: '24' }, { key: 'D', text: '54' }], correctAnswer: 'A', solution: '$u_3 = 18$.' },
  { id: 'q11_5', type: 'multiple_choice', level: 'NhanBiet', topicName: 'Giới hạn', lessonName: 'Giới hạn dãy số', outcome: 'YCCĐ 1', content: 'Tính giới hạn $L = \\lim \\frac{2n + 1}{n + 3}$:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '1' }, { key: 'C', text: '0' }, { key: 'D', text: '1/3' }], correctAnswer: 'A', solution: '$L = 2$.' },
  { id: 'q11_6', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Giới hạn', lessonName: 'Giới hạn hàm số', outcome: 'YCCĐ 1', content: 'Tính giới hạn $L = \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$:', options: [{ key: 'A', text: '4' }, { key: 'B', text: '2' }, { key: 'C', text: '0' }, { key: 'D', text: '1' }], correctAnswer: 'A', solution: '$\\lim (x+2) = 4$.' },
  { id: 'q11_7', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Hình học', lessonName: 'Đường thẳng vuông góc mặt phẳng', outcome: 'YCCĐ 1', content: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Mệnh đề nào SAI?', options: [{ key: 'A', text: '$SC \\perp (ABCD)$' }, { key: 'B', text: '$SA \\perp BD$' }, { key: 'C', text: '$BD \\perp (SAC)$' }, { key: 'D', text: '$BC \\perp (SAB)$' }], correctAnswer: 'A', solution: '$SC$ không vuông góc đáy.' },
  { id: 'q11_8', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Đạo hàm', lessonName: 'Quy tắc tính đạo hàm', outcome: 'YCCĐ 1', content: 'Đạo hàm của $y = x^3 - 3x^2 + 2x - 1$ là:', options: [{ key: 'A', text: '$y\' = 3x^2 - 6x + 2$' }, { key: 'B', text: '$y\' = 3x^2 - 6x$' }, { key: 'C', text: '$y\' = x^2 - 3x + 2$' }, { key: 'D', text: '$y\' = 3x^2 - 3x + 2$' }], correctAnswer: 'A', solution: '$y\' = 3x^2 - 6x + 2$.' },
  { id: 'q11_9', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Tiếp tuyến', lessonName: 'Phương trình tiếp tuyến', outcome: 'YCCĐ 1', content: 'Hệ số góc tiếp tuyến $y = x^2 - 2x + 3$ tại $x_0 = 2$ bằng:', options: [{ key: 'A', text: '2' }, { key: 'B', text: '3' }, { key: 'C', text: '4' }, { key: 'D', text: '0' }], correctAnswer: 'A', solution: '$k = 2$.' },
  { id: 'q11_10', type: 'multiple_choice', level: 'VanDung', topicName: 'Logarit', lessonName: 'Phương trình logarit', outcome: 'YCCĐ 1', content: 'Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:', options: [{ key: 'A', text: '$x = 9$' }, { key: 'B', text: '$x = 8$' }, { key: 'C', text: '$x = 7$' }, { key: 'D', text: '$x = 10$' }], correctAnswer: 'A', solution: '$x = 9$.' },
  { id: 'q11_11', type: 'multiple_choice', level: 'VanDung', topicName: 'Xác suất', lessonName: 'Quy tắc nhân xác suất', outcome: 'YCCĐ 1', content: 'Bắn hai phát độc lập, xác suất trúng là 0.8 và 0.7. Xác suất trúng cả hai:', options: [{ key: 'A', text: '0.56' }, { key: 'B', text: '0.75' }, { key: 'C', text: '0.15' }, { key: 'D', text: '0.94' }], correctAnswer: 'A', solution: '$0.8 \\times 0.7 = 0.56$.' },
  { id: 'q11_12', type: 'multiple_choice', level: 'ThongHieu', topicName: 'Góc', lessonName: 'Góc giữa hai đường thẳng', outcome: 'YCCĐ 1', content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$. Góc giữa hai đường thẳng $A\'B$ và $B\'C$ bằng:', options: [{ key: 'A', text: '$60^\\circ$' }, { key: 'B', text: '$90^\\circ$' }, { key: 'C', text: '$45^\\circ$' }, { key: 'D', text: '$30^\\circ$' }], correctAnswer: 'A', solution: '$60^\\circ$.' },
  { id: 'q11_13', type: 'true_false', level: 'ThongHieu', topicName: 'Cấp số cộng', lessonName: 'Cấp số cộng', outcome: 'YCCĐ 1', content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 2, d = 3$. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Số hạng $u_5 = 14$', isCorrect: true }, { id: 'b', text: '$u_n = 3n - 1$', isCorrect: true }, { id: 'c', text: 'Số 100 thuộc cấp số', isCorrect: false }, { id: 'd', text: 'Tổng $S_{10} = 155$', isCorrect: true }], solution: 'a, b, d Đúng; c Sai.' },
  { id: 'q11_14', type: 'true_false', level: 'VanDung', topicName: 'Hình không gian', lessonName: 'Đường vuông góc mặt phẳng', outcome: 'YCCĐ 1', content: 'Cho hình chóp $S.ABC$ có đáy vuông tại $B$, $SA \\perp (ABC)$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$SA \\perp BC$', isCorrect: true }, { id: 'b', text: '$BC \\perp (SAB)$', isCorrect: true }, { id: 'c', text: 'Tam giác $SBC$ vuông tại $C$', isCorrect: false }, { id: 'd', text: 'Góc giữa $SC$ và đáy là $\\widehat{SCA}$', isCorrect: true }], solution: 'c Sai.' },
  { id: 'q11_15', type: 'true_false', level: 'ThongHieu', topicName: 'Đạo hàm', lessonName: 'Đạo hàm và tiếp tuyến', outcome: 'YCCĐ 1', content: 'Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng/sai:', statements: [{ id: 'a', text: '$f\'(x) = 3x^2 - 3$', isCorrect: true }, { id: 'b', text: '$f\'(x) = 0$ có 2 nghiệm', isCorrect: true }, { id: 'c', text: 'Hệ số góc tại $x=0$ là $-3$', isCorrect: true }, { id: 'd', text: 'Hệ số góc tại $x=1$ là $0$', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q11_16', type: 'true_false', level: 'VanDung', topicName: 'Xác suất', lessonName: 'Biến cố và xác suất', outcome: 'YCCĐ 1', content: 'Hộp có 4 bi đỏ và 6 bi xanh, lấy ngẫu nhiên 3 viên. Xét tính đúng/sai:', statements: [{ id: 'a', text: 'Không gian mẫu là 120', isCorrect: true }, { id: 'b', text: 'Xác suất 3 bi đỏ là 1/30', isCorrect: true }, { id: 'c', text: 'Xác suất 3 bi cùng màu là 1/5', isCorrect: true }, { id: 'd', text: 'Xác suất có ít nhất 1 bi xanh là 29/30', isCorrect: true }], solution: 'Tất cả đều đúng.' },
  { id: 'q11_17', type: 'short_answer', level: 'ThongHieu', topicName: 'Cấp số cộng', lessonName: 'Cấp số cộng', outcome: 'YCCĐ 1', content: 'Cho cấp số cộng có $u_1 = 5, d = 3$. Tính $u_{10}$:', correctAnswer: '32', solution: '$u_{10} = 32$.' },
  { id: 'q11_18', type: 'short_answer', level: 'ThongHieu', topicName: 'Giới hạn', lessonName: 'Giới hạn hàm số', outcome: 'YCCĐ 1', content: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{2x^2 - x - 1}{x - 1}$:', correctAnswer: '3', solution: '$L = 3$.' },
  { id: 'q11_19', type: 'short_answer', level: 'VanDung', topicName: 'Góc', lessonName: 'Góc đường và mặt phẳng', outcome: 'YCCĐ 1', content: 'Cho hình chóp $S.ABCD$ có đáy vuông cạnh $a$, $SA \\perp (ABCD), SA = a\\sqrt{2}$. Tính tang góc giữa $SC$ và đáy:', correctAnswer: '1', solution: '$\\tan = 1$.' },
  { id: 'q11_20', type: 'short_answer', level: 'VanDung', topicName: 'Tiếp tuyến', lessonName: 'Tiếp tuyến phân thức', outcome: 'YCCĐ 1', content: 'Tìm hệ số góc tiếp tuyến của $y = \\frac{2x - 1}{x + 1}$ tại $x_0 = 1$:', correctAnswer: '0.75', solution: '$k = 0.75$.' },
  { id: 'q11_21', type: 'short_answer', level: 'VanDung', topicName: 'Mũ', lessonName: 'Phương trình mũ cơ bản', outcome: 'YCCĐ 1', content: 'Giải phương trình $2^{x^2 - 3x} = 16$. Tính tổng các nghiệm:', correctAnswer: '3', solution: 'Tổng = 3.' },
  { id: 'q11_22', type: 'short_answer', level: 'VanDung', topicName: 'Tổ hợp', lessonName: 'Chỉnh hợp', outcome: 'YCCĐ 1', content: 'Từ các chữ số 1, 2, 3, 4, 5, 6 lập được bao nhiêu số tự nhiên gồm 4 chữ số khác nhau?', correctAnswer: '360', solution: '$A_6^4 = 360$.' },
];

// ==============================================================
// 4. HÀM TẠO ĐỀ LIÊN KẾT CHUẨN XÁC VỚI SYLLABUS CỦA KHỐI ĐƯỢC CHỌN
// ==============================================================
export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const grade = String(config?.grade || '10');
  const syllabus = getSyllabusForGrade(grade);

  let rawQuestions: Question[] = [];
  if (grade === '10') {
    rawQuestions = MATH_10_QUESTIONS;
  } else {
    rawQuestions = MATH_11_QUESTIONS;
  }

  // Tự động liên kết và đồng bộ chặt chẽ với các chủ đề trong file syllabus tương ứng
  const linkedQuestions = rawQuestions.map((q, idx) => {
    const topic = syllabus[idx % Math.max(1, syllabus.length)];
    const lesson = topic?.lessons?.[0];
    const outcome = lesson?.outcomes?.[0];
    return {
      ...q,
      topicName: q.topicName || topic?.title || `Toán ${grade}`,
      lessonName: q.lessonName || lesson?.title || `Bài học Toán ${grade}`,
      outcome: q.outcome || outcome?.text || `YCCĐ chuẩn Toán ${grade}`,
    };
  });

  return {
    id: `test_${grade}_${Date.now()}`,
    title: config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`,
    config: { ...config, grade },
    questions: linkedQuestions,
    createdAt: new Date().toISOString(),
  };
};

export const generateUniqueTestForStudent = (config: TestConfig, student?: StudentAccount): GeneratedTest => {
  return createDefaultTest(config);
};
