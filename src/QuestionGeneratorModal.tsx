import React, { useState, useMemo } from 'react';
import { TestConfig } from './types';
import { MATH_12_SYLLABUS, Topic, Lesson } from './math12Syllabus';
import { DIAGRAM_BANK, DiagramItem } from './diagramBank';
import { DiagramRenderer } from './DiagramRenderer';
import {
  Sparkles, CheckCircle2, Sliders, BookOpen, AlertCircle,
  RefreshCw, CheckSquare, Square, ListChecks, Image as ImageIcon,
  ChevronDown, ChevronUp, Trash2, RotateCcw, X, Clock, Layers
} from 'lucide-react';

export interface QuestionGeneratorModalProps {
  config: TestConfig;
  setConfig: React.Dispatch<React.SetStateAction<TestConfig>>;
  onGenerate: (overrideConfig?: TestConfig) => void;
  onGenerateFromBank?: () => void;
  isGenerating?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  config,
  setConfig,
  onGenerate,
  onGenerateFromBank,
  isGenerating = false,
  onClose,
}) => {
  // 1. Phân loại chuyên đề & Khối lớp
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [grade, setGrade] = useState<string>(config?.grade || '12');
  const [title, setTitle] = useState<string>(config?.title || 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018');
  const [durationMinutes, setDurationMinutes] = useState<number>(config?.durationMinutes || 45);

  // 2. Cơ cấu số lượng câu hỏi theo ma trận
  const [mcCount, setMcCount] = useState<number>(config?.questionCountByType?.multipleChoice ?? 12);
  const [tfCount, setTfCount] = useState<number>(config?.questionCountByType?.trueFalse ?? 4);
  const [saCount, setSaCount] = useState<number>(config?.questionCountByType?.shortAnswer ?? 6);

  // 3. Chọn chủ đề & bài học
  const initialTopicIds = config?.selectedTopicIds && config.selectedTopicIds.length > 0
    ? config.selectedTopicIds
    : [MATH_12_SYLLABUS[0].id];
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds);

  const initialLessonIds = config?.selectedLessonIds && config.selectedLessonIds.length > 0
    ? config.selectedLessonIds
    : MATH_12_SYLLABUS[0].lessons.map((l) => l.id);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(initialLessonIds);

  // Thu gọn / Mở rộng nhóm chủ đề
  const [collapsedTopicIds, setCollapsedTopicIds] = useState<string[]>([]);

  const categories = ['Tất cả', 'Giải Tích', 'Hình Học', 'Thống Kê & Xác Suất', 'Chuyên Đề Học Tập'];

  // Lọc chủ đề theo Category
  const filteredTopics = useMemo(() => {
    return MATH_12_SYLLABUS.filter(
      (t) => selectedCategory === 'Tất cả' || t.category === selectedCategory
    );
  }, [selectedCategory]);

  const toggleTopicCollapse = (topicId: string) => {
    setCollapsedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleTopic = (topic: Topic) => {
    const isSelected = selectedTopicIds.includes(topic.id);
    const lessonIds = topic.lessons.map((l) => l.id);

    if (isSelected) {
      if (selectedTopicIds.length <= 1) return; // Giữ ít nhất 1 chủ đề
      setSelectedTopicIds((prev) => prev.filter((id) => id !== topic.id));
      setSelectedLessonIds((prev) => prev.filter((id) => !lessonIds.includes(id)));
    } else {
      setSelectedTopicIds((prev) => [...prev, topic.id]);
      setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...lessonIds])));
    }
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSelectAllInTopic = (topic: Topic) => {
    const lessonIds = topic.lessons.map((l) => l.id);
    if (!selectedTopicIds.includes(topic.id)) {
      setSelectedTopicIds((prev) => [...prev, topic.id]);
    }
    setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...lessonIds])));
  };

  const handleDeselectAllInTopic = (topic: Topic) => {
    const lessonIds = topic.lessons.map((l) => l.id);
    setSelectedLessonIds((prev) => prev.filter((id) => !lessonIds.includes(id)));
  };

  const handleStartGenerate = () => {
    const newConfig: TestConfig = {
      ...config,
      title,
      grade,
      durationMinutes,
      selectedTopicIds,
      selectedLessonIds,
      questionCountByType: {
        multipleChoice: mcCount,
        trueFalse: tfCount,
        shortAnswer: saCount,
      },
    };

    if (typeof setConfig === 'function') {
      setConfig(newConfig);
    }

    if (typeof onGenerate === 'function') {
      onGenerate(newConfig);
    }
  };

  return (
    <div className="font-sans text-slate-800 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            CẤU HÌNH MA TRẬN & TẠO ĐỀ THI TOÁN THPT
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập ma trận nhận thức và cấu trúc đề thi chuẩn Chương trình GDPT 2018
          </p>
        </div>
      </div>

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề đề thi / Kiểm tra:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Nhập tiêu đề đề kiểm tra..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Thời gian làm bài (Phút):
          </label>
          <input
            type="number"
            min={15}
            max={180}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Cơ cấu số lượng câu hỏi theo 3 phần chuẩn GDPT 2018 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-600" />
          CƠ CẤU DẠNG THỨC CÂU HỎI (CHUẨN BỘ GIÁO DỤC & ĐÀO TẠO):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-900 block mb-1">Phần I: Trắc nghiệm 4 lựa chọn</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={50}
                value={mcCount}
                onChange={(e) => setMcCount(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-600">câu (0.25đ / câu)</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-900 block mb-1">Phần II: Trắc nghiệm Đúng / Sai</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={tfCount}
                onChange={(e) => setTfCount(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-600">câu (4 ý / câu)</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 block mb-1">Phần III: Trả lời ngắn</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={saCount}
                onChange={(e) => setSaCount(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-600">câu (0.5đ / câu)</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Tổng số câu hỏi: <strong>{mcCount + tfCount + saCount} câu</strong> | Tổng điểm: <strong>10.0 điểm</strong>
        </div>
      </div>

      {/* Bộ lọc Chuyên đề & Bài học */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            CHỌN CHUYÊN ĐỀ & BÀI HỌC VÀO MA TRẬN ĐỀ THI:
          </h3>
          {/* Tabs Category */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách chủ đề và bài học */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {filteredTopics.map((topic) => {
            const isTopicSelected = selectedTopicIds.includes(topic.id);
            const isCollapsed = collapsedTopicIds.includes(topic.id);

            return (
              <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Topic Header */}
                <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => toggleTopic(topic)}>
                    <button type="button" className="text-blue-600">
                      {isTopicSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                    </button>
                    <span className="text-sm font-bold text-slate-800">{topic.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {topic.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllInTopic(topic)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Chọn hết
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeselectAllInTopic(topic)}
                      className="text-[11px] text-slate-500 hover:underline font-semibold"
                    >
                      Bỏ chọn
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTopicCollapse(topic.id)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Lessons list */}
                {!isCollapsed && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white">
                    {topic.lessons.map((lesson) => {
                      const isLessonSelected = selectedLessonIds.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => toggleLesson(lesson.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                            isLessonSelected
                              ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isLessonSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span>{lesson.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Đã chọn: <strong>{selectedTopicIds.length} chuyên đề</strong> | <strong>{selectedLessonIds.length} bài học</strong>
        </div>

        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>
          )}

          <button
            type="button"
            disabled={isGenerating || selectedLessonIds.length === 0}
            onClick={handleStartGenerate}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang tạo đề thi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Bắt đầu tạo đề thi mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorModal;
