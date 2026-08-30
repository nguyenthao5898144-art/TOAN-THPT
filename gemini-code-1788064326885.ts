// Kiểm tra điều kiện mở/đóng đề và số lần làm bài
const currentAssignment = getStoredAssignments().find(a => a.id === assignmentId);
const submissions = getStudentSubmissions(assignmentId, currentUser?.id);
const attemptCount = submissions.length;

const now = new Date();
const isOpen = currentAssignment ? new Date(currentAssignment.openAt) <= now : true;
const isClosed = currentAssignment ? new Date(currentAssignment.closeAt) < now : false;
const isExceededAttempts = currentAssignment && currentAssignment.maxAttempts > 0 && attemptCount >= currentAssignment.maxAttempts;

// Hiển thị thông báo trạng thái tương ứng:
// - Nếu !isOpen: "Đề thi sẽ mở vào lúc [openAt]. Vui lòng quay lại sau!"
// - Nếu isClosed: "Đề thi đã đóng vào lúc [closeAt]. Bạn không thể làm bài nữa."
// - Nếu isExceededAttempts: "Bạn đã làm tối đa {maxAttempts} lần. Điểm cao nhất: {bestScore} điểm."