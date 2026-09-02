import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import {
  Edit3, Trash2, CheckCircle2, XCircle, FileText,
  Sparkles, Save, FolderArchive, BookOpen, Layers
} from 'lucide-react';

interface QuestionListProps {
  test: GeneratedTest;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onSaveToBank?: () => void;
  onOpenBank?: () => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  test,
  onEditQuestion,
  onDeleteQuestion,
  onSaveToBank,
  onOpenBank,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'part1' | 'part2' | 'part3'>('all');

  const questions = test.questions || [];
  const part1 = questions.filter((q) => q.type === 'multiple_choice');
  const part2 = questions.filter((q) => q.type === 'true_false');
  const part3 = questions.filter((q) => q.type === 'short_answer');

  // Đổi id (a, b, c, d) thành chữ thường có dấu đóng ngoặc: a), b), c), d)
  const formatStatementId = (id: string, index: number) => {
    const letters = ['a', 'b', 'c', 'd'];
    const letter = (id && typeof id === 'string' && id.trim()) ? id.toLowerCase().replace(/[^a-d]/g, '') : letters[index % 4];
    return `${letter || letters[index % 4]})`;
  };

  return (
    <div className="font-sans space-y-6 max-w-5xl mx-auto pb-12 text-slate-800">
      {/* 1. THANH TIÊU ĐỀ ĐỀ THI & CÁC NÚT TÁC VỤ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            ĐỀ THI CHUẨN ĐỊNH DẠNG GDPT 2018 (22 CÂU - 10 ĐIỂM)
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {test.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Khối lớp: <strong>Toán {test.config?.grade || '12'}</strong> • Thời gian: <strong>{test.config?.durationMinutes || 45} phút</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSaveToBank && (
            <button
              type="button"
              onClick={onSaveToBank}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Lưu vào Kho đề
            </button>
          )}

          {onOpenBank && (
            <button
              type="button"
              onClick={onOpenBank}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <FolderArchive className="w-4 h-4 text-amber-600" /> Mở Kho lưu trữ
            </button>
          )}
        </div>
      </div>

      {/* 2. BỘ LỌC TỪNG PHẦN (ALL / PHẦN I / PHẦN II / PHẦN III) */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tất cả (22 câu)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('part1')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'part1' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Phần I ({part1.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('part2')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'part2' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Phần II ({part2.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('part3')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'part3' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Phần III ({part3.length})
        </button>
      </div>

      {/* ======================================================= */}
      {/* PHẦN I: CÂU TRẮC NGHIỆM 4 LỰA CHỌN (CÂU 1 ĐẾN CÂU 12) */}
      {/* ======================================================= */}
      {(activeTab === 'all' || activeTab === 'part1') && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN ({part1.length} câu)
              </h3>
              <p className="text-[11px] text-blue-100 italic mt-0.5">
                Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi chỉ chọn một phương án. (0,25 điểm / câu)
              </p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              3,0 ĐIỂM
            </span>
          </div>

          {part1.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black">
                    Câu {idx + 1}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                    {q.level || 'Nhận biết'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    title="Sửa câu này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                    title="Xóa câu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                <MathText text={q.content} />
              </div>

              {q.diagramId && (
                <div className="my-2 p-3 bg-slate-50 rounded-xl border flex justify-center">
                  <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {((q as any).options || []).map((opt: any) => {
                  const isCorrect = opt.key === (q as any).correctAnswer;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                      }`}>
                        {opt.key}
                      </span>
                      <MathText text={opt.text} />
                    </div>
                  );
                })}
              </div>

              {q.solution && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-blue-700 block">Lời giải:</span>
                  <MathText text={q.solution} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ======================================================= */}
      {/* PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI (CÂU 1 ĐẾN CÂU 4, Ý a, b, c, d) */}
      {/* ======================================================= */}
      {(activeTab === 'all' || activeTab === 'part2') && (
        <div className="space-y-4 pt-2">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG / SAI ({part2.length} câu)
              </h3>
              <p className="text-[11px] text-indigo-100 italic mt-0.5">
                1 ý: 0,1đ | 2 ý: 0,25đ | 3 ý: 0,5đ | 4 ý: 1,0đ
              </p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              4,0 ĐIỂM
            </span>
          </div>

          {part2.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              {/* HEADER CÂU HỎI PHẦN II: ĐÁNH SỐ TỪ CÂU 1 ĐẾN CÂU 4 CHUẨN BỘ */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black">
                    Câu {idx + 1}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                    {q.level || 'Thông hiểu'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    title="Sửa câu này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                    title="Xóa câu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LỜI DẪN CÂU HỎI */}
              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                <MathText text={q.content} />
              </div>

              {q.diagramId && (
                <div className="my-2 p-3 bg-slate-50 rounded-xl border flex justify-center">
                  <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                </div>
              )}

              {/* CÁC MỆNH ĐỀ ĐƯỢC ĐÁNH SỐ CHUẨN 100%: a) b) c) d) */}
              <div className="space-y-2 pt-1">
                {((q as any).statements || []).map((st: any, sIdx: number) => (
                  <div
                    key={st.id || sIdx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {/* CHỮ a) b) c) d) CHUẨN KHÔNG CÓ CHỮ Ý */}
                      <span className="font-black text-indigo-700 text-sm shrink-0">
                        {formatStatementId(st.id, sIdx)}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">
                        <MathText text={st.text} />
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black shrink-0 ${
                        st.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                    </span>
                  </div>
                ))}
              </div>

              {q.solution && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-indigo-700 block">Lời giải chi tiết:</span>
                  <MathText text={q.solution} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ======================================================= */}
      {/* PHẦN III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (CÂU 1 ĐẾN CÂU 6) */}
      {/* ======================================================= */}
      {(activeTab === 'all' || activeTab === 'part3') && (
        <div className="space-y-4 pt-2">
          <div className="bg-gradient-to-r from-purple-700 to-pink-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN ({part3.length} câu)
              </h3>
              <p className="text-[11px] text-purple-100 italic mt-0.5">
                Thí sinh trả lời từ câu 1 đến câu 6. Điền kết quả số vào ô trống. (0,5 điểm / câu)
              </p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              3,0 ĐIỂM
            </span>
          </div>

          {part3.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-black">
                    Câu {idx + 1}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                    {q.level || 'Vận dụng'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    title="Sửa câu này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                    title="Xóa câu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                <MathText text={q.content} />
              </div>

              {q.diagramId && (
                <div className="my-2 p-3 bg-slate-50 rounded-xl border flex justify-center">
                  <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                </div>
              )}

              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs flex items-center gap-2">
                <span className="font-bold text-purple-950">Đáp số chuẩn:</span>
                <span className="font-black text-purple-700 font-mono text-sm">
                  {(q as any).correctAnswer || '5'}
                </span>
              </div>

              {q.solution && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-purple-700 block">Lời giải chi tiết:</span>
                  <MathText text={q.solution} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
