import React, { useState } from 'react';
import { Question } from './types';
import { X, Save, Check } from 'lucide-react';

interface EditorModalProps {
  question: Question;
  onSave: (updated: Question) => void;
  onClose: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({ question, onSave, onClose }) => {
  const [content, setContent] = useState(question.content || '');
  const [solution, setSolution] = useState(question.solution || '');

  const handleSave = () => {
    onSave({
      ...question,
      content,
      solution
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Chỉnh Sửa Nội Dung Câu Hỏi
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi (hỗ trợ LaTeX):
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 bg-slate-50 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Lời giải chi tiết:
            </label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 bg-slate-50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
