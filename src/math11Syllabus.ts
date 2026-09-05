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
];
