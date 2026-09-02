import React, { useState, useMemo } from 'react';
import { TestConfig } from './types';
import { getStoredClasses, getStudentSubmissions, ClassRoom, StudentSubmission } from './classStorage';
import {
  Send, Clock, Calendar, Check, Copy, Link as LinkIcon, X,
  Shield, Lock, Award, Users, Search, Download, Trash2,
  Settings, BarChart2, Trophy, RotateCcw, QrCode, FileSpreadsheet, Share2, ArrowLeft,
  FileText
} from 'lucide-react';

interface AssignmentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentConfig?: TestConfig;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen = true,
  onClose,
  currentConfig,
}) => {
  const classes: ClassRoom[] = getStoredClasses();
  const defaultClass = classes.find((c) => c.name === '12A6') || classes[0] || {
    id: 'c_12a6',
    name: '12A6',
    students: [
      { id: 'hs_1', name: 'Châu Ngô Nhật Ái', code: '67339301', phone: '0901234567' },
      { id: 'hs_2', name: 'Lê Thị Yến Duy', code: '67339302', phone: '0901234568' },
      { id: 'hs_3', name: 'Lê Vũ Đạt', code: '67339303', phone: '0901234569' },
      { id: 'hs_4', name: 'Trần Thành Đạt', code: '67339304', phone: '0901234570' },
      { id: 'hs_5', name: 'Sử Lưu Phước Hậu', code: '67339305', phone: '0901234571' },
      { id: 'hs_6', name: 'Trần Chấn Hiệp', code: '67339306', phone: '0901234572' },
    ],
  };

  const [selectedClass, setSelectedClass] = useState<ClassRoom>(defaultClass);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<'tracking' | 'settings' | 'stats' | 'ranking'>('tracking');

  const submissions: StudentSubmission[] = getStudentSubmissions();

  const studentList = useMemo(() => {
    return (selectedClass.students || []).filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.phone && s.phone.includes(searchTerm))
    );
  }, [selectedClass, searchTerm]);

  const submittedCount = (selectedClass.students || []).filter((s) =>
    submissions.some((sub) => sub.studentId === s.id || sub.studentName?.toLowerCase() === s.name.toLowerCase())
  ).length;

  const totalStudents = selectedClass.students?.length || 38;
  const studentLink = `${window.location.origin}/?mode=student`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'HS';
  };

  return (
    <div className="font-sans max-w-7xl mx-auto p-3 sm:p-6 text-slate-800 space-y-4">
      {onClose && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <FileText className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BÀI TẬP</span>
                <h2 className="text-base font-black text-slate-900 leading-snug">
                  {currentConfig?.title || 'THƯỜNG XUYÊN - CẢI THIỆN ĐIỂM'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Đã sao chép link!' : 'Copy link bài thi'}</span>
              </button>
              <button
                type="button"
                onClick={() => alert(`Link học sinh: ${studentLink}`)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl"
                title="Mã QR bài thi"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Ngày tạo: <strong>{new Date().toLocaleDateString('vi-VN')}</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span>Thời gian giao đề:</span>
                <p className="font-bold text-rose-600 font-mono text-[11px]">
                  {new Date().toLocaleDateString('vi-VN')} 15:00 ➔ 23:59
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Người tạo: <strong className="text-slate-900">Nguyễn Thảo</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-400" />
              <span>Số lượt làm: <strong>{submittedCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Khối học: <strong>Khối 12 - Toán</strong></span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ link đề thi
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1">
              Menu quản lý bài thi
            </span>
            <button
              type="button"
              onClick={() => setActiveMenu('tracking')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeMenu === 'tracking' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" /> Danh sách đã thi ({submittedCount}/{totalStudents})
            </button>
            <button
              type="button"
              onClick={() => setActiveMenu('stats')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeMenu === 'stats' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-blue-500" /> Thống kê & Phổ điểm
            </button>
            <button
              type="button"
              onClick={() => setActiveMenu('ranking')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeMenu === 'ranking' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" /> Bảng xếp hạng học sinh
            </button>
            <button
              type="button"
              onClick={() => alert('Đã kích hoạt tính năng chấm lại toàn bộ bài thi theo đáp án mới!')}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-emerald-600" /> Chấm lại điểm
            </button>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs font-black text-slate-900">
              Danh sách đã thi ({submittedCount}/{totalStudents})
            </span>
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo Tên | SĐT | SBD..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
            <div className="flex items-center gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    cls.id === selectedClass.id
                      ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {cls.name} ({submittedCount}/{cls.students?.length || 38})
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Lấy link làm bài
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3 min-w-[200px]">Họ và tên</th>
                  <th className="p-3 text-center w-32">Thời gian làm bài</th>
                  <th className="p-3 text-center w-32">Thời gian nộp bài</th>
                  <th className="p-3 text-center w-28">Kết quả / Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentList.map((st, idx) => {
                  const studentSub = submissions.find(
                    (s) => s.studentId === st.id || s.studentName?.toLowerCase() === st.name.toLowerCase()
                  );

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                            {getInitials(st.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{st.name}</span>
                            <span className={`text-[10px] font-semibold ${studentSub ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {studentSub ? 'Đã hoàn thành' : 'Chưa thi'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">{studentSub ? '15 phút' : '---'}</td>
                      <td className="p-3 text-center font-mono text-slate-500 text-[11px]">{studentSub?.submittedAt || '---'}</td>
                      <td className="p-3 text-center">
                        {studentSub ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-xs">
                            {studentSub.score} / 10
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[11px]">Chưa thi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
