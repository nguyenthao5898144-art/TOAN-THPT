export interface Lesson {
  id: string;
  name: string;
  outcomes: string[];
}

export interface Topic {
  id: string;
  category: 'Giải Tích' | 'Hình Học' | 'Thống Kê & Xác Suất' | 'Chuyên Đề Học Tập';
  name: string;
  lessons: Lesson[];
}

export const MATH_12_SYLLABUS: Topic[] = [
  {
    id: 'topic_dao_ham',
    category: 'Giải Tích',
    name: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
    lessons: [
      {
        id: 'lesson_don_dieu',
        name: 'Tính đơn điệu của hàm số',
        outcomes: [
          'Nhận biết được tính đồng biến, nghịch biến của một hàm số trên một khoảng dựa vào dấu của đạo hàm cấp một của nó.',
          'Thể hiện được tính đồng biến, nghịch biến của hàm số trong bảng biến thiên.',
          'Nhận biết được tính đơn điệu, điểm cực trị, giá trị cực trị của hàm số thông qua bảng biến thiên hoặc thông qua hình ảnh hình học của đồ thị hàm số.'
        ]
      },
      {
        id: 'lesson_gtln_gtnn',
        name: 'Giá trị lớn nhất, giá trị nhỏ nhất của hàm số',
        outcomes: [
          'Nhận biết được giá trị lớn nhất, giá trị nhỏ nhất của hàm số trên một tập xác định cho trước.',
          'Xác định được giá trị lớn nhất, giá trị nhỏ nhất của hàm số bằng đạo hàm trong những trường hợp đơn giản.'
        ]
      },
      {
        id: 'lesson_khao_sat_do_thi',
        name: 'Khảo sát và vẽ đồ thị của hàm số',
        outcomes: [
          'Nhận biết được hình ảnh hình học của đường tiệm cận ngang, đường tiệm cận đứng, đường tiệm cận xiên của đồ thị hàm số.',
          'Mô tả được sơ đồ tổng quát để khảo sát hàm số (tìm tập xác định, xét chiều biến thiên, tìm cực trị, tìm tiệm cận, lập bảng biến thiên, vẽ đồ thị).',
          'Khảo sát được tập xác định, chiều biến thiên, cực trị, tiệm cận, bảng biến thiên và vẽ đồ thị của các hàm số y = ax³ + bx² + cx + d, y = (ax+b)/(cx+d), y = (ax²+bx+c)/(mx+n).',
          'Nhận biết được tính đối xứng (trục đối xứng, tâm đối xứng) của đồ thị các hàm số trên.'
        ]
      },
      {
        id: 'lesson_ung_dung_thuc_tien_dh',
        name: 'Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn',
        outcomes: [
          'Vận dụng được đạo hàm và khảo sát hàm số để giải quyết một số vấn đề liên quan đến thực tiễn (khoảng cách, chi phí, tối ưu hoá lợi nhuận).'
        ]
      }
    ]
  },
  {
    id: 'topic_nguyen_ham_tich_phan',
    category: 'Giải Tích',
    name: 'Nguyên hàm và Tích phân',
    lessons: [
      {
        id: 'lesson_nguyen_ham',
        name: 'Nguyên hàm. Bảng nguyên hàm của một số hàm số sơ cấp',
        outcomes: [
          'Nhận biết được khái niệm nguyên hàm của một hàm số.',
          'Giải thích được tính chất cơ bản của nguyên hàm.',
          'Xác định được nguyên hàm của một số hàm số sơ cấp như: y=x^α, y=1/x, y=sin x, y=cos x, y=1/cos² x, y=1/sin² x, y=a^x, y=e^x.',
          'Tính được nguyên hàm trong những trường hợp đơn giản.'
        ]
      },
      {
        id: 'lesson_tich_phan',
        name: 'Tích phân. Ứng dụng hình học của tích phân',
        outcomes: [
          'Nhận biết được định nghĩa và các tính chất của tích phân.',
          'Tính được tích phân trong những trường hợp đơn giản.',
          'Sử dụng được tích phân để tính diện tích của một số hình phẳng, thể tích của một số hình khối.',
          'Vận dụng được tích phân để giải một số bài toán có liên quan đến thực tiễn.'
        ]
      }
    ]
  },
  {
    id: 'topic_oxyz',
    category: 'Hình Học',
    name: 'Phương pháp tọa độ trong không gian (Oxyz)',
    lessons: [
      {
        id: 'lesson_toa_do_vecto',
        name: 'Tọa độ của vectơ đối với hệ trục tọa độ Oxyz',
        outcomes: [
          'Nhận biết được vectơ và các phép toán vectơ trong không gian (tổng, hiệu, tích với số, tích vô hướng).',
          'Nhận biết được tọa độ của một vectơ đối với hệ trục tọa độ.',
          'Xác định được độ dài của một vectơ khi biết tọa độ hai đầu mút và biểu thức tọa độ của các phép toán vectơ.',
          'Vận dụng tọa độ của vectơ để giải một số bài toán liên quan đến thực tiễn.'
        ]
      },
      {
        id: 'lesson_pt_mat_phang',
        name: 'Phương trình mặt phẳng',
        outcomes: [
          'Nhận biết được phương trình tổng quát của mặt phẳng.',
          'Thiết lập phương trình tổng quát của mặt phẳng trong hệ trục tọa độ Oxyz theo ba cách cơ bản (qua 1 điểm & VTPT, qua 1 điểm & cặp VTCP, qua 3 điểm).',
          'Thiết lập điều kiện để hai mặt phẳng song song, vuông góc.',
          'Tính khoảng cách từ một điểm đến một mặt phẳng bằng phương pháp tọa độ.',
          'Vận dụng kiến thức phương trình mặt phẳng giải một số bài toán thực tiễn.'
        ]
      },
      {
        id: 'lesson_pt_duong_thang',
        name: 'Phương trình đường thẳng trong không gian',
        outcomes: [
          'Nhận biết được phương trình chính tắc, phương trình tham số, VTCP của đường thẳng.',
          'Thiết lập phương trình đường thẳng qua 1 điểm & VTCP, hoặc qua 2 điểm.',
          'Xác định điều kiện để 2 đường thẳng chéo nhau, cắt nhau, song song hoặc vuông góc.',
          'Thiết lập công thức tính góc giữa 2 đường thẳng, giữa đường thẳng và mặt phẳng, giữa 2 mặt phẳng.',
          'Vận dụng phương trình đường thẳng trong không gian giải bài toán thực tiễn.'
        ]
      },
      {
        id: 'lesson_pt_mat_cau',
        name: 'Phương trình mặt cầu',
        outcomes: [
          'Nhận biết được phương trình mặt cầu, xác định tâm và bán kính.',
          'Thiết lập phương trình mặt cầu khi biết tâm và bán kính.',
          'Vận dụng kiến thức phương trình mặt cầu để giải bài toán thực tiễn.'
        ]
      }
    ]
  },
  {
    id: 'topic_thong_ke_xac_suat',
    category: 'Thống Kê & Xác Suất',
    name: 'Thống kê và Xác suất lớp 12',
    lessons: [
      {
        id: 'lesson_thong_ke_ghep_nhom',
        name: 'Các số đặc trưng của mẫu số liệu ghép nhóm',
        outcomes: [
          'Tính được các số đặc trưng đo mức độ phân tán mẫu số liệu ghép nhóm: khoảng biến thiên, khoảng tứ phân vị, phương sai, độ lệch chuẩn.',
          'Giải thích ý nghĩa và vai trò của các số đặc trưng mẫu số liệu trong thực tiễn.',
          'Chỉ ra những kết luận nhờ ý nghĩa của các số đặc trưng trong trường hợp đơn giản.'
        ]
      },
      {
        id: 'lesson_xac_suat_co_dieu_kien',
        name: 'Xác suất có điều kiện. Các quy tắc tính xác suất',
        outcomes: [
          'Nhận biết khái niệm và ý nghĩa của xác suất có điều kiện trong thực tiễn.',
          'Mô tả công thức xác suất toàn phần, công thức Bayes qua bảng 2x2 và sơ đồ hình cây.',
          'Sử dụng công thức Bayes và sơ đồ hình cây để tính xác suất có điều kiện và vận dụng vào bài toán thực tiễn.'
        ]
      }
    ]
  },
  {
    id: 'topic_chuyen_de_12',
    category: 'Chuyên Đề Học Tập',
    name: 'Chuyên đề học tập Toán 12',
    lessons: [
      {
        id: 'lesson_chuyen_de_12_1',
        name: 'Chuyên đề 12.1: Biến ngẫu nhiên rời rạc & Phân bố nhị thức',
        outcomes: [
          'Nhận biết biến ngẫu nhiên rời rạc, phân bố XS, kỳ vọng, phương sai, độ lệch chuẩn.',
          'Lập và đọc bảng phân bố xác suất của biến ngẫu nhiên rời rạc.',
          'Nhận biết phép thử lặp, công thức Bernoulli, phân bố nhị thức và ứng dụng thực tiễn.'
        ]
      },
      {
        id: 'lesson_chuyen_de_12_2',
        name: 'Chuyên đề 12.2: Ứng dụng toán học để giải quyết một số bài toán tối ưu',
        outcomes: [
          'Vận dụng hệ bất phương trình bậc nhất để giải quyết bài toán quy hoạch tuyến tính.',
          'Vận dụng đạo hàm để giải quyết bài toán tối ưu thực tiễn (khoảng cách, thời gian, chi phí, lợi nhuận).'
        ]
      },
      {
        id: 'lesson_chuyen_de_12_3',
        name: 'Chuyên đề 12.3: Ứng dụng toán học trong tài chính & đầu tư',
        outcomes: [
          'Thiết lập kế hoạch tài chính cá nhân cho các nhu cầu dài hạn.',
          'Tính lãi suất tiết kiệm, tính đến lạm phát, lãi suất thẻ tín dụng.',
          'Vận dụng kiến thức toán học (tỉ số, phần trăm, đạo hàm, cực trị) trong việc giải quyết bài toán đầu tư và vay nợ.'
        ]
      }
    ]
  }
];
