import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import {
  FileText, Download, Printer, Database, Check,
  X, Sparkles, ChevronDown, ChevronUp, Edit3
} from 'lucide-react';

interface QuestionListProps {
  test: GeneratedTest;
  onUpdateTest?: (updated: GeneratedTest) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ test, onUpdateTest }) => {
  // HÀM CHUẨN HÓA ĐỊNH DẠNG: MA_TRẬN_[...].json
  const formatMatrixFileName = (rawTitle: string): string => {
    let clean = (rawTitle || 'DE_THI').trim().replace(/\.json$/i, '');
    let core = clean.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]$/, '').trim();
    return `MA_TRẬN_[${core}].json`;
  };

  // State cho Modal "Lưu file vào Ngân hàng ma trận" (Chuẩn Ảnh 180)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [matrixFileName, setMatrixFileName] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('TOÁN 10');

  // MỞ POPUP LƯU VÀO NGÂN HÀNG MA TRẬN
  const handleOpenSaveModal = () => {
    // TỰ ĐỘNG ĐIỀN ĐÚNG DẠNG: MA_TRẬN_[...].json
    const initialName = formatMatrixFileName(test.title);
    setMatrixFileName(initialName);

    const grade = test.config?.grade || '10';
    setSelectedFolder(grade === '11' ? 'TOÁN 11' : (grade === '12' ? 'TOÁN 12' : 'TOÁN 10'));
    setIsSaveModalOpen(true);
  };

  // XÁC NHẬN LƯU VÀO NGÂN HÀNG MA TRẬN
  const handleConfirmSaveToBank = () => {
    const finalName = formatMatrixFileName(matrixFileName);
    const targetGrade = selectedFolder.replace(/\D/g, '') || test.config?.grade || '10';

    const savedItem: GeneratedTest = {
      ...test,
      id: `matrix_${Date.now()}`,
      title: finalName,
      config: {
        ...(test.config || {}),
        grade: targetGrade,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('stored_bank_tests') || '[]');
      const updated = [savedItem, ...existing.filter((t: any) => t.title !== finalName)];
      localStorage.setItem('stored_bank_tests', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (onUpdateTest) onUpdateTest(savedItem);
    setIsSaveModalOpen(false);
    alert(`Đã lưu thành công vào Ngân hàng ma trận:\n${finalName}\nThư mục: ${selectedFolder}`);
  };

  const part1Questions = (test.questions || []).filter((q) => q.type === 'multiple_choice');
  const part2Questions = (test.questions || []).filter((q) => q.type === 'true_false');
  const part3Questions = (test.questions || []).filter((q) => q.type === 'short_answer');

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* THANH CÔNG CỤ TRÊN CÙNG */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {test.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Môn: <strong>Toán {test.config?.grade || '10'}</strong> • Thời gian: <strong>{test.config?.durationMinutes || 45} phút</strong> • Tổng số: <strong>{test.questions?.length || 22} câu</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* NÚT LƯU FILE VÀO NGÂN HÀNG MA TRẬN */}
          <button
            type="button"
            onClick={handleOpenSaveModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
          >
            <Database className="w-4 h-4" /> Lưu file vào Ngân hàng ma trận
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> In đề
          </button>
        </div>
      </div>

      {/* DANH SÁCH CÂU HỎI TRONG ĐỀ */}
      <div className="space-y-6">
        {/* PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN */}
        {part1Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-blue-900 uppercase">
                PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn ({part1Questions.length} câu - 3.0 điểm)
              </h3>
              <p className="text-xs text-slate-500">Mỗi câu hỏi thí sinh chỉ chọn một phương án.</p>
            </div>

            <div className="space-y-4">
              {part1Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg font-black text-xs">
                      Câu {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">[{q.level || 'Nhận biết'}]</span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-relaxed">{q.content}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                          opt.key === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          opt.key === q.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  {q.solution && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <strong>Lời giải:</strong> {q.solution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHẦN II: ĐÚNG / SAI */}
        {part2Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-blue-900 uppercase">
                PHẦN II. Câu trắc nghiệm đúng sai ({part2Questions.length} câu - 4.0 điểm)
              </h3>
              <p className="text-xs text-slate-500">Thí sinh trả lời từ ý a) đến ý d) trong mỗi câu.</p>
            </div>

            <div className="space-y-4">
              {part2Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-lg font-black text-xs">
                      Câu {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">[{q.level || 'Thông hiểu'}]</span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-relaxed">{q.content}</div>

                  <div className="space-y-1.5 pt-1">
                    {(q.statements || []).map((st) => (
                      <div key={st.id} className="p-2 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                        <span className="text-slate-800"><strong>{st.id})</strong> {st.text}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${st.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHẦN III: TRẢ LỜI NGẮN */}
        {part3Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-blue-900 uppercase">
                PHẦN III. Câu trắc nghiệm trả lời ngắn ({part3Questions.length} câu - 3.0 điểm)
              </h3>
              <p className="text-xs text-slate-500">Thí sinh điền kết quả vào ô trả lời.</p>
            </div>

            <div className="space-y-4">
              {part3Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg font-black text-xs">
                      Câu {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">[{q.level || 'Vận dụng'}]</span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-relaxed">{q.content}</div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Đáp số:</span>
                    <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{q.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* MODAL "LƯU FILE VÀO NGÂN HÀNG MA TRẬN" (CHUẨN 100% ẢNH 180) */}
      {/* ======================================================= */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 font-sans animate-in fade-in">
            {/* Header Popup có icon tài liệu xanh lá và nút đóng X */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <FileText className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">
                  Lưu file vào Ngân hàng ma trận
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form nhập thông số */}
            <div className="space-y-4 text-xs">
              {/* Ô NHẬP TÊN FILE MA TRẬN ĐÃ TỰ ĐỘNG CHUẨN HÓA DẠNG: MA_TRẬN_[...].json */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Tên file ma trận (*):
                </label>
                <input
                  type="text"
                  value={matrixFileName}
                  onChange={(e) => setMatrixFileName(e.target.value)}
                  className="w-full p-2.5 border-2 border-emerald-500 rounded-xl font-bold font-mono text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  autoFocus
                />
              </div>

              {/* CHỌN THƯ MỤC TRONG NGÂN HÀNG MA TRẬN */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Chọn thư mục trong Ngân hàng ma trận (*):
                </label>
                <div className="relative">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 outline-none bg-white appearance-none pr-8 cursor-pointer"
                  >
                    <option value="TOÁN 10">TOÁN 10</option>
                    <option value="TOÁN 11">TOÁN 11</option>
                    <option value="TOÁN 12">TOÁN 12</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Tệp tin sẽ được lưu thẳng vào thư mục đã chọn trong Ngân hàng ma trận.
              </p>
            </div>

            {/* CẶP NÚT: HỦY - XÁC NHẬN LƯU (CHUẨN ẢNH 180) */}
            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmSaveToBank}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" /> Xác nhận lưu vào Ngân hàng ma trận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
