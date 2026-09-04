import React, { useState } from 'react';
import { TestConfig, GeneratedTest } from './types';
import { generateTest } from './testGenerator';
import { MatrixTable } from './MatrixTable';
import { QuestionBankManager } from './QuestionBankManager';
import { AssistantChat } from './AssistantChat';
import { BookOpen, FileText, Database, Sparkles, Sliders } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'matrix' | 'bank' | 'assistant'>('generator');
  const [currentTest, setCurrentTest] = useState<GeneratedTest | null>(null);

  const handleGenerateTest = (config: TestConfig) => {
    const test = generateTest(config);
    setCurrentTest(test);
    setActiveTab('matrix');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-inner">
              𝚺
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">TOÁN THPT - GDPT 2018</h1>
              <p className="text-xs text-slate-400">Hệ thống Quản lý Ngân hàng Đề & Ma Trận Chuẩn</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Đề thi
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              Ma trận & Bản đặc tả
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'bank'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              Ngân hàng đề
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Trợ lý AI
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'generator' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Trình Tạo Đề Kiểm Tra & Ma Trận</h2>
            <p className="text-slate-600 mb-6 text-sm">
              Hệ thống hỗ trợ biên soạn đề kiểm tra toán học theo cấu trúc chuẩn của Bộ GD&ĐT (GDPT 2018).
            </p>
            <button
              onClick={() => {
                const sampleConfig = { grade: '12', title: 'ĐỀ KIỂM TRA MÔN TOÁN 12', durationMinutes: 45 };
                handleGenerateTest(sampleConfig as any);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Tạo Đề Kiểm Tra Mẫu Nhanh
            </button>
          </div>
        )}

        {activeTab === 'matrix' && (
          currentTest ? (
            <MatrixTable test={currentTest} onBack={() => setActiveTab('generator')} />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-xl mx-auto mt-12">
              <p className="text-slate-600 mb-4">Chưa có dữ liệu đề thi hoặc ma trận được tạo.</p>
              <button
                onClick={() => setActiveTab('generator')}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Tạo đề ngay
              </button>
            </div>
          )
        )}

        {activeTab === 'bank' && <QuestionBankManager />}

        {activeTab === 'assistant' && <AssistantChat />}
      </main>
    </div>
  );
}

export default App;
