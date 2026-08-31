import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, GeneratedTest } from '../types';
import { MessageSquare, Send, Bot, User, Sparkles, X, Minimize2, Maximize2, RefreshCw, GripVertical, Move } from 'lucide-react';

interface AssistantChatProps {
  currentTest: GeneratedTest;
  onGenerateCommand: (prompt: string) => void;
  isGenerating: boolean;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  currentTest,
  onGenerateCommand,
  isGenerating,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'assistant',
      text: 'Xin chào Thầy/Cô! Tôi là Trợ lý Khảo sát Trí tuệ Nhân tạo Môn Toán 12 (CT 2018). Thầy/Cô có thể yêu cầu tôi tạo câu hỏi mới hoặc điều chỉnh ma trận đề thi bất cứ lúc nào!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Position coordinates for draggable chat
  const [chatPosition, setChatPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('assistant_chat_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return {
      x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 440) : 100,
      y: typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 520) : 100,
    };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('assistant_chat_position', JSON.stringify(chatPosition));
    } catch {}
  }, [chatPosition]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: chatPosition.x,
      posY: chatPosition.y,
    };
    setIsDragging(true);
  }, [chatPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
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

      const w = chatContainerRef.current?.offsetWidth || 380;
      const h = chatContainerRef.current?.offsetHeight || 480;

      const maxX = Math.max(10, window.innerWidth - w - 10);
      const maxY = Math.max(10, window.innerHeight - h - 10);

      const nextX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
      const nextY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

      setChatPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
        const deltaY = e.touches[0].clientY - dragStartRef.current.startY;

        const w = chatContainerRef.current?.offsetWidth || 380;
        const h = chatContainerRef.current?.offsetHeight || 480;

        const maxX = Math.max(10, window.innerWidth - w - 10);
        const maxY = Math.max(10, window.innerHeight - h - 10);

        const nextX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
        const nextY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

        setChatPosition({ x: nextX, y: nextY });
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

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Check if user prompt is a command to generate/renew questions
    const isCreationCommand =
      userMsgText.toLowerCase().includes('tạo') ||
      userMsgText.toLowerCase().includes('làm mới') ||
      userMsgText.toLowerCase().includes('cập nhật') ||
      userMsgText.toLowerCase().includes('đề mới');

    if (isCreationCommand) {
      const botMsg: ChatMessage = {
        id: `msg_gen_${Date.now()}`,
        sender: 'assistant',
        text: 'Đang tiến hành giải phóng câu hỏi cũ và khởi tạo bộ câu hỏi + ma trận mới hoàn toàn theo yêu cầu của Thầy/Cô...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      onGenerateCommand(userMsgText);
      return;
    }

    // Call server AI chat endpoint
    try {
      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText, currentTest }),
      });
      const data = await res.json();

      const botReplyMsg: ChatMessage = {
        id: `msg_res_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Dạ tôi đã ghi nhận yêu cầu của Thầy/Cô.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReplyMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Đã có lỗi xảy ra khi trao đổi với AI. Thầy/Cô có thể thử lại bằng các nút lệnh nhanh phía trên.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const presetPrompts = [
    'Tạo mới hoàn toàn đề 15 phút bài Tính đơn điệu hàm số',
    'Tạo đề 45 phút chương Oxyz gồm 6 câu MCQ và 2 câu Đúng/Sai',
    'Cập nhật lại toàn bộ ma trận và câu hỏi mức độ Vận dụng',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-2xl flex items-center space-x-2 transition-all transform hover:scale-105 ring-4 ring-blue-400/30 cursor-pointer"
        >
          <Bot className="w-5 h-5 text-blue-200" />
          <span className="font-bold text-xs sm:text-sm">Trợ lý AI Toán 12</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Floating Draggable Chat Drawer */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          style={{
            position: 'fixed',
            left: `${chatPosition.x}px`,
            top: `${chatPosition.y}px`,
            zIndex: 90,
          }}
          className={`w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] transition-shadow ${
            isDragging ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''
          }`}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 flex items-center justify-between border-b border-slate-700 cursor-grab active:cursor-grabbing select-none"
            title="Kéo thả thanh tiêu đề để di chuyển cửa sổ trợ lý"
          >
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-slate-400">
                <GripVertical className="w-4 h-4 text-blue-400" />
              </div>
              <div className="p-1 bg-blue-600 rounded-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs">TRỢ LÝ KHẢO SÁT TOÁN 12</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  ● Trực tuyến (Gemini AI)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Badges */}
          <div className="p-2 bg-slate-50 border-b border-slate-200 flex space-x-1.5 overflow-x-auto text-[10px]">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-full text-blue-700 hover:bg-blue-50 font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    AI
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu lệnh tạo mới hoặc tư vấn ma trận..."
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={isGenerating || !inputText.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

