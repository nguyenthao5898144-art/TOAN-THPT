import React, { useState, useEffect } from 'react';
import { GeneratedTest } from './types';
import {
  Printer, Database, Check, X, FileText, ChevronDown
} from 'lucide-react';

interface QuestionListProps {
  test: GeneratedTest;
  onUpdateTest?: (updated: GeneratedTest) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ test, onUpdateTest }) => {
  // HÀM ÉP BUỘC CHUẨN ĐỊNH DẠNG: MA_TRẬN_[...].json
  const formatMatrixFileName = (rawTitle: string): string => {
    let clean = (rawTitle || 'DE_THI').trim().replace(/\.json$/i, '');
    let core = clean.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]$/, '').trim();
    return `MA_TRẬN_[${core}].json`;
  };

  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [matrixFileName, setMatrixFileName] = useState<string>(() => formatMatrixFileName(test?.title));
  const [selectedFolder, setSelectedFolder] = useState<string>('TOÁN 10');

  useEffect(() => {
    setMatrixFileName(formatMatrixFileName(test?.title));
  }, [test?.title]);

  const handleOpenSaveModal = () => {
    setMatrixFileName(formatMatrixFileName(test?.title));
    const grade = test.config?.grade || '10';
    setSelectedFolder(grade === '11' ? 'TOÁN 11' : (grade === '12' ? 'TOÁN 12' : 'TOÁN 10'));
    setIsSaveModalOpen(true);
  };

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
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{test.title}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Toán {test.config?.grade || '10'} • {test.config?.durationMinutes || 45} phút • {test.questions?.length || 22} câu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" /> In đề
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {part1Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-blue-900 uppercase border-b pb-2">PHẦN I. Câu trắc nghiệm 4 lựa chọn ({part1Questions.length} câu)</h3>
            <div className="space-y-3">
              {part1Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Câu {idx + 1}: {q.content}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(q.options || []).map(opt => (
                      <div key={opt.key} className={`p-2 rounded-lg border ${opt.key === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white'}`}>
                        {opt.key}. {opt.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {part2Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-blue-900 uppercase border-b pb-2">PHẦN II. Câu trắc nghiệm Đúng / Sai ({part2Questions.length} câu)</h3>
            <div className="space-y-3">
              {part2Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Câu {idx + 1}: {q.content}</div>
                  <div className="space-y-1">
                    {(q.statements || []).map(st => (
                      <div key={st.id} className="p-1.5 bg-white rounded border flex justify-between">
                        <span>{st.id}) {st.text}</span>
                        <span className={`font-bold ${st.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{st.isCorrect ? 'ĐÚNG' : 'SAI'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {part3Questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-blue-900 uppercase border-b pb-2">PHẦN III. Câu trắc nghiệm trả lời ngắn ({part3Questions.length} câu)</h3>
            <div className="space-y-3">
              {part3Questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Câu {idx + 1}: {q.content}</div>
                  <div className="font-mono font-bold text-blue-700">Đáp án: {q.correctAnswer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POPUP LƯU FILE VÀO NGÂN HÀNG MA TRẬN */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 font-sans animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <FileText className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">Lưu file vào Ngân hàng ma trận</h3>
              </div>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">Tên file ma trận (*):</label>
                <input
                  type="text"
                  value={matrixFileName || formatMatrixFileName(test?.title)}
                  onChange={(e) => setMatrixFileName(e.target.value)}
                  className="w-full p-2.5 border-2 border-emerald-500 rounded-xl font-bold font-mono text-xs text-slate-900 outline-none bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">Chọn thư mục trong Ngân hàng ma trận (*):</label>
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

              <p className="text-[11px] text-slate-500 italic">* Tệp tin sẽ được lưu thẳng vào thư mục đã chọn trong Ngân hàng ma trận.</p>
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setIsSaveModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer">Hủy</button>
              <button onClick={handleConfirmSaveToBank} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer">
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
