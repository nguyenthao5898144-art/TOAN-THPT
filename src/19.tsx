import React, { useState } from 'react';
import { TestConfig } from './types';
import { getStoredClasses, saveAssignment, Assignment, ClassRoom } from './classStorage';
import { Send, Clock, Calendar, CheckSquare, Square, Users, Check, Copy, Link as LinkIcon, X } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: TestConfig;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, currentConfig }) => {
  const classes: ClassRoom[] = getStoredClasses();
  const [title, setTitle] = useState(currentConfig?.title || 'KIỂM TRA ĐỊNH KỲ TOÁN 12');
  const [durationMinutes, setDurationMinutes] = useState(currentConfig?.durationMinutes || 45);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(classes.map((c) => c.name));
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleToggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const handleCreateAssignment = () => {
    const assignmentId = `assign_${Date.now()}`;
    const newAssignment: Assignment = {
      id: assignmentId,
      title,
      config: currentConfig,
      durationMinutes,
      maxAttempts,
      targetType: 'class',
      targetClasses: selectedClasses,
      allowReviewSolution: true,
      createdAt: new Date().toISOString(),
    };
    saveAssignment(newAssignment);
    const link = `${window.location.origin}${window.location.pathname}?mode=student&assignmentId=${assignmentId}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">GIAO BÀI KIỂM TRA CHO HỌC SINH</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-slate-700">
          <div>
            <label className="block font-bold mb-1">Tên bài kiểm tra:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-600" /> Thời gian (Phút):
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Số lần làm tối đa:</label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value={1}>1 lần</option>
                <option value={2}>2 lần</option>
                <option value={0}>Không giới hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-emerald-600" /> Chọn lớp nhận bài:
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleToggleClass(cls.name)}
                  className={`px-3 py-1 rounded text-xs font-bold border ${
                    selectedClasses.includes(cls.name)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {generatedLink && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> Link học sinh:</span>
                <button onClick={handleCopyLink} className="text-emerald-700 underline cursor-pointer">
                  {isCopied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
              <input type="text" readOnly value={generatedLink} className="w-full text-xs p-1.5 bg-white border rounded" />
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg text-sm">Đóng</button>
          <button onClick={handleCreateAssignment} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm">
            Tạo link & Giao bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
