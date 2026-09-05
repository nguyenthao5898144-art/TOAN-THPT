import { Topic } from './types';
import { MATH_10_SYLLABUS } from './math10Syllabus';
import { MATH_11_SYLLABUS } from './math11Syllabus';

export { MATH_10_SYLLABUS } from './math10Syllabus';
export { MATH_11_SYLLABUS } from './math11Syllabus';

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

// Hàm trích xuất ngân hàng chương trình theo khối lớp an toàn tuyệt đối
export function getSyllabusByGrade(grade: string | number): Topic[] {
  const gStr = String(grade);
  if (gStr === '10') return MATH_10_SYLLABUS;
  if (gStr === '11') return MATH_11_SYLLABUS;
  return MATH_12_SYLLABUS;
}
