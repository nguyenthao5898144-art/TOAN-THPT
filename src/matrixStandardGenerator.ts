import { GeneratedTest } from './types';
import { getSyllabusForGrade } from './testGenerator';

export function buildStandardSpecData(test: GeneratedTest) {
  const grade = test.config?.grade || '12';
  const syllabus = getSyllabusForGrade(grade);

  let topicName = 'Chủ đề mặc định';
  let lessonName = 'Bài học mặc định';
  let outcomes = ['Hiểu và vận dụng kiến thức'];

  if (syllabus && syllabus.length > 0) {
    const firstTopic = syllabus[0];
    topicName = firstTopic.name;
    if (firstTopic.lessons && firstTopic.lessons.length > 0) {
      lessonName = firstTopic.lessons[0].name;
      outcomes = firstTopic.lessons[0].outcomes || outcomes;
    }
  }

  const rows = [
    {
      index: 1,
      topicName: topicName,
      lessonName: lessonName,
      outcomeText: outcomes.join('; '),
      nhanBietCount: 2,
      thongHieuCount: 1,
      vanDungCount: 0,
    }
  ];

  return {
    rows,
    durationMinutes: test.config?.durationMinutes || 45,
  };
}
