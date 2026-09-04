// Kiểu dữ liệu tài khoản học sinh
export interface StudentAccount {
  id: string; // Mã học sinh (vd: "HS12A1_01")
  fullName: string; // Họ và tên học sinh
  className: string; // Lớp (vd: "12A1")
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu
}

// Cấu hình bài tập do Giáo viên giao
export interface AssignmentPackage {
  id: string;
  title: string;
  config: TestConfig;
  durationMinutes: number;
  allowedClasses: string[]; // Danh sách lớp được phép làm (vd: ["12A1", "12A2"])
  createdAt: string;
  allowReviewSolution: boolean; // Cho phép xem lời giải sau khi nộp bài
}

// Kết quả nộp bài của học sinh
export interface StudentSubmission {
  assignmentId: string;
  studentId: string;
  studentName: string;
  className: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  timeSpentSeconds: number;
  answers: {
    mcq: Record<string, string>;
    trueFalse: Record<string, Record<string, boolean>>;
    shortAnswer: Record<string, string>;
  };
}
