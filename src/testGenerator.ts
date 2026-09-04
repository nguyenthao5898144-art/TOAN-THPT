import { TestConfig, GeneratedTest, Question } from './types';
import { math10Syllabus } from './math10Syllabus';
import { math11Syllabus } from './math11Syllabus';
import { math12Syllabus } from './math12Syllabus';

export function generateTest(config: TestConfig): GeneratedTest {
  let syllabus: any[] = [];
  if (config.grade === 10) {
    syllabus = math10Syllabus;
  } else if (config.grade === 11) {
    syllabus = math11Syllabus;
  } else if (config.grade === 12) {
    syllabus = math12Syllabus;
  } else {
    syllabus = [...math10Syllabus, ...math11Syllabus, ...math12Syllabus];
  }

  // Đảm bảo thời gian làm bài (duration) nhận giá trị tùy ý theo cấu hình từ người dùng, mặc định 90 phút nếu không truyền vào
  const durationValue = config.duration ? Number(config.duration) : 90;

  return {
    id: 'test_' + Date.now(),
    title: config.title || 'ĐỀ KIỂM TRA MÔN TOÁN (THPT)',
    duration: durationValue,
    questions: syllabus, // Giữ nguyên logic lấy dữ liệu syllabus cho các khối
    createdAt: new Date().toISOString()
  };
}
```[cite: 1]


