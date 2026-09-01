import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  UserCheck,
  FolderArchive,
  Move,
  Pin,
  PinOff,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Send,
  FileText,
  Layers,
  Table,
  Award,
  Download,
  RefreshCw,
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
  onQuickSaveToBank,
  isGenerating = false,
  questionCount,
  savedCount = 0,
}) => {
  // Trạng thái ghim nổi (Floating) hoặc ghim cố định trên đầu trang
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

  // Tọa độ vị trí nổi
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

  const menuRef = useRef<HTMLDivElement>(null);

  // Lưu trạng thái cài đặt vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('header_menu_is_floating', JSON.stringify(isFloating));
    } catch {}
  }, [isFloating]);

  useEffect(() => {
    try {
      localStorage.setItem('header_menu_is_collapsed', JSON.stringify(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  useEffect(() => {
    if (isFloating) {
      try {
        localStorage.setItem('header_menu_position', JSON.stringify(position));
      } catch {}
    }
  }, [position, isFloating]);

  // Xử lý kéo thả vị trí nổi
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
      ref={menuRef}
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
      className={`transition-all ${
        isFloating
          ? 'shadow-2xl rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md text-white p-2.5 max-w-4xl w-[94vw] sm:w-auto'
          : 'bg-slate-900 border-b border-slate-800 text-white p-3 shadow-md'
      }`}
    >
      <div className="flex flex-col space-y-2">
        {/* HÀNG 1: THƯƠNG HIỆU & NÚT ĐIỀU HƯỚNG CỐT LÕI */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Tên phần mềm */}
          <div className="flex items-center space-x-2.5">
            {isFloating && (
              <button
                onMouseDown={handleMouseDown}
                className="p-1 text-slate-400 hover:text-white cursor-move"
                title="Giữ chuột để di chuyển menu nổi"
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

          {/* Các nút lệnh quan trọng: Tạo đề, Tải lên, Kho đề, Giao bài */}
          {!isCollapsed && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* NÚT 1: TẠO ĐỀ MỚI */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('generator');
                  onGenerateNew && onGenerateNew();
                }}
                id="btn_menu_generate"
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shadow-sm ${
                  activeTab === 'generator'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Tạo đề thi mới theo ma trận đặc tả"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span> TẠO ĐỀ MỚI</span>
              </button>

              {/* NÚT 2: TẢI LÊN FILE WORD */}
              <button
                type="button"
                onClick={onOpenUpload}
                id="btn_menu_upload"
                className="px-3 py-1.5 rounded-lg font-bold bg-cyan-700 text-cyan-100 hover:bg-cyan-600 transition-all flex items-center space-x-1.5 whitespace-nowrap shadow-sm cursor-pointer"
                title="Tải lên file câu hỏi (.docx, .doc, .txt)"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-300" />
                <span> Tải lên</span>
              </button>

              {/* NÚT 3: KHO ĐỀ ĐÃ LƯU */}
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                id="btn_menu_bank"
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shadow-sm ${
                  activeTab === 'bank'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                    : 'bg-slate-800 text-slate-2
