import React, { useState } from 'react';
import { GeneratedTest } from './types';
import { buildStandardMatrixData } from './matrixStandardGenerator';
import { 
  exportBothMatricesWord, 
  exportStandardMatrixOnlyWord, 
  exportSpecMatrixOnlyWord, 
  exportQuestionAndOutcomeMatricesWord 
} from './wordExporter';
import { extractTestMetadata, saveTestToBank } from './testBankStorage';
import { FileText, Download, Save, CheckCircle2, X } from 'lucide-react';

interface MatrixTableProps {
  test: GeneratedTest;
  onBack?: () => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ test, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const meta = extractTestMetadata(test);
  
  const [fileNameInput, setFileNameInput] = useState(`MaTran_${meta.cleanFileName}`);
  const [displayNameInput, setDisplayNameInput] = useState(`Ma Trận & Đặc Tả - ${meta.displayName}`);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const matrixData = buildStandardMatrixData(test);
  const { summary, rows } = matrixData;

  const handleOpenSaveModal = () => {
    setFileNameInput(`MaTran_${meta.cleanFileName}`);
    setDisplayNameInput(`Ma Trận & Đặc Tả - ${meta.displayName}`);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const handleConfirmSaveToBank = () => {
    try {
      saveTestToBank(test, {
        grade: meta.grade,
        className: meta.className,
        topicName: meta.topicName,
        lessonName: meta.lessonName,
        fileName: fileNameInput.trim() || `MaTran_${meta.cleanFileName}`,
        displayName: displayNameInput.trim() || `Ma Trận & Đặc Tả - ${meta.displayName}`,
        tags: [meta.grade, 'Ma Trận', 'Bảng Đặc Tả'],
        allowDuplicateSequence: true,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Lỗi lưu ma trận vào ngân hàng đề:', error);
      alert('Có lỗi xảy ra khi lưu ma trận vào ngân hàng đề.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      {/* Top Action Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Hệ Thống Ma Trận Đề Kiểm Tra & Bảng Đặc Tả
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Môn: Toán Khối {meta.grade} | Chủ đề: {meta.topicName} - {meta.lessonName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenSaveModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Lưu Ma Trận vào Ngân Hàng Đề
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Xuất File Word (.docx)
            </button>
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50">
              <button
                onClick={() => exportBothMatricesWord(test)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
              >
                📄 Xuất toàn bộ Bộ Ma Trận & Đặc Tả
              </button>
              <button
                onClick={() => exportQuestionAndOutcomeMatricesWord(test)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
              >
                📊 Xuất Ma Trận dạng câu hỏi & YCCĐ
              </button>
              <button
                onClick={() => exportStandardMatrixOnlyWord(test)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
              >
                📋 Xuất Ma Trận chuẩn 19 cột
              </button>
              <button
                onClick={() => exportSpecMatrixOnlyWord(test)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
              >
                📑 Xuất Bảng Đặc Tả Kỹ Thuật
              </button>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-all"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>

      {/* Preview Section: Standard 19-Column Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-200 bg-slate-100/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">1. Ma Trận Đề Kiểm Tra Định Kỳ (Cấu trúc GDPT 2018)</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
            Thời gian: {matrixData.durationMinutes} phút
          </span>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse border border-slate-300 text-xs text-slate-800">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-300 p-2" rowSpan={4}>TT</th>
                <th className="border border-slate-300 p-2" rowSpan={4}>Chủ đề / Chương</th>
                <th className="border border-slate-300 p-2" rowSpan={4}>Nội dung / Đơn vị kiến thức</th>
                <th className="border border-slate-300 p-2" rowSpan={4}>Yêu cầu cần đạt</th>
                <th className="border border-slate-300 p-2" colSpan={12}>Mức độ đánh giá</th>
                <th className="border border-slate-300 p-2" colSpan={3} rowSpan={3}>Tổng</th>
                <th className="border border-slate-300 p-2" rowSpan={4}>Tỉ lệ % điểm</th>
              </tr>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-300 p-2" colSpan={9}>TNKQ</th>
                <th className="border border-slate-300 p-2" colSpan={3} rowSpan={2}>Tự luận</th>
              </tr>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-300 p-2" colSpan={3}>Nhiều lựa chọn</th>
                <th className="border border-slate-300 p-2" colSpan={3}>Đúng - Sai</th>
                <th className="border border-slate-300 p-2" colSpan={3}>Trả lời ngắn</th>
              </tr>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-300 p-1">Biết</th>
                <th className="border border-slate-300 p-1">Hiểu</th>
                <th className="border border-slate-300 p-1">Vận dụng</th>
                <th className="border border-slate-300 p-1">Biết</th>
                <th className="border border-slate-300 p-1">Hiểu</th>
                <th className="border border-slate-300 p-1">Vận dụng</th>
                <th className="border border-slate-300 p-1">Biết</th>
                <th className="border border-slate-300 p-1">Hiểu</th>
                <th className="border border-slate-300 p-1">Vận dụng</th>
                <th className="border border-slate-300 p-1">Biết</th>
                <th className="border border-slate-300 p-1">Hiểu</th>
                <th className="border border-slate-300 p-1">Vận dụng</th>
                <th className="border border-slate-300 p-1">Biết</th>
                <th className="border border-slate-300 p-1">Hiểu</th>
                <th className="border border-slate-300 p-1">Vận dụng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {row.isFirstInTopic && (
                    <td className="border border-slate-300 p-2 text-center font-bold bg-white" rowSpan={row.topicRowSpan}>
                      {row.index}
                    </td>
                  )}
                  {row.isFirstInTopic && (
                    <td className="border border-slate-300 p-2 font-bold bg-white" rowSpan={row.topicRowSpan}>
                      {row.topicName}
                    </td>
                  )}
                  {row.isFirstInLesson && (
                    <td className="border border-slate-300 p-2 font-medium bg-white" rowSpan={row.lessonRowSpan}>
                      {row.lessonName}
                    </td>
                  )}
                  <td className="border border-slate-300 p-2">{row.requirementText}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.mcq.nhanBiet.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.mcq.thongHieu.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.mcq.vanDung.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.trueFalse.nhanBiet.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.trueFalse.thongHieu.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.trueFalse.vanDung.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.shortAnswer.nhanBiet.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.shortAnswer.thongHieu.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center">{row.shortAnswer.vanDung.tags.join(', ')}</td>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{row.rowKnown || ''}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{row.rowUnderstand || ''}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{row.rowApply || ''}</td>
                  {row.isFirstInLesson && (
                    <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50" rowSpan={row.lessonRowSpan}>
                      {row.percentage}%
                    </td>
                  )}
                </tr>
              ))}

              {/* Summary Rows */}
              <tr className="bg-slate-100 font-bold text-center">
                <td className="border border-slate-300 p-2" colSpan={4}>Tổng số câu/ý</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.mcq.nhanBiet}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.mcq.thongHieu}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.mcq.vanDung}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.trueFalse.nhanBiet}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.trueFalse.thongHieu}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.trueFalse.vanDung}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.shortAnswer.nhanBiet}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.shortAnswer.thongHieu}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.shortAnswer.vanDung}</td>
                <td className="border border-slate-300 p-1">0</td>
                <td className="border border-slate-300 p-1">0</td>
                <td className="border border-slate-300 p-1">0</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.byLevel.nhanBiet}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.byLevel.thongHieu}</td>
                <td className="border border-slate-300 p-1">{summary.totalCount.byLevel.vanDung}</td>
                <td className="border border-slate-300 p-1">-</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <td className="border border-slate-300 p-2" colSpan={4}>Tổng số điểm</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.score.mcq.toFixed(1)} đ</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.score.trueFalse.toFixed(1)} đ</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.score.shortAnswer.toFixed(1)} đ</td>
                <td className="border border-slate-300 p-2" colSpan={3}>0.0 đ</td>
                <td className="border border-slate-300 p-1">{summary.score.byLevel.nhanBiet.toFixed(1)}</td>
                <td className="border border-slate-300 p-1">{summary.score.byLevel.thongHieu.toFixed(1)}</td>
                <td className="border border-slate-300 p-1">{summary.score.byLevel.vanDung.toFixed(1)}</td>
                <td className="border border-slate-300 p-1">{summary.score.total.toFixed(1)}</td>
              </tr>
              <tr className="bg-slate-200 font-bold text-center">
                <td className="border border-slate-300 p-2" colSpan={4}>Tỉ lệ %</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.percentage.mcq}%</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.percentage.trueFalse}%</td>
                <td className="border border-slate-300 p-2" colSpan={3}>{summary.percentage.shortAnswer}%</td>
                <td className="border border-slate-300 p-2" colSpan={3}>0%</td>
                <td className="border border-slate-300 p-1">{summary.percentage.byLevel.nhanBiet}%</td>
                <td className="border border-slate-300 p-1">{summary.percentage.byLevel.thongHieu}%</td>
                <td className="border border-slate-300 p-1">{summary.percentage.byLevel.vanDung}%</td>
                <td className="border border-slate-300 p-1">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Matrix Modal with Filename Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Save className="w-5 h-5 text-emerald-400" />
                Lưu Ma Trận & Đặc Tả vào Ngân Hàng Đề
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {saveSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <h4 className="text-xl font-bold text-slate-800">Lưu thành công!</h4>
                  <p className="text-sm text-slate-500">Bộ ma trận và đặc tả đã được lưu vào Ngân hàng Đề.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Tên file chuẩn hóa (Mã định danh):
                    </label>
                    <input
                      type="text"
                      value={fileNameInput}
                      onChange={(e) => setFileNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-mono text-slate-800 bg-slate-50"
                      placeholder="Ví dụ: MaTran_Toan12_UngDungDaoHam"
                    />
                    <p className="text-xs text-slate-400 mt-1">Dùng để quản lý file hệ thống (không dấu, viết liền).</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Tên hiển thị (Tiêu đề):
                    </label>
                    <input
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-slate-800"
                      placeholder="Ví dụ: Toán 12 - Ứng dụng đạo hàm - Ma trận đề kiểm tra"
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">💡 Thông tin lưu trữ:</p>
                    <p>• Khối lớp: {meta.grade}</p>
                    <p>• Chủ đề: {meta.topicName}</p>
                    <p>• Tổng số câu: {test.questions.length} câu</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSaveToBank}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Xác Nhận Lưu
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixTable;
