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

export const MATH_10_SYLLABUS: Topic[] = [
  {
    id: 'topic_menh_de_tap_hop_10',
    name: 'Mệnh đề và Tập hợp',
    lessons: [
      {
        id: 'lesson_menh_de',
        name: 'Mệnh đề toán học',
        outcomes: [
          'Nhận biết mệnh đề và mệnh đề chứa biến.',
          'Xác định tính đúng sai của mệnh đề trong những trường hợp đơn giản.'
        ]
      },
      {
        id: 'lesson_tap_hop_10',
        name: 'Tập hợp và các phép toán trên tập hợp',
        outcomes: [
          'Sử dụng các ký hiệu tập hợp và các phép toán giao, hợp, hiệu, phần bù.',
          'Vận dụng tập hợp vào giải quyết bài toán thực tiễn.'
        ]
      }
    ]
  },
  {
    id: 'topic_bat_phuong_trinh_10',
    name: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    lessons: [
      {
        id: 'lesson_bpt_bac_nhat_hai_an',
        name: 'Bất phương trình bậc nhất hai ẩn',
        outcomes: [
          'Nhận biết bất phương trình bậc nhất hai ẩn.',
          'Biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn trên mặt phẳng tọa độ.'
        ]
      },
      {
        id: 'lesson_he_bpt_bac_nhat_hai_an',
        name: 'Hệ bất phương trình bậc nhất hai ẩn',
        outcomes: [
          'Nhận biết hệ bất phương trình bậc nhất hai ẩn.',
          'Giải bài toán tối ưu hóa đơn giản bằng phương pháp đồ thị.'
        ]
      }
    ]
  },
  {
    id: 'topic_ham_so_bac_hai_10',
    name: 'Hàm số bậc hai và đồ thị',
    lessons: [
      {
        id: 'lesson_ham_so_va_do_thi',
        name: 'Hàm số và đồ thị',
        outcomes: [
          'Hiểu khái niệm hàm số, tập xác định, tập giá trị.',
          'Nhận biết tính đồng biến, nghịch biến của hàm số.'
        ]
      },
      {
        id: 'lesson_ham_so_bac_hai',
        name: 'Hàm số bậc hai y = ax^2 + bx + c',
        outcomes: [
          'Vẽ và nhận dạng đồ thị hàm số bậc hai.',
          'Xác định tọa độ đỉnh, trục đối xứng và giá trị lớn nhất, nhỏ nhất của hàm số bậc hai.'
        ]
      }
    ]
  },
  {
    id: 'topic_he_thuc_luong_10',
    name: 'Hệ thức lượng trong tam giác',
    lessons: [
      {
        id: 'lesson_gia_tri_luong_giac_0_180',
        name: 'Giá trị lượng giác của một góc từ 0° đến 180°',
        outcomes: [
          'Xác định giá trị lượng giác của một góc từ 0° đến 180°.',
          'Áp dụng các hệ thức liên hệ giữa các giá trị lượng giác phụ nhau, bù nhau.'
        ]
      },
      {
        id: 'lesson_dinh_ly_cosin_sin',
        name: 'Định lý côsin và định lý sin trong tam giác',
        outcomes: [
          'Vận dụng định lý côsin và định lý sin để giải tam giác.',
          'Tính diện tích tam giác.'
        ]
      }
    ]
  },
  {
    id: 'topic_vecto_10',
    name: 'Vectơ',
    lessons: [
      {
        id: 'lesson_khai_niem_vecto',
        name: 'Các khái niệm mở đầu về vectơ',
        outcomes: [
          'Nhận biết vectơ, độ dài vectơ, hai vectơ cùng phương, cùng hướng, bằng nhau.'
        ]
      },
      {
        id: 'lesson_tong_hieu_vecto',
        name: 'Tổng và hiệu của hai vectơ',
        outcomes: [
          'Thực hiện các phép toán cộng, trừ vectơ và tính chất.'
        ]
      },
      {
        id: 'lesson_tich_vecto_voi_mot_so',
        name: 'Tích của một số với một vectơ',
        outcomes: [
          'Thực hiện phép nhân vectơ với một số.',
          'Ứng dụng vectơ để chứng minh tính thẳng hàng và trung điểm.'
        ]
      },
      {
        id: 'lesson_tich_vo_huong',
        name: 'Tích vô hướng của hai vectơ',
        outcomes: [
          'Tính tích vô hướng của hai vectơ.',
          'Ứng dụng tính góc giữa hai vectơ và chứng minh vuông góc.'
        ]
      }
    ]
  },
  {
    id: 'topic_thong_ke_10',
    name: 'Thống kê',
    lessons: [
      {
        id: 'lesson_so_lieu_thong_ke',
        name: 'Số liệu thống kê. Các số đặc trưng đo xu thế trung tâm',
        outcomes: [
          'Thu thập, phân loại số liệu.',
          'Tính số trung bình, trung vị, mốt, tứ phân vị và độ lệch chuẩn, phương sai.'
        ]
      }
    ]
  },
  {
    id: 'topic_phuong_phap_toa_do_oxy_10',
    name: 'Phương pháp tọa độ trong mặt phẳng (Oxy)',
    lessons: [
      {
        id: 'lesson_toa_do_cua_vecto_diem',
        name: 'Tọa độ của vectơ và của điểm',
        outcomes: [
          'Xác định tọa độ của vectơ, tọa độ của điểm trên mặt phẳng Oxy.'
        ]
      },
      {
        id: 'lesson_phuong_trinh_duong_thang',
        name: 'Phương trình đường thẳng',
        outcomes: [
          'Lập phương trình tổng quát và phương trình tham số của đường thẳng.',
          'Tính góc giữa hai đường thẳng và khoảng cách từ một điểm đến đường thẳng.'
        ]
      },
      {
        id: 'lesson_phuong_trinh_duong_tron',
        name: 'Phương trình đường tròn',
        outcomes: [
          'Lập phương trình đường tròn khi biết tâm và bán kính hoặc các điều kiện cho trước.'
        ]
      }
    ]
  },
  {
    id: 'topic_dai_so_to_hop_xac_suat_10',
    name: 'Đại số tổ hợp và Xác suất',
    lessons: [
      {
        id: 'lesson_quy_tac_dem',
        name: 'Quy tắc đếm. Hoán vị, chỉnh hợp, tổ hợp',
        outcomes: [
          'Áp dụng quy tắc cộng và quy tắc nhân.',
          'Tính số hoán vị, chỉnh hợp, tổ hợp.'
        ]
      },
      {
        id: 'lesson_xac_suat_bien_co_10',
        name: 'Biến cố và định nghĩa cổ điển của xác suất',
        outcomes: [
          'Mô tả không gian mẫu và biến cố.',
          'Tính xác suất của biến cố theo định nghĩa cổ điển.'
        ]
      }
    ]
  }
];
