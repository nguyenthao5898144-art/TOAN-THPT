// Bổ sung State chọn Khối lớp
const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12'>(config.grade || '12');

// Lọc danh sách chủ đề theo Khối lớp đã chọn
const topicsByGrade = HIGH_SCHOOL_MATH_SYLLABUS.filter(t => t.grade === selectedGrade);

const handleSwitchGrade = (grade: '10' | '11' | '12') => {
  setSelectedGrade(grade);
  const firstTopic = HIGH_SCHOOL_MATH_SYLLABUS.find(t => t.grade === grade);
  if (firstTopic) {
    const firstLesson = firstTopic.lessons[0];
    setConfig(prev => ({
      ...prev,
      grade,
      title: `ĐỀ KIỂM TRA MÔN TOÁN LỚP ${grade} - GDPT 2018`,
      selectedTopicIds: [firstTopic.id],
      selectedLessonId: firstLesson?.id,
      selectedLessonIds: firstLesson ? [firstLesson.id] : [],
      selectedOutcomes: firstLesson ? firstLesson.outcomes : []
    }));
  }
};
