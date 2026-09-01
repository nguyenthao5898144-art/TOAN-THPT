import React, { useState, useMemo } from 'react';
import { Question } from './types';
import {
  findDuplicateQuestionGroups,
  autoDeduplicateQuestions,
  DuplicateGroup,
} from './utils/deduplication';
import { MathText } from './MathText';
import {
  X,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface DeduplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onApplyUniqueQuestions: (uniqueQuestions: Question[], removedCount: number) => void;
}

export const DeduplicationModal: React.FC<DeduplicationModalProps> = ({
  isOpen,
  onClose,
  questions,
  onApplyUniqueQuestions,
}) => {
  const [threshold, setThreshold] = useState<number>(0.80);
  const [ignoredGroupIds, setIgnoredGroupIds] = useState<string[]>([]);
  const [keptQuestionMap, setKeptQuestionMap] = useState<Record<string, string>>({});

  // Compute duplicate groups based on threshold
  const duplicateGroups = useMemo(() => {
    return findDuplicateQuestionGroups(questions, threshold);
  }, [questions, threshold]);

  const activeGroups = useMemo(() => {
    return duplicateGroups.filter((g) => !ignoredGroupIds.includes(g.id));
  }, [duplicateGroups, ignoredGroupIds]);

  const totalDuplicatesCount = useMemo(() => {
    return activeGroups.reduce((acc, g) => acc + g.duplicateQuestions.length, 0);
  }, [activeGroups]);

  if (!isOpen) return null;

  // Handle 1-click Auto Remove All Duplicates
  const handleAutoCleanAll = () => {
    const { uniqueQuestions, removedCount } = autoDeduplicateQuestions(questions, threshold);
    onApplyUniqueQuestions(uniqueQuestions, removedCount);
    onClose();
  };

  // Handle keeping a specific question in a group and removing others
  const handleKeepSpecific = (group: DuplicateGroup, keepQuestionId: string) => {
    const allGroupIds = [group.originalQuestion.id, ...group.duplicateQuestions.map((d) => d.question.id)];
    const idsToRemove = allGroupIds.filter((id) => id !== keepQuestionId);

    const updatedQuestions = questions.filter((q) => !idsToRemove.includes(q.id));
    onApplyUniqueQuestions(updatedQuestions, idsToRemove.length);

    setIgnoredGroupIds((prev) => [...prev, group.id]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/90 border border-indigo-400/50 flex items-center justify-center text-white shadow-md">
              <Copy className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  TỰ ĐỘNG LỌC CÂU HỎI TRÙNG LẶP
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                  ≥ Math Engine 80%
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Phân tích & phát hiện các câu hỏi trùng lặp nội dung từ {Math.round(threshold * 100)}% trở lên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threshold Adjustment Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">
              Ngưỡng độ giống nhau: <strong className="text-indigo-600 font-extrabold">{Math.round(threshold * 100)}%</strong>
            </span>
            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
              {[0.70, 0.75, 0.80, 0.85, 0.90].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setThreshold(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    threshold === val
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {Math.round(val * 100)}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">
              Tổng số câu hỏi hiện tại: <strong className="text-slate-900 font-bold">{questions.length}</strong>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeGroups.length === 0 ? (
            <div className="text-center py-12 px-4 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">
                Không có câu hỏi trùng lặp nào (≥{Math.round(threshold * 100)}%)
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Toàn bộ ngân hàng câu hỏi hiện tại của bạn đã là duy nhất và không bị trùng lặp nội dung.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Banner with 1-Click Action */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs sm:text-sm">
                      Phát hiện {activeGroups.length} nhóm trùng lặp (Tổng cộng {totalDuplicatesCount} câu bị trùng)
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Bạn có thể lọc nhanh 1-Click để giữ lại câu gốc đầu tiên hoặc chủ động chọn câu muốn giữ trong từng nhóm.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAutoCleanAll}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>TỰ ĐỘNG XÓA TẤT CẢ CÂU TRÙNG ({totalDuplicatesCount} CÂU)</span>
                </button>
              </div>

              {/* Group Cards List */}
              <div className="space-y-5">
                {activeGroups.map((group, groupIdx) => {
                  const allQuestionsInGroup = [
                    { question: group.originalQuestion, similarity: 100, isOriginal: true },
                    ...group.duplicateQuestions.map((d) => ({
                      question: d.question,
                      similarity: d.similarity,
                      isOriginal: false,
                    })),
                  ];

                  return (
                    <div
                      key={group.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-xs space-y-3"
                    >
                      {/* Group Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                            {groupIdx + 1}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-800">
                            Nhóm câu hỏi giống nhau ({allQuestionsInGroup.length} câu)
                          </h5>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Độ tương đồng max: {Math.max(...group.duplicateQuestions.map((d) => d.similarity))}%
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500 font-medium">
                          Chủ đề: {group.originalQuestion.topicName}
                        </span>
                      </div>

                      {/* Items grid comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allQuestionsInGroup.map(({ question, similarity, isOriginal }, qIdx) => (
                          <div
                            key={`${question.id}_dedup_${qIdx}`}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                              isOriginal
                                ? 'bg-white border-blue-300 ring-2 ring-blue-100'
                                : 'bg-white border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <div className="flex items-center space-x-1.5">
                                  {isOriginal ? (
                                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                                      CÂU GỐC
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                                      TRÙNG {similarity}%
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400">ID: ...{question.id.slice(-6)}</span>
                                </div>

                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {question.level === 'NhanBiet' ? 'Nhận biết' : question.level === 'ThongHieu' ? 'Thông hiểu' : 'Vận dụng'}
                                </span>
                              </div>

                              <div className="text-xs text-slate-800 font-medium leading-relaxed mb-3 line-clamp-4">
                                <MathText text={question.content} />
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleKeepSpecific(group, question.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all cursor-pointer flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Giữ câu này & Xóa câu khác</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = questions.filter((q) => q.id !== question.id);
                                  onApplyUniqueQuestions(updated, 1);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Xóa riêng câu hỏi này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Hệ thống tự động chuyển đổi biểu thức toán về dạng chuẩn hóa để so sánh độ tương đồng.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
