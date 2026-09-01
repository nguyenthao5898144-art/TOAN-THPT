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

export interface HeaderMenuProps {
  activeTab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank' | 'classes';
  setActiveTab: (tab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank' | 'classes') => void;
  onExportWord?: () => void;
  onGenerateNew?: () => void;
  onOpenUpload: () => void;
  onOpenAssign?: () => void;
  questionCount: number;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  activeTab,
  setActiveTab,
  onExportWord,
  onGenerateNew,
  onOpenUpload,
  onOpenAssign,
  questionCount,
}) => {
  return (
    <aside className="w-64 sm:w-72 bg-slate-900 text-white min-h-screen h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 p-4 shrink-0 shadow-2xl overflow-y-auto font-sans">
      {/* KHỐI NÚT LỆNH DỌC BÊN TRÁI */}
      <div className="space-y-4">
        {/* Tiêu đề cột điều khiển */}
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> BẢNG ĐIỀU KHIỂN
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full font-bold border border-blue-500/30">
            GDPT 2018
          </span>
        </div>

        {/* DANH SÁCH MENU DỌC BÊN TRÁI TRANG CHỦ */}
        <div className="space-y-2">
          {/* 1. TẠO ĐỀ MỚI */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('generator');
              if (onGenerateNew) onGenerateNew();
            }}
            className="w-full px-3.5 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2.5 shadow-lg transition-all cursor-pointer text-xs sm:text-sm text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>✨ Tạo đề mới (Ma trận)</span>
          </button>

          {/* 2. TẢI LÊN FILE WORD */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full px-3.5 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-cyan-200 hover:text-white flex items-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm border border-slate-700 text-left"
          >
            <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>📥 Tải lên đề Word</span>
          </button>

          {/* 3. GIAO BÀI CHO HỌC SINH */}
          <button
            type="button"
            onClick={onOpenAssign}
            className="w-full px-3.5 py-2.5 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-600 text-emerald-100 flex items-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm shadow-md border border-emerald-600 text-left"
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
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>👥 Quản lý Lớp học</span>
          </button>

          {/* 5. KHO ĐỀ ĐÃ LƯU */}
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'bank'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-200 hover:text-white border border-slate-700'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🗄️ Kho lưu trữ đề</span>
          </button>

          {/* 6. MA TRẬN & BẢN ĐẶC TẢ */}
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Table className="w-4 h-4 text-blue-400 shrink-0" />
            <span>📊 Ma trận & Bản đặc tả</span>
          </button>

          {/* 7. TRÌNH CHIẾU SLIDE */}
          <button
            type="button"
            onClick={() => setActiveTab('slides')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer text-left ${
              activeTab === 'slides'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span>📽️ Trình chiếu Slide</span>
          </button>

          {/* 8. XUẤT FILE WORD */}
          {onExportWord && (
            <button
              type="button"
              onClick={onExportWord}
              className="w-full px-3.5 py-2.5 rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-blue-100 flex items-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm border border-blue-700 text-left"
            >
              <Download className="w-4 h-4 text-blue-300 shrink-0" />
              <span>💾 Xuất đề ra Word (.docx)</span>
            </button>
          )}
        </div>
      </div>

      {/* FOOTER CỘT MENU */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center space-y-0.5">
        <p className="font-bold text-slate-300">THPT MAI THANH THẾ</p>
        <p className="text-[10px] text-slate-500">Năm học 2026 - 2027</p>
      </div>
    </aside>
  );
};

export default HeaderMenu;
