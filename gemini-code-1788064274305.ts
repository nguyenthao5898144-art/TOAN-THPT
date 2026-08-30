// 1. Tài khoản học sinh
export interface StudentAccount {
  id: string; // Mã học sinh (vd: "HS_0912345678")
  fullName: string; // Họ và tên học sinh
  phone: string; // Số điện thoại (dùng làm Username & Mật khẩu mặc định)
  className: string; // Tên lớp (vd: "12A1")
  username: string; // Tên đăng nhập (Số điện thoại)
  password?: string; // Mật khẩu (mặc định là số điện thoại hoặc 123)
  createdAt: string;
}

// 2. Lớp học
export interface ClassRoom {
  id: string;
  name: string; // vd: "12A1"
  academicYear: string; // vd: "2026 - 2027"
  students: StudentAccount[];
  createdAt: string;
}

// 3. Cấu hình bài tập giao cho học sinh
export interface Assignment {
  id: string;
  title: string; // Tiêu đề bài kiểm tra
  config: TestConfig; // Ma trận cấu hình đề thi
  openAt: string; // Thời gian mở đề (ISO string hoặc YYYY-MM-DDTHH:mm)
  closeAt: string; // Thời gian đóng đề (Hạn nộp)
  durationMinutes: number; // Thời gian làm bài (phút, vd: 15, 45, 90)
  maxAttempts: number; // Số lần làm bài tối đa (1, 2, 3... hoặc 0 = Không giới hạn)
  targetType: 'class' | 'specific_students'; // Giao theo Lớp hoặc Học sinh cụ thể
  targetClasses: string[]; // Danh sách lớp được giao (vd: ["12A1", "12A2"])
  targetStudentIds: string[]; // Danh sách mã học sinh cụ thể (nếu chọn specific_students)
  allowReviewSolution: boolean; // Cho phép xem lời giải sau khi nộp
  createdAt: string;
}

// 4. Lịch sử bài làm của học sinh
export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  className: string;
  attemptNumber: number; // Lần làm thứ mấy (1, 2...)
  score: number; // Điểm số / 10.0
  totalQuestions: number;
  submittedAt: string;
  timeSpentSeconds: number;
  answers: {
    mcq: Record<string, string>;
    trueFalse: Record<string, Record<string, boolean>>;
    shortAnswer: Record<string, string>;
  };
}