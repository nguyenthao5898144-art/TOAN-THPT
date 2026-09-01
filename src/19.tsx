import React, { useState } from 'react';
import { TestConfig } from './types';
import { getStoredClasses, saveAssignment, Assignment, ClassRoom } from './classStorage';
import {
  Send, Clock, Calendar, CheckSquare, Square,
  Users, Check, Copy, Link as LinkIcon, X, Sparkles
} from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: TestConfig;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
}) => {
  const classes: ClassRoom[] = getStoredClasses();

  // 1. Cấu hình bài tập
  const [title, setTitle] = useState(currentConfig?.title || 'KIỂM TRA ĐỊNH KỲ TOÁN 12');
  const [durationMinutes, setDurationMinutes] = useState(currentConfig?.durationMinutes || 45);

  // Thời gian mở & đóng đề mặc định (Từ hiện tại đến 2 ngày sau)
  const nowStr = new Date().toISOString().slice(0, 16);
  const futureStr = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [openAt, setOpenAt] = useState(nowStr);
  const [closeAt, setCloseAt] = useState(futureStr);

  // Số lần làm bài tối đa (1, 2, 3... 0 = Không giới hạn)
  const [maxAttempts, setMaxAttempts] = useState<number>(1);

  // Đối tượng nhận bài
  const [targetType, setTargetType] = useState<'class' | 'specific_students'>('class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(classes.map((c) => c.name));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleToggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleCreateAssignment = () => {
    const assignmentId = `assign_${Date.now()}`;
    const newAssignment: Assignment = {
      id: assignmentId,
      title,
      config: currentConfig,
      openAt,
      closeAt,
      durationMinutes,
      maxAttempts,
      targetType,
      targetClasses: selectedClasses,
      targetStudentIds: selectedStudentIds,
      allowReviewSolution: true,
      createdAt: new Date().toISOString(),
    };

    saveAssignment(newAssignment);

    // Tạo đường dẫn trực tiếp cho học sinh
    const appUrl = window.location.origin + window.location.pathname;
    const link = `${appUrl}?mode=student&assignmentId=${assignmentId}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">CẤU HÌNH GIAO BÀI TẬP THÔNG MA TRẬN/ĐỀ</h2>
              <p className="text-xs text-slate-400">Sinh đề đặc bản riêng cho từng học sinh khi làm bài</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          {/* Tên bài tập */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Tên bài kiểm tra / Nhiệm vụ:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Nhập tên bài tập..."
            />
          </div>

          {/* Thời gian làm bài & số lần làm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Thời gian làm bài (Phút):
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Số lần làm tối đa:
              </label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value={1}>1 lần duy nhất</option>
                <option value={2}>2 lần</option>
                <option value={3}>3 lần</option>
                <option value={0}>Không giới hạn (Luyện tập tự do)</option>
              </select>
            </div>
          </div>

          {/* Khung thời gian mở & đóng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> Thời gian mở đề:
              </label>
              <input
                type="datetime-local"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" /> Thời gian đóng đề:
              </label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Đối tượng giao bài */}
          <div className="border-t border-slate-200 pt-3">
            <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Chọn lớp học nhận bài:
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => {
                const isSelected = selectedClasses.includes(cls.name);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleToggleClass(cls.name)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    {cls.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link đã tạo */}
          {generatedLink && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" /> Link bài làm của học sinh:
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Đã sao chép!' : 'Sao chép link'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs text-slate-700 select-all"
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleCreateAssignment}
            className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Tạo link & Giao bài
          </button>
        </div>
