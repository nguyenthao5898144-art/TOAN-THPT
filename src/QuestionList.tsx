import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import {
  Edit3, Trash2, CheckCircle2,
  FileText, Check, HelpCircle, Eye, EyeOff
} from 'lucide-react';

export interface QuestionListProps {
  test: GeneratedTest;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onSaveToBank?: () => void;
  onOpenBank?: () => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  test,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [showSolutions, setShowSolutions] = useState<boolean>(true);

  const questions = test?.questions || [];
  const mcqQuestions = questions.filter((q) => q.type === 'multiple_choice');
  const tfQuestions = questions.filter((q) => q.type === 'true_false');
  const saQuestions = questions.filter((q) => q.type === 'short_answer');

  // Hiển thị nhãn mức độ nhận thức
  const renderLevelBadge = (level?: string) => {
    switch (level) {
      case 'NhanBiet':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Nhận biết</span>;
      case 'ThongHieu':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">Thông hiểu</span>;
      case 'VanDung':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">Vận dụng</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-5xl mx-auto">
      {/* THANH ĐIỀU KHIỂN NHẸ NHÀNG TRÊN CÙNG */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-slate-700">
            Tổng cộng: <strong className="text-blue-600">{questions.length} câu hỏi</strong> (10.0 điểm)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSolutions(!showSolutions)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
        >
          {showSolutions ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
          {showSolutions ? 'Ẩn đáp án & Lời giải' : 'Hiện đáp án & Lời giải'}
        </button>
      </div>

      {/* PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN */}
      {mcqQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between">
            <span>PHẦN I. CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN ({mcqQuestions.length} câu)</span>
            <span className="text-[11px] font-medium opacity-90">Mỗi câu chọn đúng được 0,25 điểm</span>
          </div>

          <div className="space-y-3">
            {mcqQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-lg text-xs font-black">
                      Câu {idx + 1}
                    </span>
                    {renderLevelBadge(q.level)}
                    {q.lessonName && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        • {q.lessonName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditQuestion(q)}
                      className="px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Nội dung câu hỏi */}
                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                  <MathText text={q.content} />
                </div>

                {/* Hình vẽ nếu có */}
                {q.diagramId && (
                  <div className="my-2 p-2 bg-slate-50 rounded-xl border flex justify-center">
                    <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                  </div>
                )}

                {/* 4 Phương án */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {((q as any).options || []).map((opt: any) => {
                    const isCorrect = showSolutions && (q as any).correctAnswer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                        }`}>
                          {opt.key}
                        </span>
                        <MathText text={opt.text} />
                        {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Lời giải */}
                {showSolutions && q.solution && (
                  <div className="mt-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950">
                    <strong className="text-blue-800 block mb-0.5">💡 Hướng dẫn giải:</strong>
                    <MathText text={q.solution} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHẦN II: ĐÚNG / SAI */}
      {tfQuestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between">
            <span>PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG / SAI ({tfQuestions.length} câu)</span>
            <span className="text-[11px] font-medium opacity-90">1 ý: 0.1đ | 2 ý: 0.25đ | 3 ý: 0.5đ | 4 ý: 1.0đ</span>
          </div>

          <div className="space-y-3">
            {tfQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-black">
                      Câu {mcqQuestions.length + idx + 1}
                    </span>
                    {renderLevelBadge(q.level)}
                    {q.lessonName && <span className="text-[11px] text-slate-500 font-medium">• {q.lessonName}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditQuestion(q)}
                      className="px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                  <MathText text={q.content} />
                </div>

                {q.diagramId && (
                  <div className="my-2 p-2 bg-slate-50 rounded-xl border flex justify-center">
                    <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                  </div>
                )}

                {/* 4 Mệnh đề */}
                <div className="space-y-1.5 pt-1">
                  {((q as any).statements || []).map((st: any) => (
                    <div key={st.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3">
                      <div className="flex items-start gap-2">
                        <span className="font-bold uppercase text-indigo-700 shrink-0">Ý {st.id})</span>
                        <MathText text={st.text} />
                      </div>
                      {showSolutions && (
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                          st.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {showSolutions && q.solution && (
                  <div className="mt-2 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                    <strong className="text-indigo-800 block mb-0.5">💡 Hướng dẫn giải:</strong>
                    <MathText text={q.solution} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHẦN III: TRẢ LỜI NGẮN */}
      {saQuestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between">
            <span>PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN ({saQuestions.length} câu)</span>
            <span className="text-[11px] font-medium opacity-90">Mỗi câu trả lời đúng được 0,5 điểm</span>
          </div>

          <div className="space-y-3">
            {saQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-xs font-black">
                      Câu {mcqQuestions.length + tfQuestions.length + idx + 1}
                    </span>
                    {renderLevelBadge(q.level)}
                    {q.lessonName && <span className="text-[11px] text-slate-500 font-medium">• {q.lessonName}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditQuestion(q)}
                      className="px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                  <MathText text={q.content} />
                </div>

                {q.diagramId && (
                  <div className="my-2 p-2 bg-slate-50 rounded-xl border flex justify-center">
                    <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                  </div>
                )}

                {showSolutions && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <div className="text-emerald-900 font-bold">
                      🎯 Đáp số đúng: <span className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 ml-1">{(q as any).correctAnswer || '---'}</span>
                    </div>
                    {q.solution && (
                      <div className="text-slate-600 pt-1 border-t border-emerald-100">
                        <strong>Lời giải:</strong> <MathText text={q.solution} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
