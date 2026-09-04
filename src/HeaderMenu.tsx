import React from 'react';
import {
  Sparkles,
  Upload,
  UserCheck,
  FolderArchive,
  Download,
  FileText,
  Layers,
  Table,
  Users,
  Send,
  BookOpen,
} from 'lucide-react';

export type ActiveTabType = 'home' | 'create' | 'upload' | 'assign' | 'classes' | 'generator' | 'slides' | 'matrix' | 'bank';

export interface HeaderMenuProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onExportWord?: () => void;
  questionCount: number;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  activeTab,
  setActiveTab,
  onExportWord,
  questionCount,
}) => {
  return (
    <aside className="w-64 sm:w-72 bg-slate-900 text-white min-h-screen h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 p-4 shrink-0 shadow-2xl overflow-y-auto font-sans">
      <div className="space-y-4">
        {/* Tiêu đề Bảng điều khiển */}
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> BẢNG ĐIỀU KHIỂN
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full font-bold border border-blue-500/30">
            GDPT 2018
          </span>
        </div>

        {/* DANH SÁCH MENU DỌC TRANG CHỦ */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Chức năng chính
          </span>

          {/* 1. TẠO ĐỀ MỚI */}
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>✨ Tạo đề mới (Ma trận)</span>
          </button>

          {/* 2. TẢI LÊN ĐỀ WORD */}
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'upload'
                ? 'bg-cyan-700 text-white shadow-lg ring-2 ring-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-200'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>📥 Tải lên đề Word</span>
          </button>

          {/* 3. GIAO BÀI CHO HỌC SINH */}
          <button
            type="button"
            onClick={() => setActiveTab('assign')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'assign'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>📲 Giao bài (Tạo link HS)</span>
          </button>

          {/* 4. QUẢN LÝ LỚP HỌC */}
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'classes'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>👥 Quản lý Lớp học</span>
          </button>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 pt-2">
            Xem và Khai thác đề thi
          </span>

          {/* 5. XEM ĐỀ THI HIỆN TẠI */}
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            <span>📄 Xem đề thi ({questionCount} câu)</span>
          </button>

          {/* 6. TRÌNH CHIẾU SLIDE */}
          <button
            type="button"
            onClick={() => setActiveTab('slides')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'slides'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span>📽️ Trình chiếu Slide</span>
          </button>

          {/* 7. MA TRẬN & BẢN ĐẶC TẢ */}
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4 text-amber-400 shrink-0" />
            <span>📊 Ma trận & Bản đặc tả</span>
          </button>

          {/* 8. KHO LƯU TRỮ ĐỀ */}
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'bank'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-orange-400 shrink-0" />
            <span>🗄️ Kho lưu trữ đề</span>
          </button>

          {/* 9. XUẤT FILE WORD */}
          {onExportWord && (
            <button
              type="button"
              onClick={onExportWord}
              className="w-full px-3.5 py-2.5 rounded-xl font-bold bg-blue-900/90 hover:bg-blue-800 text-blue-100 flex items-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm text-left border border-blue-700/60 mt-2"
            >
              <Download className="w-4 h-4 text-blue-300 shrink-0" />
              <span>💾 Xuất đề ra Word (.docx)</span>
            </button>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center space-y-0.5">
        <p className="font-bold text-slate-300">THPT MAI THANH THẾ</p>
        <p className="text-[10px] text-slate-500">Năm học 2026 - 2027</p>
      </div>
    </aside>
  );
};

export default HeaderMenu;
