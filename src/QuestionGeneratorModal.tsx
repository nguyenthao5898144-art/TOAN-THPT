import React, { useState } from 'react';
import { TestConfig } from '../types';
import { MATH_12_SYLLABUS, Topic, Lesson } from '../data/math12Syllabus';
import { DIAGRAM_BANK, DiagramItem } from '../data/diagramBank';
import { DiagramRenderer } from './DiagramRenderer';
import { Sparkles, CheckCircle2, Sliders, BookOpen, AlertCircle, RefreshCw, CheckSquare, Square, ListChecks, Image as ImageIcon, ChevronDown, ChevronUp, Trash2, RotateCcw } from 'lucide-react';

interface QuestionGeneratorModalProps {
  config: TestConfig;
  setConfig: React.Dispatch<React.SetStateAction<TestConfig>>;
  onGenerate: (overrideConfig?: TestConfig) => void;
  onGenerateFromBank?: () => void;
  isGenerating: boolean;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  config,
  setConfig,
  onGenerate,
  onGenerateFromBank,
  isGenerating,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [showDiagramBank, setShowDiagramBank] = useState<boolean>(false);
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [diagramCategoryFilter, setDiagramCategoryFilter] = useState<string>('Tất cả');

  // Interactive Question & Diagram Bank State (Selectable & Deletable)
  const [diagramList, setDiagramList] = useState<DiagramItem[]>(DIAGRAM_BANK);
  const [checkedDiagramIds, setCheckedDiagramIds] = useState<string[]>([]);

  // Collapsible UI States
  const [isTopicsGridOpen, setIsTopicsGridOpen] = useState<boolean>(true);
  const [collapsedTopicIds, setCollapsedTopicIds] = useState<string[]>([]);
  const [collapsedLessonIds, setCollapsedLessonIds] = useState<string[]>([]);

