import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Table as TableIcon } from 'lucide-react';

export const AssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    { role: 'ai', text: 'Chào thầy! Tôi là trợ lý AI chuyên hỗ trợ biên soạn đề thi, ma trận và ngân hàng câu hỏi toán học GDPT 2018. Thầy cần tôi giúp gì nào?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `Tôi đã ghi nhận yêu cầu: "${userMsg}". Hệ thống ma trận và ngân hàng đề đang hoạt động ổn định, thầy có thể tiếp tục tạo đề hoặc xuất file Word bất cứ lúc nào!` }
      ]);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px]">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h2 className="font-bold text-base">Trợ Lý AI Toán Học</h2>
          <p className="text-xs text-slate-400">Hỗ trợ chuyên sâu chương trình GDPT 2018</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-amber-300'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập nội dung trao đổi với trợ lý AI..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800"
        />
        <button
          onClick={handleSend}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Gửi
        </button>
      </div>
    </div>
  );
};

export default AssistantChat;
