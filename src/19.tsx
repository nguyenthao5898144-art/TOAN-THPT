import React, { useState } from 'react';
import { TestConfig } from './types';
import { getStoredClasses, saveAssignment, Assignment, ClassRoom } from './classStorage';
import {
  Send, Clock, Calendar, CheckSquare, Square, Users, Check,
  Copy, Link as LinkIcon, X, Shield, Lock, Eye, AlertCircle,
  Sparkles, CheckCircle2, Award
} from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: TestConfig;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
}) => {
  const classes: ClassRoom[] = getStoredClasses();

  // 1. Cấu hình chung
  const [title, setTitle] = useState<string>(currentConfig?.title || 'BÀI KIỂM TRA & LUYỆN TẬP TOÁN THPT');
  const [grade, setGrade] = useState<string>(currentConfig?.grade || '12');
  const [purpose, setPurpose] = useState<string>('Kiểm tra định kỳ (1 tiết / 45 phút)');
  const [durationMinutes, setDurationMinutes] = useState<number>(currentConfig?.durationMinutes || 45);

  // Thời gian mở & đóng đề
  const nowIso = new Date().toISOString().slice(0, 16);
  const futureIso = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [openAt, setOpenAt] = useState<string>(nowIso);
  const [closeAt, setCloseAt] = useState<string>(futureIso);

  // Lớp nhận bài
  const [selectedClasses, setSelectedClasses] = useState<string[]>(classes.map((c) => c.name));

  // Cấu hình tính năng
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [examPassword, setExamPassword] = useState<string>('');
  const [enableMonitoring, setEnableMonitoring] = useState<boolean>(true);
  const [showSolutionAfterSubmit, setShowSolutionAfterSubmit] = useState<boolean>(true);

  // Link bài thi sau khi xuất bản
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // HÀM TỰ ĐỘNG ĐIỀN THÔNG MINH KHI CHỌN MỤC ĐÍCH TẠO ĐỀ
  const handlePurposeChange = (val: string) => {
    setPurpose(val);

    if (val.includes('15 phút') || val.includes('thường xuyên')) {
      setDurationMinutes(15);
      setTitle(`BÀI KIỂM TRA THƯỜNG XUYÊN (15 PHÚT) - TOÁN ${grade}`);
    } else if (val.includes('45 phút') || val.includes('định kỳ')) {
      setDurationMinutes(45);
      setTitle(`BÀI KIỂM TRA ĐỊNH KỲ (45 PHÚT) - TOÁN ${grade}`);
    } else if (val.includes('giữa kỳ')) {
      setDurationMinutes(60);
      setTitle(`ĐỀ THI KIỂM TRA GIỮA HỌC KỲ - TOÁN ${grade}`);
    } else if (val.includes('cuối kỳ')) {
      setDurationMinutes(90);
      setTitle(`ĐỀ THI KIỂM TRA CUỐI HỌC KỲ - TOÁN ${grade}`);
    } else if (val.includes('tốt nghiệp')) {
      setDurationMinutes(90);
      setTitle(`ĐỀ THI THỬ TỐT NGHIỆP THPT QUỐC GIA - TOÁN ${grade}`);
    } else if (val.includes('Luyện tập') || val.includes('tự học')) {
      setDurationMinutes(0);
      setMaxAttempts(0);
      setTitle(`BÀI TẬP TỰ LUYỆN & ÔN TẬP - TOÁN ${grade}`);
    }
  };

  const handleToggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const handleSelectAllClasses = () => {
    setSelectedClasses(classes.map((c) => c.name));
  };

  const handlePublishAssignment = () => {
    const assignmentId = `assign_${Date.now()}`;
    const newAssignment: Assignment = {
      id: assignmentId,
      title,
      config: currentConfig,
      openAt,
      closeAt,
      durationMinutes,
      maxAttempts,
      targetType: 'class',
      targetClasses: selectedClasses,
      allowReviewSolution: showSolutionAfterSubmit,
      createdAt: new Date().toISOString(),
    };

    saveAssignment(newAssignment);

    const link = `${window.location.origin}/?mode=student&assignmentId=${assignmentId}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-slate-50 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tên đề thi: <strong>{title}</strong>
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                KIỂM TRA & LUYỆN TẬP
              </div>
              <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                • Tích hợp đầy đủ: Kiểm tra tính điểm & Mở lời giải ôn luyện cho học sinh
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NỘI DUNG FORM CẤU HÌNH */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {/* KHỐI 1: CẤU HÌNH ĐỀ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Tên bài thi / Kiểm tra (Tự động điền hoặc sửa tùy ý):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối học:</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setGrade(newGrade);
                    setTitle((prev) => prev.replace(/TOÁN \d+/, `TOÁN ${newGrade}`));
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">Toán 12</option>
                  <option value="11">Toán 11</option>
                  <option value="10">Toán 10</option>
                </select>
              </div>

              {/* Ô MỤC ĐÍCH TẠO ĐỀ - HỖ TRỢ TỰ ĐIỀN VÀ TỰ GÕ TÙY Ý */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Mục đích tạo đề:</label>
                  <span className="text-[10px] text-blue-600 font-bold">⚡ Tự động điền số phút & tên đề</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    list="purpose_options"
                    value={purpose}
                    onChange={(e) => handlePurposeChange(e.target.value)}
                    placeholder="Bấm chọn hoặc tự gõ mục đích..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <datalist id="purpose_options">
                    <option value="Kiểm tra định kỳ (1 tiết / 45 phút)" />
                    <option value="Kiểm tra thường xuyên (15 phút)" />
                    <option value="Kiểm tra giữa kỳ" />
                    <option value="Kiểm tra cuối kỳ" />
                    <option value="Luyện thi tốt nghiệp THPT" />
                    <option value="Luyện tập & Tự học" />
                  </datalist>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Thời gian làm bài (Phút):
                </label>
                <input
                  type="number"
                  min={0}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nhập 0 nếu không giới hạn giờ làm</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượt làm bài tối đa:</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nhập 0 để học sinh luyện tập nhiều lần</span>
              </div>
            </div>

            {/* Thời gian mở & đóng đề */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Thời gian bắt đầu mở đề:
                </label>
                <input
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" /> Hạn chót nộp bài:
                </label>
                <input
                  type="datetime-local"
                  value={closeAt}
                  onChange={(e) => setCloseAt(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chọn lớp nhận bài */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Chọn lớp nhận bài ({selectedClasses.length}/{classes.length} lớp):
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="text-blue-600 hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Chọn tất cả
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {classes.map((cls) => {
                  const isSelected = selectedClasses.includes(cls.name);
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleToggleClass(cls.name)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Lớp {cls.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cls.students?.length || 0} HS
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KHỐI 2: TÍNH NĂNG BẢO MẬT & XEM LỜI GIẢI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" /> Cấu hình giám sát thi & Xem lời giải ôn luyện
            </h3>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-950 block">Cho học sinh xem đáp án & Lời giải chi tiết sau khi nộp:</span>
                <span className="text-[11px] text-blue-800">Học sinh nộp bài xong sẽ xem được ngay đáp án đúng và hướng dẫn giải từng câu</span>
              </div>
              <input
                type="checkbox"
                checked={showSolutionAfterSubmit}
                onChange={(e) => setShowSolutionAfterSubmit(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Giám sát thoát màn hình tự động:</span>
                <span className="text-[11px] text-slate-500">Cảnh báo và ghi nhận số lần học sinh chuyển tab / rời khỏi trang thi</span>
              </div>
              <input
                type="checkbox"
                checked={enableMonitoring}
                onChange={(e) => setEnableMonitoring(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Mật khẩu đề thi (Tùy chọn):
              </label>
              <input
                type="text"
                value={examPassword}
                onChange={(e) => setExamPassword(e.target.value)}
                placeholder="Để trống nếu không cần mật khẩu..."
                className="w-full sm:w-64 p-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* LINK SAU KHI XUẤT BẢN */}
          {generatedLink && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ĐÃ XUẤT BẢN THÀNH CÔNG! LINK BÀI THI CỦA HỌC SINH:
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Đã sao chép!' : 'Sao chép link'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-slate-700 select-all"
              />
            </div>
          )}
        </div>

        {/* FOOTER NÚT HÀNH ĐỘNG */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handlePublishAssignment}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Xuất bản & Lấy link bài làm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
