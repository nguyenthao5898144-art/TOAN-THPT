export interface TestConfig {
  grade: '10' | '11' | '12'; // Khối 10, 11 hoặc 12
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