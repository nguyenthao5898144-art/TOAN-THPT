import { TestConfig, GeneratedTest, Question } from './types';
import { createDefaultTest, mutateQuestionToMakeUnique, deduplicateAllQuestions, calculateMatrixAndSummary } from './testGenerator';

/**
 * Sinh đề thi độc bản duy nhất cho từng học sinh dựa theo Ma trận của Giáo viên
 * @param config Ma trận cấu hình của đề
 * @param studentId Mã học sinh dùng làm seed ngẫu nhiên
 */
export function generateUniqueTestForStudent(config: TestConfig, studentId: string): GeneratedTest {
  // 1. Tạo bộ đề gốc theo đúng ma trận YCCĐ và mức độ nhận thức
  const baseTest = createDefaultTest(config);
  
  // 2. Tạo seed ngẫu nhiên dựa trên mã học sinh và thời gian
  let studentHash = 0;
  for (let i = 0; i < studentId.length; i++) {
    studentHash = (studentHash << 5) - studentHash + studentId.charCodeAt(i);
    studentHash |= 0;
  }
  const seed = Math.abs(studentHash) % 1000 + 1;

  // 3. Biến đổi số liệu toán học cho từng câu hỏi theo seed của học sinh
  const studentQuestions: Question[] = baseTest.questions.map((q, idx) => {
    // Hoán biến số liệu toán học để tạo đề độc bản
    const mutated = mutateQuestionToMakeUnique(q, seed + idx);
    
    // Nếu là trắc nghiệm 4 lựa chọn -> Xáo trộn vị trí A, B, C, D ngẫu nhiên
    if (mutated.type === 'multiple_choice' && Array.isArray(mutated.options)) {
      const correctOptText = mutated.options.find(o => o.key === mutated.correctAnswer)?.text || '';
      const shuffledOptionsText = [...mutated.options.map(o => o.text)].sort(() => (Math.random() > 0.5 ? 1 : -1));
      
      const newOptions = ['A', 'B', 'C', 'D'].map((key, kIdx) => ({
        key: key as 'A' | 'B' | 'C' | 'D',
        text: shuffledOptionsText[kIdx] || `Lựa chọn ${key}`
      }));
      
      const newCorrectKey = newOptions.find(o => o.text === correctOptText)?.key || 'A';
      return {
        ...mutated,
        id: `hs_${studentId}_q_${idx + 1}`,
        options: newOptions,
        correctAnswer: newCorrectKey
      };
    }

    return {
      ...mutated,
      id: `hs_${studentId}_q_${idx + 1}`
    };
  });

  // 4. Xáo trộn thứ tự các câu hỏi trong cùng một phần (Phần I, Phần II, Phần III)
  const mcq = studentQuestions.filter(q => q.type === 'multiple_choice').sort(() => (Math.random() > 0.5 ? 1 : -1));
  const tf = studentQuestions.filter(q => q.type === 'true_false').sort(() => (Math.random() > 0.5 ? 1 : -1));
  const sa = studentQuestions.filter(q => q.type === 'short_answer').sort(() => (Math.random() > 0.5 ? 1 : -1));

  const finalQuestions = [...mcq, ...tf, ...sa];
  const { matrix, summary } = calculateMatrixAndSummary(finalQuestions, config);

  return {
    id: `test_${studentId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    config: {
      ...config,
      title: `${config.title} (Mã đề: ${Math.abs(seed % 900) + 100})`
    },
    questions: finalQuestions,
    matrix,
    summary
  };
}
