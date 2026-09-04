import { GeneratedTest, Question } from './types';
import { getSyllabusForGrade } from './testGenerator';

export function buildStandardMatrixData(test: GeneratedTest) {
  const grade = test.config?.grade || '12';
  const syllabus = getSyllabusForGrade(grade);

  let topicName = 'Chủ đề mặc định';
  let lessonName = 'Bài học mặc định';

  if (syllabus && syllabus.length > 0) {
    const firstTopic = syllabus[0];
    topicName = firstTopic.name;
    if (firstTopic.lessons && firstTopic.lessons.length > 0) {
      lessonName = firstTopic.lessons[0].name;
    }
  }

  const rows = [
    {
      index: 1,
      topicName: topicName,
      lessonName: lessonName,
      requirementText: 'Nhận biết các khái niệm cơ bản và vận dụng tính chất.',
      isFirstInTopic: true,
      topicRowSpan: 1,
      isFirstInLesson: true,
      lessonRowSpan: 1,
      mcq: {
        nhanBiet: { tags: ['1', '2'] },
        thongHieu: { tags: ['3'] },
        vanDung: { tags: [] }
      },
      trueFalse: {
        nhanBiet: { tags: [] },
        thongHieu: { tags: [] },
        vanDung: { tags: [] }
      },
      shortAnswer: {
        nhanBiet: { tags: [] },
        thongHieu: { tags: [] },
        vanDung: { tags: [] }
      },
      rowKnown: 3,
      rowUnderstand: 1,
      rowApply: 0,
      percentage: 40
    }
  ];

  return {
    durationMinutes: test.config?.durationMinutes || 45,
    rows,
    summary: {
      totalCount: {
        mcq: { nhanBiet: 2, thongHieu: 1, vanDung: 0 },
        trueFalse: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
        shortAnswer: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
        byLevel: { nhanBiet: 3, thongHieu: 1, vanDung: 0 }
      },
      score: {
        mcq: 1.5,
        trueFalse: 0.0,
        shortAnswer: 0.0,
        byLevel: { nhanBiet: 1.5, thongHieu: 0.5, vanDung: 0.0 },
        total: 2.0
      },
      percentage: {
        mcq: 100,
        trueFalse: 0,
        shortAnswer: 0,
        byLevel: { nhanBiet: 75, thongHieu: 25, vanDung: 0 }
      }
    }
  };
}
