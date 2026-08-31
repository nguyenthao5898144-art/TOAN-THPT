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
} from 'lucide-react';

interface HeaderMenuProps {
  activeTab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank';
  setActiveTab: (tab: 'generator' | 'slides' | 'editor' | 'matrix' | 'bank') => void;
  onExportWord?: () => void;
  onGenerateNew?: () => void;
  onOpenUpload: () => void;
  onQuickSaveToBank?: () => void;
  isGenerating?: boolean;
  questionCount: number;
  savedCount?: number;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  activeTab,
  setActiveTab,
  onGenerateNew,
  onOpenUpload,
  onQuickSaveToBank,
  isGenerating,
  questionCount,
  savedCount = 0,
}) => {
  // Floating state: pinned to top vs freely movable floating menu
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

  // Coordinates for floating position
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
    // Default floating position: centered horizontally near top
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

  // Save state preferences
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

  // Keep floating position bounded on resize
  useEffect(() => {
    const handleResize = () => {
      if (!isFloating || !menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      const maxX = Math.max(10, window.innerWidth - rect.width - 10);
      const maxY = Math.max(10, window.innerHeight - rect.height - 10);

      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), maxX),
        y: Math.min(Math.max(10, prev.y), maxY),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFloating]);

  // Mouse & Touch Drag Handlers
  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!isFloating) {
        // Automatically switch to floating mode when user starts dragging
        setIsFloating(true);
        if (menuRef.current) {
          const rect = menuRef.current.getBoundingClientRect();
          setPosition({ x: rect.left, y: rect.top });
          dragStartRef.current = {
            startX: clientX,
            startY: clientY,
            posX: rect.left,
            posY: rect.top,
          };
        }
      } else {
        dragStartRef.current = {
          startX: clientX,
          startY: clientY,
          posX: position.x,
          posY: position.y,
        };
      }
      setIsDragging(true);
    },
    [isFloating, position]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag if left button clicked
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const menuWidth = menuRef.current?.offsetWidth || 600;
      const menuHeight = menuRef.current?.offsetHeight || 60;

      const maxX = Math.max(10, window.innerWidth - menuWidth - 10);
      const maxY = Math.max(10, window.innerHeight - menuHeight - 10);

      const nextX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
      const nextY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
        const deltaY = e.touches[0].clientY - dragStartRef.current.startY;

        const menuWidth = menuRef.current?.offsetWidth || 600;
        const menuHeight = menuRef.current?.offsetHeight || 60;

        const maxX = Math.max(10, window.innerWidth - menuWidth - 10);
        const maxY = Math.max(10, window.innerHeight - menuHeight - 10);

        const nextX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
        const nextY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

        setPosition({ x: nextX, y: nextY });
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleResetPosition = () => {
    if (typeof window !== 'undefined') {
      const menuWidth = menuRef.current?.offsetWidth || 760;
      setPosition({
        x: Math.max(16, (window.innerWidth - menuWidth) / 2),
        y: 20,
      });
    }
  };

  const handleToggleFloating = () => {
    if (!isFloating) {
      if (typeof window !== 'undefined') {
        const menuWidth = menuRef.current?.offsetWidth || 760;
        setPosition({
          x: Math.max(16, (window.innerWidth - menuWidth) / 2),
          y: 20,
        });
      }
      setIsFloating(true);
    } else {
      setIsFloating(false);
    }
  };

  return (
    <>
      {/* Ghost spacer when floating to avoid page layout jumps */}
      {!isFloating && <div className="h-0" />}

      <header
        ref={menuRef}
        style={
          isFloating
            ? {
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 100,
                touchAction: 'none',
              }
            : undefined
        }
        className={`transition-shadow ${
          isFloating
            ? `shadow-2xl rounded-2xl border border-blue-500/40 bg-slate-900/95 backdrop-blur-md text-slate-100 ring-2 ${
                isDragging ? 'ring-blue-400 scale-[1.01] opacity-95 cursor-grabbing' : 'ring-slate-700/60'
              }`
            : 'sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Drag Handle & Brand Identity */}
          <div className="flex items-center space-x-2">
            {/* Drag Grip Handle */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="flex items-center justify-center p-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-600 hover:text-white text-slate-400 cursor-grab active:cursor-grabbing transition-colors group"
              title="Kéo giữ để di chuyển thanh menu đến bất kỳ vị trí nào"
            >
              <GripVertical className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-400 group-hover:text-white" />
              <Move className="w-3 h-3 -ml-1 text-slate-500 group-hover:text-blue-200" />
            </div>

            {/* Brand Logo & Title */}
            <div
              onMouseDown={isFloating ? handleMouseDown : undefined}
              onTouchStart={isFloating ? handleTouchStart : undefined}
              className={`flex items-center space-x-2.5 ${isFloating ? 'cursor-grab active:cursor-grabbing select-none' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                12
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight tracking-wide">
                    TOÁN 12
                  </h1>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/80">
                    GDPT 2018
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-400 inline" />
                      Tác giả: NGUYỄN QUỐC TÂM
                    </span>
                    <span className="text-slate-600 hidden md:inline">•</span>
                    <span className="hidden md:inline">THPT MAI THANH THẾ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Control Navigation Bar */}
          {!isCollapsed && (
            <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1 text-xs">
              {/* [1] TẠO ĐỀ MỚI */}
              <button
                onClick={() => setActiveTab('generator')}
                id="btn_menu_kt"
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>[1] TẠO ĐỀ MỚI</span>
              </button>

              {/* [2] Tải lên */}
              <button
                onClick={onOpenUpload}
                id="btn_menu_upload"
                className="px-2.5 py-1.5 rounded-md font-medium bg-cyan-700 text-cyan-100 hover:bg-cyan-600 transition-all flex items-center space-x-1.5 whitespace-nowrap shadow-sm cursor-pointer"
                title="Tải lên file câu hỏi (.doc, .docx, .pdf, .txt, .json)"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-300" />
                <span>[2] Tải lên</span>
              </button>

              {/* [3] KHO ĐỀ ĐÃ LƯU (NGÂN HÀNG ĐỀ) */}
              <button
                onClick={() => setActiveTab('bank')}
                id="btn_menu_bank"
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'bank'
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Ngân hàng lưu trữ các đề thi đã tạo (tên file Khối-Lớp-Chủ đề)"
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
                <span>[3] Kho đề đã lưu</span>
                {savedCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full ml-0.5">
                    {savedCount}
                  </span>
                )}
              </button>
            </nav>
          )}

          {/* Action Tools & Drag Mode Settings */}
          <div className="flex items-center space-x-1.5">
            {/* Menu Move / Pin Mode Controls */}
            <div className="flex items-center space-x-1">
              {/* Toggle Floating vs Docked Mode */}
              <button
                onClick={handleToggleFloating}
                className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  isFloating
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm ring-1 ring-blue-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={
                  isFloating
                    ? 'Đang ở chế độ NỔI DI CHUYỂN TÙY Ý. Nhấn để ghim cố định lại đầu trang'
                    : 'Nhấn để chuyển sang CHẾ ĐỘ NỔI DI CHUYỂN TÙY Ý trên màn hình'
                }
              >
                {isFloating ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline text-[11px]">
                  {isFloating ? 'Đang nổi' : 'Di chuyển'}
                </span>
              </button>

              {/* Reset Floating Position */}
              {isFloating && (
                <button
                  onClick={handleResetPosition}
                  className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  title="Đặt lại vị trí menu về vị trí giữa phía trên"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Minimize / Expand Toggle */}
              {isFloating && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  title={isCollapsed ? 'Mở rộng thanh menu đầy đủ' : 'Thu gọn thanh menu'}
                >
                  {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

