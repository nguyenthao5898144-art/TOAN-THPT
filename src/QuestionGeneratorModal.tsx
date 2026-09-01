import React, { useState, useMemo, useEffect } from 'react';
import { TestConfig } from './types';
import { MATH_12_SYLLABUS, Topic, Lesson } from './math12Syllabus';
import {
  Sparkles, Sliders, BookOpen, Clock, Table, CheckSquare, Square,
  CheckCircle2, ChevronDown, ChevronUp, Layers, Award, FileText,
  Database, RefreshCw, X, RotateCcw, Check, ArrowRight
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
  // 1. Thông tin chung
  const [title, setTitle] = useState<string>(config?.title || 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018');
  const [durationMinutes, setDurationMinutes] = useState<number>(config?.durationMinutes || 45);
  const [activePreset, setActivePreset] = useState<'standard' | '15min' | 'advanced'>('standard');

  // 2. Cơ cấu Ma trận theo 3 dạng thức
  // Phần I: MCQ
  const [mcNB, setMcNB] = useState<number>(6);
  const [mcTH, setMcTH] = useState<number>(4);
  const [mcVD, setMcVD] = useState<number>(2);

  // Phần II: Đúng / Sai
  const [tfNB, setTfNB] = useState<number>(1);
  const [tfTH, setTfTH] = useState<number>(2);
  const [tfVD, setTfVD] = useState<number>(1);

  // Phần III: Trả lời ngắn
  const [saNB, setSaNB] = useState<number>(1);
  const [saTH, setSaTH] = useState<number>(2);
  const [saVD, setSaVD] = useState<number>(3);

  // 3. Chọn chủ đề & bài học & YCCĐ
  const initialTopicIds = config?.selectedTopicIds && config.selectedTopicIds.length > 0
    ? config.selectedTopicIds
    : [MATH_12_SYLLABUS[0].id];
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds);

  const initialLessonIds = config?.selectedLessonIds && config.selectedLessonIds.length > 0
    ? config.selectedLessonIds
    : MATH_12_SYLLABUS[0].lessons.map((l) => l.id);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(initialLessonIds);

  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [collapsedTopicIds, setCollapsedTopicIds] = useState<string[]>([]);

  // 4. Bảng Ma trận chi tiết YCCĐ
  const [yccdCounts, setYccdCounts] = useState<Record<string, { nb: number; th: number; vd: number }>>({});

  // Tổng số câu hỏi từng phần
  const totalMC = mcNB + mcTH + mcVD;
  const totalTF = tfNB + tfTH + tfVD;
  const totalSA = saNB + saTH + saVD;
  const totalQuestions = totalMC + totalTF + totalSA;

  // Tổng số câu theo mức độ nhận thức
  const totalNB = mcNB + tfNB + saNB;
  const totalTH = mcTH + tfTH + saTH;
  const totalVD = mcVD + tfVD + saVD;
  const totalScore = (totalMC * 0.25 + totalTF * 1.0 + totalSA * 0.5).toFixed(1);

  // Danh sách chủ đề được chọn
  const selectedTopics = useMemo(() => {
    return MATH_12_SYLLABUS.filter((t) => selectedTopicIds.includes(t.id));
  }, [selectedTopicIds]);

  // Tạo danh sách các dòng YCCĐ phẳng
  const flatYccdList = useMemo(() => {
    const list: { key: string; topicName: string; lessonName: string; outcome: string; outcomeIndex: number; topicId: string; lessonId: string }[] = [];
    selectedTopics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.includes(lesson.id)) {
          lesson.outcomes.forEach((outcome, idx) => {
            if (selectedOutcomes.length === 0 || selectedOutcomes.includes(outcome)) {
              list.push({
                key: `${topic.id}_${lesson.id}_${idx}`,
                topicName: topic.name,
                lessonName: lesson.name,
                outcome,
                outcomeIndex: idx + 1,
                topicId: topic.id,
                lessonId: lesson.id,
              });
            }
          });
        }
      });
    });
    return list;
  }, [selectedTopics, selectedLessonIds, selectedOutcomes]);

  // Tự động phân bổ đều số câu hỏi theo từng YCCĐ
  const handleAutoDistributeYccd = () => {
    const numRows = flatYccdList.length;
    if (numRows === 0) return;

    const newCounts: Record<string, { nb: number; th: number; vd: number }> = {};
    let remNB = totalNB;
    let remTH = totalTH;
    let remVD = totalVD;

    const baseNB = Math.floor(totalNB / numRows);
    const baseTH = Math.floor(totalTH / numRows);
    const baseVD = Math.floor(totalVD / numRows);

    flatYccdList.forEach((row, idx) => {
      const isLast = idx === numRows - 1;
      const nb = isLast ? remNB : baseNB;
      const th = isLast ? remTH : baseTH;
      const vd = isLast ? remVD : baseVD;

      remNB -= nb;
      remTH -= th;
      remVD -= vd;

      newCounts[row.key] = {
        nb: Math.max(0, nb),
        th: Math.max(0, th),
        vd: Math.max(0, vd),
      };
    });

    setYccdCounts(newCounts);
  };

  // Khởi tạo ban đầu cho YCCĐ khi danh sách YCCĐ thay đổi
  useEffect(() => {
    handleAutoDistributeYccd();
  }, [flatYccdList.length, totalQuestions]);

  const updateYccdCount = (key: string, field: 'nb' | 'th' | 'vd', val: number) => {
    setYccdCounts((prev) => ({
      ...prev,
      [key]: {
        nb: prev[key]?.nb || 0,
        th: prev[key]?.th || 0,
        vd: prev[key]?.vd || 0,
        [field]: Math.max(0, val),
      },
    }));
  };

  // Tổng số câu hiện tại trong bảng YCCĐ
  const sumYccdNB = flatYccdList.reduce((sum, r) => sum + (yccdCounts[r.key]?.nb || 0), 0);
  const sumYccdTH = flatYccdList.reduce((sum, r) => sum + (yccdCounts[r.key]?.th || 0), 0);
  const sumYccdVD = flatYccdList.reduce((sum, r) => sum + (yccdCounts[r.key]?.vd || 0), 0);
  const sumYccdTotal = sumYccdNB + sumYccdTH + sumYccdVD;
  const isMatrixSynced = sumYccdTotal === totalQuestions;

  // Áp dụng mẫu ma trận nhanh
  const applyPreset = (preset: 'standard' | '15min' | 'advanced') => {
    setActivePreset(preset);
    if (preset === 'standard') {
      setDurationMinutes(45);
      setMcNB(6); setMcTH(4); setMcVD(2);
      setTfNB(1); setTfTH(2); setTfVD(1);
      setSaNB(1); setSaTH(2); setSaVD(3);
    } else if (preset === '15min') {
      setDurationMinutes(15);
      setMcNB(3); setMcTH(2); setMcVD(1);
      setTfNB(0); setTfTH(1); setTfVD(1);
      setSaNB(0); setSaTH(1); setSaVD(1);
    } else if (preset === 'advanced') {
      setDurationMinutes(90);
      setMcNB(4); setMcTH(4); setMcVD(4);
      setTfNB(0); setTfTH(2); setTfVD(2);
      setSaNB(0); setSaTH(1); setSaVD(1);
    }
  };

  const toggleTopic = (topicId: string) => {
    const topic = MATH_12_SYLLABUS.find((t) => t.id === topicId);
    if (!topic) return;
    const lessonIds = topic.lessons.map((l) => l.id);

    if (selectedTopicIds.includes(topicId)) {
      if (selectedTopicIds.length <= 1) return;
      setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
      setSelectedLessonIds((prev) => prev.filter((id) => !lessonIds.includes(id)));
    } else {
      setSelectedTopicIds((prev) => [...prev, topicId]);
      setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...lessonIds])));
    }
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const handleSelectAllTopics = () => {
    const allTopicIds = MATH_12_SYLLABUS.map((t) => t.id);
    const allLessonIds = MATH_12_SYLLABUS.flatMap((t) => t.lessons.map((l) => l.id));
    setSelectedTopicIds(allTopicIds);
    setSelectedLessonIds(allLessonIds);
  };

  const handleDeselectAllTopics = () => {
    if (MATH_12_SYLLABUS.length > 0) {
      setSelectedTopicIds([MATH_12_SYLLABUS[0].id]);
      setSelectedLessonIds(MATH_12_SYLLABUS[0].lessons.map((l) => l.id));
    }
  };

  const handleStartGenerate = (source: 'ai' | 'bank') => {
    const newConfig: TestConfig = {
      ...config,
      title,
      grade: '12',
      durationMinutes,
      selectedTopicIds,
      selectedLessonIds,
      selectedOutcomes,
      questionCountByType: {
        multipleChoice: totalMC,
        trueFalse: totalTF,
        shortAnswer: totalSA,
      },
    };

    if (typeof setConfig === 'function') {
      setConfig(newConfig);
    }

    if (source === 'bank' && typeof onGenerateFromBank === 'function') {
      onGenerateFromBank();
    } else if (typeof onGenerate === 'function') {
      onGenerate(newConfig);
    }
  };

  return (
    <div className="font-sans text-slate-800 space-y-5">
      {/* 1. KHỐI CHỌN CHỦ ĐỀ LỚN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {MATH_12_SYLLABUS.map((topic) => {
          const isSelected = selectedTopicIds.includes(topic.id);
          return (
            <div
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <button type="button" className="mt-0.5 text-blue-600">
                {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                  {topic.category}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug truncate">{topic.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{topic.lessons.length} bài học</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* DANH SÁCH BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              DANH SÁCH BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT CỦA CÁC CHỦ ĐỀ ĐÃ CHỌN ({selectedTopics.length} chủ đề):
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleSelectAllTopics}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold"
            >
              Chọn tất cả bài
            </button>
            <button
              type="button"
              onClick={handleDeselectAllTopics}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md font-semibold"
            >
              Bỏ chọn bài
            </button>
          </div>
        </div>

        {/* Danh sách bài học và YCCĐ */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {selectedTopics.map((topic) => (
            <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              <div className="p-2.5 bg-slate-100/80 flex items-center justify-between border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {topic.category.toUpperCase()}: {topic.name}
                </span>
                <button
                  type="button"
                  onClick={() => setCollapsedTopicIds((prev) =>
                    prev.includes(topic.id) ? prev.filter((id) => id !== topic.id) : [...prev, topic.id]
                  )}
                  className="text-slate-500 hover:text-slate-800"
                >
                  {collapsedTopicIds.includes(topic.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedTopicIds.includes(topic.id) && (
                <div className="p-3 space-y-2.5 bg-white">
                  {topic.lessons.map((lesson, lIdx) => {
                    const isLessonSelected = selectedLessonIds.includes(lesson.id);
                    return (
                      <div key={lesson.id} className="border border-slate-200 rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => toggleLesson(lesson.id)}
                            className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800"
                          >
                            <button type="button" className="text-blue-600">
                              {isLessonSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            <span>Bài {lIdx + 1}: {lesson.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {lesson.outcomes.length} YCCĐ
                          </span>
                        </div>

                        {isLessonSelected && (
                          <div className="space-y-1.5 pl-6 border-t border-slate-100 pt-2">
                            {lesson.outcomes.map((outcome, oIdx) => {
                              const isOutcomeSelected = selectedOutcomes.length === 0 || selectedOutcomes.includes(outcome);
                              return (
                                <div
                                  key={oIdx}
                                  onClick={() => toggleOutcome(outcome)}
                                  className={`p-1.5 rounded text-[11px] cursor-pointer flex items-start gap-2 border ${
                                    isOutcomeSelected
                                      ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-medium'
                                      : 'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}
                                >
                                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-bold shrink-0 mt-0.5">
                                    YCCĐ {oIdx + 1}
                                  </span>
                                  <span>{outcome}</span>
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
          ))}
        </div>
      </div>

      {/* BƯỚC 2: TẠO & CẤU HÌNH MA TRẬN CHI TIẾT */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded">BƯỚC 2</span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              TẠO & CẤU HÌNH MA TRẬN CHI TIẾT (PHÂN BỐ SỐ CÂU THEO MỖI YCCĐ)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold">Mẫu ma trận nhanh:</span>
            <button
              type="button"
              onClick={() => applyPreset('standard')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activePreset === 'standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Chuẩn GDPT 2018 (22 câu - 10đ)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('15min')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activePreset === '15min' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Kiểm tra 15 Phút (10 câu)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('advanced')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activePreset === 'advanced' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Phân hóa / Nâng cao (18 câu)
            </button>
          </div>
        </div>

        {/* Bảng Dạng câu hỏi */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
              <tr>
                <th className="border border-slate-300 p-2 text-left">Dạng câu hỏi (Định dạng Bộ GD&ĐT)</th>
                <th className="border border-slate-300 p-2 bg-blue-50 text-blue-900 w-24">Nhận biết</th>
                <th className="border border-slate-300 p-2 bg-indigo-50 text-indigo-900 w-24">Thông hiểu</th>
                <th className="border border-slate-300 p-2 bg-emerald-50 text-emerald-900 w-24">Vận dụng</th>
                <th className="border border-slate-300 p-2 bg-slate-200 text-slate-900 font-black w-24">Tổng số câu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 text-left font-semibold">Phần I: Trắc nghiệm 4 lựa chọn (0.25đ / câu)</td>
                <td className="border border-slate-300 p-1 bg-blue-50/30">
                  <input type="number" min={0} value={mcNB} onChange={(e) => setMcNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-indigo-50/30">
                  <input type="number" min={0} value={mcTH} onChange={(e) => setMcTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-emerald-50/30">
                  <input type="number" min={0} value={mcVD} onChange={(e) => setMcVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalMC} câu</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-left font-semibold">Phần II: Trắc nghiệm Đúng/Sai (Mỗi câu gồm 4 ý a, b, c, d)</td>
                <td className="border border-slate-300 p-1 bg-blue-50/30">
                  <input type="number" min={0} value={tfNB} onChange={(e) => setTfNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-indigo-50/30">
                  <input type="number" min={0} value={tfTH} onChange={(e) => setTfTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-emerald-50/30">
                  <input type="number" min={0} value={tfVD} onChange={(e) => setTfVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalTF} câu</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-left font-semibold">Phần III: Trắc nghiệm trả lời ngắn (0.5đ / câu)</td>
                <td className="border border-slate-300 p-1 bg-blue-50/30">
                  <input type="number" min={0} value={saNB} onChange={(e) => setSaNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-indigo-50/30">
                  <input type="number" min={0} value={saTH} onChange={(e) => setSaTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-1 bg-emerald-50/30">
                  <input type="number" min={0} value={saVD} onChange={(e) => setSaVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" />
                </td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalSA} câu</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG MA TRẬN CHI TIẾT YCCĐ (ĐÚNG THEO ẢNH YÊU CẦU) */}
        <div className="border border-emerald-300 rounded-xl overflow-hidden shadow-sm mt-4 bg-white">
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black rounded uppercase">
                MA TRẬN CHI TIẾT YCCĐ
              </span>
              <span className="text-xs font-bold text-emerald-950">
                ≛ PHÂN BỐ SỐ CÂU CHI TIẾT THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeYccd}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tự động chia đều số câu theo YCCĐ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th className="border border-slate-300 p-2 text-left min-w-[140px]">Chủ đề</th>
                  <th className="border border-slate-300 p-2 text-left min-w-[120px]">Bài học</th>
                  <th className="border border-slate-300 p-2 text-left min-w-[220px]">Yêu cầu cần đạt (YCCĐ)</th>
                  <th className="border border-slate-300 p-2 bg-blue-50 text-blue-900 w-16">NB</th>
                  <th className="border border-slate-300 p-2 bg-indigo-50 text-indigo-900 w-16">TH</th>
                  <th className="border border-slate-300 p-2 bg-emerald-50 text-emerald-900 w-16">VD</th>
                  <th className="border border-slate-300 p-2 bg-slate-200 text-slate-900 font-black w-20">Tổng câu</th>
                </tr>
              </thead>
              <tbody>
                {flatYccdList.map((row) => {
                  const counts = yccdCounts[row.key] || { nb: 0, th: 0, vd: 0 };
                  const rowTotal = counts.nb + counts.th + counts.vd;
                  return (
                    <tr key={row.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="border border-slate-300 p-2 text-left font-bold text-slate-800">{row.topicName}</td>
                      <td className="border border-slate-300 p-2 text-left text-slate-700 font-semibold">{row.lessonName}</td>
                      <td className="border border-slate-300 p-2 text-left">
                        <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold mr-1.5">
                          YCCĐ {row.outcomeIndex}
                        </span>
                        <span className="text-[11px] text-slate-700">{row.outcome}</span>
                      </td>
                      <td className="border border-slate-300 p-1 bg-blue-50/20">
                        <input
                          type="number"
                          min={0}
                          value={counts.nb}
                          onChange={(e) => updateYccdCount(row.key, 'nb', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 bg-indigo-50/20">
                        <input
                          type="number"
                          min={0}
                          value={counts.th}
                          onChange={(e) => updateYccdCount(row.key, 'th', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 bg-emerald-50/20">
                        <input
                          type="number"
                          min={0}
                          value={counts.vd}
                          onChange={(e) => updateYccdCount(row.key, 'vd', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-2 font-black text-slate-900 bg-slate-50">{rowTotal} câu</td>
                    </tr>
                  );
                })}

                {/* Hàng tổng cộng YCCĐ */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={3} className="border border-slate-300 p-2 text-right uppercase tracking-wider">
                    TỔNG CỘNG SỐ CÂU PHÂN BỔ THEO YCCĐ:
                  </td>
                  <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900">{sumYccdNB} NB</td>
                  <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">{sumYccdTH} TH</td>
                  <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900">{sumYccdVD} VD</td>
                  <td className="border border-slate-300 p-2 bg-emerald-800 text-white font-black text-sm">{sumYccdTotal} CÂU</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isMatrixSynced ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ma trận chi tiết YCCĐ khớp 100% với tổng Ma trận Dạng câu hỏi ({totalQuestions} câu)
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Chưa khớp số câu ({sumYccdTotal} / {totalQuestions} câu). Bấm "Tự động chia đều" để đồng bộ.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeYccd}
              className="text-blue-600 hover:underline font-bold"
            >
              Đồng bộ lại theo Ma trận Dạng câu hỏi
            </button>
          </div>
        </div>
      </div>

      {/* BƯỚC 3: TẠO ĐỀ THI HOÀN CHỈNH (TỪ AI HOẶC TỪ NGÂN HÀNG CÂU HỎI) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-600 text-white text-[11px] font-black rounded">BƯỚC 3</span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              TẠO ĐỀ THI HOÀN CHỈNH (TỪ AI HOẶC TỪ NGÂN HÀNG CÂU HỎI)
            </h3>
          </div>
          <div className="text-xs font-bold text-slate-700">
            Tổng cộng: <strong className="text-blue-700">{totalQuestions} câu hỏi</strong> | <strong className="text-emerald-700">{totalScore} điểm</strong>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Đề thi sẽ được khởi tạo 100% đúng theo ma trận {totalQuestions} câu và các YCCĐ đã chọn ở trên. Vui lòng chọn nguồn tạo đề:
        </p>

        {/* 2 NÚT TẠO ĐỀ CHÍNH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Nút 1: Tạo đề từ AI Gemini */}
          <button
            type="button"
            disabled={isGenerating || selectedLessonIds.length === 0}
            onClick={() => handleStartGenerate('ai')}
            className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-left shadow-lg hover:shadow-xl transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" /> TẠO ĐỀ TỪ AI (GEMINI)
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Tự động 100%</span>
            </div>
            <p className="text-[11px] text-blue-100">
              AI sẽ tự động biên soạn mới toàn bộ {totalQuestions} câu hỏi bám sát Ma trận & YCCĐ GDPT 2018.
            </p>
          </button>

          {/* Nút 2: Tạo đề từ Ngân hàng */}
          <button
            type="button"
            disabled={isGenerating || selectedLessonIds.length === 0}
            onClick={() => handleStartGenerate('bank')}
            className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:bg-slate-300 text-white rounded-xl text-left shadow-lg hover:shadow-xl transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-200" /> TẠO ĐỀ TỪ NGÂN HÀNG
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Có sẵn mẫu</span>
            </div>
            <p className="text-[11px] text-emerald-100">
              Lấy câu hỏi & bài tập chuẩn mực từ Ngân hàng câu hỏi có sẵn theo đúng tỉ lệ ma trận đã cấu hình.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorModal;
