import React, { useState } from 'react';
import { TestConfig, Assignment, ClassRoom } from '../types';
import { getStoredClasses, saveAssignment } from '../utils/classStorage';
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
  currentConfig
}) => {
  const classes: ClassRoom[] = getStoredClasses();

  // 1. Cấu hình bài tập
  const [title, setTitle] = useState(currentConfig.title || 'KIỂM TRA ĐỊNH KỲ TOÁN 12');
  const [durationMinutes, setDurationMinutes] = useState(currentConfig.durationMinutes || 45);
  
  // Thời gian mở & đóng đề mặc định (Từ hiện tại đến 2 ngày sau)
  const nowStr = new Date().toISOString().slice(0, 16);
  const futureStr = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [openAt, setOpenAt] = useState(nowStr);
  const [closeAt, setCloseAt] = useState(futureStr);

  // Số lần làm bài tối đa (1, 2, 3... 0 = Không giới hạn)
  const [maxAttempts, setMaxAttempts] = useState<number>(1);

  // Đối tượng nhận bài
  const [targetType, setTargetType] = useState<'class' | 'specific_students'>('class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(classes.map(c => c.name));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleToggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
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
      createdAt: new Date().toISOString()
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
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">CẤU HÌNH GIAO BÀI TẬP THEO MA TRẬN</h2>
              <p className="text-xs text-slate-400">Sinh đề độc bản riêng cho từng học sinh khi làm bài</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
          {/* Tiêu đề */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài kiểm tra / Luyện tập:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cài đặt thời gian & Số lần làm bài */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Thời gian MỞ ĐỀ:
              </label>
              <input
                type="datetime-local"
                value={openAt}
                onChange={e => setOpenAt(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600" /> Thời gian ĐÓNG ĐỀ (Hạn chót):
              </label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={e => setCloseAt(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Thời gian làm bài (Phút):
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số lần làm bài tối đa:</label>
              <select
                value={maxAttempts}
                onChange={e => setMaxAttempts(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                <option value={1}>Chỉ làm 1 lần duy nhất</option>
                <option value={2}>Tối đa 2 lần</option>
                <option value={3}>Tối đa 3 lần</option>
                <option value={0}>Không giới hạn số lần làm</option>
              </select>
            </div>
          </div>

          {/* Đối tượng giao bài */}
          <div className="space-y-2 pt-2">
            <label className="block font-bold text-slate-800">Giao bài tập cho:</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'class'}
                  onChange={() => setTargetType('class')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-semibold">Theo Lớp học</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'specific_students'}
                  onChange={() => setTargetType('specific_students')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-semibold">Chọn học sinh cụ thể</span>
              </label>
            </div>

            {/* Danh sách chọn Lớp */}
            {targetType === 'class' && (
              <div className="flex flex-wrap gap-2 pt-2">
                {classes.map(c => {
                  const isChecked = selectedClasses.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleClass(c.name)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      <span>Lớp {c.name} ({c.students.length} HS)</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Danh sách chọn từng Học sinh cụ thể */}
            {targetType === 'specific_students' && (
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                {classes.flatMap(c => c.students).map(s => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleStudent(s.id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                        isChecked ? 'bg-blue-50 border-blue-300 font-bold text-blue-900' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{s.fullName} ({s.className})</span>
                      <span className="text-[11px] text-slate-400 font-mono">{s.phone}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Khu vực hiển thị Link bài tập sau khi tạo */}
          {generatedLink && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                ĐÃ TẠO LINK GIAO BÀI THÀNH CÔNG!
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Đã copy link!' : 'Copy Link Gửi Zalo'}</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800">
                * Học sinh đăng nhập bằng Số điện thoại $\rightarrow$ Bấm Bắt đầu làm bài $\rightarrow$ Tự động nhận 1 mã đề độc bản ngẫu nhiên theo ma trận.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl">
            Đóng
          </button>
          {!generatedLink && (
            <button
              onClick={handleCreateAssignment}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>TẠO & LẤY LINK GIAO BÀI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};