  const toggleTopicCollapse = (topicId: string) => {
    setCollapsedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleLessonCollapse = (lessonId: string) => {
    setCollapsedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const toggleCheckDiagram = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedDiagramIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDiagrams = (filteredItems: DiagramItem[]) => {
    const currentIds = filteredItems.map((d) => d.id);
    const allChecked = currentIds.length > 0 && currentIds.every((id) => checkedDiagramIds.includes(id));
    if (allChecked) {
      setCheckedDiagramIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setCheckedDiagramIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleDeleteSingleDiagram = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiagramList((prev) => prev.filter((d) => d.id !== id));
    setCheckedDiagramIds((prev) => prev.filter((i) => i !== id));
    if (selectedDiagramId === id) {
      setSelectedDiagramId(null);
      setConfig((prev) => ({
        ...prev,
        customInstructions: prev.customInstructions?.replace(/\[ĐỒ THỊ & BẢNG BIẾN THIÊN CÓ SẴN: .*?\]/g, '').trim() || ''
      }));
    }
  };

  const handleDeleteSelectedDiagrams = () => {
    if (checkedDiagramIds.length === 0) return;
    setDiagramList((prev) => prev.filter((d) => !checkedDiagramIds.includes(d.id)));
    if (selectedDiagramId && checkedDiagramIds.includes(selectedDiagramId)) {
      setSelectedDiagramId(null);
      setConfig((prev) => ({
        ...prev,
        customInstructions: prev.customInstructions?.replace(/\[ĐỒ THỊ & BẢNG BIẾN THIÊN CÓ SẴN: .*?\]/g, '').trim() || ''
      }));
    }
    setCheckedDiagramIds([]);
  };

  const handleRestoreBank = () => {
    setDiagramList(DIAGRAM_BANK);
    setCheckedDiagramIds([]);
  };

  const categories = ['Tất cả', 'Giải Tích', 'Hình Học', 'Thống Kê & Xác Suất', 'Chuyên Đề Học Tập'];

  const filteredTopics = MATH_12_SYLLABUS.filter(
    (t) => selectedCategory === 'Tất cả' || t.category === selectedCategory
  );

  const selectedTopics = MATH_12_SYLLABUS.filter((t) =>
    config.selectedTopicIds.includes(t.id)
  );
  const effectiveSelectedTopics = selectedTopics.length > 0 ? selectedTopics : [MATH_12_SYLLABUS[0]];

  const allLessonsInSelectedTopics = effectiveSelectedTopics.flatMap((t) => t.lessons);

  const activeSelectedLessonIds =
    config.selectedLessonIds !== undefined && config.selectedLessonIds.length > 0
      ? config.selectedLessonIds
      : config.selectedLessonId
      ? [config.selectedLessonId]
      : allLessonsInSelectedTopics.map((l) => l.id);

  const activeOutcomes =
    config.selectedOutcomes !== undefined
      ? config.selectedOutcomes
      : allLessonsInSelectedTopics
          .filter((l) => activeSelectedLessonIds.includes(l.id))
          .flatMap((l) => l.outcomes);

  // 1. Toggle Topic Selection
  const handleTopicToggle = (topicId: string) => {
    let newTopicIds: string[];
    if (config.selectedTopicIds.includes(topicId)) {
      if (config.selectedTopicIds.length <= 1) return; // Keep at least 1 topic
      newTopicIds = config.selectedTopicIds.filter((id) => id !== topicId);
    } else {
      newTopicIds = [...config.selectedTopicIds, topicId];
    }

    const newSelectedTopics = MATH_12_SYLLABUS.filter((t) => newTopicIds.includes(t.id));
    const newAllLessons = newSelectedTopics.flatMap((t) => t.lessons);
    const newAllLessonIds = newAllLessons.map((l) => l.id);

    let newSelectedLessonIds: string[];
    if (config.selectedTopicIds.includes(topicId)) {
      // Removing topic -> remove its lessons from selectedLessonIds
      newSelectedLessonIds = activeSelectedLessonIds.filter((lid) => newAllLessonIds.includes(lid));
      if (newSelectedLessonIds.length === 0) {
        newSelectedLessonIds = newAllLessonIds;
      }
    } else {
      // Adding topic -> auto-select its lessons
      const addedTopic = MATH_12_SYLLABUS.find((t) => t.id === topicId);
      const addedLessonIds = addedTopic ? addedTopic.lessons.map((l) => l.id) : [];
      newSelectedLessonIds = Array.from(new Set([...activeSelectedLessonIds, ...addedLessonIds]));
    }

    const newActiveLessons = newAllLessons.filter((l) => newSelectedLessonIds.includes(l.id));
    const newAllOutcomes = newActiveLessons.flatMap((l) => l.outcomes);

    setConfig((prev) => ({
      ...prev,
      selectedTopicIds: newTopicIds,
      selectedLessonId: newSelectedLessonIds[0],
      selectedLessonIds: newSelectedLessonIds,
      selectedOutcomes: newAllOutcomes,
    }));
  };

  // 2. Toggle Single Lesson Selection
  const handleLessonToggle = (lesson: Lesson) => {
    let newLessonIds: string[];
    let newOutcomes: string[];

    if (activeSelectedLessonIds.includes(lesson.id)) {
      if (activeSelectedLessonIds.length <= 1) return; // Keep at least 1 lesson overall
      newLessonIds = activeSelectedLessonIds.filter((id) => id !== lesson.id);
      newOutcomes = activeOutcomes.filter((o) => !lesson.outcomes.includes(o));
    } else {
      newLessonIds = [...activeSelectedLessonIds, lesson.id];
      newOutcomes = Array.from(new Set([...activeOutcomes, ...lesson.outcomes]));
    }

    setConfig((prev) => ({
      ...prev,
      selectedLessonId: newLessonIds[0],
      selectedLessonIds: newLessonIds,
      selectedOutcomes: newOutcomes,
    }));
  };

  // 3. Topic-level Lesson Selection Handlers
  const handleSelectAllTopicLessons = (topic: Topic) => {
    const topicLessonIds = topic.lessons.map((l) => l.id);
    const newLessonIds = Array.from(new Set([...activeSelectedLessonIds, ...topicLessonIds]));
    const topicOutcomes = topic.lessons.flatMap((l) => l.outcomes);
    const newOutcomes = Array.from(new Set([...activeOutcomes, ...topicOutcomes]));

    setConfig((prev) => ({
      ...prev,
      selectedLessonId: newLessonIds[0],
      selectedLessonIds: newLessonIds,
      selectedOutcomes: newOutcomes,
    }));
  };

  const handleDeselectAllTopicLessons = (topic: Topic) => {
    const topicLessonIds = topic.lessons.map((l) => l.id);
    const remainingLessonIds = activeSelectedLessonIds.filter((id) => !topicLessonIds.includes(id));
    if (remainingLessonIds.length === 0) return; // Must keep at least 1 lesson
    const topicOutcomes = topic.lessons.flatMap((l) => l.outcomes);
    const remainingOutcomes = activeOutcomes.filter((o) => !topicOutcomes.includes(o));

    setConfig((prev) => ({
      ...prev,
      selectedLessonId: remainingLessonIds[0],
      selectedLessonIds: remainingLessonIds,
      selectedOutcomes: remainingOutcomes,
    }));
  };

  // 4. Outcome Handlers
  const handleToggleOutcome = (outcomeText: string) => {
    if (activeOutcomes.includes(outcomeText)) {
      setConfig((prev) => ({
        ...prev,
        selectedOutcomes: activeOutcomes.filter((o) => o !== outcomeText),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        selectedOutcomes: [...activeOutcomes, outcomeText],
      }));
    }
  };

  const handleSelectAllLessonOutcomes = (lesson: Lesson) => {
    const newOutcomes = Array.from(new Set([...activeOutcomes, ...lesson.outcomes]));
    setConfig((prev) => ({
      ...prev,
      selectedOutcomes: newOutcomes,
    }));
  };

  const handleDeselectAllLessonOutcomes = (lesson: Lesson) => {
    const newOutcomes = activeOutcomes.filter((o) => !lesson.outcomes.includes(o));
    setConfig((prev) => ({
      ...prev,
      selectedOutcomes: newOutcomes,
    }));
  };

  const handleSelectAllGlobalOutcomes = () => {
    const activeLessons = allLessonsInSelectedTopics.filter((l) => activeSelectedLessonIds.includes(l.id));
    const allOutcomes = activeLessons.flatMap((l) => l.outcomes);
    setConfig((prev) => ({
      ...prev,
      selectedOutcomes: allOutcomes,
    }));
  };

  const handleDeselectAllGlobalOutcomes = () => {
    setConfig((prev) => ({
      ...prev,
      selectedOutcomes: [],
    }));
  };

  const handleCountChange = (
    type: 'multipleChoice' | 'trueFalse' | 'shortAnswer',
    level: 'nhanBiet' | 'thongHieu' | 'vanDung',
    value: number
  ) => {
    const safeVal = Math.max(0, Math.min(20, value));
    const newCounts = {
      ...config.counts,
      [type]: {
        ...config.counts[type],
        [level]: safeVal,
      },
    };
    const newOutcomeMatrix = computeAutoOutcomeMatrix(activeOutcomeItems, newCounts);
    setConfig((prev) => ({
      ...prev,
      counts: newCounts,
      outcomeMatrix: newOutcomeMatrix,
    }));
  };

  const totalMcq = config.counts.multipleChoice.nhanBiet + config.counts.multipleChoice.thongHieu + config.counts.multipleChoice.vanDung;
  const totalTf = config.counts.trueFalse.nhanBiet + config.counts.trueFalse.thongHieu + config.counts.trueFalse.vanDung;
  const totalSa = config.counts.shortAnswer.nhanBiet + config.counts.shortAnswer.thongHieu + config.counts.shortAnswer.vanDung;
  const totalQuestions = totalMcq + totalTf + totalSa;

  // Detailed YCCĐ Matrix items & calculations
  const activeOutcomeItems = effectiveSelectedTopics.flatMap((topic) =>
    topic.lessons
      .filter((lesson) => activeSelectedLessonIds.includes(lesson.id))
      .flatMap((lesson) =>
        lesson.outcomes
          .filter((outcome) => activeOutcomes.includes(outcome))
          .map((outcome) => ({
            topicId: topic.id,
            topicName: topic.name,
            lessonId: lesson.id,
            lessonName: lesson.name,
            outcome,
          }))
      )
  );

  const totalNB_General =
    config.counts.multipleChoice.nhanBiet +
    config.counts.trueFalse.nhanBiet +
    config.counts.shortAnswer.nhanBiet;
  const totalTH_General =
    config.counts.multipleChoice.thongHieu +
    config.counts.trueFalse.thongHieu +
    config.counts.shortAnswer.thongHieu;
  const totalVD_General =
    config.counts.multipleChoice.vanDung +
    config.counts.trueFalse.vanDung +
    config.counts.shortAnswer.vanDung;

  const computeAutoOutcomeMatrix = (
    items: typeof activeOutcomeItems,
    counts: TestConfig['counts']
  ) => {
    const totalNB =
      counts.multipleChoice.nhanBiet +
      counts.trueFalse.nhanBiet +
      counts.shortAnswer.nhanBiet;
    const totalTH =
      counts.multipleChoice.thongHieu +
      counts.trueFalse.thongHieu +
      counts.shortAnswer.thongHieu;
    const totalVD =
      counts.multipleChoice.vanDung +
      counts.trueFalse.vanDung +
      counts.shortAnswer.vanDung;

    const N = items.length;
    if (N === 0) return {};

    const matrix: Record<string, { nhanBiet: number; thongHieu: number; vanDung: number }> = {};
    items.forEach((item, i) => {
      const nb = Math.floor(totalNB / N) + (i < (totalNB % N) ? 1 : 0);
      const th = Math.floor(totalTH / N) + (i < (totalTH % N) ? 1 : 0);
      const vd = Math.floor(totalVD / N) + (i < (totalVD % N) ? 1 : 0);
      matrix[item.outcome] = { nhanBiet: nb, thongHieu: th, vanDung: vd };
    });
    return matrix;
  };

  const currentOutcomeMatrix =
    config.outcomeMatrix || computeAutoOutcomeMatrix(activeOutcomeItems, config.counts);

  const handleOutcomeCountChange = (
    outcomeText: string,
    level: 'nhanBiet' | 'thongHieu' | 'vanDung',
    value: number
  ) => {
    const safeVal = Math.max(0, Math.min(30, value));
    const currentCounts = currentOutcomeMatrix[outcomeText] || { nhanBiet: 0, thongHieu: 0, vanDung: 0 };
    const updated = {
      ...currentOutcomeMatrix,
      [outcomeText]: {
        ...currentCounts,
        [level]: safeVal,
      },
    };
    setConfig((prev) => ({
      ...prev,
      outcomeMatrix: updated,
    }));
  };

  const handleAutoDistributeOutcomes = () => {
    const autoMatrix = computeAutoOutcomeMatrix(activeOutcomeItems, config.counts);
    setConfig((prev) => ({
      ...prev,
      outcomeMatrix: autoMatrix,
    }));
  };

  const sumYCCDs = activeOutcomeItems.reduce(
    (acc, item) => {
      const c = currentOutcomeMatrix[item.outcome] || { nhanBiet: 0, thongHieu: 0, vanDung: 0 };
      acc.nb += c.nhanBiet;
      acc.th += c.thongHieu;
      acc.vd += c.vanDung;
      return acc;
    },
    { nb: 0, th: 0, vd: 0 }
  );
  const totalYCCDQuestions = sumYCCDs.nb + sumYCCDs.th + sumYCCDs.vd;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-5 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              TẠO CÂU HỎI VÀ MA TRẬN ĐỀ THI MỚI (CT GDPT 2018)
            </h2>
            <p className="text-xs text-slate-500">
              Mỗi lần bấm tạo, hệ thống sẽ <strong className="text-red-600 font-semibold">xóa hoàn toàn nội dung cũ</strong> và sinh ra bộ câu hỏi & ma trận mới không trùng lặp.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                mode: 'kt_cuoi_bai',
                title: 'ĐỀ KIỂM TRA MÔN TOÁN 12 - KT CUỐI BÀI',
                durationMinutes: 15,
              }))
            }
            className={`px-3 py-1.5 rounded-md transition-all ${
              config.mode === 'kt_cuoi_bai' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KT CUỐI BÀI (15 phút)
          </button>
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                mode: 'kt_dinh_ky',
                title: 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN LỚP 12',
                durationMinutes: 45,
              }))
            }
            className={`px-3 py-1.5 rounded-md transition-all ${
              config.mode === 'kt_dinh_ky' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KT ĐỊNH KỲ (45 phút)
          </button>
        </div>
      </div>



      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đề bài / Tiêu đề đề thi</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            placeholder="Nhập tiêu đề đề thi..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đơn vị / Trường THPT</label>
          <input
            type="text"
            value={config.schoolName}
            onChange={(e) => setConfig((prev) => ({ ...prev, schoolName: e.target.value }))}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ chuyên môn / Bộ môn</label>
          <input
            type="text"
            value={config.departmentName || 'TỔ TOÁN'}
            onChange={(e) => setConfig((prev) => ({ ...prev, departmentName: e.target.value }))}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-slate-800"
            placeholder="TỔ TOÁN"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Năm học</label>
          <input
            type="text"
            value={config.academicYear || '2026 - 2027'}
            onChange={(e) => setConfig((prev) => ({ ...prev, academicYear: e.target.value }))}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-blue-900"
            placeholder="2026 - 2027"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm bài (Phút)</label>
          <input
            type="number"
            value={config.durationMinutes}
            onChange={(e) => setConfig((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 45 }))}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* STEP 1: Syllabus Topic & Lesson Selector */}
      <div className="mb-6 p-4 bg-blue-50/40 rounded-2xl border border-blue-200">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-blue-200/80">
          <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-black text-xs shadow-xs">
            BƯỚC 1
          </span>
          <h3 className="font-extrabold text-xs sm:text-sm text-blue-950 uppercase tracking-wide">
            CHỌN CÁC CHỦ ĐỀ, BÀI HỌC & YÊU CẦU CẦN ĐẠT (YCCĐ - BỘ GD&ĐT)
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsTopicsGridOpen(!isTopicsGridOpen)}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>DANH SÁCH CHỦ ĐỀ MÔN TOÁN 12 (CT 2018):</span>
              <div className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                {isTopicsGridOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Đã chọn {effectiveSelectedTopics.length} chủ đề
            </span>
          </div>

          {/* Category Filter Pills & Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1 text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsTopicsGridOpen(true);
                  }}
                  className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsTopicsGridOpen(!isTopicsGridOpen)}
              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{isTopicsGridOpen ? 'Thu gọn danh sách chủ đề' : 'Hiện danh sách chủ đề'}</span>
              {isTopicsGridOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isTopicsGridOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            {filteredTopics.map((topic) => {
              const isSelected = config.selectedTopicIds.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 text-blue-950 font-medium ring-2 ring-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                        {topic.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {topic.lessons.length} bài học
                      </span>
                    </div>
                    <p className="line-clamp-2 leading-tight font-medium">{topic.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lesson & Learning Outcomes (YCCĐ) for ALL Selected Topics */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-50/90 rounded-xl border border-indigo-200">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-xs text-indigo-950">
              DANH SÁCH BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT CỦA CÁC CHỦ ĐỀ ĐÃ CHỌN ({effectiveSelectedTopics.length} chủ đề):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setCollapsedTopicIds([])}
              className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
              title="Mở sổ tất cả các chủ đề"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Mở rộng tất cả chủ đề</span>
            </button>
            <button
              type="button"
              onClick={() => setCollapsedTopicIds(effectiveSelectedTopics.map((t) => t.id))}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Thu gọn tất cả các chủ đề"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Thu gọn tất cả chủ đề</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={handleSelectAllGlobalOutcomes}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Chọn tất cả các yêu cầu cần đạt của tất cả bài học đã chọn"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Chọn tất cả YCCĐ</span>
            </button>

            <button
              type="button"
              onClick={handleDeselectAllGlobalOutcomes}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-semibold border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Bỏ chọn toàn bộ yêu cầu cần đạt"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Bỏ chọn tất cả</span>
            </button>
          </div>
        </div>

        {effectiveSelectedTopics.map((topic, topicIdx) => {
          const topicLessonsSelectedCount = topic.lessons.filter((l) =>
            activeSelectedLessonIds.includes(l.id)
          ).length;
          const isTopicCollapsed = collapsedTopicIds.includes(topic.id);

          return (
            <div key={topic.id} className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
              {/* Topic Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div
                  onClick={() => toggleTopicCollapse(topic.id)}
                  className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
                >
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-all"
                  >
                    {isTopicCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                    {topic.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    Chủ đề {topicIdx + 1}: {topic.name}
                  </h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    topicLessonsSelectedCount > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    Đã chọn {topicLessonsSelectedCount}/{topic.lessons.length} bài
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectAllTopicLessons(topic)}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 transition-all cursor-pointer"
                  >
                    Chọn tất cả bài
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeselectAllTopicLessons(topic)}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-white text-slate-600 hover:bg-slate-100 font-semibold border border-slate-200 transition-all cursor-pointer"
                  >
                    Bỏ chọn bài
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTopicCollapse(topic.id)}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{isTopicCollapsed ? 'Mở sổ' : 'Thu gọn'}</span>
                    {isTopicCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* List of Lessons under this topic */}
              {!isTopicCollapsed && (
                <div className="space-y-3">
                  {topic.lessons.map((lesson, lessonIdx) => {
                    const isLessonSelected = activeSelectedLessonIds.includes(lesson.id);
                    const selectedOutcomesInLesson = lesson.outcomes.filter((o) =>
                      activeOutcomes.includes(o)
                    ).length;
                    const isLessonCollapsed = collapsedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isLessonSelected
                            ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-100'
                            : 'bg-slate-100/60 border-slate-200 opacity-80'
                        }`}
                      >
                        {/* Lesson Title & Checkbox */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div
                            onClick={() => handleLessonToggle(lesson)}
                            className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isLessonSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isLessonSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-300" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-950">
                                Bài {lessonIdx + 1}: {lesson.name}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                selectedOutcomesInLesson > 0
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-slate-200 text-slate-500 border-slate-300'
                              }`}>
                                {selectedOutcomesInLesson}/{lesson.outcomes.length} YCCĐ
                              </span>
                            </div>
                          </div>

                          {/* Quick YCCĐ buttons & Collapse button for this lesson */}
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            {isLessonSelected && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllLessonOutcomes(lesson)}
                                  className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium border border-indigo-200 transition-all cursor-pointer"
                                >
                                  Chọn hết YCCĐ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeselectAllLessonOutcomes(lesson)}
                                  className="px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium border border-slate-200 transition-all cursor-pointer"
                                >
                                  Bỏ YCCĐ
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleLessonCollapse(lesson.id)}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                              title={isLessonCollapsed ? "Mở sổ danh sách YCCĐ" : "Thu gọn YCCĐ"}
                            >
                              <span>{isLessonCollapsed ? "Mở YCCĐ" : "Thu gọn"}</span>
                              {isLessonCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Outcomes List when Lesson is Selected and NOT collapsed */}
                        {isLessonSelected && !isLessonCollapsed && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 pl-6">
                            {lesson.outcomes.map((out, outIdx) => {
                              const isOutcomeSelected = activeOutcomes.includes(out);
                              return (
                                <div
                                  key={outIdx}
                                  onClick={() => handleToggleOutcome(out)}
                                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-2 ${
                                    isOutcomeSelected
                                      ? 'bg-blue-50/70 border-blue-300 text-slate-800 font-medium'
                                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isOutcomeSelected ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className={`text-[10px] font-bold mr-1.5 px-1.5 py-0.2 rounded ${
                                      isOutcomeSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                      YCCĐ {outIdx + 1}
                                    </span>
                                    <span className={isOutcomeSelected ? 'text-slate-800' : 'text-slate-400 line-through'}>
                                      {out}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {activeOutcomes.length === 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Cảnh báo:</strong> Chưa có YCCĐ nào được chọn. Vui lòng chọn ít nhất 1 YCCĐ để AI tạo câu hỏi chính xác.
            </span>
          </div>
        )}
      </div>

      {/* STEP 2: Question Counts Matrix Config */}
      <div className="mb-6 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-emerald-200/80">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-black text-xs shadow-xs">
              BƯỚC 2
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>TẠO & CẤU HÌNH MA TRẬN CHI TIẾT (PHÂN BỔ SỐ CÂU THEO MỖI YCCĐ (SỐ CÂU VÀ MỨC ĐỘ))</span>
            </h3>
          </div>

          {/* Quick Matrix Presets */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-500">Mẫu ma trận nhanh:</span>
            <button
              type="button"
              onClick={() => {
                const newCounts = {
                  multipleChoice: { nhanBiet: 6, thongHieu: 4, vanDung: 2 },
                  trueFalse: { nhanBiet: 2, thongHieu: 1, vanDung: 1 },
                  shortAnswer: { nhanBiet: 2, thongHieu: 2, vanDung: 2 },
                };
                setConfig((prev) => ({
                  ...prev,
                  counts: newCounts,
                  outcomeMatrix: computeAutoOutcomeMatrix(activeOutcomeItems, newCounts),
                }));
              }}
              className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-md border border-blue-200 transition-all cursor-pointer"
            >
              Chuẩn GDPT 2018 (22 câu = 10đ)
            </button>
            <button
              type="button"
              onClick={() => {
                const newCounts = {
                  multipleChoice: { nhanBiet: 4, thongHieu: 4, vanDung: 0 },
                  trueFalse: { nhanBiet: 1, thongHieu: 1, vanDung: 0 },
                  shortAnswer: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
                };
                setConfig((prev) => ({
                  ...prev,
                  counts: newCounts,
                  outcomeMatrix: computeAutoOutcomeMatrix(activeOutcomeItems, newCounts),
                }));
              }}
              className="px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold rounded-md border border-indigo-200 transition-all cursor-pointer"
            >
              KT 15 Phút (10 câu)
            </button>
            <button
              type="button"
              onClick={() => {
                const newCounts = {
                  multipleChoice: { nhanBiet: 4, thongHieu: 4, vanDung: 2 },
                  trueFalse: { nhanBiet: 1, thongHieu: 2, vanDung: 1 },
                  shortAnswer: { nhanBiet: 1, thongHieu: 1, vanDung: 2 },
                };
                setConfig((prev) => ({
                  ...prev,
                  counts: newCounts,
                  outcomeMatrix: computeAutoOutcomeMatrix(activeOutcomeItems, newCounts),
                }));
              }}
              className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-md border border-purple-200 transition-all cursor-pointer"
            >
              Phân hóa / Nâng cao (18 câu)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white mb-4">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold">
              <tr>
                <th className="p-2.5">Dạng câu hỏi (Định dạng Bộ GD&ĐT)</th>
                <th className="p-2.5 text-center text-emerald-800 bg-emerald-50/70">Nhận biết</th>
                <th className="p-2.5 text-center text-blue-800 bg-blue-50/70">Thông hiểu</th>
                <th className="p-2.5 text-center text-amber-800 bg-amber-50/70">Vận dụng</th>
                <th className="p-2.5 text-center bg-slate-200">Tổng số câu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Row 1: Multiple Choice */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-semibold text-slate-800">
                  Phần I: Trắc nghiệm 4 lựa chọn (Chọn 1 phương án)
                </td>
                <td className="p-2.5 text-center bg-emerald-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.multipleChoice.nhanBiet}
                    onChange={(e) => handleCountChange('multipleChoice', 'nhanBiet', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-blue-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.multipleChoice.thongHieu}
                    onChange={(e) => handleCountChange('multipleChoice', 'thongHieu', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-amber-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.multipleChoice.vanDung}
                    onChange={(e) => handleCountChange('multipleChoice', 'vanDung', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-100">
                  {totalMcq} câu
                </td>
              </tr>

              {/* Row 2: True / False */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-semibold text-slate-800">
                  Phần II: Trắc nghiệm Đúng/Sai (Mỗi câu gồm 4 ý a, b, c, d)
                </td>
                <td className="p-2.5 text-center bg-emerald-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.trueFalse.nhanBiet}
                    onChange={(e) => handleCountChange('trueFalse', 'nhanBiet', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-blue-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.trueFalse.thongHieu}
                    onChange={(e) => handleCountChange('trueFalse', 'thongHieu', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-amber-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.trueFalse.vanDung}
                    onChange={(e) => handleCountChange('trueFalse', 'vanDung', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-100">
                  {totalTf} câu
                </td>
              </tr>

              {/* Row 3: Short Answer */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-semibold text-slate-800">
                  Phần III: Trắc nghiệm trả lời ngắn / Tự luận
                </td>
                <td className="p-2.5 text-center bg-emerald-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.shortAnswer.nhanBiet}
                    onChange={(e) => handleCountChange('shortAnswer', 'nhanBiet', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-blue-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.shortAnswer.thongHieu}
                    onChange={(e) => handleCountChange('shortAnswer', 'thongHieu', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center bg-amber-50/20">
                  <input
                    type="number"
                    min="0"
                    value={config.counts.shortAnswer.vanDung}
                    onChange={(e) => handleCountChange('shortAnswer', 'vanDung', Number(e.target.value))}
                    className="w-14 text-center border border-slate-300 rounded p-1 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-100">
                  {totalSa} câu
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Live Preview of the Created Matrix */}
        <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-200/60">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              <span className="font-bold text-xs text-purple-950 uppercase">
                BẢNG XEM TRƯỚC MA TRẬN ĐỀ THI MỚI SẼ TẠO:
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <span className="bg-white px-2.5 py-0.5 rounded border border-purple-200">
                {activeSelectedLessonIds.length === 1
                  ? `Bài: ${allLessonsInSelectedTopics.find((l) => l.id === activeSelectedLessonIds[0])?.name || ''}`
                  : `Đã chọn: ${activeSelectedLessonIds.length} bài học (${effectiveSelectedTopics.length} chủ đề)`}
              </span>
              <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded shadow-xs">
                Tổng: {totalQuestions} câu | {(totalMcq * 0.25 + totalTf * 1.0 + totalSa * 0.5).toFixed(1)} điểm
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-purple-100 text-slate-700">
              <span className="font-bold text-emerald-700 block mb-0.5">🟢 Nhận biết:</span>
              <span>
                {config.counts.multipleChoice.nhanBiet} MCQ | {config.counts.trueFalse.nhanBiet} ĐS | {config.counts.shortAnswer.nhanBiet} TL
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-purple-100 text-slate-700">
              <span className="font-bold text-blue-700 block mb-0.5">🔵 Thông hiểu:</span>
              <span>
                {config.counts.multipleChoice.thongHieu} MCQ | {config.counts.trueFalse.thongHieu} ĐS | {config.counts.shortAnswer.thongHieu} TL
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-purple-100 text-slate-700">
              <span className="font-bold text-amber-700 block mb-0.5">🟠 Vận dụng:</span>
              <span>
                {config.counts.multipleChoice.vanDung} MCQ | {config.counts.trueFalse.vanDung} ĐS | {config.counts.shortAnswer.vanDung} TL
              </span>
            </div>
          </div>
        </div>

        {/* BẢNG MA TRẬN CHI TIẾT THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ) */}
        <div className="mt-5 pt-4 border-t border-emerald-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold text-[11px] shadow-xs">
                MA TRẬN CHI TIẾT YCCĐ
              </span>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-emerald-600" />
                <span>PHÂN BỔ SỐ CÂU CHI TIẾT THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ)</span>
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeOutcomes}
              className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Tự động phân bổ lại số câu hỏi từ ma trận chung cho các YCCĐ"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              Tự động chia đều số câu theo YCCĐ
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white mb-3">
            <table className="w-full text-xs text-left text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 border-r border-slate-200 w-1/4">Chủ đề</th>
                  <th className="p-2.5 border-r border-slate-200 w-1/4">Bài học</th>
                  <th className="p-2.5 border-r border-slate-200">Yêu cầu cần đạt (YCCĐ)</th>
                  <th className="p-2 text-center text-emerald-800 bg-emerald-50/70 border-r border-slate-200 w-16">
                    NB
                  </th>
                  <th className="p-2 text-center text-blue-800 bg-blue-50/70 border-r border-slate-200 w-16">
                    TH
                  </th>
                  <th className="p-2 text-center text-amber-800 bg-amber-50/70 border-r border-slate-200 w-16">
                    VD
                  </th>
                  <th className="p-2 text-center bg-slate-200 w-20">Tổng câu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeOutcomeItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                      Chưa chọn YCCĐ nào ở Bước 1.
                    </td>
                  </tr>
                ) : (
                  activeOutcomeItems.map((item, idx) => {
                    const c = currentOutcomeMatrix[item.outcome] || { nhanBiet: 0, thongHieu: 0, vanDung: 0 };
                    const itemTotal = c.nhanBiet + c.thongHieu + c.vanDung;

                    const isFirstOfTopic = idx === 0 || activeOutcomeItems[idx - 1].topicId !== item.topicId;
                    const isFirstOfLesson = idx === 0 || activeOutcomeItems[idx - 1].lessonId !== item.lessonId;

                    return (
                      <tr key={`matrix-item-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 border-r border-slate-200 align-top font-bold text-slate-800 bg-slate-50/50">
                          {isFirstOfTopic ? (
                            <span className="text-blue-900 font-extrabold flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {item.topicName}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">〃 {item.topicName}</span>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top font-semibold text-slate-700">
                          {isFirstOfLesson ? (
                            <span className="text-indigo-900 font-bold">{item.lessonName}</span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">〃 {item.lessonName}</span>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top text-slate-800">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] mr-1.5">
                            YCCĐ {idx + 1}
                          </span>
                          {item.outcome}
                        </td>
                        <td className="p-1.5 text-center bg-emerald-50/20 border-r border-slate-200 align-middle">
                          <input
                            type="number"
                            min="0"
                            value={c.nhanBiet}
                            onChange={(e) =>
                              handleOutcomeCountChange(item.outcome, 'nhanBiet', Number(e.target.value))
                            }
                            className="w-12 text-center border border-slate-300 rounded p-1 font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </td>
                        <td className="p-1.5 text-center bg-blue-50/20 border-r border-slate-200 align-middle">
                          <input
                            type="number"
                            min="0"
                            value={c.thongHieu}
                            onChange={(e) =>
                              handleOutcomeCountChange(item.outcome, 'thongHieu', Number(e.target.value))
                            }
                            className="w-12 text-center border border-slate-300 rounded p-1 font-bold text-blue-900 focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="p-1.5 text-center bg-amber-50/20 border-r border-slate-200 align-middle">
                          <input
                            type="number"
                            min="0"
                            value={c.vanDung}
                            onChange={(e) =>
                              handleOutcomeCountChange(item.outcome, 'vanDung', Number(e.target.value))
                            }
                            className="w-12 text-center border border-slate-300 rounded p-1 font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                        </td>
                        <td className="p-2.5 text-center font-black text-slate-900 bg-slate-100 align-middle">
                          {itemTotal} câu
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={3} className="p-2.5 border-r border-slate-300 text-right font-extrabold uppercase text-slate-800">
                    TỔNG CỘNG SỐ CÂU PHÂN BỔ THEO YCCĐ:
                  </td>
                  <td className="p-2 text-center text-emerald-800 font-black border-r border-slate-300 bg-emerald-100/60">
                    {sumYCCDs.nb} NB
                  </td>
                  <td className="p-2 text-center text-blue-800 font-black border-r border-slate-300 bg-blue-100/60">
                    {sumYCCDs.th} TH
                  </td>
                  <td className="p-2 text-center text-amber-800 font-black border-r border-slate-300 bg-amber-100/60">
                    {sumYCCDs.vd} VD
                  </td>
                  <td className="p-2 text-center font-black text-white bg-emerald-700">
                    {totalYCCDQuestions} câu
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Sync status badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              {sumYCCDs.nb === totalNB_General &&
              sumYCCDs.th === totalTH_General &&
              sumYCCDs.vd === totalVD_General ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Ma trận chi tiết YCCĐ khớp 100% với tổng Ma trận Dạng câu hỏi ({totalYCCDQuestions} câu)
                </span>
              ) : (
                <span className="text-amber-800 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Chênh lệch: YCCĐ ({sumYCCDs.nb} NB, {sumYCCDs.th} TH, {sumYCCDs.vd} VD) vs Dạng câu hỏi ({totalNB_General} NB, {totalTH_General} TH, {totalVD_General} VD)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeOutcomes}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              Đồng bộ lại theo Ma trận Dạng câu hỏi
            </button>
          </div>
        </div>
      </div>

      {/* Pre-built Diagram & Question Bank Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 p-4 rounded-2xl border border-blue-200/80 shadow-xs">
        <div
          onClick={() => setShowDiagramBank(!showDiagramBank)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-base sm:text-lg text-blue-700 tracking-wide uppercase">
                  NGÂN HÀNG CÂU HỎI
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                  {diagramList.length} mẫu
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn, đính kèm vào đề thi AI hoặc xóa bỏ các câu hỏi, đồ thị, bảng biến thiên
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {checkedDiagramIds.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-xs">
                Đã tích {checkedDiagramIds.length} mục
              </span>
            )}
            {selectedDiagramId && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs animate-bounce">
                ✓ Đã gắn AI 1 hình
              </span>
            )}
            <button className="p-1 text-slate-400 group-hover:text-slate-700 transition-colors">
              {showDiagramBank ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showDiagramBank && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4">
            {/* Category tabs & Batch action controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white/60 p-2 rounded-xl border border-slate-200/60">
              <div className="flex flex-wrap gap-1 text-xs">
                {['Tất cả', 'Bảng biến thiên', 'Bảng xét dấu', 'Đồ thị Oxy', 'Đồ thị đạo hàm'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDiagramCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      diagramCategoryFilter === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Batch Select and Delete Controls */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Select All */}
                {(() => {
                  const filteredItems = diagramList.filter((item) => {
                    if (diagramCategoryFilter === 'Tất cả') return true;
                    if (diagramCategoryFilter === 'Bảng xét dấu') return item.category === 'Bảng xét dấu';
                    if (diagramCategoryFilter === 'Bảng biến thiên') return item.type === 'bbt' && item.category !== 'Bảng xét dấu';
                    if (diagramCategoryFilter === 'Đồ thị Oxy') return item.type === 'graph' && item.category !== 'Đồ thị đạo hàm';
                    if (diagramCategoryFilter === 'Đồ thị đạo hàm') return item.category === 'Đồ thị đạo hàm';
                    return true;
                  });
                  const allChecked = filteredItems.length > 0 && filteredItems.every((d) => checkedDiagramIds.includes(d.id));

                  return (
                    <button
                      type="button"
                      onClick={() => handleSelectAllDiagrams(filteredItems)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      {allChecked ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
                    </button>
                  );
                })()}

                {/* Delete Selected Button */}
                {checkedDiagramIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelectedDiagrams}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center space-x-1 cursor-pointer animate-pulse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>XÓA ĐÃ CHỌN ({checkedDiagramIds.length})</span>
                  </button>
                )}

                {/* Restore Bank if items were deleted */}
                {diagramList.length < DIAGRAM_BANK.length && (
                  <button
                    type="button"
                    onClick={handleRestoreBank}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center space-x-1 cursor-pointer"
                    title="Khôi phục đầy đủ các câu hỏi & đồ thị mặc định"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục ngân hàng</span>
                  </button>
                )}

                {selectedDiagramId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiagramId(null);
                      setConfig((prev) => ({
                        ...prev,
                        customInstructions: prev.customInstructions?.replace(/\[ĐỒ THỊ & BẢNG BIẾN THIÊN CÓ SẴN: .*?\]/g, '').trim() || ''
                      }));
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-all"
                  >
                    Bỏ gắn AI
                  </button>
                )}
              </div>
            </div>

            {/* List of Questions / Diagrams */}
            {diagramList.length === 0 ? (
              <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-500 mb-2">Ngân hàng hiện tại đang trống (Đã xóa hết mẫu)</p>
                <button
                  type="button"
                  onClick={handleRestoreBank}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Khôi phục lại Ngân hàng mặc định</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {diagramList.filter((item) => {
                  if (diagramCategoryFilter === 'Tất cả') return true;
                  if (diagramCategoryFilter === 'Bảng xét dấu') return item.category === 'Bảng xét dấu';
                  if (diagramCategoryFilter === 'Bảng biến thiên') return item.type === 'bbt' && item.category !== 'Bảng xét dấu';
                  if (diagramCategoryFilter === 'Đồ thị Oxy') return item.type === 'graph' && item.category !== 'Đồ thị đạo hàm';
                  if (diagramCategoryFilter === 'Đồ thị đạo hàm') return item.category === 'Đồ thị đạo hàm';
                  return true;
                }).map((item) => {
                  const isAttachedToAi = selectedDiagramId === item.id;
                  const isChecked = checkedDiagramIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isAttachedToAi) {
                          setSelectedDiagramId(null);
                          setConfig((prev) => ({
                            ...prev,
                            customInstructions: prev.customInstructions?.replace(/\[ĐỒ THỊ & BẢNG BIẾN THIÊN CÓ SẴN: .*?\]/g, '').trim() || ''
                          }));
                        } else {
                          setSelectedDiagramId(item.id);
                          const instruction = `[ĐỒ THỊ & BẢNG BIẾN THIÊN CÓ SẴN: ${item.id} - ${item.title}]`;
                          setConfig((prev) => ({
                            ...prev,
                            customInstructions: prev.customInstructions ? `${prev.customInstructions} ${instruction}` : instruction
                          }));
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isChecked
                          ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-md'
                          : isAttachedToAi
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400 shadow-md'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {/* Multi-select Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => toggleCheckDiagram(item.id, e)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title={isChecked ? 'Bỏ tích chọn' : 'Tích chọn để xử lý hoặc xóa'}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 hover:text-amber-600" />
                            )}
                          </button>

                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {isAttachedToAi ? (
                            <span className="text-[11px] text-blue-700 font-black flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Đã gắn AI
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                              Bấm để gắn AI
                            </span>
                          )}

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingleDiagram(item.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all"
                            title="Xóa mẫu câu hỏi / đồ thị này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 mb-1 leading-snug">{item.title}</h5>
                      <p className="text-[11px] text-slate-500 mb-2.5 line-clamp-2">{item.description}</p>

                      <DiagramRenderer diagramItem={item} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Additional Instructions & Visual Question Filter (Only shown when expanded) */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-semibold text-slate-700">Ghi chú / Yêu cầu thêm cho AI</label>
                <label className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={config.customInstructions?.includes('[ƯU TIÊN CÂU HỎI TRỰC QUAN]') || false}
                    onChange={(e) => {
                      const tag = '[ƯU TIÊN CÂU HỎI TRỰC QUAN: Sinh các câu hỏi chứa Bảng biến thiên, Đồ thị, Bảng giá trị, Thống kê, Hình vẽ]';
                      if (e.target.checked) {
                        setConfig((prev) => ({
                          ...prev,
                          customInstructions: prev.customInstructions ? `${prev.customInstructions} ${tag}` : tag,
                        }));
                      } else {
                        setConfig((prev) => ({
                          ...prev,
                          customInstructions: prev.customInstructions?.replace(/\[ƯU TIÊN CÂU HỎI TRỰC QUAN: .*?\]/g, '').trim() || '',
                        }));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>🎯 Ưu tiên lọc / sinh các câu hỏi có Bảng biến thiên, Đồ thị, Bảng giá trị, Hình vẽ</span>
                </label>
              </div>
              <input
                type="text"
                value={config.customInstructions || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, customInstructions: e.target.value }))}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ví dụ: Tập trung vào bài toán ứng dụng thực tiễn kinh tế, có bảng biến thiên LaTeX..."
              />
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: Action Section - Generate Exam (From AI vs From Bank) */}
      <div className="pt-5 border-t border-slate-200 bg-gradient-to-r from-purple-50/50 via-slate-50 to-blue-50/50 p-4 rounded-2xl border border-purple-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-purple-200/80">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-black text-xs shadow-xs">
              BƯỚC 3
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>BƯỚC 3: TẠO ĐỀ THI HOÀN CHỈNH (TỪ AI HOẶC TỪ NGÂN HÀNG CÂU HỎI)</span>
            </h3>
          </div>

          <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-purple-200 shadow-2xs">
            Tổng cộng: <span className="text-purple-700 font-black">{totalQuestions} câu hỏi</span> | <span className="text-emerald-700 font-black">{(totalMcq * 0.25 + totalTf * 1.0 + totalSa * 0.5).toFixed(1)} điểm</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Đề thi sẽ được khởi tạo lại 100% đúng theo <strong className="text-purple-900">Ma trận {totalQuestions} câu</strong> và các <strong className="text-blue-900">YCCĐ</strong> đã chọn ở trên. Vui lòng chọn nguồn tạo đề:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option A: TẠO ĐỀ TỪ AI */}
          <button
            type="button"
            onClick={() => onGenerate()}
            disabled={isGenerating || totalQuestions === 0 || activeOutcomes.length === 0}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30 text-left"
          >
            <div>
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-xs text-white">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="font-extrabold text-sm uppercase tracking-wide">
                    TẠO ĐỀ TỪ AI (GEMINI)
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full border border-white/30 shrink-0">
                  Tự động 100%
                </span>
              </div>
              <p className="text-xs text-blue-100 font-normal leading-relaxed mb-3">
                AI sẽ tự động biên soạn mới toàn bộ {totalQuestions} câu hỏi bám sát Ma trận & YCCĐ GDPT 2018.
              </p>
            </div>

            <div className="w-full pt-2.5 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <span>
                {activeOutcomes.length === 0
                  ? '⚠️ CHƯA CHỌN YCCĐ'
                  : isGenerating
                  ? 'Đang khởi tạo từ AI...'
                  : `XUẤT ĐỀ TỪ AI (${totalQuestions} CÂU)`}
              </span>
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            </div>
          </button>

          {/* Option B: TẠO ĐỀ TỪ NGÂN HÀNG */}
          <button
            type="button"
            onClick={() => onGenerateFromBank ? onGenerateFromBank() : onGenerate()}
            disabled={isGenerating || totalQuestions === 0}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/30 text-left"
          >
            <div>
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-xs text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm uppercase tracking-wide">
                    TẠO ĐỀ TỪ NGÂN HÀNG
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full border border-white/30 shrink-0">
                  Có sẵn mẫu
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-normal leading-relaxed mb-3">
                Lấy câu hỏi & bài tập chuẩn mực từ Ngân hàng câu hỏi có sẵn theo đúng tỉ lệ ma trận đã cấu hình.
              </p>
            </div>

            <div className="w-full pt-2.5 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <span>
                {isGenerating ? 'Đang lấy từ Ngân hàng...' : `LẤY ĐỀ TỪ NGÂN HÀNG (${totalQuestions} CÂU)`}
              </span>
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
