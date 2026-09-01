import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { DIAGRAM_BANK } from './diagramBank';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { DeduplicationModal } from './DeduplicationModal';
import { detectQuestionVisuals, filterQuestionsByVisualCategory, VisualType } from './visualDetector';
import { resolveQuestionDiagram, parseAsciiBBT } from './mathGraphParser';
import { exportAllDiagramsZip } from './diagramImageGenerator';
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Tag,
  BookOpen,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
  Filter,
  BarChart3,
  TrendingUp,
  Table,
  Shapes,
  FolderArchive,
  BookmarkCheck,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface QuestionListProps {
  test: GeneratedTest;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDeleteSelectedQuestions?: (ids: string[]) => void;
  onApplyUniqueQuestions?: (uniqueQuestions: Question[], removedCount: number) => void;
  onSaveToBank?: () => void;
  onOpenBank?: () => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  test,
  onEditQuestion,
  onDeleteQuestion,
  onDeleteSelectedQuestions,
  onApplyUniqueQuestions,
  onSaveToBank,
  onOpenBank,
}) => {
  const [showSolutions, setShowSolutions] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeduplicateModalOpen, setIsDeduplicateModalOpen] = useState<boolean>(false);
  const [visualFilter, setVisualFilter] = useState<'all' | 'has_visual' | VisualType>('all');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipMessage, setZipMessage] = useState<string | null>(null);

  const handleExportZip = async () => {
    setIsExportingZip(true);
    setZipMessage(null);
    try {
      const res = await exportAllDiagramsZip(test.questions, test.config.title);
      if (res.success) {
        setZipMessage(`Đã xuất trọn bộ ${res.count} hình vẽ PNG và mã TikZ (.ZIP)!`);
        setTimeout(() => setZipMessage(null), 4000);
      } else {
        setZipMessage('Không tìm thấy hình vẽ nào trong bộ đề hiện tại.');
        setTimeout(() => setZipMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error exporting diagrams zip:', err);
      setZipMessage('Có lỗi khi tạo tệp ZIP hình vẽ.');
      setTimeout(() => setZipMessage(null), 3000);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Compute visual stats across all questions
  const visualStats = React.useMemo(() => {
    let hasVisual = 0;
    let bbt = 0;
    let dothi = 0;
    let bangGiatri = 0;
    let hinhVe = 0;

    test.questions.forEach((q) => {
      const res = detectQuestionVisuals(q);
      if (res.hasVisual) hasVisual++;
      if (res.types.includes('bbt')) bbt++;
      if (res.types.includes('dothi')) dothi++;
      if (res.types.includes('bang_giatri')) bangGiatri++;
      if (res.types.includes('hinh_ve')) hinhVe++;
    });

    return { total: test.questions.length, hasVisual, bbt, dothi, bangGiatri, hinhVe };
  }, [test.questions]);

  // Filtered questions based on visual filter choice
  const displayedQuestions = React.useMemo(() => {
    return filterQuestionsByVisualCategory(test.questions, visualFilter);
  }, [test.questions, visualFilter]);

  const totalQuestions = test.questions.length;
  const mcqList = displayedQuestions.filter((q) => q.type === 'multiple_choice');
  const trueFalseList = displayedQuestions.filter((q) => q.type === 'true_false');
  const shortAnswerList = displayedQuestions.filter((q) => q.type === 'short_answer');

  const allSelected = totalQuestions > 0 && selectedIds.length === totalQuestions;
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalQuestions;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(test.questions.map((q) => q.id));
    }
  };

  const handleSelectSectionToggle = (sectionQuestions: Question[]) => {
    const sectionIds = sectionQuestions.map((q) => q.id);
    const allSectionSelected = sectionIds.every((id) => selectedIds.includes(id));

    if (allSectionSelected) {
      // Unselect all in this section
      setSelectedIds((prev) => prev.filter((id) => !sectionIds.includes(id)));
    } else {
      // Select all in this section
      setSelectedIds((prev) => Array.from(new Set([...prev, ...sectionIds])));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteSelectedQuestions) {
      onDeleteSelectedQuestions(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteQuestion(id));
    }
    setSelectedIds([]);
  };

  const handleDeleteSingle = (q: Question) => {
    onDeleteQuestion(q.id);
    setSelectedIds((prev) => prev.filter((id) => id !== q.id));
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'NhanBiet':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
            Nhận biết
          </span>
        );
      case 'ThongHieu':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
            Thông hiểu
          </span>
        );
      case 'VanDung':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
            Vận dụng
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
            Mức độ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Title Header Card */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1 text-xs text-blue-400 font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{test.config.schoolName} • {test.config.departmentName || 'TỔ TOÁN'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">NĂM HỌC: {test.config.academicYear || '2026 - 2027'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {test.config.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Thời gian làm bài: <strong className="text-blue-300">{test.config.durationMinutes} phút</strong> | Khung GDPT 2018 | Tổng cộng: <strong className="text-emerald-300">{totalQuestions} câu hỏi</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveToBank && (
              <button
                onClick={onSaveToBank}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Lưu bộ đề này vào Ngân hàng lưu trữ đề với tên chuẩn Khối-Lớp-Chủ đề"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Lưu vào Kho đề</span>
              </button>
            )}

            {onOpenBank && (
              <button
                onClick={onOpenBank}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Mở Ngân hàng lưu trữ đề thi đã tạo"
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                <span>Mở Kho đề</span>
              </button>
            )}

            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Tải trọn bộ tất cả hình vẽ đồ thị / bảng biến thiên (PNG) và mã TikZ (LaTeX) về máy"
            >
              <Download className="w-3.5 h-3.5 text-indigo-200" />
              <span>{isExportingZip ? 'Đang nén ZIP...' : 'Tải bộ ảnh hình vẽ (.ZIP)'}</span>
            </button>

            <button
              onClick={() => setIsDeduplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Phân tích & Tự động lọc các câu hỏi có nội dung giống nhau ≥80%"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Lọc trùng lặp (≥80%)</span>
            </button>

            <button
              onClick={() => setShowSolutions(!showSolutions)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showSolutions
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {showSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSolutions ? 'Ẩn đáp án & lời giải' : 'Hiện đáp án & lời giải'}</span>
            </button>
          </div>
        </div>

        {/* Zip export notification */}
        {zipMessage && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{zipMessage}</span>
          </div>
        )}

        {/* Global Selection & Batch Delete Toolbar */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAllToggle}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition-all flex items-center space-x-2 border border-slate-600 cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${totalQuestions} câu)`}</span>
            </button>

            <span className="text-slate-300 font-semibold">
              Đã chọn: <strong className="text-amber-400 font-bold text-sm">{selectedIds.length}</strong> / {totalQuestions} câu
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {selectedIds.length > 0 ? (
              <button
                onClick={handleDeleteSelected}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer animate-pulse"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÓA ĐÃ CHỌN ({selectedIds.length} CÂU)</span>
              </button>
            ) : (
              <span className="text-slate-500 italic text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Tích chọn các câu hỏi bên dưới để xóa hàng loạt</span>
              </span>
            )}
          </div>
        </div>

        {/* AUTOMATIC VISUAL ELEMENT FILTER BAR (BBT / Đồ thị / Bảng / Hình vẽ) */}
        <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-amber-300 text-xs uppercase tracking-wider">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>TỰ ĐỘNG LỌC CÂU HỎI TRỰC QUAN & DỮ LIỆU:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Đang hiển thị <strong className="text-white font-bold">{displayedQuestions.length}</strong> / {totalQuestions} câu hỏi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setVisualFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>Tất cả ({visualStats.total})</span>
            </button>

            <button
              onClick={() => setVisualFilter('has_visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'has_visual'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>🎯 Tất cả câu có Sơ đồ / Hình / Bảng ({visualStats.hasVisual})</span>
            </button>

            <button
              onClick={() => setVisualFilter('bbt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'bbt'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                  : 'bg-slate-700/80 text-purple-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>📊 Bảng biến thiên ({visualStats.bbt})</span>
            </button>

            <button
              onClick={() => setVisualFilter('dothi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'dothi'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-slate-700/80 text-blue-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>📈 Đồ thị hàm số ({visualStats.dothi})</span>
            </button>

            <button
              onClick={() => setVisualFilter('bang_giatri')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'bang_giatri'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-700/80 text-emerald-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>📋 Bảng giá trị (Thống kê/XS) ({visualStats.bangGiatri})</span>
            </button>

            <button
              onClick={() => setVisualFilter('hinh_ve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                visualFilter === 'hinh_ve'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-slate-700/80 text-amber-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>📐 Hình vẽ & Sơ đồ ({visualStats.hinhVe})</span>
            </button>
          </div>
        </div>
      </div>

      {/* PART I: Multiple Choice */}
      {mcqList.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                I
              </span>
              PHẦN I. Câu trắc nghiệm 4 lựa chọn ({mcqList.length} câu)
            </h3>

            <button
              onClick={() => handleSelectSectionToggle(mcqList)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {mcqList.every((q) => selectedIds.includes(q.id)) ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
              ) : (
                <Square className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span>Chọn tất cả Phần I</span>
            </button>
          </div>

          <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-6">
            {mcqList.map((q, idx) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={`${q.id}_mcq_${idx}`}
                  className={`pt-4 first:pt-0 p-3 sm:p-4 rounded-xl transition-all space-y-3 ${
                    isSelected
                      ? 'bg-blue-50/50 border-2 border-blue-500 shadow-md ring-2 ring-blue-200'
                      : 'border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Checkbox for individual question */}
                      <label className="flex items-center space-x-2 cursor-pointer select-none bg-slate-100 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-all">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(q.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">Chọn</span>
                      </label>

                      <span className="font-black text-blue-700 text-sm sm:text-base">
                        Câu {idx + 1}.
                      </span>
                      {getLevelBadge(q.level)}
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {q.lessonName}
                      </span>

                      {/* Visual Badges */}
                      {detectQuestionVisuals(q).hasVisual &&
                        detectQuestionVisuals(q).badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${b.colorClass}`}
                          >
                            <span>{b.icon}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onEditQuestion(q)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(q)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-300 hover:border-rose-400 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Xóa câu hỏi này khỏi ngân hàng câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* YCCĐ Tag */}
                  <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong>YCCĐ GDPT 2018:</strong> {q.learningOutcome}
                  </div>

                  {/* Question Prompt */}
                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  {/* Render Graph / BBT Diagram if applicable */}
                  <DiagramRenderer
                    diagramId={resolveQuestionDiagram(q)}
                    questionContent={q.content}
                    tikzCode={q.tikzCode}
                    tikzPrompt={q.tikzPrompt}
                    imageUrl={q.imageUrl}
                  />

                  {/* Options Grid */}
                  <div
                    className={`grid gap-2 text-xs pt-1 ${
                      q.options.some((opt) => opt.text.includes('|'))
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    {q.options.map((opt) => {
                      const isCorrect = showSolutions && opt.key === q.correctAnswer;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-lg border transition-all flex items-start space-x-2 overflow-x-auto ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span
                            className={`font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="leading-snug pt-0.5 flex-1 min-w-0 overflow-x-auto">
                            <MathText text={opt.text} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution Box */}
                  {showSolutions && (
                    <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs space-y-1 text-slate-800">
                      <div className="font-bold text-blue-900 flex items-center space-x-2">
                        <span>Lời giải chi tiết (Đáp án {q.correctAnswer}):</span>
                      </div>
                      <MathText text={q.solution} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PART II: True / False */}
      {trueFalseList.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                II
              </span>
              PHẦN II. Câu trắc nghiệm Đúng/Sai ({trueFalseList.length} câu)
            </h3>

            <button
              onClick={() => handleSelectSectionToggle(trueFalseList)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {trueFalseList.every((q) => selectedIds.includes(q.id)) ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-700" />
              ) : (
                <Square className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>Chọn tất cả Phần II</span>
            </button>
          </div>

          <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-6">
            {trueFalseList.map((q, idx) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={`${q.id}_tf_${idx}`}
                  className={`pt-4 first:pt-0 p-3 sm:p-4 rounded-xl transition-all space-y-3 ${
                    isSelected
                      ? 'bg-indigo-50/50 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                      : 'border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Checkbox for individual question */}
                      <label className="flex items-center space-x-2 cursor-pointer select-none bg-slate-100 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-all">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(q.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">Chọn</span>
                      </label>

                      <span className="font-black text-indigo-700 text-sm sm:text-base">
                        Câu {idx + 1}.
                      </span>
                      {getLevelBadge(q.level)}
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                        {q.lessonName}
                      </span>

                      {/* Visual Badges */}
                      {detectQuestionVisuals(q).hasVisual &&
                        detectQuestionVisuals(q).badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${b.colorClass}`}
                          >
                            <span>{b.icon}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onEditQuestion(q)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(q)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-300 hover:border-rose-400 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Xóa câu hỏi này khỏi ngân hàng câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* YCCĐ Tag */}
                  <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong>YCCĐ GDPT 2018:</strong> {q.learningOutcome}
                  </div>

                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  {/* Render Graph / BBT Diagram if applicable */}
                  <DiagramRenderer
                    diagramId={resolveQuestionDiagram(q)}
                    questionContent={q.content}
                    tikzCode={q.tikzCode}
                    tikzPrompt={q.tikzPrompt}
                    imageUrl={q.imageUrl}
                  />

                  {/* Statements */}
                  <div className="space-y-1.5 text-xs pt-1">
                    {q.type === 'true_false' &&
                      (q.statements || []).map((st, index) => {
                        const letter = (st.id || ['a', 'b', 'c', 'd'][index] || 'a').toLowerCase();
                        const statementText =
                          st.text ||
                          (st as any).statement ||
                          (st as any).content ||
                          (st as any).value ||
                          `Mệnh đề (${letter}) của bài toán`;
                        return (
                          <div
                            key={st.id || index}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-start space-x-2 flex-1 min-w-0">
                              <span className="font-bold text-indigo-800 shrink-0">{letter})</span>
                              <div className="flex-1">
                                <MathText text={statementText} inline />
                              </div>
                            </div>

                            {showSolutions && (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-black shrink-0 ${
                                  st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                                }`}
                              >
                                {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {showSolutions && (
                    <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-1 text-slate-800">
                      <div className="font-bold text-indigo-900">Lời giải chi tiết:</div>
                      <MathText text={q.solution} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PART III: Short Answer */}
      {shortAnswerList.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                  III
                </span>
                PHẦN III. Trắc nghiệm trả lời ngắn (Điền kết quả 4 ký tự) ({shortAnswerList.length} câu)
              </h3>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Thí sinh viết đáp số (tối đa 4 ký tự, có thể chứa dấu âm '-' hoặc dấu thập phân) vào ô trả lời.
              </p>
            </div>

            <button
              onClick={() => handleSelectSectionToggle(shortAnswerList)}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {shortAnswerList.every((q) => selectedIds.includes(q.id)) ? (
                <CheckSquare className="w-3.5 h-3.5 text-purple-700" />
              ) : (
                <Square className="w-3.5 h-3.5 text-purple-500" />
              )}
              <span>Chọn tất cả Phần III</span>
            </button>
          </div>

          <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-6">
            {shortAnswerList.map((q, idx) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={`${q.id}_sa_${idx}`}
                  className={`pt-4 first:pt-0 p-3 sm:p-4 rounded-xl transition-all space-y-3 ${
                    isSelected
                      ? 'bg-purple-50/50 border-2 border-purple-500 shadow-md ring-2 ring-purple-200'
                      : 'border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Checkbox for individual question */}
                      <label className="flex items-center space-x-2 cursor-pointer select-none bg-slate-100 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-all">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(q.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">Chọn</span>
                      </label>

                      <span className="font-black text-purple-700 text-sm sm:text-base">
                        Câu {idx + 1}.
                      </span>
                      {getLevelBadge(q.level)}
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100">
                        {q.lessonName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onEditQuestion(q)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(q)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-300 hover:border-rose-400 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Xóa câu hỏi này khỏi ngân hàng câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* YCCĐ Tag */}
                  <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong>YCCĐ GDPT 2018:</strong> {q.learningOutcome}
                  </div>

                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  {/* Render Graph / BBT Diagram if applicable */}
                  <DiagramRenderer
                    diagramId={resolveQuestionDiagram(q)}
                    questionContent={q.content}
                    tikzCode={q.tikzCode}
                    tikzPrompt={q.tikzPrompt}
                    imageUrl={q.imageUrl}
                  />

                  {/* 4-character Optical Answer Box Fill-in Preview */}
                  <div className="flex items-center space-x-2 my-2 bg-purple-50/70 p-2.5 rounded-lg border border-purple-200/80 w-fit">
                    <span className="text-xs font-bold text-purple-900">Ô điền kết quả (tối đa 4 ký tự):</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 4 }).map((_, charIdx) => {
                        const char = (q.correctAnswer || '')[charIdx] || '';
                        return (
                          <div
                            key={charIdx}
                            className="w-7 h-8 border-2 border-purple-500 bg-white rounded flex items-center justify-center font-mono font-bold text-sm text-purple-900 shadow-2xs"
                          >
                            {showSolutions ? char : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {showSolutions && q.type === 'short_answer' && (
                    <div className="mt-3 p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs space-y-1 text-slate-800">
                      <div className="font-bold text-purple-900">
                        Đáp số: <span className="text-purple-700 font-black text-sm">{q.correctAnswer}</span>
                      </div>
                      <div className="pt-1">
                        <MathText text={q.solution} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Deduplication Modal */}
      <DeduplicationModal
        isOpen={isDeduplicateModalOpen}
        onClose={() => setIsDeduplicateModalOpen(false)}
        questions={test.questions}
        onApplyUniqueQuestions={(uniqueQuestions, removedCount) => {
          if (onApplyUniqueQuestions) {
            onApplyUniqueQuestions(uniqueQuestions, removedCount);
          }
        }}
      />
    </div>
  );
};
