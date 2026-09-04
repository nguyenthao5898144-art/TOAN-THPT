import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './types';
import { Bot, Send, X, Minimize2, GripVertical, RefreshCw } from 'lucide-react';

export const AssistantChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMini, setIsMini] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Xin chào Thầy! Em là Trợ lý AI Toán THPT. Thầy cần hỗ trợ soạn đề thi hay giải toán không ạ?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 200 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight - 80 : 500,
  }));

  const [isDrag, setIsDrag] = useState<boolean>(false);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0, moved: false });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const startDrag = (cx: number, cy: number) => {
    setIsDrag(true);
    dragRef.current = { startX: cx, startY: cy, initX: pos.x, initY: pos.y, moved: false };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDrag) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      const nx = Math.max(10, Math.min(window.innerWidth - 160, dragRef.current.initX + dx));
      const ny = Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initY + dy));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setIsDrag(false);
    if (isDrag) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDrag]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    const uMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((p) => [...p, uMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      setMessages((p) => [...p, { id: `b_${Date.now()}`, sender: 'assistant', text: data.text || 'Đã xử lý xong.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setMessages((p) => [...p, { id: `b_${Date.now()}`, sender: 'assistant', text: 'Em đã tiếp nhận yêu cầu từ Thầy.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div style={{ position: 'fixed', left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 50 }}>
          {isMini ? (
            <div
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onClick={() => { if (!dragRef.current.moved) { setIsMini(false); setIsOpen(true); } }}
              className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl cursor-move border-2 border-white relative transition-transform hover:scale-105"
              title="Kéo di chuyển • Nhấp để mở"
            >
              <Bot className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
          ) : (
            <div
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1 pl-2.5 pr-2 rounded-full shadow-2xl border border-white/30 cursor-move"
              title="Kéo di chuyển"
            >
              <GripVertical className="w-3.5 h-3.5 text-white/70 mr-1 shrink-0" />
              <div onClick={() => { if (!dragRef.current.moved) setIsOpen(true); }} className="flex items-center gap-1.5 cursor-pointer py-1 pr-1.5">
                <Bot className="w-4 h-4" />
                <span className="text-xs font-black tracking-wide">Trợ lý AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setIsMini(true); }} className="p-1 hover:bg-white/20 rounded-full text-white/80" title="Thu nhỏ">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[90vw] sm:w-[380px] h-[500px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in fade-in">
          <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-bold text-xs leading-tight flex items-center gap-1">Trợ lý AI <span className="w-2 h-2 bg-emerald-400 rounded-full"></span></h4>
                <p className="text-[10px] text-blue-100">Gemini 2.5 Flash</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setIsOpen(false); setIsMini(true); }} className="p-1 hover:bg-white/20 rounded-lg text-white" title="Thu nhỏ"><Minimize2 className="w-4 h-4" /></button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg text-white" title="Đóng"><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border shadow-sm'}`}>
                  {m.text}
                  <span className={`block text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{m.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[11px] text-slate-400 p-2 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> AI đang trả lời...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2.5 bg-white border-t flex gap-1.5">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Nhập câu hỏi cho AI..." className="flex-1 p-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantChat;
