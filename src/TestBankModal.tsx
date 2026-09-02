import React, { useState } from 'react';
import { GeneratedTest } from './types';
import { StoredTestItem, getStoredTestBank, deleteStoredTest } from './testBankStorage';
import { exportTestToWord } from './wordExporter';
import {
  Search, Plus, FolderPlus, FileText, Download, Trash2, Folder,
  Database, ChevronRight, ChevronLeft, QrCode, Copy, Check, Calendar,
  Clock, Users, Award, Shield, Share2, BarChart2, Trophy, RotateCcw,
  CheckCircle2, XCircle, ArrowLeft, Printer, MessageSquare, MoreVertical,
  Scissors, Info, Settings, Edit3
} from 'lucide-react';

export interface TestBankModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTest?: (test: GeneratedTest) => void;
  onCreateNew?: () => void;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  onSelectTest,
  onCreateNew,
}) => {
  const [storedTests, setStoredTests] = useState<StoredTestItem[]>(() => {
    try {
      return getStoredTestBank();
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [folderPath, setFolderPath] = useState<string[]>(['KIỂM TRA 2025-2026', 'TOÁN 12']);

  // Menu chuột phải / 3 chấm của Thư mục (Ảnh 1) & Đề thi (Ảnh 2)
  const [activeFolderMenu, setActiveFolderMenu] = useState<string | null>(null);
  const [activeExamMenu, setActiveExamMenu] = useState<string | null>(null);

  // Màn hình Cấp 3, 4, 5
  const [selectedExamDetail, setSelectedExamDetail] = useState<any | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [isStatsViewOpen, setIsStatsViewOpen] = useState<boolean>(false);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('Bài làm rất tốt, lập luận chặt chẽ và tính toán chính xác!');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Cấu trúc cây thư mục
  const [folderTree, setFolderTree] = useState<Record<string, string[]>>({
    root: ['Kho đề Azota', 'TOÁN 12', 'TOÁN 10', 'KIỂM TRA 2025-2026', 'ÔN TẬP RÈN LUYỆN'],
    'KIỂM TRA 2025-2026': ['TOÁN 12', 'TOÁN 11', 'TOÁN 10'],
    'TOÁN 12': ['ÔN TẬP GK1', 'TX1', 'TX2', 'TX3', 'TX4', 'TX5', 'TX6'],
  });

  // Đề thi trong thư mục
  const [examList, setExamList] = useState<any[]>([
    {
      id: 'exam_1',
      name: 'THƯỜNG XUYÊN-CẢI THIỆN ĐIỂM',
      submissions: 0,
      status: 'Chưa xuất bản',
      targetClass: '12A6',
      assignedTime: '23/04/2026 15:00 -> 23/04/2026 15:10',
      createdAt: '23/04/2026 13:04',
      creator: 'Nguyễn Thảo',
      durationMinutes: 15,
      grade: 'Khối 12 - Toán',
    },
    {
      id: 'exam_2',
      name: 'TO12-THƯỜNG XUYÊN 8.3',
      submissions: 26,
      status: 'Đã xuất bản',
      targetClass: '12A6',
      assignedTime: '20/04/2026 15:30 -> 20/04/2026 15:40',
      createdAt: '20/04/2026 15:06',
      creator: 'Nguyễn Thảo',
      durationMinutes: 15,
      grade: 'Khối 12 - Toán',
    },
  ]);

  const studentResults = [
    { id: '1', name: 'Châu Ngô Nhật Ái', initials: 'CA', score: 9.5, duration: '9 phút 5 giây', submittedAt: '20/04/2026 15:40', sbd: '67339301' },
    { id: '2', name: 'Lê Thị Yến Duy', initials: 'LD', score: 9.5, duration: '9 phút 49 giây', submittedAt: '20/04/2026 15:42', sbd: '67339302' },
    { id: '3', name: 'Lê Vũ Đạt', initials: 'LD', score: 9.0, duration: '11 phút 56 giây', submittedAt: '20/04/2026 15:44', sbd: '67339303' },
    { id: '4', name: 'Trần Thành Đạt', initials: 'Đ', score: 9.5, duration: '3 phút 55 giây', submittedAt: '20/04/2026 15:35', sbd: '67339304' },
    { id: '5', name: 'Sử Lưu Phước Hậu', initials: 'SH', score: 9.0, duration: '3 phút 13 giây', submittedAt: '20/04/2026 15:34', sbd: '67339305' },
    { id: '6', name: 'Trần Chấn Hiệp', initials: 'TH', score: 8.5, duration: '8 phút 20 giây', submittedAt: '20/04/2026 15:39', sbd: '67339306' },
  ];

  const currentParentKey = folderPath.length === 0 ? 'root' : folderPath[folderPath.length - 1];
  const currentSubFolders = folderTree[currentParentKey] || [];

  const handleOpenFolder = (folderName: string) => {
    setFolderPath([...folderPath, folderName]);
    setActiveFolderMenu(null);
    setActiveExamMenu(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) setFolderPath([]);
    else setFolderPath(folderPath.slice(0, index + 1));
    setActiveFolderMenu(null);
    setActiveExamMenu(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?mode=student`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Đóng toàn bộ menu popup khi click ra ngoài
  const handleCloseMenus = () => {
    setActiveFolderMenu(null);
    setActiveExamMenu(null);
  };

  // ==========================================================
  // CẤP 5: PHÂN TÍCH PHỔ ĐIỂM
  // ==========================================================
  if (isStatsViewOpen) {
    return (
      <div className="font-sans max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <button
            type="button"
            onClick={() => setIsStatsViewOpen(false)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại Bảng điểm (Cấp 3)
          </button>
          <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            CẤP 5: PHỔ ĐIỂM & PHÂN TÍCH CHẤT LƯỢNG BÀI THI
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Sĩ số tham gia</span>
            <span className="text-2xl font-black text-slate-900">26 / 38</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Đạt 68.4%</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Điểm trung bình lớp</span>
            <span className="text-2xl font-black text-blue-600">9.12</span>
            <span className="text-[10px] text-slate-400 block mt-1">Học lực Giỏi</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Điểm cao nhất</span>
            <span className="text-2xl font-black text-emerald-600">9.5</span>
            <span className="text-[10px] text-slate-400 block mt-1">3 học sinh đạt</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Thời gian làm TB</span>
            <span className="text-2xl font-black text-indigo-600">8.2 ph</span>
            <span className="text-[10px] text-slate-400 block mt-1">Hạn 15 phút</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 4: CHI TIẾT BÀI LÀM CỦA 1 HỌC SINH
  // ==========================================================
  if (selectedStudentDetail) {
    return (
      <div className="font-sans max-w-5xl mx-auto p-4 sm:p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <button
            type="button"
            onClick={() => setSelectedStudentDetail(null)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách học sinh (Cấp 3)
          </button>
          <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            CẤP 4: PHIẾU BÀI LÀM CHI TIẾT CỦA HỌC SINH
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
              {selectedStudentDetail.initials}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{selectedStudentDetail.name}</h2>
              <p className="text-xs text-slate-500">
                SBD: <strong>{selectedStudentDetail.sbd}</strong> • Lớp: <strong>12A6</strong> • Thời gian nộp: <strong>{selectedStudentDetail.submittedAt}</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-semibold">Điểm bài thi:</span>
            <span className="text-3xl font-black text-emerald-600">{selectedStudentDetail.score} / 10</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Lời phê của Thầy Nguyễn Quốc Tâm:
          </span>
          <textarea
            rows={2}
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 3: MÀN HÌNH BẢNG ĐIỂM HỌC SINH ĐÃ NỘP (ẢNH 3)
  // ==========================================================
  if (selectedExamDetail) {
    return (
      <div className="font-sans max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedExamDetail(null)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại thư mục {folderPath[folderPath.length - 1]}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="space-y-2 pb-3 border-b">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <h2 className="text-base font-black text-slate-900">{selectedExamDetail.name}</h2>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-blue-200"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Đã sao chép link!' : 'Copy link bài thi'}
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>📅 Ngày tạo: <strong>{selectedExamDetail.createdAt}</strong></p>
              <p>⏰ Giao đề: <strong>{selectedExamDetail.assignedTime}</strong></p>
              <p>👤 Người tạo: <strong>{selectedExamDetail.creator}</strong></p>
              <p>✍️ Số lượt làm: <strong>{selectedExamDetail.submissions}</strong></p>
            </div>

            <div className="space-y-1 pt-2 border-t text-xs font-bold text-slate-700">
              <div
                onClick={() => setIsStatsViewOpen(true)}
                className="p-2 hover:bg-blue-50 rounded-xl flex items-center gap-2 cursor-pointer text-blue-700 font-black"
              >
                <BarChart2 className="w-4 h-4 text-blue-600" /> 📊 Xem Phổ điểm & Phân tích câu (Cấp 5)
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <span className="text-xs font-black">Danh sách đã thi ({selectedExamDetail.submissions}/38)</span>
              <button onClick={() => alert('Xuất bảng điểm Excel...')} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Xuất Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-bold text-slate-600 border-b text-[11px]">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Họ và tên (Bấm xem bài làm)</th>
                    <th className="p-3 text-center w-36">Thời gian làm bài</th>
                    <th className="p-3 text-center w-36">Thời gian nộp bài</th>
                    <th className="p-3 text-center w-28">Điểm số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentResults.map((st, i) => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudentDetail(st)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 text-center font-bold text-slate-500">{i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">{st.initials}</div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-blue-600">{st.name} ♂</span>
                            <span className="text-[10px] text-emerald-600 font-bold">Điểm: {st.score}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono">{st.duration}</td>
                      <td className="p-3 text-center font-mono text-[11px]">{st.submittedAt}</td>
                      <td className="p-3 text-center"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black">{st.score} / 10</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 1 & CẤP 2: CÂY THƯ MỤC & MENU 3 CHẤM (CHUẨN ẢNH 1 & ẢNH 2)
  // ==========================================================
  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800" onClick={handleCloseMenus}>
      {/* 1. THANH TÌM KIẾM & 3 NÚT LỆNH TRÊN CÙNG */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-200" /> Tạo đề từ ngân hàng chung
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi
          </button>
          <button
            type="button"
            onClick={() => alert('Tạo thư mục mới...')}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-300" /> Tạo thư mục
          </button>
        </div>
      </div>

      {/* 2. THANH BREADCRUMB */}
      <div className="flex items-center space-x-2 text-sm font-bold px-1">
        <button
          type="button"
          onClick={() => handleBreadcrumbClick(-1)}
          className={`cursor-pointer ${folderPath.length === 0 ? 'text-slate-900 font-black' : 'text-slate-500 hover:text-blue-600'}`}
        >
          Tất cả
        </button>
        {folderPath.map((folder, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(idx)}
              className={`cursor-pointer ${idx === folderPath.length - 1 ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-blue-600'}`}
            >
              {folder}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* 3. BẢNG DANH MỤC THƯ MỤC & ĐỀ THI KÈM MENU 3 CHẤM (CHUẨN ẢNH 1 & ẢNH 2) */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b">
              <tr>
                <th className="p-3.5 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                <th className="p-3.5">Tên</th>
                <th className="p-3.5 text-center w-28">Số bài đã nộp</th>
                <th className="p-3.5 text-center w-28">Trạng Thái</th>
                <th className="p-3.5 w-32">Đã Giao Cho</th>
                <th className="p-3.5 w-44">Thời gian giao đề</th>
                <th className="p-3.5 w-28">Thời gian tạo</th>
                <th className="p-3.5 text-center w-16">Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* CÁC HÀNG THƯ MỤC (TX1, TX2...) */}
              {currentSubFolders.map((fName, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleOpenFolder(fName)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group relative"
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                  <td className="p-3.5 flex items-center gap-3 font-bold text-slate-900 group-hover:text-blue-600">
                    <Folder className="w-5 h-5 text-slate-700 fill-slate-600 shrink-0 group-hover:text-blue-600" />
                    <span>{fName}</span>
                  </td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-500 font-mono">2026</td>
                  <td className="p-3.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveFolderMenu(activeFolderMenu === fName ? null : fName)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* MENU THƯ MỤC CHUẨN 100% ẢNH 126 */}
                    {activeFolderMenu === fName && (
                      <div className="absolute right-2 top-8 w-44 bg-white rounded-2xl shadow-2xl border p-1.5 z-40 text-xs font-bold text-slate-700 space-y-0.5 text-left">
                        <div onClick={() => { alert(`Chia sẻ thư mục ${fName}`); setActiveFolderMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Share2 className="w-4 h-4 text-slate-600" /> Chia sẻ
                        </div>
                        <div onClick={() => { alert(`Đổi tên thư mục ${fName}`); setActiveFolderMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer border-t">
                          <Edit3 className="w-4 h-4 text-slate-600" /> Sửa
                        </div>
                        <div onClick={() => { alert(`Sao chép thư mục ${fName}`); setActiveFolderMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Copy className="w-4 h-4 text-slate-600" /> Sao chép
                        </div>
                        <div onClick={() => { alert(`Di chuyển thư mục ${fName}`); setActiveFolderMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Scissors className="w-4 h-4 text-slate-600" /> Cut
                        </div>
                        <div onClick={() => { alert(`Xóa thư mục ${fName}`); setActiveFolderMenu(null); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2.5 cursor-pointer border-t">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* CÁC HÀNG ĐỀ THI */}
              {examList.map((exam) => (
                <tr
                  key={exam.id}
                  onClick={() => setSelectedExamDetail(exam)}
                  className="hover:bg-amber-50/40 transition-colors cursor-pointer relative"
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3 font-bold text-slate-900 hover:text-blue-600">
                      <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{exam.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{exam.submissions}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      exam.status === 'Đã xuất bản' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-semibold">{exam.targetClass}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{exam.assignedTime}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{exam.createdAt}</td>
                  <td className="p-3.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveExamMenu(activeExamMenu === exam.id ? null : exam.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* MENU ĐỀ THI CHUẨN 100% ẢNH 127 */}
                    {activeExamMenu === exam.id && (
                      <div className="absolute right-2 top-8 w-52 bg-white rounded-2xl shadow-2xl border p-1.5 z-40 text-xs font-bold text-slate-700 space-y-0.5 text-left">
                        <div onClick={() => setSelectedExamDetail(exam)} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Info className="w-4 h-4 text-blue-600" /> Xem nội dung đề
                        </div>
                        <div onClick={() => setSelectedExamDetail(exam)} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Users className="w-4 h-4 text-emerald-600" /> Danh sách đã làm
                        </div>
                        <div onClick={handleCopyLink} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Copy className="w-4 h-4 text-blue-600" /> Copy link
                        </div>
                        <div className="border-t my-1"></div>
                        <div onClick={() => { alert(`Chia sẻ đề ${exam.name}`); setActiveExamMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Share2 className="w-4 h-4 text-slate-600" /> Chia sẻ
                        </div>
                        <div onClick={() => { alert(`Cài đặt đề ${exam.name}`); setActiveExamMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Settings className="w-4 h-4 text-slate-600" /> Cài đặt
                        </div>
                        <div onClick={() => { setSelectedExamDetail(exam); setIsStatsViewOpen(true); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <BarChart2 className="w-4 h-4 text-blue-500" /> Thống kê & Phổ điểm
                        </div>
                        <div onClick={() => { alert(`Bảng xếp hạng đề ${exam.name}`); setActiveExamMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Trophy className="w-4 h-4 text-amber-500" /> Bảng xếp hạng
                        </div>
                        <div className="border-t my-1"></div>
                        <div onClick={() => { alert(`Sao chép đề ${exam.name}`); setActiveExamMenu(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Copy className="w-4 h-4 text-slate-600" /> Sao chép
                        </div>
                        <div onClick={() => { alert(`Xóa đề ${exam.name}`); setActiveExamMenu(null); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2.5 cursor-pointer">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestBankModal;
