export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export type CognitiveLevel = 'NhanBiet' | 'ThongHieu' | 'VanDung';

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  level: CognitiveLevel;
  learningOutcome: string;
  learningOutcomeIndex?: number;
  diagramId?: string;
  imageUrl?: string;
  tableData?: any;
  tikzCode?: string;
  tikzPrompt?: string;
  content: string; // May contain $...$ LaTeX
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  solution: string;
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  level: CognitiveLevel;
  learningOutcome: string;
  learningOutcomeIndex?: number;
  diagramId?: string;
  imageUrl?: string;
  tableData?: any;
  tikzCode?: string;
  tikzPrompt?: string;
  content: string; // Common prompt
  statements: {
    id: 'a' | 'b' | 'c' | 'd';
    text: string;
    isCorrect: boolean;
  }[];
  solution: string;
}

export interface ShortAnswerQuestion {
  id: string;
  type: 'short_answer';
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  level: CognitiveLevel;
  learningOutcome: string;
  learningOutcomeIndex?: number;
  diagramId?: string;
  imageUrl?: string;
  tableData?: any;
  tikzCode?: string;
  tikzPrompt?: string;
  content: string;
  correctAnswer: string;
  solution: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface TestMatrixItem {
  topicName: string;
  lessonName: string;
  learningOutcome: string;
  multipleChoiceCount: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
  };
  trueFalseCount: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
  };
  shortAnswerCount: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
  };
  totalPoints: number;
  percentage: number;
}

export interface LevelCounts {
  nhanBiet: number;
  thongHieu: number;
  vanDung: number;
}

export interface TestConfig {
  mode: 'kt_dinh_ky' | 'kt_cuoi_bai';
  title: string;
  schoolName: string;
  departmentName?: string;
  academicYear: string;
  durationMinutes: number;
  selectedTopicIds: string[];
  selectedLessonId?: string;
  selectedLessonIds?: string[];
  selectedOutcomes?: string[];
  counts: {
    multipleChoice: LevelCounts;
    trueFalse: LevelCounts;
    shortAnswer: LevelCounts;
  };
  outcomeMatrix?: Record<string, LevelCounts>;
  customInstructions?: string;
}

export interface TestSummary {
  totalQuestions: number;
  totalMcq: number;
  totalTrueFalse: number;
  totalShortAnswer: number;
  scoreMcq: number;
  scoreTrueFalse: number;
  scoreShortAnswer: number;
  totalScore: number;
}

export interface GeneratedTest {
  id: string;
  createdAt: string;
  config: TestConfig;
  questions: Question[];
  matrix: TestMatrixItem[];
  summary: TestSummary;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionRequested?: 'generate' | 'edit' | 'matrix' | 'export';
}
export interface StudentAccount {
  id: string;
  name: string;
  className?: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  testId?: string;
  score?: number;
  submittedAt: string;
  answers: any;
}
