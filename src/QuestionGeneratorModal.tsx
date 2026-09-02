import React, { useState, useMemo, useEffect } from 'react';
import { TestConfig } from './types';
import { getSyllabusByGrade, MATH_12_SYLLABUS, Topic } from './math12Syllabus';
import { Sparkles, BookOpen, Table, CheckSquare, Square, Database, RefreshCw } from 'lucide-react';

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
  onGenerateFromBank,
  isGenerating = false,
}) => {
  const [grade, setGrade] = useState<'10' | '11' | '12'>((config?.grade as any) || '12');
  const [title, setTitle] = useState<string>(config?.title || 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018');
  const [durationMinutes, setDurationMinutes] = useState<number>(config?.durationMinutes || 45);

  const currentSyllabus = useMemo(() => {
    try {
      const s = getSyllabusByGrade(grade);
      return s && s.length > 0 ? s : MATH_12_SYLLABUS;
    } catch {
      return MATH_12_SYLLABUS;
    }
  }, [grade]);

  const [mcNB, setMcNB] = useState<number>(6);
  const [mcTH, setMcTH] = useState<number>(4);
  const [mcVD, setMcVD] = useState<number>(2);

  const [tfNB, setTfNB] = useState<number>(1);
  const [tfTH, setTfTH] = useState<number>(2);
  const [tfVD, setTfVD] = useState<number>(1);

  const [saNB, setSaNB] = useState<number>(1);
  const [saTH, setSaTH] = useState<number>(2);
  const [saVD, setSaVD] = useState<number>(3);

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(() => [currentSyllabus[0]?.id || 'topic_dao_ham']);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(() => currentSyllabus[0]?.lessons.map((l) => l.id) || []);
  const [yccdCounts, setYccdCounts] = useState<Record<string, { nb: number; th: number; vd: number }>>({});

  const handleSwitchGrade = (newGrade: '10' | '11' | '12') => {
    setGrade(newGrade);
    setTitle(`ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN ${newGrade} - GDPT 2018`);
    const syl = getSyllabusByGrade(newGrade);
    if (syl.length > 0) {
      setSelectedTopicIds([syl[0].id]);
      setSelectedLessonIds(syl[0].lessons.map((l) => l.id));
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

  const selectedTopics = useMemo(() => currentSyllabus.filter((t) => selectedTopicIds.includes(t.id)), [currentSyllabus, selectedTopicIds]);

  const flatYccdList = useMemo(() => {
    const list: { key: string; topicName: string; lessonName: string; outcome: string; idx: number }[] = [];
    selectedTopics.forEach((t) => {
      t.lessons.forEach((l) => {
        if (selectedLessonIds.includes(l.id)) {
          l.outcomes.forEach((o, idx) => {
            list.push({ key: `${t.id}_${l.id}_${idx}`, topicName: t.name, lessonName: l.name, outcome: o, idx: idx + 1 });
          });
        }
      });
    });
    return list;
  }, [selectedTopics, selectedLessonIds]);

  const handleAutoDistribute = () => {
    const n = flatYccdList.length;
    if (n === 0) return;
    const res: Record<string, { nb: number; th: number; vd: number }> = {};
    const bNB = Math.floor(totalNB / n);
    const bTH = Math.floor(totalTH / n);
    const bVD = Math.floor(totalVD / n);
    let rNB = totalNB;
    let rTH = totalTH;
    let rVD = totalVD;

    flatYccdList.forEach((r, i) => {
      const last = i === n - 1;
      const nb = last ? rNB : bNB;
      const th = last ? rTH : bTH;
      const vd = last ? rVD : bVD;
      rNB -= nb; rTH -= th; rVD -= vd;
      res[r.key] = { nb: Math.max(0, nb), th: Math.max(0, th), vd: Math.max(0, vd) };
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

  const toggleTopic = (topic: Topic) => {
    const isSelected = selectedTopicIds.includes(topic.id);
    const lIds = topic.lessons.map((l) => l.id);
    if (isSelected) {
      if (selectedTopicIds.length <= 1) return;
      setSelectedTopicIds(selectedTopicIds.filter((id) => id !== topic.id));
      setSelectedLessonIds(selectedLessonIds.filter((id) => !lIds.includes(id)));
    } else {
      setSelectedTopicIds([...selectedTopicIds, topic.id]);
      setSelectedLessonIds([...selectedLessonIds, ...lIds]);
    }
  };

  const handleGenerateClick = (source: 'ai' | 'bank') => {
    const newCfg: TestConfig = {
      ...config,
      title,
      grade,
      durationMinutes,
      selectedTopicIds,
      selectedLessonIds,
      questionCountByType: { multipleChoice: totalMC, trueFalse: totalTF, shortAnswer: totalSA },
    };
    if (setConfig) setConfig(newCfg);
    if (source === 'bank' && onGenerateFromBank) onGenerateFromBank();
    else onGenerate(newCfg);
  };

  return (
    <div className="font-sans space-y-5 text-slate-800">
      {/* 1. CHỌN KHỐI LỚP */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl text-white shadow">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-400">CHỌN KHỐI LỚP:</span>
          <div className="flex gap-1.5">
            {(['10', '11', '12'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSwitchGrade(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  grade === g ? 'bg-blue-600 text-white shadow ring-2 ring-blue-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                TOÁN {g}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Chương trình GDPT 2018 ({currentSyllabus.length} chuyên đề)</span>
      </div>

      {/* 2. CHỌN CHUYÊN ĐỀ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {currentSyllabus.map((t) => {
          const isSel = selectedTopicIds.includes(t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggleTopic(t)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                isSel ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'bg-white border-slate-200'
              }`}
            >
              <button type="button" className="mt-0.5 text-blue-600">
                {isSel ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{t.category}</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">{t.name}</h4>
                <p className="text-[11px] text-slate-500">{t.lessons.length} bài học</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BẢNG DẠNG THỨC CÂU HỎI */}
      <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
          <Table className="w-4 h-4 text-blue-600" /> BẢNG MA TRẬN DẠNG THỨC CÂU HỎI (CHUẨN BỘ GD&ĐT)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse border border-slate-200">
            <thead className="bg-slate-100 font-bold text-[11px]">
              <tr>
                <th className="border p-2 text-left">Dạng thức câu hỏi</th>
                <th className="border p-2 bg-blue-50 text-blue-900 w-24">Nhận biết</th>
                <th className="border p-2 bg-indigo-50 text-indigo-900 w-24">Thông hiểu</th>
                <th className="border p-2 bg-emerald-50 text-emerald-900 w-24">Vận dụng</th>
                <th className="border p-2 bg-slate-200 font-black w-24">Tổng câu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-left font-semibold">Phần I: Trắc nghiệm 4 lựa chọn</td>
                <td className="border p-1"><input type="number" min={0} value={mcNB} onChange={(e) => setMcNB(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={mcTH} onChange={(e) => setMcTH(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={mcVD} onChange={(e) => setMcVD(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-2 font-bold bg-slate-50">{totalMC} câu</td>
              </tr>
              <tr>
                <td className="border p-2 text-left font-semibold">Phần II: Đúng / Sai (4 ý)</td>
                <td className="border p-1"><input type="number" min={0} value={tfNB} onChange={(e) => setTfNB(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={tfTH} onChange={(e) => setTfTH(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={tfVD} onChange={(e) => setTfVD(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-2 font-bold bg-slate-50">{totalTF} câu</td>
              </tr>
              <tr>
                <td className="border p-2 text-left font-semibold">Phần III: Trả lời ngắn</td>
                <td className="border p-1"><input type="number" min={0} value={saNB} onChange={(e) => setSaNB(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={saTH} onChange={(e) => setSaTH(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-1"><input type="number" min={0} value={saVD} onChange={(e) => setSaVD(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-bold" /></td>
                <td className="border p-2 font-bold bg-slate-50">{totalSA} câu</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="border p-2 text-left">TỔNG CỘNG SỐ CÂU:</td>
                <td className="border p-2 bg-blue-100 text-blue-900 font-black">{totalNB} NB</td>
                <td className="border p-2 bg-indigo-100 text-indigo-900 font-black">{totalTH} TH</td>
                <td className="border p-2 bg-emerald-100 text-emerald-900 font-black">{totalVD} VD</td>
                <td className="border p-2 bg-amber-200 text-amber-950 font-black">{totalQuestions} CÂU</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BẢNG MA TRẬN CHI TIẾT YCCĐ */}
      <div className="border border-emerald-300 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-950">
            MA TRẬN CHI TIẾT YCCĐ ≛ PHÂN BỐ SỐ CÂU THEO MỖI BÀI HỌC (TOÁN {grade})
          </span>
          <button
            type="button"
            onClick={handleAutoDistribute}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tự động chia đều theo YCCĐ
          </button>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-center border-collapse border border-slate-200">
            <thead className="bg-slate-100 font-bold text-[11px] sticky top-0 bg-white">
              <tr>
                <th className="border p-2 text-left min-w-[120px]">Chủ đề</th>
                <th className="border p-2 text-left min-w-[120px]">Bài học</th>
                <th className="border p-2 text-left min-w-[200px]">Yêu cầu cần đạt</th>
                <th className="border p-2 bg-blue-50 text-blue-900 w-16">NB</th>
                <th className="border p-2 bg-indigo-50 text-indigo-900 w-16">TH</th>
                <th className="border p-2 bg-emerald-50 text-emerald-900 w-16">VD</th>
                <th className="border p-2 bg-slate-200 w-20 font-bold">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {flatYccdList.map((row) => {
                const c = yccdCounts[row.key] || { nb: 0, th: 0, vd: 0 };
                return (
                  <tr key={row.key} className="hover:bg-slate-50">
                    <td className="border p-2 text-left font-bold">{row.topicName}</td>
                    <td className="border p-2 text-left">{row.lessonName}</td>
                    <td className="border p-2 text-left text-[11px]">{row.outcome}</td>
                    <td className="border p-1">
                      <input type="number" min={0} value={c.nb} onChange={(e) => updateCount(row.key, 'nb', Number(e.target.value))} className="w-12 p-1 text-center font-bold border rounded" />
                    </td>
                    <td className="border p-1">
                      <input type="number" min={0} value={c.th} onChange={(e) => updateCount(row.key, 'th', Number(e.target.value))} className="w-12 p-1 text-center font-bold border rounded" />
                    </td>
                    <td className="border p-1">
                      <input type="number" min={0} value={c.vd} onChange={(e) => updateCount(row.key, 'vd', Number(e.target.value))} className="w-12 p-1 text-center font-bold border rounded" />
                    </td>
                    <td className="border p-2 font-bold bg-slate-50">{c.nb + c.th + c.vd}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td colSpan={3} className="border p-2 text-right">TỔNG PHÂN BỔ YCCĐ:</td>
                <td className="border p-2 bg-blue-100 text-blue-900">{sumNB} NB</td>
                <td className="border p-2 bg-indigo-100 text-indigo-900">{sumTH} TH</td>
                <td className="border p-2 bg-emerald-100 text-emerald-900">{sumVD} VD</td>
                <td className="border p-2 bg-emerald-800 text-white font-black">{sumTotal} câu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HAI NÚT TẠO ĐỀ */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b pb-2 text-xs font-bold">
          <span>BƯỚC 3: TẠO ĐỀ THI TOÁN {grade}</span>
          <span className="text-blue-700">{totalQuestions} câu hỏi | {totalScore} điểm</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isGenerating || selectedLessonIds.length === 0}
            onClick={() => handleGenerateClick('ai')}
            className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> TẠO ĐỀ TỪ AI (GEMINI) - TOÁN {grade}
          </button>
          <button
            type="button"
            disabled={isGenerating || selectedLessonIds.length === 0}
            onClick={() => handleGenerateClick('bank')}
            className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-200" /> TẠO ĐỀ TỪ NGÂN HÀNG - TOÁN {grade}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorModal;
