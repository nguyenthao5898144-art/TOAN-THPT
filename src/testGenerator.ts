import { GeneratedTest, Question } from './types';
import { MATH_11_SYLLABUS } from './math11Syllabus';

export function getSyllabusForGrade(grade: string) {
  return MATH_11_SYLLABUS;
}

export function sanitizeQuestionMath(text: string): string {
  if (!text) return '';
  return text;
}

export const MATH_10_QUESTIONS: Question[] = [];

export const MATH_11_QUESTIONS: Question[] = [
  {
    id: 'q10_22',
    type: 'short_answer',
    level: 'VanDung',
    topicId: 'topic_dai_so',
    topicName: 'Mệnh đề và Tập hợp',
    lessonId: 'lesson_tap_hop',
    lessonName: 'Số nguyên trên trục số',
    learningOutcome: 'YCCĐ 3',
    content: 'Có bao nhiêu số nguyên S thuộc tập hợp giao giữa SA và SB biết SA = (-5; 3) và SB = [2; 5]?',
    correctAnswer: '4',
    solution: 'Giải chi tiết...'
  }
];

export const MATH_12_QUESTIONS: Question[] = [];

export function createDefaultTest(config: any): GeneratedTest {
  return {
    id: 'test_' + Date.now(),
    createdAt: new Date().toISOString(),
    config,
    questions: MATH_11_QUESTIONS,
    matrix: [],
    summary: {
      totalQuestions: MATH_11_QUESTIONS.length,
      totalMcq: 0,
      totalTrueFalse: 0,
      totalShortAnswer: MATH_11_QUESTIONS.length,
      scoreMcq: 0,
      scoreTrueFalse: 0,
      scoreShortAnswer: MATH_11_QUESTIONS.length * 0.5,
      totalScore: MATH_11_QUESTIONS.length * 0.5,
    }
  };
}

export function generateTest(config: any): GeneratedTest {
  return createDefaultTest(config);
}
