import { Topic } from './types';

export const MATH_11_SYLLABUS: Topic[] = [
  {
    id: 'topic_11_luong_giac',
    grade: '11',
    category: 'Giải Tích',
    name: 'Hàm số lượng giác & Phương trình lượng giác',
    lessons: [
      {
        id: 'lesson_11_goc_cong_thuc_lg',
        name: 'Góc lượng giác và Công thức lượng giác',
        outcomes: [
          'Nhận biết khái niệm radian, đường tròn lượng giác, giá trị lượng giác của góc lượng giác.',
          'Vận dụng thành thạo các công thức cộng, công thức nhân đôi, biến đổi tích thành tổng và tổng thành tích.',
        ],
      },
      {
        id: 'lesson_11_ham_so_pt_lg',
        name: 'Hàm số lượng giác và Phương trình lượng giác cơ bản',
        outcomes: [
          'Nhận biết tập xác định, tính tuần hoàn, chu kì, tính chẵn lẻ và đồ thị của y = sin x, y = cos x, y = tan x, y = cot x.',
          'Giải được các phương trình lượng giác cơ bản: sin x = m, cos x = m, tan x = m, cot x = m.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_day_so_cap_so',
    grade: '11',
    category: 'Giải Tích',
    name: 'Dãy số, Cấp số cộng & Cấp số nhân',
    lessons: [
      {
        id: 'lesson_11_day_so',
        name: 'Dãy số và tính chất (Tăng, giảm, bị chặn)',
        outcomes: [
          'Nhận biết dãy số cho bởi công thức số hạng tổng quát hoặc hệ thức truy hồi.',
          'Xét được tính tăng, giảm và bị chặn của dãy số.',
        ],
      },
      {
        id: 'lesson_11_csc_csn',
        name: 'Cấp số cộng và Cấp số nhân',
        outcomes: [
          'Nhận biết cấp số cộng (công sai d), cấp số nhân (công bội q).',
          'Tính được số hạng tổng quát u_n và tổng n số hạng đầu tiên S_n của cấp số cộng và cấp số nhân.',
          'Vận dụng cấp số cộng, cấp số nhân giải các bài toán thực tế (lãi suất kép, tăng trưởng dân số).',
        ],
      },
    ],
  },
  {
    id: 'topic_11_gioi_han_lien_tuc',
    grade: '11',
    category: 'Giải Tích',
    name: 'Giới hạn & Hàm số liên tục',
    lessons: [
      {
        id: 'lesson_11_gioi_han',
        name: 'Giới hạn của dãy số và Giới hạn của hàm số',
        outcomes: [
          'Tính được giới hạn của dãy số hữu tỉ, lũy thừa và tổng của cấp số nhân lùi vô hạn.',
          'Tính được giới hạn của hàm số tại một điểm, tại vô cực và giới hạn một bên (dạng 0/0, ∞/∞).',
        ],
      },
      {
        id: 'lesson_11_ham_so_lien_tuc',
        name: 'Hàm số liên tục',
        outcomes: [
          'Xét được tính liên tục của hàm số tại một điểm và trên một khoảng/đoạn.',
          'Vận dụng định lí giá trị trung gian để chứng minh phương trình có nghiệm.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_hinh_khong_gian_song_song',
    grade: '11',
    category: 'Hình Học',
    name: 'Hình học không gian: Quan hệ song song',
    lessons: [
      {
        id: 'lesson_11_duong_mp_song_song',
        name: 'Đường thẳng và mặt phẳng song song',
        outcomes: [
          'Xác định giao tuyến của hai mặt phẳng, giao điểm của đường thẳng và mặt phẳng.',
          'Chứng minh đường thẳng song song với mặt phẳng, hai đường thẳng song song trong không gian.',
        ],
      },
      {
        id: 'lesson_11_hai_mp_song_song',
        name: 'Hai mặt phẳng song song & Phép chiếu song song',
        outcomes: [
          'Chứng minh hai mặt phẳng song song, định lí Ta-lét trong không gian.',
          'Xác định hình biểu diễn của các hình phẳng qua phép chiếu song song.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_hinh_khong_gian_vuong_goc',
    grade: '11',
    category: 'Hình Học',
    name: 'Hình học không gian: Quan hệ vuông góc',
    lessons: [
      {
        id: 'lesson_11_duong_vuong_mp',
        name: 'Đường thẳng vuông góc với mặt phẳng',
        outcomes: [
          'Chứng minh đường thẳng vuông góc với mặt phẳng, định lí ba đường vuông góc.',
          'Xác định góc giữa đường thẳng và mặt phẳng.',
        ],
      },
      {
        id: 'lesson_11_hai_mp_vuong_goc_kc',
        name: 'Hai mặt phẳng vuông góc, Góc nhị diện & Khoảng cách',
        outcomes: [
          'Chứng minh hai mặt phẳng vuông góc, xác định góc giữa hai mặt phẳng (góc nhị diện).',
          'Tính khoảng cách từ điểm đến mặt phẳng, khoảng cách giữa đường thẳng và mặt phẳng song song, khoảng cách giữa hai đường thẳng chéo nhau.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_mu_logarit',
    grade: '11',
    category: 'Giải Tích',
    name: 'Hàm số mũ và Hàm số logarit',
    lessons: [
      {
        id: 'lesson_11_luy_thua_logarit',
        name: 'Lũy thừa và Logarit',
        outcomes: [
          'Thực hiện các phép tính biến đổi lũy thừa với số mũ thực và các tính chất của logarit cơ số a (a > 0, a ≠ 1).',
          'Sử dụng logarit tự nhiên ln và logarit thập phân log.',
        ],
      },
      {
        id: 'lesson_11_ham_so_pt_mu_log',
        name: 'Hàm số, Phương trình & Bất phương trình Mũ - Logarit',
        outcomes: [
          'Nhận biết tập xác định, tính đơn điệu và đồ thị của y = a^x và y = log_a(x).',
          'Giải được phương trình và bất phương trình mũ, logarit cơ bản và quy về cơ bản.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_dao_ham',
    grade: '11',
    category: 'Giải Tích',
    name: 'Đạo hàm và Ứng dụng ban đầu',
    lessons: [
      {
        id: 'lesson_11_dinh_nghia_quy_tac_dao_ham',
        name: 'Định nghĩa và Các quy tắc tính đạo hàm',
        outcomes: [
          'Tính được đạo hàm của các hàm số cơ bản (đa thức, lượng giác, mũ, logarit) và hàm số hợp.',
          'Viết được phương trình tiếp tuyến của đồ thị hàm số tại một điểm hoặc khi biết hệ số góc.',
        ],
      },
    ],
  },
  {
    id: 'topic_11_xac_suat',
    grade: '11',
    category: 'Thống Kê & Xác Suất',
    name: 'Xác suất lớp 11: Các quy tắc tính xác suất',
    lessons: [
      {
        id: 'lesson_11_bien_co_quy_tac_xac_suat',
        name: 'Biến cố hợp, giao, độc lập & Quy tắc cộng, nhân xác suất',
        outcomes: [
          'Nhận biết biến cố giao, biến cố hợp, hai biến cố xung khắc, hai biến cố độc lập.',
          'Vận dụng công thức cộng xác suất P(A ∪ B) và công thức nhân xác suất cho hai biến cố độc lập P(A ∩ B) = P(A).P(B).',
        ],
      },
    ],
  },
];
