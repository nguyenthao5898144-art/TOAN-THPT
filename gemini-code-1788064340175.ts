export interface Lesson {
  id: string;
  name: string;
  outcomes: string[];
}

export interface Topic {
  id: string;
  grade: '10' | '11' | '12';
  category: 'Đại số & Giải tích' | 'Hình học' | 'Thống kê & Xác suất' | 'Chuyên đề học tập';
  name: string;
  lessons: Lesson[];
}

export const HIGH_SCHOOL_MATH_SYLLABUS: Topic[] = [
  // =========================================================================
  // 📘 TOÁN 10 - CHƯƠNG TRÌNH GDPT 2018
  // =========================================================================
  {
    id: 'topic_10_menh_de_tap_hop',
    grade: '10',
    category: 'Đại số & Giải tích',
    name: 'Mệnh đề và Tập hợp',
    lessons: [
      {
        id: 'lesson_10_menh_de',
        name: 'Mệnh đề toán học',
        outcomes: [
          'Nhận biết được thế nào là một mệnh đề toán học, mệnh đề phủ định, mệnh đề kéo theo, mệnh đề đảo.',
          'Sử dụng đúng các kí hiệu với mọi (∀) và tồn tại (∃) trong các suy luận toán học.',
          'Xác định được tính đúng/sai của một mệnh đề toán học trong các trường hợp đơn giản.'
        ]
      },
      {
        id: 'lesson_10_tap_hop',
        name: 'Tập hợp và các phép toán trên tập hợp',
        outcomes: [
          'Nhận biết các khái niệm tập hợp, tập con, hai tập hợp bằng nhau, tập hợp rỗng.',
          'Thực hiện thành thạo các phép toán giao (∩), hợp (∪), hiệu (\\), phần bù của hai tập hợp.',
          'Sử dụng biểu đồ Ven và biểu diễn các khoảng, đoạn, nửa khoảng trên trục số để giải toán.'
        ]
      }
    ]
  },
  {
    id: 'topic_10_bat_phuong_trinh_bac_nhat',
    grade: '10',
    category: 'Đại số & Giải tích',
    name: 'Bất phương trình và Hệ BPT bậc nhất hai ẩn',
    lessons: [
      {
        id: 'lesson_10_bpt_bac_nhat_2_an',
        name: 'Bất phương trình bậc nhất hai ẩn',
        outcomes: [
          'Nhận biết được bất phương trình bậc nhất hai ẩn và nghiệm của nó.',
          'Biểu diễn được miền nghiệm của bất phương trình bậc nhất hai ẩn trên mặt phẳng tọa độ Oxy.'
        ]
      },
      {
        id: 'lesson_10_he_bpt_bac_nhat_2_an',
        name: 'Hệ bất phương trình bậc nhất hai ẩn',
        outcomes: [
          'Biểu diễn được miền nghiệm của hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng tọa độ.',
          'Vận dụng kiến thức về hệ bất phương trình bậc nhất hai ẩn để giải quyết bài toán quy hoạch tuyến tính thực tế (tìm GTLN, GTNN).'
        ]
      }
    ]
  },
  {
    id: 'topic_10_ham_so_bac_hai',
    grade: '10',
    category: 'Đại số & Giải tích',
    name: 'Hàm số bậc hai và Tam thức bậc hai',
    lessons: [
      {
        id: 'lesson_10_ham_so_bac_hai',
        name: 'Hàm số bậc hai và đồ thị',
        outcomes: [
          'Thiết lập bảng biến thiên và vẽ được parabol y = ax^2 + bx + c (a ≠ 0).',
          'Nhận biết tọa độ đỉnh, trục đối xứng, khoảng đồng biến/nghịch biến của hàm số bậc hai.',
          'Vận dụng hàm số bậc hai giải quyết bài toán thực tế (tối ưu hóa parabol, quỹ đạo chuyển động).'
        ]
      },
      {
        id: 'lesson_10_dau_tam_thuc',
        name: 'Dấu của tam thức bậc hai & BPT bậc hai',
        outcomes: [
          'Xét dấu của tam thức bậc hai f(x) = ax^2 + bx + c dựa vào dấu của a và biệt thức Δ.',
          'Giải được bất phương trình bậc hai một ẩn và phương trình chứa căn quy về bậc hai.'
        ]
      }
    ]
  },
  {
    id: 'topic_10_he_thuc_luong_tam_giac',
    grade: '10',
    category: 'Hình học',
    name: 'Hệ thức lượng trong tam giác',
    lessons: [
      {
        id: 'lesson_10_luong_giac_0_180',
        name: 'Giá trị lượng giác của một góc từ 0° đến 180°',
        outcomes: [
          'Nhận biết giá trị lượng giác sin, cos, tan, cot của góc từ 0° đến 180° trên nửa đường tròn đơn vị.',
          'Sử dụng các hệ thức lượng giác cơ bản và quan hệ lượng giác của hai góc bù nhau, phụ nhau.'
        ]
      },
      {
        id: 'lesson_10_he_thuc_luong',
        name: 'Định lí côsin, định lí sin và diện tích tam giác',
        outcomes: [
          'Áp dụng định lí côsin, định lí sin để tính độ dài cạnh, số đo góc trong tam giác.',
          'Vận dụng các công thức tính diện tích tam giác và giải bài toán đo đạc khoảng cách thực tế.'
        ]
      }
    ]
  },
  {
    id: 'topic_10_vecto',
    grade: '10',
    category: 'Hình học',
    name: 'Vectơ và các phép toán',
    lessons: [
      {
        id: 'lesson_10_khai_niem_vecto',
        name: 'Tổng và hiệu của hai vectơ. Tích vectơ với một số',
        outcomes: [
          'Thực hiện quy tắc ba điểm, quy tắc hình bình hành, quy tắc trung điểm và trọng tâm tam giác.',
          'Xác định điều kiện để hai vectơ cùng phương, ba điểm thẳng hàng.'
        ]
      },
      {
        id: 'lesson_10_tich_vo_huong',
        name: 'Tích vô hướng của hai vectơ',
        outcomes: [
          'Tính tích vô hướng của hai vectơ theo định nghĩa và công thức tọa độ.',
          'Tính góc giữa hai vectơ và chứng minh hai vectơ vuông góc.'
        ]
      }
    ]
  },
  {
    id: 'topic_10_oxy',
    grade: '10',
    category: 'Hình học',
    name: 'Phương pháp tọa độ trong mặt phẳng (Oxy)',
    lessons: [
      {
        id: 'lesson_10_pt_duong_thang',
        name: 'Phương trình đường thẳng',
        outcomes: [
          'Lập phương trình tổng quát, phương trình tham số của đường thẳng.',
          'Xét vị trí tương đối giữa hai đường thẳng, tính góc và khoảng cách từ một điểm đến đường thẳng.'
        ]
      },
      {
        id: 'lesson_10_pt_duong_tron',
        name: 'Phương trình đường tròn & Ba đường conic',
        outcomes: [
          'Nhận biết phương trình đường tròn, xác định tâm và bán kính; viết phương trình tiếp tuyến.',
          'Nhận biết dạng chính tắc và các yếu tố hình học của Elip, Hypebol, Parabol.'
        ]
      }
    ]
  },
  {
    id: 'topic_10_dai_so_to_hop',
    grade: '10',
    category: 'Đại số & Giải tích',
    name: 'Đại số tổ hợp & Xác suất',
    lessons: [
      {
        id: 'lesson_10_to_hop',
        name: 'Quy tắc đếm, Hoán vị, Chỉnh hợp, Tổ hợp & Nhị thức Newton',
        outcomes: [
          'Sử dụng quy tắc cộng, quy tắc nhân, sơ đồ hình cây trong các bài toán đếm.',
          'Tính số hoán vị (P_n), chỉnh hợp (A_n^k), tổ hợp (C_n^k) và khai triển nhị thức Newton bậc 4, 5.'
        ]
      },
      {
        id: 'lesson_10_xac_suat',
        name: 'Biến cố và xác suất cổ điển',
        outcomes: [
          'Xác định không gian mẫu và các biến cố.',
          'Tính xác suất của biến cố theo định nghĩa cổ điển P(A) = n(A)/n(Ω).'
        ]
      }
    ]
  },

  // =========================================================================
  // 📗 TOÁN 11 - CHƯƠNG TRÌNH GDPT 2018
  // =========================================================================
  {
    id: 'topic_11_luong_giac',
    grade: '11',
    category: 'Đại số & Giải tích',
    name: 'Hàm số lượng giác & Phương trình lượng giác',
    lessons: [
      {
        id: 'lesson_11_goc_cong_thuc_lg',
        name: 'Góc lượng giác & Công thức lượng giác',
        outcomes: [
          'Đổi đơn vị độ sang radian; sử dụng công thức cộng, công thức nhân đôi, biến đổi tích thành tổng và tổng thành tích.',
          'Rút gọn và tính giá trị biểu thức lượng giác.'
        ]
      },
      {
        id: 'lesson_11_ham_so_pt_luong_giac',
        name: 'Hàm số lượng giác & Phương trình lượng giác cơ bản',
        outcomes: [
          'Khảo sát tính tuần hoàn, tập xác định, tập giá trị, đồ thị hàm số y = sin x, cos x, tan x, cot x.',
          'Giải thành thạo các phương trình lượng giác cơ bản: sin x = m, cos x = m, tan x = m.'
        ]
      }
    ]
  },
  {
    id: 'topic_11_day_so_csc_csn',
    grade: '11',
    category: 'Đại số & Giải tích',
    name: 'Dãy số, Cấp số cộng và Cấp số nhân',
    lessons: [
      {
        id: 'lesson_11_day_so',
        name: 'Dãy số & Tính chất của dãy số',
        outcomes: [
          'Xác định số hạng tổng quát, tính tăng/giảm và bị chặn của dãy số.'
        ]
      },
      {
        id: 'lesson_11_csc_csn',
        name: 'Cấp số cộng & Cấp số nhân',
        outcomes: [
          'Nhận biết cấp số cộng (công sai d), cấp số nhân (công bội q).',
          'Vận dụng công thức số hạng tổng quát u_n và tổng n số hạng đầu S_n vào giải toán thực tế (tài chính, tăng trưởng dân số).'
        ]
      }
    ]
  },
  {
    id: 'topic_11_gioi_han_lien_tuc',
    grade: '11',
    category: 'Đại số & Giải tích',
    name: 'Giới hạn & Hàm số liên tục',
    lessons: [
      {
        id: 'lesson_11_gioi_han',
        name: 'Giới hạn dãy số & Giới hạn hàm số',
        outcomes: [
          'Tính giới hạn hữu hạn, giới hạn vô cực của dãy số và hàm số tại một điểm, tại vô cực.',
          'Khử các dạng vô định 0/0, ∞/∞, ∞ - ∞ đơn giản.'
        ]
      },
      {
        id: 'lesson_11_ham_so_lien_tuc',
        name: 'Hàm số liên tục',
        outcomes: [
          'Xét tính liên tục của hàm số tại một điểm và trên một khoảng.',
          'Ứng dụng định lí giá trị trung gian chứng minh phương trình có nghiệm.'
        ]
      }
    ]
  },
  {
    id: 'topic_11_hinh_khong_gian_song_song',
    grade: '11',
    category: 'Hình học',
    name: 'Hình học không gian - Quan hệ song song',
    lessons: [
      {
        id: 'lesson_11_dai_cuong_hkg',
        name: 'Đại cương đường thẳng và mặt phẳng',
        outcomes: [
          'Tìm giao tuyến của hai mặt phẳng, giao điểm của đường thẳng và mặt phẳng.',
          'Xác định thiết diện của hình chóp, hình chóp cụt, hình lăng trụ khi cắt bởi một mặt phẳng.'
        ]
      },
      {
        id: 'lesson_11_quan_he_song_song',
        name: 'Hai đường thẳng song song, Đường thẳng song song mặt phẳng, Hai mặt phẳng song song',
        outcomes: [
          'Chứng minh đường thẳng song song với mặt phẳng, hai mặt phẳng song song.',
          'Vận dụng định lí Ta-lét trong không gian và tính chất phép chiếu song song.'
        ]
      }
    ]
  },
  {
    id: 'topic_11_mu_logarit',
    grade: '11',
    category: 'Đại số & Giải tích',
    name: 'Hàm số mũ & Hàm số lôgarit',
    lessons: [
      {
        id: 'lesson_11_luy_thua_logarit',
        name: 'Phép tính lũy thừa và Lôgarit',
        outcomes: [
          'Tính toán thành thạo các tính chất lũy thừa với số mũ thực và công thức lôgarit (đổi cơ số).'
        ]
      },
      {
        id: 'lesson_11_ham_so_pt_mu_log',
        name: 'Hàm số, Phương trình & Bất phương trình mũ, lôgarit',
        outcomes: [
          'Khảo sát đồ thị hàm số y = a^x, y = log_a(x) (tính đồng biến, nghịch biến).',
          'Giải phương trình và bất phương trình mũ, lôgarit cơ bản và bài toán ứng dụng thực tế (lãi kép, độ pH, thang Richter).'
        ]
      }
    ]
  },
  {
    id: 'topic_11_dao_ham',
    grade: '11',
    category: 'Đại số & Giải tích',
    name: 'Đạo hàm',
    lessons: [
      {
        id: 'lesson_11_quy_tac_dao_ham',
        name: 'Định nghĩa & Các quy tắc tính đạo hàm',
        outcomes: [
          'Tính đạo hàm của các hàm số đa thức, phân thức, lượng giác, mũ, lôgarit và đạo hàm của hàm hợp.',
          'Viết phương trình tiếp tuyến của đồ thị hàm số tại một điểm, khi biết hệ số góc k.',
          'Ý nghĩa vật lí của đạo hàm: vận tốc tức thời v(t) = s\'(t), gia tốc a(t) = v\'(t).'
        ]
      }
    ]
  },
  {
    id: 'topic_11_quan_he_vuong_goc',
    grade: '11',
    category: 'Hình học',
    name: 'Hình học không gian - Quan hệ vuông góc',
    lessons: [
      {
        id: 'lesson_11_duong_vuong_goc_mat',
        name: 'Đường thẳng vuông góc với mặt phẳng. Hai mặt phẳng vuông góc',
        outcomes: [
          'Chứng minh đường thẳng vuông góc với mặt phẳng (d ⊥ a, d ⊥ b), hai mặt phẳng vuông góc.',
          'Xác định góc giữa đường thẳng và mặt phẳng, góc phẳng nhị diện giữa hai mặt phẳng.'
        ]
      },
      {
        id: 'lesson_11_khoang_cach_the_tich',
        name: 'Khoảng cách trong không gian & Khối đa diện',
        outcomes: [
          'Tính khoảng cách từ điểm đến mặt phẳng, khoảng cách giữa hai đường thẳng chéo nhau.',
          'Tính thể tích khối chóp, khối lăng trụ, khối chóp cụt đều.'
        ]
      }
    ]
  },
  {
    id: 'topic_11_xac_suat_thong_ke',
    grade: '11',
    category: 'Thống kê & Xác suất',
    name: 'Thống kê ghép nhóm & Các quy tắc xác suất',
    lessons: [
      {
        id: 'lesson_11_thong_ke_ghep_nhom',
        name: 'Các số đặc trưng đo xu thế trung tâm cho mẫu số liệu ghép nhóm',
        outcomes: [
          'Tính số trung bình, trung vị (Me), tứ phân vị (Q1, Q2, Q3), mốt (Mo) cho mẫu ghép nhóm.'
        ]
      },
      {
        id: 'lesson_11_quy_tac_xac_suat',
        name: 'Biến cố hợp, biến cố giao, độc lập & Quy tắc cộng/nhân xác suất',
        outcomes: [
          'Nhận biết hai biến cố xung khắc, hai biến cố độc lập.',
          'Áp dụng quy tắc cộng P(A ∪ B) và quy tắc nhân P(A ∩ B) = P(A).P(B).'
        ]
      }
    ]
  },

  // =========================================================================
  // 📕 TOÁN 12 - CHƯƠNG TRÌNH GDPT 2018 (ĐÃ TÍCH HỢP SẴN)
  // =========================================================================
  {
    id: 'topic_dao_ham',
    grade: '12',
    category: 'Đại số & Giải tích',
    name: 'Ứng dụng đạo hàm để khảo sát hàm số',
    lessons: [
      {
        id: 'lesson_don_dieu',
        name: 'Tính đơn điệu và cực trị của hàm số',
        outcomes: [
          'Nhận biết tính đồng biến, nghịch biến qua bảng biến thiên hoặc đồ thị.',
          'Tìm các điểm cực đại, cực tiểu và giá trị cực trị của hàm số.',
          'Khảo sát các bài toán thực tế tối ưu hóa vận tốc, chi phí, lợi nhuận.'
        ]
      },
      {
        id: 'lesson_gtln_gtnn',
        name: 'Giá trị lớn nhất, giá trị nhỏ nhất của hàm số',
        outcomes: [
          'Tìm GTLN, GTNN của hàm số trên một đoạn [a; b] hoặc khoảng.',
          'Giải quyết các bài toán tối ưu thực tế (hình học, kinh tế).'
        ]
      },
      {
        id: 'lesson_khao_sat_do_thi',
        name: 'Khảo sát và vẽ đồ thị hàm số (Bậc 3, Phân thức, Tiệm cận xiên)',
        outcomes: [
          'Xác định tiệm cận đứng, tiệm cận ngang và tiệm cận xiên của đồ thị hàm số.',
          'Nhận dạng bảng biến thiên và đồ thị hàm số bậc 3, hàm nhất biến, hàm phân thức bậc hai/bậc nhất.'
        ]
      }
    ]
  },
  {
    id: 'topic_nguyen_ham_tich_phan',
    grade: '12',
    category: 'Đại số & Giải tích',
    name: 'Nguyên hàm - Tích phân và Ứng dụng',
    lessons: [
      {
        id: 'lesson_nguyen_ham',
        name: 'Nguyên hàm và bảng nguyên hàm cơ bản',
        outcomes: [
          'Tìm nguyên hàm bằng định nghĩa, bảng nguyên hàm cơ bản và phương pháp từng phần.'
        ]
      },
      {
        id: 'lesson_tich_phan',
        name: 'Tích phân & Ứng dụng hình học (Diện tích, Thể tích)',
        outcomes: [
          'Tính tích phân bằng định nghĩa, đổi biến và từng phần.',
          'Tính diện tích hình phẳng và thể tích khối tròn xoay.'
        ]
      }
    ]
  },
  {
    id: 'topic_oxyz',
    grade: '12',
    category: 'Hình học',
    name: 'Phương pháp tọa độ trong không gian (Oxyz)',
    lessons: [
      {
        id: 'lesson_toa_do_vecto',
        name: 'Tọa độ vectơ & điểm trong không gian Oxyz',
        outcomes: [
          'Thực hiện các phép toán vectơ, tích có hướng, khoảng cách và góc trong không gian.'
        ]
      },
      {
        id: 'lesson_pt_mat_phang_duong_thang_mat_cau',
        name: 'Phương trình Mặt phẳng, Đường thẳng và Mặt cầu',
        outcomes: [
          'Viết phương trình mặt phẳng, đường thẳng và mặt cầu trong không gian Oxyz.',
          'Xét vị trí tương đối và giải bài toán khoảng cách, góc trong không gian Oxyz.'
        ]
      }
    ]
  },
  {
    id: 'topic_thong_ke_xac_suat',
    grade: '12',
    category: 'Thống kê & Xác suất',
    name: 'Thống kê ghép nhóm & Xác suất có điều kiện',
    lessons: [
      {
        id: 'lesson_thong_ke_ghep_nhom_12',
        name: 'Các số đặc trưng đo mức độ phân tán (Khoảng biến thiên, Phương sai, Độ lệch chuẩn)',
        outcomes: [
          'Tính khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn của mẫu ghép nhóm.'
        ]
      },
      {
        id: 'lesson_xac_suat_co_dieu_kien',
        name: 'Xác suất có điều kiện, Công thức xác suất toàn phần & Công thức Bayes',
        outcomes: [
          'Tính xác suất có điều kiện P(A|B) qua bảng số liệu 2x2 hoặc sơ đồ cây.',
          'Áp dụng công thức xác suất toàn phần và công thức Bayes trong bài toán thực tế (y tế, kiểm định).'
        ]
      }
    ]
  }
];