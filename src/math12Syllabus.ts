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

export const MATH_12_SYLLABUS: Topic[] = [
  {
    id: 'topic_dao_ham',
    name: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
    lessons: [
      {
        id: 'lesson_don_dieu',
        name: 'Tính đơn điệu của hàm số',
        outcomes: [
          'Nhận biết tính đồng biến, nghịch biến của hàm số thông qua đạo hàm.',
          'Vận dụng đạo hàm để xét tính đơn điệu của hàm số trên khoảng, đoạn.'
        ]
      },
      {
        id: 'lesson_cuc_tri',
        name: 'Cực trị của hàm số',
        outcomes: [
          'Xác định điểm cực trị, giá trị cực trị của hàm số bằng đạo hàm cấp một và cấp hai.',
          'Vận dụng bài toán cực trị vào các bài toán thực tiễn.'
        ]
      },
      {
        id: 'lesson_giatri_ln_nn',
        name: 'Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',
        outcomes: [
          'Tìm giá trị lớn nhất và giá trị nhỏ nhất của hàm số trên một đoạn, khoảng.',
          'Giải quyết các bài toán tối ưu thực tế.'
        ]
      },
      {
        id: 'lesson_duong_tiem_can',
        name: 'Đường tiệm cận của đồ thị hàm số',
        outcomes: [
          'Xác định tiệm cận đứng, tiệm cận ngang và tiệm cận xiên của đồ thị hàm số.'
        ]
      },
      {
        id: 'lesson_khao_sat_do_thi',
        name: 'Khảo sát sự biến thiên và vẽ đồ thị của hàm số',
        outcomes: [
          'Khảo sát và vẽ đồ thị của các hàm số đa thức bậc ba, bậc bốn trùng phương và phân thức hữu tỉ.',
          'Nhận dạng đồ thị hàm số từ các hệ số hoặc bảng biến thiên.'
        ]
      }
    ]
  },
  {
    id: 'topic_vecto_khong_gian_12',
    name: 'Vectơ và hệ tọa độ trong không gian',
    lessons: [
      {
        id: 'lesson_toa_do_vecto',
        name: 'Tọa độ của vectơ trong không gian',
        outcomes: [
          'Xác định tọa độ của vectơ và các phép toán vectơ trong không gian Oxyz.'
        ]
      },
      {
        id: 'lesson_bieu_thuc_toa_do',
        name: 'Biểu thức tọa độ của các phép toán vectơ',
        outcomes: [
          'Sử dụng biểu thức tọa độ để tính tích vô hướng, độ dài vectơ và góc giữa hai vectơ.'
        ]
      }
    ]
  },
  {
    id: 'topic_nguyen_ham_tich_phan',
    name: 'Nguyên hàm và Tích phân',
    lessons: [
      {
        id: 'lesson_nguyen_ham',
        name: 'Nguyên hàm',
        outcomes: [
          'Hiểu khái niệm nguyên hàm và tính chất cơ bản.',
          'Sử dụng bảng nguyên hàm các hàm số sơ cấp cơ bản.'
        ]
      },
      {
        id: 'lesson_tich_phan',
        name: 'Tích phân',
        outcomes: [
          'Hiểu định nghĩa và tính chất của tích phân.',
          'Tính tích phân bằng phương pháp đổi biến số và phương pháp tích phân từng phần.'
        ]
      },
      {
        id: 'lesson_ung_dung_tich_phan',
        name: 'Ứng dụng hình học của tích phân',
        outcomes: [
          'Tính diện tích hình phẳng và thể tích vật thể, khối tròn xoay bằng tích phân.'
        ]
      }
    ]
  },
  {
    id: 'topic_oxyz',
    name: 'Phương pháp tọa độ trong không gian Oxyz',
    lessons: [
      {
        id: 'lesson_phuong_trinh_mat_phang',
        name: 'Phương trình mặt phẳng',
        outcomes: [
          'Lập phương trình mặt phẳng khi biết một điểm và vectơ pháp tuyến hoặc các điều kiện đủ.'
        ]
      },
      {
        id: 'lesson_phuong_trinh_duong_thang_oxyz',
        name: 'Phương trình đường thẳng trong không gian',
        outcomes: [
          'Lập phương trình tham số và chính tắc của đường thẳng trong không gian Oxyz.'
        ]
      },
      {
        id: 'lesson_khoang_cach_goc_oxyz',
        name: 'Khoảng cách và góc trong không gian',
        outcomes: [
          'Tính khoảng cách từ một điểm đến mặt phẳng, đường thẳng; tính góc giữa đường thẳng và mặt phẳng.'
        ]
      }
    ]
  },
  {
    id: 'topic_thong_ke_12',
    name: 'Thống kê ứng dụng trong toán học',
    lessons: [
      {
        id: 'lesson_khoang_bien_tu_phan_vi',
        name: 'Khoảng biến thiên và khoảng tứ phân vị của mẫu số liệu ghép nhóm',
        outcomes: [
          'Tính và ý nghĩa của khoảng biến thiên, khoảng tứ phân vị cho mẫu số liệu ghép nhóm.'
        ]
      }
    ]
  },
  {
    id: 'topic_xac_suat_12',
    name: 'Xác suất có điều kiện',
    lessons: [
      {
        id: 'lesson_xac_suat_co_dieu_kien',
        name: 'Xác suất có điều kiện',
        outcomes: [
          'Hiểu khái niệm xác suất có điều kiện và vận dụng công thức nhân xác suất, công thức xác suất toàn phần.'
        ]
      }
    ]
  }
];
