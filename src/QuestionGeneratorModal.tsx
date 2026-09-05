import React, { useState, useMemo, useEffect } from 'react';
import { TestConfig } from './types';
import { getSyllabusByGrade, MATH_12_SYLLABUS, Topic, Lesson } from './math12Syllabus';
import {
  Sparkles, BookOpen, Clock, Table, CheckSquare, Square,
  CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Layers
} from 'lucide-react';

export interface QuestionGeneratorModalProps {
  config?: TestConfig;
  setConfig?: React.Dispatch<React.SetStateAction<TestConfig>>;
  onGenerate: (overrideConfig?: TestConfig) => void;
  onGenerateFromBank?: () => void;
  isGenerating?: boolean;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  config,
  setConfig,
  onGenerate,
  isGenerating = false,
}) => {
 // 1. Khối lớp (10, 11, 12)
  const [grade, setGrade] = useState<'10' | '11' | '12'>((config?.grade as any) || '10');
  const [title, setTitle] = useState<string>(config?.title || 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN 10 - GDPT 2018');
  const [durationMinutes, setDurationMinutes] = useState<number>(config?.durationMinutes || 45);
  const [activePreset, setActivePreset] = useState<'standard' | '15min' | 'advanced'>('standard');
  const currentSyllabus = useMemo(() => {
    try {
      const s = getSyllabusByGrade(grade);
      return s && s.length > 0 ? s : getSyllabusByGrade('10');
    } catch {
      return getSyllabusByGrade('10');
    }
  }, [grade]);
  // 2. Cơ cấu Ma trận theo 3 dạng thức
  const [mcNB, setMcNB] = useState<number>(6);
  const [mcTH, setMcTH] = useState<number>(4);
  const [mcVD, setMcVD] = useState<number>(2);

  const [tfNB, setTfNB] = useState<number>(1);
  const [tfTH, setTfTH] = useState<number>(2);
  const [tfVD, setTfVD] = useState<number>(1);

  const [saNB, setSaNB] = useState<number>(1);
  const [saTH, setSaTH] = useState<number>(2);
  const [saVD, setSaVD] = useState<number>(3);

  // 3. Quản lý chọn Chủ đề, Bài học, YCCĐ
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(() => [currentSyllabus[0]?.id || 'topic_dao_ham']);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(() => currentSyllabus[0]?.lessons.map((l) => l.id) || []);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>(() => currentSyllabus[0]?.lessons.flatMap((l) => l.outcomes) || []);

  const [collapsedTopicIds, setCollapsedTopicIds] = useState<string[]>([]);
  const [collapsedLessonIds, setCollapsedLessonIds] = useState<string[]>([]);
  const [yccdCounts, setYccdCounts] = useState<Record<string, { nb: number; th: number; vd: number }>>({});

  // Đổi khối lớp
  const handleSwitchGrade = (newGrade: '10' | '11' | '12') => {
    setGrade(newGrade);
    setTitle(`ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN ${newGrade} - GDPT 2018`);
    const syl = getSyllabusByGrade(newGrade);
    if (syl.length > 0) {
      setSelectedTopicIds([syl[0].id]);
      setSelectedLessonIds(syl[0].lessons.map((l) => l.id));
      setSelectedOutcomes(syl[0].lessons.flatMap((l) => l.outcomes));
    }
  };

  const totalMC = mcNB + mcTH + mcVD;
  const totalTF = tfNB + tfTH + tfVD;
  const totalSA = saNB + saTH + saVD;
  const totalQuestions = totalMC + totalTF + totalSA;

  const totalNB = mcNB + tfNB + saNB;
  const totalTH = mcTH + tfTH + saTH;
  const totalVD = mcVD + tfVD + saVD;
  const totalScore = (totalMC * 0.25 + totalTF * 1.0 + totalSA * 0.5).toFixed(1);

  // Lọc các chủ đề đang chọn
  const selectedTopics = useMemo(() => {
    return currentSyllabus.filter((t) => selectedTopicIds.includes(t.id));
  }, [currentSyllabus, selectedTopicIds]);

  // Tạo danh sách phẳng YCCĐ
  const flatYccdList = useMemo(() => {
    const list: { key: string; topicName: string; lessonName: string; outcome: string; outcomeIndex: number }[] = [];
    selectedTopics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.includes(lesson.id)) {
          lesson.outcomes.forEach((outcome, idx) => {
            if (selectedOutcomes.includes(outcome)) {
              list.push({
                key: `${topic.id}_${lesson.id}_${idx}`,
                topicName: topic.name,
                lessonName: lesson.name,
                outcome,
                outcomeIndex: idx + 1,
              });
            }
          });
        }
      });
    });
    return list;
  }, [selectedTopics, selectedLessonIds, selectedOutcomes]);

  // Tự động chia đều số câu theo YCCĐ
  const handleAutoDistribute = () => {
    const numRows = flatYccdList.length;
    if (numRows === 0) return;
    const res: Record<string, { nb: number; th: number; vd: number }> = {};
    const bNB = Math.floor(totalNB / numRows);
    const bTH = Math.floor(totalTH / numRows);
    const baseVD = Math.floor(totalVD / numRows);
    let remNB = totalNB;
    let remTH = totalTH;
    let remVD = totalVD;

    flatYccdList.forEach((row, idx) => {
      const isLast = idx === numRows - 1;
      const nb = isLast ? remNB : bNB;
      const th = isLast ? remTH : bTH;
      const vd = isLast ? remVD : baseVD;
      remNB -= nb;
      remTH -= th;
      remVD -= vd;
      res[row.key] = { nb: Math.max(0, nb), th: Math.max(0, th), vd: Math.max(0, vd) };
    });
    setYccdCounts(res);
  };

  useEffect(() => {
    handleAutoDistribute();
  }, [flatYccdList.length, totalQuestions]);

  const updateCount = (key: string, field: 'nb' | 'th' | 'vd', val: number) => {
    setYccdCounts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { nb: 0, th: 0, vd: 0 }), [field]: Math.max(0, val) },
    }));
  };

  const sumNB = flatYccdList.reduce((s, r) => s + (yccdCounts[r.key]?.nb || 0), 0);
  const sumTH = flatYccdList.reduce((s, r) => s + (yccdCounts[r.key]?.th || 0), 0);
  const sumVD = flatYccdList.reduce((s, r) => s + (yccdCounts[r.key]?.vd || 0), 0);
  const sumTotal = sumNB + sumTH + sumVD;
  const isMatrixSynced = sumTotal === totalQuestions;

  // Xử lý chọn/bỏ chọn
  const toggleTopic = (topic: Topic) => {
    const isSelected = selectedTopicIds.includes(topic.id);
    const lIds = topic.lessons.map((l) => l.id);
    const oList = topic.lessons.flatMap((l) => l.outcomes);

    if (isSelected) {
      if (selectedTopicIds.length <= 1) return;
      setSelectedTopicIds((prev) => prev.filter((id) => id !== topic.id));
      setSelectedLessonIds((prev) => prev.filter((id) => !lIds.includes(id)));
      setSelectedOutcomes((prev) => prev.filter((o) => !oList.includes(o)));
    } else {
      setSelectedTopicIds((prev) => [...prev, topic.id]);
      setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...lIds])));
      setSelectedOutcomes((prev) => Array.from(new Set([...prev, ...oList])));
    }
  };

  const toggleLesson = (lesson: Lesson) => {
    const isSelected = selectedLessonIds.includes(lesson.id);
    if (isSelected) {
      setSelectedLessonIds((prev) => prev.filter((id) => id !== lesson.id));
      setSelectedOutcomes((prev) => prev.filter((o) => !lesson.outcomes.includes(o)));
    } else {
      setSelectedLessonIds((prev) => [...prev, lesson.id]);
      setSelectedOutcomes((prev) => Array.from(new Set([...prev, ...lesson.outcomes])));
    }
  };

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const handleSelectAllOutcomesInLesson = (lesson: Lesson) => {
    if (!selectedLessonIds.includes(lesson.id)) {
      setSelectedLessonIds((prev) => [...prev, lesson.id]);
    }
    setSelectedOutcomes((prev) => Array.from(new Set([...prev, ...lesson.outcomes])));
  };

  const handleDeselectAllOutcomesInLesson = (lesson: Lesson) => {
    setSelectedOutcomes((prev) => prev.filter((o) => !lesson.outcomes.includes(o)));
  };

  const handleSelectAllYccd = () => {
    const allOutcomes = selectedTopics.flatMap((t) => t.lessons.flatMap((l) => l.outcomes));
    setSelectedOutcomes(allOutcomes);
  };

  const handleDeselectAllYccd = () => {
    setSelectedOutcomes([]);
  };

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

  // Nút hành động duy nhất "KIỂM TRA"
  const handleExecuteExamCreation = () => {
    const newCfg: TestConfig = {
      ...config,
      title,
      grade,
      durationMinutes,
      selectedTopicIds,
      selectedLessonIds,
      selectedOutcomes,
      questionCountByType: { multipleChoice: totalMC, trueFalse: totalTF, shortAnswer: totalSA },
    };
    if (setConfig) setConfig(newCfg);
    onGenerate(newCfg);
  };

  return (
    <div className="font-sans space-y-6 text-slate-800">
      {/* 1. BỘ CHỌN KHỐI LỚP 10, 11, 12 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl text-white shadow">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold px-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-400" /> CHỌN KHỐI LỚP:
          </span>
          <div className="flex gap-1.5">
            {(['10', '11', '12'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSwitchGrade(g)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  grade === g ? 'bg-blue-600 text-white shadow ring-2 ring-blue-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                TOÁN {g}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[11px] text-slate-300 font-semibold px-2">
          Chương trình GDPT 2018 • Khối {grade} ({currentSyllabus.length} chủ đề)
        </span>
      </div>

      {/* 2. CHỌN CHỦ ĐỀ (5 THẺ CHỦ ĐỀ LỚN NHƯ TRONG ẢNH) */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          1. Tích chọn các Chủ đề cần khảo sát & kiểm tra:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentSyllabus.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            return (
              <div
                key={topic.id}
                onClick={() => toggleTopic(topic)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button type="button" className="mt-0.5 text-blue-600">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {topic.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug line-clamp-2">{topic.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{topic.lessons.length} bài học</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DANH SÁCH BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ) CHI TIẾT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              DANH SÁCH BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT CỦA CÁC CHỦ ĐỀ ĐÃ CHỌN ({selectedTopics.length} chủ đề):
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleSelectAllYccd}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all"
            >
              Chọn tất cả YCCĐ
            </button>
            <button
              type="button"
              onClick={handleDeselectAllYccd}
              className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-all"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* Danh sách từng chủ đề -> từng bài học -> từng YCCĐ */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1.5">
          {selectedTopics.map((topic) => (
            <div key={topic.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60 shadow-sm">
              {/* Header Chủ đề */}
              <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase">
                    {topic.category}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    Chủ đề: {topic.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsedTopicIds((prev) =>
                    prev.includes(topic.id) ? prev.filter((id) => id !== topic.id) : [...prev, topic.id]
                  )}
                  className="text-slate-500 hover:text-slate-800 p-1"
                >
                  {collapsedTopicIds.includes(topic.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedTopicIds.includes(topic.id) && (
                <div className="p-3 space-y-3 bg-white">
                  {topic.lessons.map((lesson, lIdx) => {
                    const isLessonSelected = selectedLessonIds.includes(lesson.id);
                    const isLessonCollapsed = collapsedLessonIds.includes(lesson.id);
                    const selectedOutcomesInThisLesson = lesson.outcomes.filter((o) => selectedOutcomes.includes(o)).length;

                    return (
                      <div key={lesson.id} className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-slate-50/30">
                        {/* Header Bài học */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div
                            onClick={() => toggleLesson(lesson)}
                            className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900"
                          >
                            <button type="button" className="text-blue-600">
                              {isLessonSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                            </button>
                            <span>Bài {lIdx + 1}: {lesson.name}</span>
                            <span className="text-[10px] px-2 py-0.2 bg-blue-50 text-blue-800 rounded-full font-bold border border-blue-200">
                              Đã chọn {selectedOutcomesInThisLesson}/{lesson.outcomes.length} YCCĐ
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleSelectAllOutcomesInLesson(lesson)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Chọn hết YCCĐ
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllOutcomesInLesson(lesson)}
                              className="text-slate-500 hover:underline font-semibold"
                            >
                              Bỏ YCCĐ
                            </button>
                            <button
                              type="button"
                              onClick={() => setCollapsedLessonIds((prev) =>
                                prev.includes(lesson.id) ? prev.filter((id) => id !== lesson.id) : [...prev, lesson.id]
                              )}
                              className="p-1 text-slate-400 hover:text-slate-700"
                            >
                              {isLessonCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Danh sách từng thẻ YCCĐ con */}
                        {!isLessonCollapsed && (
                          <div className="space-y-1.5 pl-4">
                            {lesson.outcomes.map((outcome, oIdx) => {
                              const isOutcomeSelected = selectedOutcomes.includes(outcome);
                              return (
                                <div
                                  key={oIdx}
                                  onClick={() => toggleOutcome(outcome)}
                                  className={`p-2 rounded-xl text-xs cursor-pointer flex items-start gap-2.5 border transition-all ${
                                    isOutcomeSelected
                                      ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <button type="button" className="mt-0.5 text-blue-600 shrink-0">
                                    {isOutcomeSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                                  </button>
                                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px] font-bold shrink-0 mt-0.5">
                                    YCCĐ {oIdx + 1}
                                  </span>
                                  <span className="text-[11px] leading-relaxed">{outcome}</span>
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

      {/* BƯỚC 2: TẠO & CẤU HÌNH MA TRẬN CHI TIẾT (PHÂN BỔ SỐ CÂU THEO MỖI YCCĐ) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
                activePreset === 'standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Chuẩn GDPT 2018 (22 câu - 10đ)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('15min')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activePreset === '15min' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Kiểm tra 15 Phút (10 câu)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('advanced')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activePreset === 'advanced' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Phân hóa / Nâng cao (18 câu)
            </button>
          </div>
        </div>

        {/* Bảng Dạng thức câu hỏi */}
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
                <td className="border border-slate-300 p-1 bg-blue-50/20"><input type="number" min={0} value={mcNB} onChange={(e) => setMcNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-indigo-50/20"><input type="number" min={0} value={mcTH} onChange={(e) => setMcTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-emerald-50/20"><input type="number" min={0} value={mcVD} onChange={(e) => setMcVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalMC} câu</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-left font-semibold">Phần II: Trắc nghiệm Đúng/Sai (Mỗi câu gồm 4 ý)</td>
                <td className="border border-slate-300 p-1 bg-blue-50/20"><input type="number" min={0} value={tfNB} onChange={(e) => setTfNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-indigo-50/20"><input type="number" min={0} value={tfTH} onChange={(e) => setTfTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-emerald-50/20"><input type="number" min={0} value={tfVD} onChange={(e) => setTfVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalTF} câu</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-left font-semibold">Phần III: Trắc nghiệm trả lời ngắn (0.5đ / câu)</td>
                <td className="border border-slate-300 p-1 bg-blue-50/20"><input type="number" min={0} value={saNB} onChange={(e) => setSaNB(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-indigo-50/20"><input type="number" min={0} value={saTH} onChange={(e) => setSaTH(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-1 bg-emerald-50/20"><input type="number" min={0} value={saVD} onChange={(e) => setSaVD(Number(e.target.value))} className="w-16 p-1 text-center font-bold border rounded" /></td>
                <td className="border border-slate-300 p-2 font-bold bg-slate-50">{totalSA} câu</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="border border-slate-300 p-2 text-left">TỔNG CỘNG SỐ CÂU:</td>
                <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900 font-black">{totalNB} NB</td>
                <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900 font-black">{totalTH} TH</td>
                <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900 font-black">{totalVD} VD</td>
                <td className="border border-slate-300 p-2 bg-amber-200 text-amber-950 font-black">{totalQuestions} CÂU</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG MA TRẬN CHI TIẾT YCCĐ */}
        <div className="border border-emerald-300 rounded-2xl overflow-hidden shadow-sm mt-4 bg-white">
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black rounded uppercase">
                MA TRẬN CHI TIẾT YCCĐ
              </span>
              <span className="text-xs font-bold text-emerald-950">
                ≛ PHÂN BỐ SỐ CÂU CHI TIẾT THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YCCĐ (TOÁN {grade})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoDistribute}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tự động chia đều số câu theo YCCĐ
            </button>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px] sticky top-0 bg-white">
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
                    <tr key={row.key} className="hover:bg-slate-50 transition-colors">
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
                          onChange={(e) => updateCount(row.key, 'nb', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 bg-indigo-50/20">
                        <input
                          type="number"
                          min={0}
                          value={counts.th}
                          onChange={(e) => updateCount(row.key, 'th', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 bg-emerald-50/20">
                        <input
                          type="number"
                          min={0}
                          value={counts.vd}
                          onChange={(e) => updateCount(row.key, 'vd', Number(e.target.value))}
                          className="w-12 p-1 text-center font-bold border rounded bg-white"
                        />
                      </td>
                      <td className="border border-slate-300 p-2 font-black text-slate-900 bg-slate-50">{rowTotal} câu</td>
                    </tr>
                  );
                })}

                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={3} className="border border-slate-300 p-2 text-right uppercase tracking-wider">
                    TỔNG CỘNG SỐ CÂU PHÂN BỔ THEO YCCĐ:
                  </td>
                  <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900">{sumNB} NB</td>
                  <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">{sumTH} TH</td>
                  <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900">{sumVD} VD</td>
                  <td className="border border-slate-300 p-2 bg-emerald-800 text-white font-black text-sm">{sumTotal} CÂU</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {isMatrixSynced ? `Ma trận chi tiết YCCĐ khớp 100% với tổng số câu (${totalQuestions} câu)` : `Chưa khớp số câu (${sumTotal} / ${totalQuestions} câu). Bấm "Tự động chia đều" để đồng bộ.`}
            </span>
            <button
              type="button"
              onClick={handleAutoDistribute}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Đồng bộ lại theo Ma trận
            </button>
          </div>
        </div>
      </div>

      {/* 4. NÚT DUY NHẤT "KIỂM TRA" */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b pb-2 text-xs font-bold text-slate-700">
          <span>BƯỚC 3: XÁC NHẬN CẤU HÌNH & KHỞI TẠO ĐỀ THI</span>
          <span className="text-blue-700 font-bold">{totalQuestions} câu hỏi | {totalScore} điểm</span>
        </div>

        <button
          type="button"
          disabled={isGenerating || flatYccdList.length === 0}
          onClick={handleExecuteExamCreation}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all cursor-pointer tracking-wider uppercase"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          KIỂM TRA
        </button>
        <p className="text-[11px] text-slate-500 text-center font-medium">
          Hệ thống tự động biên soạn mới và chuẩn hóa trọn bộ {totalQuestions} câu hỏi Toán {grade} đúng ma trận YCCĐ
        </p>
      </div>
    </div>
  );
};

export default QuestionGeneratorModal;
