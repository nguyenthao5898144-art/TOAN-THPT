export interface Lesson {
  id: string;
  name: string;
  outcomes: string[];
}

export interface Topic {
  id: string;
  grade:  '11' ;
  category: 'Đại Số' | 'Giải Tích' | 'Hình Học' | 'Thống Kê & Xác Suất' | 'Chuyên Đề Học Tập';
  name: string;
  lessons: Lesson[];
}
{/.
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
./}
// 2. CHƯƠNG TRÌNH TOÁN 11 (GDPT 2018)
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
 {/.
// 3. CHƯƠNG TRÌNH TOÁN 12 (GDPT 2018)
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
  {
    id: 'topic_nguyen_ham_tich_phan',
    grade: '12',
    category: 'Giải Tích',
    name: 'Nguyên hàm và Tích phân',
    lessons: [
      {
        id: 'lesson_nguyen_ham',
        name: 'Nguyên hàm và các tính chất',
        outcomes: [
          'Nhận biết khái niệm nguyên hàm của một hàm số và các tính chất cơ bản của nguyên hàm.',
          'Tìm được nguyên hàm của các hàm số sơ cấp thường gặp.',
        ],
      },
      {
        id: 'lesson_tich_phan_ung_dung',
        name: 'Tích phân và Ứng dụng hình học của tích phân',
        outcomes: [
          'Nhận biết khái niệm và các tính chất của tích phân.',
          'Tính được diện tích hình phẳng giới hạn bởi các đồ thị hàm số và thể tích khối tròn xoay.',
        ],
      },
    ],
  },
  {
    id: 'topic_oxyz',
    grade: '12',
    category: 'Hình Học',
    name: 'Phương pháp tọa độ trong không gian (Oxyz)',
    lessons: [
      {
        id: 'lesson_toa_do_vecto_oxyz',
        name: 'Hệ tọa độ Oxyz và Tọa độ của Vectơ',
        outcomes: [
          'Nhận biết hệ trục tọa độ Oxyz trong không gian, tọa độ điểm và tọa độ vectơ.',
          'Tính được các phép toán vectơ, tích có hướng của hai vectơ và ứng dụng tính diện tích, thể tích.',
        ],
      },
      {
        id: 'lesson_pt_mat_phang',
        name: 'Phương trình mặt phẳng',
        outcomes: [
          'Nhận biết vectơ pháp tuyến của mặt phẳng và lập được phương trình tổng quát của mặt phẳng.',
          'Xét vị trí tương đối giữa hai mặt phẳng và tính khoảng cách từ một điểm đến mặt phẳng.',
        ],
      },
      {
        id: 'lesson_pt_duong_thang_mat_cau',
        name: 'Phương trình đường thẳng & Mặt cầu trong không gian',
        outcomes: [
          'Lập được phương trình tham số, chính tắc của đường thẳng và phương trình mặt cầu trong không gian Oxyz.',
          'Xét vị trí tương đối giữa đường thẳng, mặt phẳng và mặt cầu.',
        ],
      },
    ],
  },
  {
    id: 'topic_xac_suat_thong_ke',
    grade: '12',
    category: 'Thống Kê & Xác Suất',
    name: 'Thống kê và Xác suất lớp 12',
    lessons: [
      {
        id: 'lesson_thong_ke_ghep_nhom',
        name: 'Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm',
        outcomes: [
          'Tính được khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn của mẫu số liệu ghép nhóm.',
          'Giải thích được ý nghĩa sư phạm của các số đặc trưng trong các tình huống thực tiễn.',
        ],
      },
      {
        id: 'lesson_xac_suat_co_dieu_kien',
        name: 'Xác suất có điều kiện và Công thức Bayes',
        outcomes: [
          'Nhận biết và tính được xác suất có điều kiện P(A|B).',
          'Vận dụng công thức xác suất toàn phần và công thức Bayes để giải quyết các bài toán dự đoán, kiểm định thực tế.',
        ],
      },
    ],
  },
  {
    id: 'topic_chuyen_de_12',
    grade: '12',
    category: 'Chuyên Đề Học Tập',
    name: 'Chuyên đề học tập Toán 12',
    lessons: [
      {
        id: 'lesson_cd_toan_tai_chinh',
        name: 'Toán học trong kinh tế và tài chính',
        outcomes: [
          'Vận dụng kiến thức hàm số, đạo hàm và tích phân để giải quyết các bài toán lãi suất, niên kim, giá trị hiện tại và khấu hao.',
        ],
      },
    ],
  },
];
./}
// Hàm trích xuất ngân hàng chương trình theo khối lớp
export function getSyllabusByGrade(grade: string): Topic[] {
  if (grade === '10') return MATH_10_SYLLABUS;
  if (grade === '11') return MATH_11_SYLLABUS;
  return MATH_12_SYLLABUS;
}
