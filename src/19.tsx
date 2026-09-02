import React, { useState } from 'react';
import { TestConfig } from './types';
import { getStoredClasses, saveAssignment, Assignment, ClassRoom } from './classStorage';
import {
  Send, Clock, Calendar, CheckSquare, Square, Users, Check,
  Copy, Link as LinkIcon, X, Shield, Lock, Eye, AlertCircle,
  FileText, Sparkles, CheckCircle2
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
  const [title, setTitle] = useState<string>(currentConfig?.title || 'THƯỜNG XUYÊN - CẢI THIỆN ĐIỂM');
  const [grade, setGrade] = useState<string>(currentConfig?.grade || '12');
  const [purpose, setPurpose] = useState<string>('Kiểm tra định kỳ');
  const [durationMinutes, setDurationMinutes] = useState<number>(currentConfig?.durationMinutes || 15);

  // Thời gian mở & đóng đề
  const nowIso = new Date().toISOString().slice(0, 16);
  const futureIso = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [openAt, setOpenAt] = useState<string>(nowIso);
  const [closeAt, setCloseAt] = useState<string>(futureIso);

  // Đối tượng làm bài
  const [targetScope, setTargetScope] = useState<'all' | 'class' | 'student'>('class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(classes.map((c) => c.name));

  // 2. Bảo mật & Giám sát
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [examPassword, setExamPassword] = useState<string>('');
  const [enableMonitoring, setEnableMonitoring] = useState<boolean>(true);

  // 3. Đảo đề theo ma trận
  const [randomizeMatrix, setRandomizeMatrix] = useState<boolean>(true);

  // 4. Xem điểm & đáp án
  const [viewScoreMode, setViewScoreMode] = useState<'no' | 'after_submit' | 'after_all'>('after_submit');
  const [viewAnswersMode, setViewAnswersMode] = useState<'no' | 'after_submit' | 'after_all'>('no');

  // Link bài thi sau khi xuất bản
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const handleSelectAllClasses = () => {
    setSelectedClasses(classes.map((c) => c.name));
  };

  // Xuất bản đề thi & tạo link cho học sinh
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
      allowReviewSolution: viewAnswersMode === 'after_submit',
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
        {/* HEADER MODAL */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tên đề thi: <strong>{title}</strong>
            </span>
            <div className="flex items-center gap-2 mt-1">
              {/* 1 NÚT KIỂM TRA DUY NHẤT (ĐÃ GỘP) */}
              <div className="inline-flex items-center">
                <span className="px-4 py-1 bg-blue-600 text-white text-xs font-black rounded-lg shadow-sm tracking-wide uppercase">
                  KIỂM TRA
                </span>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                • Cấu hình dùng cho các kỳ thi nghiêm túc, bảo mật đề thi và đáp án
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* KHỐI 1: CẤU HÌNH CHUNG */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2">Cấu hình chung</h3>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Tên đề thi:</label>
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
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">Khối 12</option>
                  <option value="11">Khối 11</option>
                  <option value="10">Khối 10</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học:</label>
                <input
                  type="text"
                  readOnly
                  value="Toán học"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mục đích tạo đề:</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Kiểm tra định kỳ">Kiểm tra định kỳ (1 tiết / 45 phút)</option>
                <option value="Kiểm tra thường xuyên">Kiểm tra thường xuyên (15 phút)</option>
                <option value="Kiểm tra giữa kỳ">Kiểm tra giữa kỳ</option>
                <option value="Kiểm tra cuối kỳ">Kiểm tra cuối kỳ</option>
                <option value="Luyện thi tốt nghiệp">Luyện thi tốt nghiệp THPT</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Thời gian làm bài (phút):
              </label>
              <input
                type="number"
                min={0}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-32 p-2.5 border border-slate-300 rounded-xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1">Nhập 0 để không giới hạn thời gian</span>
            </div>

            {/* Thời gian giao đề */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Thời gian bắt đầu mở đề:
                </label>
                <input
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-600" /> Thời gian kết thúc (Hạn nộp):
                </label>
                <input
                  type="datetime-local"
                  value={closeAt}
                  onChange={(e) => setCloseAt(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Ai được phép làm */}
            <div className="border-t pt-3 space-y-3">
              <label className="block font-bold text-slate-800">Ai được phép làm bài:</label>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'all'}
                    onChange={() => setTargetScope('all')}
                  />
                  <span>Tất cả mọi người</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'class'}
                    onChange={() => setTargetScope('class')}
                  />
                  <span>Giao theo lớp</span>
                </label>
              </div>

              {/* Danh sách lớp học nhận bài */}
              {targetScope === 'class' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn lớp nhận bài ({selectedClasses.length}/{classes.length} lớp):
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllClasses}
                      className="text-blue-600 hover:underline text-[11px] font-bold"
                    >
                      Chọn tất cả lớp
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
              )}
            </div>
          </div>

          {/* KHỐI 2: BẢO MẬT & GIÁM SÁT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Bảo mật & Giám sát thi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượt làm bài tối đa:</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Nhập 0 để không giới hạn lượt thi</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" /> Mật khẩu đề thi (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={examPassword}
                  onChange={(e) => setExamPassword(e.target.value)}
                  placeholder="Để trống nếu không cần mật khẩu..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
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
          </div>

          {/* KHỐI 3: ĐẢO CÂU HỎI VÀ LẤY NGẪU NHIÊN THEO MA TRẬN */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2">Đảo câu hỏi và đáp án</h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Lấy ngẫu nhiên & đảo câu hỏi theo ma trận:</span>
                <span className="text-[11px] text-slate-500">Mỗi học sinh khi vào thi sẽ được sinh một mã đề riêng biệt</span>
              </div>
              <input
                type="checkbox"
                checked={randomizeMatrix}
                onChange={(e) => setRandomizeMatrix(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* KHỐI 4: ĐIỂM VÀ ĐÁP ÁN SAU KHI LÀM XONG */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2">Điểm và đáp án khi làm xong</h3>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Cho xem điểm:</label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewScore" checked={viewScoreMode === 'no'} onChange={() => setViewScoreMode('no')} />
                  <span>Không</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewScore" checked={viewScoreMode === 'after_submit'} onChange={() => setViewScoreMode('after_submit')} />
                  <span>Khi làm bài xong</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewScore" checked={viewScoreMode === 'after_all'} onChange={() => setViewScoreMode('after_all')} />
                  <span>Khi tất cả thi xong</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <label className="block font-bold text-slate-800">Cho xem đề thi và đáp án:</label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewAns" checked={viewAnswersMode === 'no'} onChange={() => setViewAnswersMode('no')} />
                  <span>Không</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewAns" checked={viewAnswersMode === 'after_submit'} onChange={() => setViewAnswersMode('after_submit')} />
                  <span>Khi làm bài xong</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="viewAns" checked={viewAnswersMode === 'after_all'} onChange={() => setViewAnswersMode('after_all')} />
                  <span>Khi tất cả thi xong</span>
                </label>
              </div>
            </div>
          </div>

          {/* KHỐI HIỂN THỊ LINK SAU KHI XUẤT BẢN */}
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
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
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
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-all cursor-pointer"
          >
            Lưu nháp
          </button>

          <button
            type="button"
            onClick={handlePublishAssignment}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Xuất bản & Lấy link
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
