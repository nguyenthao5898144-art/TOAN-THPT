import React, { useState } from 'react';
import { GeneratedTest } from './types';
import {
  ArrowLeft, Download, Database, Check, X,
  FileText, ChevronDown, Table, Layers
} from 'lucide-react';

interface MatrixTableProps {
  test: GeneratedTest;
  onBack?: () => void;
  onUpdateTest?: (updated: GeneratedTest) => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ test, onBack, onUpdateTest }) => {
  // HÀM CHUẨN HÓA BẮT BUỘC: MA_TRẬN_[...].json
  const formatMatrixFileName = (rawTitle: string): string => {
    let clean = (rawTitle || 'DE_THI').trim().replace(/\.json$/i, '');
    let core = clean.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]$/, '').trim();
    return `MA_TRẬN_[${core}].json`;
  };

  // State cho Modal "Lưu file vào Ngân hàng ma trận" (Chuẩn Ảnh 181)
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

  const questions = test.questions || [];
  const part1Count = questions.filter((q) => q.type === 'multiple_choice').length;
  const part2Count = questions.filter((q) => q.type === 'true_false').length;
  const part3Count = questions.filter((q) => q.type === 'short_answer').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* THANH TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200"
              title="Quay lại biên tập đề"
            >
              <ArrowLeft className="w-5 h-5 text-blue-700" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Ma trận & Bản đặc tả đề kiểm tra
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Môn: <strong>Toán {test.config?.grade || '10'}</strong> • Đề thi: <strong>{test.title}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* NÚT LƯU FILE VÀO NGÂN HÀNG MA TRẬN */}
          <button
            type="button"
            onClick={handleOpenSaveModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Database className="w-4 h-4" /> Lưu file vào Ngân hàng ma trận
          </button>
        </div>
      </div>

      {/* BẢNG MA TRẬN TỔNG HỢP */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3 flex justify-between items-center">
          <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-700" /> Khung ma trận đề kiểm tra định kỳ (GDPT 2018)
          </h3>
          <span className="text-xs font-bold text-slate-500">Tổng điểm: 10.0 điểm</span>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse min-w-[750px]">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b">
              <tr>
                <th className="p-3 text-left border-r w-12">TT</th>
                <th className="p-3 text-left border-r min-w-[180px]">Chủ đề / Đơn vị kiến thức</th>
                <th className="p-3 border-r w-28">Phần I (TN 4 lựa chọn)</th>
                <th className="p-3 border-r w-28">Phần II (TN Đúng/Sai)</th>
                <th className="p-3 border-r w-28">Phần III (Trả lời ngắn)</th>
                <th className="p-3 border-r w-20">Tổng số câu</th>
                <th className="p-3 w-20">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 text-left font-bold text-slate-500 border-r">1</td>
                <td className="p-3 text-left font-bold text-slate-900 border-r">
                  Mệnh đề và Tập hợp (Toán 10)
                </td>
                <td className="p-3 border-r font-mono font-bold text-blue-700">{part1Count} câu</td>
                <td className="p-3 border-r font-mono font-bold text-purple-700">{part2Count} câu</td>
                <td className="p-3 border-r font-mono font-bold text-amber-700">{part3Count} câu</td>
                <td className="p-3 border-r font-black text-slate-900">{questions.length} câu</td>
                <td className="p-3 font-black text-emerald-700">10.0 đ</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                <td colSpan={2} className="p-3 text-right pr-4 border-r">TỔNG CỘNG:</td>
                <td className="p-3 border-r font-mono text-blue-800">{part1Count} câu (3.0đ)</td>
                <td className="p-3 border-r font-mono text-purple-800">{part2Count} câu (4.0đ)</td>
                <td className="p-3 border-r font-mono text-amber-800">{part3Count} câu (3.0đ)</td>
                <td className="p-3 border-r font-black">{questions.length} câu</td>
                <td className="p-3 font-black text-emerald-800">10.0 điểm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL "LƯU FILE VÀO NGÂN HÀNG MA TRẬN" (CHUẨN 100% ẢNH 181) */}
      {/* ======================================================= */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 font-sans animate-in fade-in">
            {/* Header Popup */}
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
              {/* Ô NHẬP TÊN FILE MA TRẬN TỰ ĐỘNG CHUẨN HÓA DẠNG: MA_TRẬN_[...].json */}
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

            {/* CẶP NÚT: HỦY - XÁC NHẬN LƯU (CHUẨN ẢNH 181) */}
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

export default MatrixTable;
