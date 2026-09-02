import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, GeneratedTest } from './types';
import {
  MessageSquare, Send, Bot, Sparkles, X, Minimize2, Maximize2,
  RefreshCw, GripVertical, Move, ChevronDown
} from 'lucide-react';

export interface AssistantChatProps {
  currentTest?: GeneratedTest;
  onGenerateCommand?: (prompt: string) => void;
  isGenerating?: boolean;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  currentTest,
  onGenerateCommand,
  isGenerating = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false); // Thu nhỏ thành nút tròn
  const [isExpanded, setIsExpanded] = useState<boolean>(false);   // Phóng to khung chat
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'assistant',
      text: 'Xin chào Thầy/Cô! Tôi là Trợ lý AI môn Toán THPT. Thầy/Cô cần hỗ trợ tạo câu hỏi, giải chi tiết hay điều chỉnh ma trận đề thi không ạ?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // ==========================================
  // XỬ LÝ DI CHUYỂN KÉO THẢ TỰ DO TRÊN MÀN HÌNH
  // ==========================================
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 220, y: window.innerHeight - 80 };
    }
    return { x: 500, y: 500 };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    moved: false,
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Bắt đầu kéo chuột
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initX: position.x,
      initY: position.y,
      moved: false,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      const newX = Math.max(10, Math.min(window.innerWidth - 180, dragRef.current.initX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.initY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      const newX = Math.max(10, Math.min(window.innerWidth - 180, dragRef.current.initX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.initY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleStopDrag = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleStopDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleStopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopDrag);
    };
  }, [isDragging]);

  // Gửi tin nhắn đến AI Gemini
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'assistant',
          text: data.text || 'Tôi đã xử lý yêu cầu của Thầy/Cô.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_fallback_${Date.now()}`,
        sender: 'assistant',
        text: 'Em đã nhận lệnh từ Thầy/Cô và đang tự động chuẩn hóa câu hỏi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 1. NÚT TRỢ LÝ AI NỔI TỰ DO (KÉO THẢ DI CHUYỂN & THU NHỎ ĐƯỢC) */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 50,
          }}
          className="select-none"
        >
          {isMinimized ? (
            /* DẠNG THU NHỎ: NÚT TRÒN SIÊU GỌN W-12 H-12 */
            <div
              onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => e.touches[0] && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
              onClick={() => {
                if (!dragRef.current.moved) {
                  setIsMinimized(false);
                  setIsOpen(true);
                }
              }}
              className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl cursor-move border-2 border-white/40 group relative transition-transform hover:scale-105"
              title="Nhấn giữ để di chuyển • Nhấp để mở Trợ lý AI"
            >
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
          ) : (
            /* DẠNG ĐẦY ĐỦ: VIÊN THUỐC CÓ TÊN "TRỢ LÝ AI", NÚT THU NHỎ & ICON KÉO */
            <div
              onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => e.touches[0] && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
              className="flex items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-1 pl-3 pr-2 rounded-full shadow-2xl border border-white/30 cursor-move transition-all group"
              title="Nhấn giữ để di chuyển đến bất kỳ đâu trên màn hình"
            >
              {/* Tay cầm kéo di chuyển */}
              <GripVertical className="w-3.5 h-3.5 text-white/60 mr-1 shrink-0" />

              {/* Chữ bấm mở chat */}
              <div
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setIsOpen(true);
                  }
                }}
                className="flex items-center gap-2 cursor-pointer py-1.5 pr
