import { ClassRoom, StudentAccount, Assignment, StudentSubmission } from '../types';

const CLASS_STORAGE_KEY = 'math12_classroom_database_v1';
const ASSIGNMENT_STORAGE_KEY = 'math12_assignments_database_v1';
const SUBMISSION_STORAGE_KEY = 'math12_submissions_database_v1';

// Lấy danh sách lớp học
export function getStoredClasses(): ClassRoom[] {
  try {
    const raw = localStorage.getItem(CLASS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Dữ liệu mẫu lớp ban đầu
  return [
    {
      id: 'class_12a1',
      name: '12A1',
      academicYear: '2026 - 2027',
      createdAt: new Date().toISOString(),
      students: [
        { id: 'HS_0912345671', fullName: 'Nguyễn Văn An', phone: '0912345671', className: '12A1', username: '0912345671', password: '123', createdAt: new Date().toISOString() },
        { id: 'HS_0912345672', fullName: 'Trần Thị Mai', phone: '0912345672', className: '12A1', username: '0912345672', password: '123', createdAt: new Date().toISOString() },
        { id: 'HS_0912345673', fullName: 'Lê Hoàng Nam', phone: '0912345673', className: '12A1', username: '0912345673', password: '123', createdAt: new Date().toISOString() }
      ]
    }
  ];
}

export function saveClasses(classes: ClassRoom[]): void {
  localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(classes));
}

// Hàm phân tích danh sách học sinh từ nội dung văn bản / file Excel sao chép
// Hỗ trợ các định dạng: STT | Họ và tên | Lớp | Số điện thoại
export function parseStudentListText(rawText: string, defaultClassName: string = '12A1'): StudentAccount[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const students: StudentAccount[] = [];

  lines.forEach((line, idx) => {
    // Bỏ qua dòng tiêu đề nếu có
    if (/^(stt|họ|tên|sđt|số điện thoại|lớp)/i.test(line)) return;

    // Tách theo dấu tab (khi copy từ Excel), dấu phẩy hoặc dấu gạch đứng |
    const parts = line.includes('\t') 
      ? line.split('\t').map(s => s.trim())
      : line.includes(';') 
      ? line.split(';').map(s => s.trim())
      : line.includes(',') 
      ? line.split(',').map(s => s.trim())
      : line.split(/\s{2,}/).map(s => s.trim());

    if (parts.length >= 2) {
      let fullName = '';
      let phone = '';
      let className = defaultClassName;

      // Nhận diện cột số điện thoại (chuỗi từ 9-11 chữ số)
      const phoneIdx = parts.findIndex(p => /^(0|\+84)[0-9]{8,10}$/.test(p.replace(/[\s\.\-]/g, '')));
      if (phoneIdx !== -1) {
        phone = parts[phoneIdx].replace(/[\s\.\-]/g, '');
        // Các cột còn lại là Tên và Lớp
        const remaining = parts.filter((_, i) => i !== phoneIdx && !/^\d+$/.test(parts[i]));
        fullName = remaining[0] || `Học sinh ${idx + 1}`;
        if (remaining) className = remaining;
      } else {
        // Mặc định: Cột 1 Tên, Cột 2 Số điện thoại (hoặc Cột 2 Lớp, Cột 3 SĐT)
        fullName = parts[0];
        phone = parts?.replace(/[^0-9]/g, '') || `09000000${String(idx + 1).padStart(2, '0')}`;
        if (parts[2]) className = parts[2];
      }

      const cleanPhone = phone || `09000000${String(idx + 1).padStart(2, '0')}`;
      students.push({
        id: `HS_${cleanPhone}`,
        fullName: fullName.replace(/^\d+[\.\s\-]+/, '').trim(),
        phone: cleanPhone,
        className: className || defaultClassName,
        username: cleanPhone,
        password: cleanPhone.slice(-4) || '123', // Mật khẩu là 4 số cuối SĐT hoặc 123
        createdAt: new Date().toISOString()
      });
    }
  });

  return students;
}

// Lưu & Lấy danh sách Bài tập đã giao
export function getStoredAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveAssignment(assignment: Assignment): void {
  const current = getStoredAssignments();
  const updated = [assignment, ...current.filter(a => a.id !== assignment.id)];
  localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(updated));
}

// Lấy lịch sử nộp bài của học sinh
export function getStudentSubmissions(assignmentId?: string, studentId?: string): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSION_STORAGE_KEY);
    if (raw) {
      let list: StudentSubmission[] = JSON.parse(raw);
      if (assignmentId) list = list.filter(s => s.assignmentId === assignmentId);
      if (studentId) list = list.filter(s => s.studentId === studentId);
      return list;
    }
  } catch {}
  return [];
}