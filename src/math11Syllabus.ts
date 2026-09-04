export interface Lesson {
  id: string;
  name: string;
  outcomes: string[];
}

export interface Topic {
  id: string;
  name: string;
  lessons: Lesson[];
}

export const MATH_11_SYLLABUS: Topic[] = [
  {
    id: 'topic_luong_giac',
    name: 'Hàm số lượng giác và phương trình lượng giác',
    lessons: [
      {
        id: 'lesson_goc_luong_giac',
        name: 'Góc lượng giác. Giá trị lượng giác của góc lượng giác',
        outcomes: [
          'Nhận biết góc lượng giác và đơn vị đo độ, radian.',
          'Biểu diễn góc lượng giác trên đường tròn lượng giác.',
          'Tính giá trị lượng giác của góc lượng giác.'
        ]
      },
      {
        id: 'lesson_cong_thuc_luong_giac',
        name: 'Các công thức lượng giác',
        outcomes: [
          'Sử dụng các công thức lượng giác (công thức cộng, công thức nhân đôi, công thức biến đổi tích thành tổng và tổng thành tích).',
          'Rút gọn biểu thức và chứng minh đẳng thức lượng giác.'
        ]
      },
      {
        id: 'lesson_ham_so_luong_giac',
        name: 'Hàm số lượng giác và đồ thị',
        outcomes: [
          'Nhận biết các hàm số lượng giác (sin, cos, tan, cot).',
          'Vẽ và nhận dạng đồ thị của các hàm số lượng giác.',
          'Xác định tập xác định, tập giá trị, tính tuần hoàn, chẵn lẻ của hàm số lượng giác.'
        ]
      },
      {
        id: 'lesson_phuong_trinh_luong_giac',
        name: 'Phương trình lượng giác cơ bản',
        outcomes: [
          'Giải thành thạo các phương trình lượng giác cơ bản: sin x = m, cos x = m, tan x = m, cot x = m.',
          'Vận dụng giải một số phương trình lượng giác đưa về dạng cơ bản.'
        ]
      }
    ]
  },
  {
    id: 'topic_day_so',
    name: 'Dãy số. Cấp số cộng và cấp số nhân',
    lessons: [
      {
        id: 'lesson_day_so',
        name: 'Dãy số',
        outcomes: [
          'Nhận biết dãy số hữu hạn, vô hạn.',
          'Xác định số hạng của dãy số bằng công thức tổng quát hoặc hệ thức truy hồi.'
        ]
      },
      {
        id: 'lesson_cap_so_cong',
        name: 'Cấp số cộng',
        outcomes: [
          'Nhận biết cấp số cộng và công sai.',
          'Sử dụng công thức số hạng tổng quát và tổng n số hạng đầu tiên của cấp số cộng.'
        ]
      },
      {
        id: 'lesson_cap_so_nhan',
        name: 'Cấp số nhân',
        outcomes: [
          'Nhận biết cấp số nhân và công bội.',
          'Sử dụng công thức số hạng tổng quát và tổng n số hạng đầu tiên của cấp số nhân.'
        ]
      }
    ]
  },
  {
    id: 'topic_gioi_han',
    name: 'Giới hạn. Hàm số liên tục',
    lessons: [
      {
        id: 'lesson_gioi_han_day_so',
        name: 'Giới hạn của dãy số',
        outcomes: [
          'Nhận biết giới hạn hữu hạn và vô cực của dãy số.',
          'Vận dụng các định lý và quy tắc tính giới hạn của dãy số.'
        ]
      },
      {
        id: 'lesson_gioi_han_ham_so',
        name: 'Giới hạn của hàm số',
        outcomes: [
          'Nhận biết giới hạn hữu hạn và vô cực của hàm số tại một điểm và tại vô cực.',
          'Tính giới hạn dạng vô định đơn giản (0/0).'
        ]
      },
      {
        id: 'lesson_ham_so_lien_tuc',
        name: 'Hàm số liên tục',
        outcomes: [
          'Nhận biết hàm số liên tục tại một điểm và trên một khoảng.',
          'Vận dụng tính liên tục của hàm số để chứng minh sự tồn tại nghiệm của phương trình.'
        ]
      }
    ]
  },
  {
    id: 'topic_dao_ham',
    name: 'Đạo hàm',
    lessons: [
      {
        id: 'lesson_dinh_nghia_dao_ham',
        name: 'Đạo hàm và ý nghĩa của đạo hàm',
        outcomes: [
          'Hiểu định nghĩa đạo hàm tại một điểm và ý nghĩa hình học, vật lý của đạo hàm.'
        ]
      },
      {
        id: 'lesson_quy_tac_tinh_dao_ham',
        name: 'Các quy tắc tính đạo hàm',
        outcomes: [
          'Sử dụng thành thạo các quy tắc tính đạo hàm của tổng, hiệu, tích, thương và hàm hợp.',
          'Tính đạo hàm các hàm số sơ cấp cơ bản (đa thức, lượng giác).'
        ]
      },
      {
        id: 'lesson_tiep_tuyen',
        name: 'Đạo hàm cấp hai và phương trình tiếp tuyến',
        outcomes: [
          'Viết phương trình tiếp tuyến của đồ thị hàm số.',
          'Tính đạo hàm cấp hai.'
        ]
      }
    ]
  },
  {
    id: 'topic_hinh_khong_gian_11',
    name: 'Quan hệ song song trong không gian',
    lessons: [
      {
        id: 'lesson_duong_thang_mat_phang',
        name: 'Điểm, đường thẳng và mặt phẳng trong không gian',
        outcomes: [
          'Nắm vững các tính chất thừa nhận của hình học không gian.',
          'Xác định giao tuyến của hai mặt phẳng và giao điểm của đường thẳng với mặt phẳng.'
        ]
      },
      {
        id: 'lesson_hai_duong_thang_song_song',
        name: 'Hai đường thẳng song song trong không gian',
        outcomes: [
          'Nhận biết vị trí tương đối của hai đường thẳng trong không gian.',
          'Xác định giao tuyến bằng định lý về giao tuyến song song.'
        ]
      },
      {
        id: 'lesson_duong_thang_mat_phang_song_song',
        name: 'Đường thẳng và mặt phẳng song song',
        outcomes: [
          'Xác định tính song song giữa đường thẳng và mặt phẳng.',
          'Xác định thiết diện của hình chóp cắt bởi mặt phẳng song song.'
        ]
      },
      {
        id: 'lesson_hai_mat_phang_song_song',
        name: 'Hai mặt phẳng song song',
        outcomes: [
          'Nhận biết hai mặt phẳng song song và áp dụng định lý Thales trong không gian.'
        ]
      }
    ]
  },
  {
    id: 'topic_quan_he_vuong_góc',
    name: 'Quan hệ vuông góc trong không gian',
    lessons: [
      {
        id: 'lesson_hai_duong_thang_vuong_góc',
        name: 'Hai đường thẳng vuông góc trong không gian',
        outcomes: [
          'Xác định góc giữa hai đường thẳng trong không gian.',
          'Chứng minh hai đường thẳng vuông góc.'
        ]
      },
      {
        id: 'lesson_duong_thang_vuong_góc_mat_phang',
        name: 'Đường thẳng vuông góc với mặt phẳng',
        outcomes: [
          'Chứng minh đường thẳng vuông góc với mặt phẳng, áp dụng định lý ba đường vuông góc.',
          'Xác định và tính góc giữa đường thẳng và mặt phẳng.'
        ]
      },
      {
        id: 'lesson_hai_mat_phang_vuong_góc',
        name: 'Hai mặt phẳng vuông góc',
        outcomes: [
          'Chứng minh hai mặt phẳng vuông góc, xác định và tính góc giữa hai mặt phẳng.',
          'Tính khoảng cách từ một điểm đến đường thẳng, mặt phẳng.'
        ]
      }
    ]
  },
  {
    id: 'topic_thong_ke_11',
    name: 'Thống kê và Xác suất lớp 11',
    lessons: [
      {
        id: 'lesson_mau_so_lieu_ghep_nhom',
        name: 'Mẫu số liệu ghép nhóm',
        outcomes: [
          'Tính các số đặc trưng đo xu thế trung tâm cho mẫu số liệu ghép nhóm (số trung bình, mốt, trung vị, tứ phân vị).'
        ]
      },
      {
        id: 'lesson_bien_co_giao_hop',
        name: 'Biến cố giao và biến cố hợp. Xác suất của biến cố',
        outcomes: [
          'Mô tả không gian mẫu và biến cố giao, hợp.',
          'Tính xác suất của biến cố bằng phương pháp tổ hợp hoặc quy tắc cộng/nhân xác suất.'
        ]
      }
    ]
  }
];
