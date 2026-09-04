export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  level: 'NhanBiet' | 'ThongHieu' | 'VanDung';
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  learningOutcome: string;
  content: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  solution?: string;
}

export interface TestConfig {
  grade: '10' | '11' | '12';
  title: string;
  durationMinutes: number;
  schoolName?: string;
  academicYear?: string;
  className?: string;
  selectedTopics?: string[];
  selectedLessons?: string[];
}

export interface MatrixRow {
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  outcomes: string[];
  counts: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
  };
}

export interface GeneratedTest {
  id: string;
  createdAt: string;
  config: TestConfig;
  questions: Question[];
  matrix: MatrixRow[];
  summary: {
    totalQuestions: number;
    totalMcq: number;
    totalTrueFalse: number;
    totalShortAnswer: number;
    scoreMcq: number;
    scoreTrueFalse: number;
    scoreShortAnswer: number;
    totalScore: number;
  };
}

export interface StudentAccount {
  id: string;
  name: string;
  code: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  testId: string;
  answers: Record<string, string>;
  score: number;
  submittedAt: string;
}
