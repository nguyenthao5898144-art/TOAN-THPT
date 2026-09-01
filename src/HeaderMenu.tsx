import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  UserCheck,
  FolderArchive,
  Pin,
  PinOff,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Download,
  FileText,
  Layers,
  Table,
} from 'lucide-react';

export interface HeaderMenuProps {
  activeTab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank';
  setActiveTab: (tab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank') => void;
  onExportWord?: () => void;
  onGenerateNew?: () => void;
  onOpenUpload: () => void;
  onOpenAssign?: () => void;
  onQuickSaveToBank?: () => void;
  isGenerating?: boolean;
  questionCount: number;
  savedCount?: number;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  activeTab,
  setActiveTab,
  onExportWord,
  onGenerateNew,
  onOpenUpload,
  onOpenAssign,
  isGenerating = false,
  questionCount,
}) => {
  const [isFloating, setIsFloating] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('header_menu_is_floating');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('header_menu_is_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('header_menu_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return {
      x: typeof window !== 'undefined' ? Math.max(16, (window.innerWidth - 760) / 2) : 50,
      y: 16,
    };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  useEffect(() => {
    try {
      localStorage.setItem('header_menu_is_floating', JSON.stringify(isFloating));
      localStorage.setItem('header_menu_is_collapsed', JSON.stringify(isCollapsed));
      if (isFloating) {
        localStorage.setItem('header_menu_position', JSON.stringify(position));
      }
    } catch {}
  }, [isFloating, isCollapsed, position]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isFloating) return;
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [isFloating, position]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleResetPosition = () => {
    setPosition({
      x: typeof window !== 'undefined' ? Math.max(16, (window.innerWidth - 760) / 2) : 50,
      y: 16,
    });
  };

  return (
    <div
      style={
        isFloating
          ? {
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 40,
            }
          : {}
      }
      className={
        isFloating
          ? 'shadow-2xl rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md text-white p-2.5 max-w-4xl w-[94vw] sm:w-auto'
          : 'bg-slate-900 border-b border-slate-800 text-white p-3 shadow-md'
      }
    >
      <div className="flex flex-col space-y-2">
        {/* HÀNG 1: LOGO VÀ CÁC NÚT LỆNH CHÍNH */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            {isFloating && (
              <button
                onMouseDown={handleMouseDown}
                className="p-1 text-slate-400 hover:text-white cursor-move"
                title="Giữ chuột để kéo di chuyển menu"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}

            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shadow-md">
              THPT
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-black text-sm tracking-wide text-white">TOÁN THPT</h1>
                <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded font-bold border border-blue-400/30">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Tác giả: NGUYỄN QUỐC TÂM • THPT MAI THANH THẾ
              </p>
            </div>
          </div>

          {/* CÁC NÚT BẤM CHỨC NĂNG */}
          {!isCollapsed && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* NÚT 1: TẠO ĐỀ MỚI */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('generator');
                  if (onGenerateNew) onGenerateNew();
                }}
                className={
                  activeTab === 'generator'
                    ? 'px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white ring-2 ring-blue-300 flex items-center space-x-1.5 cursor-pointer shadow-sm'
                    : 'px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center space-x-1.5 cursor-pointer'
                }
                title="Tạo đề thi mới theo ma trận"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span> TẠO ĐỀ MỚI</span>
              </button>

              {/* NÚT 2: TẢI LÊN FILE WORD */}
              <button
                type="button"
                onClick={onOpenUpload}
                className="px-3 py-1.5 rounded-lg font-bold bg-cyan-700 text-cyan-100 hover:bg-cyan-600 flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="Tải lên file câu hỏi Word"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-300" />
                <span> Tải lên</span>
              </button>

              {/* NÚT 3: KHO ĐỀ ĐÃ LƯU */}
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                className={
                  activeTab === 'bank'
                    ? 'px-3 py-1.5 rounded-lg font-bold bg-amber-600 text-white ring-2 ring-amber-300 flex items-center space-x-1.5 cursor-pointer shadow-sm'
                    : 'px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center space-x-1.5 cursor-pointer'
                }
                title="Kho lưu trữ các đề thi đã tạo"
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
                <span> Kho đề đã lưu</span>
              </button>

              {/* NÚT 4: GIAO BÀI CHO HỌC SINH (LẤY LINK) */}
              <button
                type="button"
                onClick={onOpenAssign}
                className="px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm ring-1 ring-emerald-300"
                title="Tạo link và giao bài cho học sinh"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span> Giao bài học sinh</span>
              </button>

              {/* NÚT XUẤT WORD */}
              {onExportWord && (
                <button
                  type="button"
                  onClick={onExportWord}
                  className="px-3 py-1.5 rounded-lg font-bold bg-blue-800 hover:bg-blue-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  title="Xuất đề thi ra file Word (.docx)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-200" />
                  <span>Xuất Word</span>
                </button>
              )}
            </div>
          )}

          {/* CÔNG CỤ GHIM / THU GỌN */}
          <div className="flex items-center space-x-1 text-slate-400">
            <button
              type="button"
              onClick={() => setIsFloating(!isFloating)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFloating ? 'Ghim cố định lên đầu trang' : 'Bật chế độ menu nổi'}
            >
              {isFloating ? <Pin className="w-3.5 h-3.5 text-blue-400" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>

            {isFloating && (
              <button
                type="button"
                onClick={handleResetPosition}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Đặt lại vị trí"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* HÀNG 2: CÁC TAB CHỨC NĂNG */}
        {!isCollapsed && (
          <div className="flex items-center space-x-1.5 border-t border-slate-800/80 pt-2 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={
                activeTab === 'generator'
                  ? 'px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white flex items-center space-x-1.5'
                  : 'px-3 py-1.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-1.5'
              }
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Đề thi ({questionCount} câu)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slides')}
              className={
                activeTab === 'slides'
                  ? 'px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white flex items-center space-x-1.5'
                  : 'px-3 py-1.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-1.5'
              }
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Trình chiếu Slide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={
                activeTab === 'matrix'
                  ? 'px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white flex items-center space-x-1.5'
                  : 'px-3 py-1.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-1.5'
              }
            >
              <Table className="w-3.5 h-3.5" />
              <span>Ma trận & Bản đặc tả</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={
                activeTab === 'bank'
                  ? 'px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white flex items-center space-x-1.5'
                  : 'px-3 py-1.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-1.5'
              }
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Kho lưu trữ đề</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderMenu;
