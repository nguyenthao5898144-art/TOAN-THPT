export interface Lesson {
  id: string;
  name: string;
  outcomes: string[];
}

export interface Topic {
  id: string;
  grade: '10' | '11' | '12';
  category: 'Đại Số' | 'Giải Tích' | 'Hình Học' | 'Thống Kê & Xác Suất' | 'Chuyên Đề Học Tập';
  name: string;
  lessons: Lesson[];
}

// 1. CHƯƠNG TRÌNH TOÁN 10 (GDPT 2018)
export const MATH_10_SYLLABUS: Topic[] = [
  {
    id: 'topic_10_menh_de_tap_hop',
    grade: '10',
    category: 'Đại Số',
    name: 'Mệnh đề và Tập hợp',
    lessons: [
      {
        id: 'lesson_10_menh_de',
        name: 'Mệnh đề toán học',
        outcomes: [
          'Nhận biết được mệnh đề toán học, mệnh đề phủ định, mệnh đề kéo theo, mệnh đề tương đương.',
          'Sử dụng đúng các kí hiệu với mọi (∀) và tồn tại (∃).',
          'Xác định được tính đúng sai của một mệnh đề toán học trong các trường hợp đơn giản.',
        ],
      },
      {
        id: 'lesson_10_tap_hop',
        name: 'Tập hợp và các phép toán trên tập hợp',
        outcomes: [
          'Nhận biết các cách xác định tập hợp, tập con, hai tập hợp bằng nhau.',
          'Thực hiện được các phép toán giao, hợp, hiệu của hai tập hợp và phần bù.',
          'Biểu diễn được các tập con của tập số thực (khoảng, đoạn, nửa khoảng) trên trục số.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_bpt_he_bpt',
    grade: '10',
    category: 'Đại Số',
    name: 'Bất phương trình & Hệ bất phương trình bậc nhất hai ẩn',
    lessons: [
      {
        id: 'lesson_10_bpt_bac_nhat',
        name: 'Bất phương trình bậc nhất hai ẩn',
        outcomes: [
          'Nhận biết được bất phương trình bậc nhất hai ẩn và nghiệm của nó.',
          'Biểu diễn được miền nghiệm của bất phương trình bậc nhất hai ẩn trên mặt phẳng tọa độ.',
        ],
      },
      {
        id: 'lesson_10_he_bpt_bac_nhat',
        name: 'Hệ bất phương trình bậc nhất hai ẩn & Bài toán tối ưu',
        outcomes: [
          'Nhận biết được hệ bất phương trình bậc nhất hai ẩn và biểu diễn miền nghiệm.',
          'Vận dụng giải bài toán thực tế quy về tìm giá trị lớn nhất, nhỏ nhất của biểu thức F = ax + by trên miền đa giác.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_ham_so_bac_hai',
    grade: '10',
    category: 'Đại Số',
    name: 'Hàm số bậc hai và Đồ thị',
    lessons: [
      {
        id: 'lesson_10_ham_so',
        name: 'Hàm số và Đồ thị hàm số bậc hai',
        outcomes: [
          'Nhận biết hàm số bậc hai y = ax² + bx + c (a ≠ 0), tọa độ đỉnh, trục đối xứng và bảng biến thiên.',
          'Vẽ được đồ thị parabol của hàm số bậc hai và xác định chiều biến thiên.',
          'Vận dụng hàm số bậc hai để giải quyết các bài toán tối ưu trong thực tế (tầm bay parabol, tối ưu doanh thu).',
        ],
      },
      {
        id: 'lesson_10_tam_thuc_bac_hai',
        name: 'Dấu của tam thức bậc hai & Phương trình quy về bậc hai',
        outcomes: [
          'Xét được dấu của tam thức bậc hai f(x) = ax² + bx + c.',
          'Giải được bất phương trình bậc hai một ẩn.',
          'Giải được phương trình chứa căn quy về bậc hai dạng √(ax² + bx + c) = √(dx² + ex + f) và √(ax² + bx + c) = dx + e.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_he_thuc_luong_vecto',
    grade: '10',
    category: 'Hình Học',
    name: 'Hệ thức lượng trong tam giác & Vectơ',
    lessons: [
      {
        id: 'lesson_10_he_thuc_luong',
        name: 'Hệ thức lượng trong tam giác',
        outcomes: [
          'Nhận biết và vận dụng định lí côsin, định lí sin trong tam giác.',
          'Tính được diện tích tam giác và bán kính đường tròn ngoại tiếp, nội tiếp (R, r).',
          'Giải tam giác và ứng dụng vào bài toán đo đạc khoảng cách, chiều cao trong thực tế.',
        ],
      },
      {
        id: 'lesson_10_vecto_phep_toan',
        name: 'Khái niệm Vectơ và các phép toán',
        outcomes: [
          'Nhận biết khái niệm vectơ, hai vectơ cùng phương, cùng hướng, bằng nhau, vectơ đối, vectơ không.',
          'Thực hiện được phép cộng, trừ hai vectơ (quy tắc ba điểm, quy tắc hình bình hành) và nhân vectơ với số.',
          'Tính được tích vô hướng của hai vectơ và góc giữa hai vectơ.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_oxy',
    grade: '10',
    category: 'Hình Học',
    name: 'Phương pháp tọa độ trong mặt phẳng (Oxy)',
    lessons: [
      {
        id: 'lesson_10_duong_thang',
        name: 'Phương trình đường thẳng trong Oxy',
        outcomes: [
          'Lập được phương trình tổng quát, tham số của đường thẳng.',
          'Xét được vị trí tương đối giữa hai đường thẳng, tính góc giữa hai đường thẳng và khoảng cách từ một điểm đến đường thẳng.',
        ],
      },
      {
        id: 'lesson_10_duong_tron_conic',
        name: 'Phương trình đường tròn & Ba đường conic',
        outcomes: [
          'Lập được phương trình đường tròn và viết phương trình tiếp tuyến của đường tròn.',
          'Nhận biết phương trình chính tắc của ba đường conic: Elip (Ellipse), Hypebol (Hyperbola), Parabol.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_dai_so_to_hop',
    grade: '10',
    category: 'Đại Số',
    name: 'Đại số tổ hợp',
    lessons: [
      {
        id: 'lesson_10_quy_tac_dem',
        name: 'Quy tắc cộng, quy tắc nhân và sơ đồ hình cây',
        outcomes: [
          'Vận dụng thành thạo quy tắc cộng và quy tắc nhân để đếm số phương án.',
          'Sử dụng sơ đồ hình cây để phân tích các bài toán đếm.',
        ],
      },
      {
        id: 'lesson_10_hoan_vi_chinh_hop_to_hop',
        name: 'Hoán vị, Chỉnh hợp, Tổ hợp và Nhị thức Newton',
        outcomes: [
          'Tính được số hoán vị (P_n), chỉnh hợp (A_n^k) và tổ hợp (C_n^k).',
          'Khai triển được nhị thức Newton (a + b)^n với số mũ n ≤ 5.',
        ],
      },
    ],
  },
  {
    id: 'topic_10_xac_suat',
    grade: '10',
    category: 'Thống Kê & Xác Suất',
    name: 'Thống kê & Xác suất lớp 10',
    lessons: [
      {
        id: 'lesson_10_thong_ke',
        name: 'Các số đặc trưng đo xu thế trung tâm và mức độ phân tán',
        outcomes: [
          'Tính được số trung bình, trung vị, tứ phân vị (Q1, Q2, Q3), mốt.',
          'Tính được khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn của mẫu số liệu không ghép nhóm.',
        ],
      },
      {
        id: 'lesson_10_bien_co_xac_suat',
        name: 'Biến cố và Định nghĩa cổ điển của xác suất',
        outcomes: [
          'Xác định được không gian mẫu và các biến cố.',
          'Tính được xác suất cổ điển của biến cố bằng phương pháp tổ hợp: P(A) = n(A) / n(Ω).',
        ],
      },
    ],
  },
];

// Giả định khai báo tương thích cho MATH_11_SYLLABUS nếu cần
export const MATH_11_SYLLABUS: Topic[] = [];

// Khai báo MATH_12_SYLLABUS (hoặc import từ nguồn)
export const MATH_12_SYLLABUS: Topic[] = [
  {
    id: 'topic_dao_ham',
    grade: '12',
    category: 'Giải Tích',
    name: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
    lessons: [
      {
        id: 'lesson_don_dieu',
        name: 'Tính đơn điệu của hàm số',
        outcomes: [
          'Nhận biết được tính đồng biến, nghịch biến của một hàm số trên một khoảng dựa vào dấu của đạo hàm cấp một của nó.',
          'Thể hiện được tính đồng biến, nghịch biến của hàm số trong bảng biến thiên.',
          'Nhận biết được tính đơn điệu, điểm cực trị, giá trị cực trị của hàm số thông qua bảng biến thiên hoặc thông qua hình ảnh hình học của đồ thị hàm số.',
        ],
      },
      {
        id: 'lesson_gtln_gtnn',
        name: 'Giá trị lớn nhất, giá trị nhỏ nhất của hàm số',
        outcomes: [
          'Nhận biết được giá trị lớn nhất, giá trị nhỏ nhất của hàm số trên một tập xác định cho trước.',
          'Xác định được giá trị lớn nhất, giá trị nhỏ nhất của hàm số bằng đạo hàm trong những trường hợp đơn giản.',
        ],
      },
      {
        id: 'lesson_khao_sat_do_thi',
        name: 'Khảo sát và vẽ đồ thị của hàm số',
        outcomes: [
          'Nhận biết được hình ảnh hình học của đường tiệm cận ngang, đường tiệm cận đứng, đường tiệm cận xiên của đồ thị hàm số.',
          'Mô tả được sơ đồ tổng quát để khảo sát hàm số (tìm tập xác định, xét chiều biến thiên, tìm cực trị, tìm tiệm cận, lập bảng biến thiên, vẽ đồ thị).',
          'Khảo sát được tập xác định, chiều biến thiên, cực trị, tiệm cận, bảng biến thiên và vẽ đồ thị của các hàm số bậc ba, hàm phân thức bậc nhất/bậc nhất và bậc hai/bậc nhất.',
        ],
      },
      {
        id: 'lesson_ung_dung_thuc_te',
        name: 'Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn',
        outcomes: [
          'Vận dụng đạo hàm và khảo sát hàm số để giải quyết một số bài toán tối ưu trong đời sống, kinh tế, vật lí.',
        ],
      },
    ],
  },
];

// Hàm trích xuất ngân hàng chương trình theo khối lớp
export function getSyllabusByGrade(grade: string): Topic[] {
  if (grade === '10') return MATH_10_SYLLABUS;
  if (grade === '11') return MATH_11_SYLLABUS;
  return MATH_12_SYLLABUS;
}
