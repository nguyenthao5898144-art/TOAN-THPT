import React from 'react';
import { AlertCircle, FileText, CheckCircle2, X } from 'lucide-react';
import { StoredTestItem } from '../utils/testBankStorage';

interface DuplicatePromptModalProps {
  isOpen: boolean;
  duplicateItem: StoredTestItem | null;
  proposedBaseFileName: string;
  nextSequencedFileName: string;
  onSaveAsNewVersion: () => void; // Thêm số thứ tự cuối tên file
  onCancel: () => void; // Hủy lưu
}

export const DuplicatePromptModal: React.FC<DuplicatePromptModalProps> = ({
  isOpen,
  duplicateItem,
  proposedBaseFileName,
  nextSequencedFileName,
  onSaveAsNewVersion,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Phát hiện đề thi trùng tên trong kho</h3>
              <p className="text-amber-100 text-xs">Tên file chuẩn đã tồn tại trong kho lưu trữ</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Đề thi vừa tạo có tên tệp trùng với một đề thi đã lưu trước đó trong kho đề:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-800">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{proposedBaseFileName}.docx</span>
            </div>
            {duplicateItem && (
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-200">
                <span>📚 <strong>Chủ đề:</strong> {duplicateItem.topicName}</span>
                <span>📖 <strong>Bài học:</strong> {duplicateItem.lessonName}</span>
                <span>📅 <strong>Đã lưu:</strong> {new Date(duplicateItem.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
            <strong>Bạn có muốn tiếp tục lưu?</strong> Nếu lưu tiếp, hệ thống sẽ tự động thêm số thứ tự vào cuối tên file để phân biệt các phiên bản đề:
            <div className="mt-1.5 font-mono font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-300">
              👉 {nextSequencedFileName}.docx
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Hủy lưu
          </button>
          <button
            onClick={onSaveAsNewVersion}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tiếp tục lưu (Thêm số thứ tự)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
