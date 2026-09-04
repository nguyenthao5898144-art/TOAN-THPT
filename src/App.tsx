import React, { useState } from 'react';
import { GeneratedTest, Question, TestConfig } from './types';
import { createDefaultTest } from './testGenerator';
import { QuestionList } from './QuestionList';
import { SlideViewer } from './SlideViewer';
import { MatrixTable } from './MatrixTable';
import { TestBankModal } from './TestBankModal';
import { EditorModal } from './EditorModal';
import { FileUploadModal } from './FileUploadModal';
import { QuestionGeneratorModal } from './QuestionGeneratorModal';
import { AssistantChat } from './AssistantChat';
import { AssignmentModal } from './19';
import { StudentPortal } from './14';
import { ClassManager } from './18';
import { QuestionBankManager } from './QuestionBankManager';
import { exportTestToWord } from './wordExporter';
import { saveTestToBank } from './testBankStorage';
import {
  Home, FileText, FolderArchive, BookOpen, Layers,
  Table, Sparkles, Send, Download, ArrowLeft,
  Bookmark, Landmark, Layers as StackIcon, RefreshCw
} from 'lucide-react';

export type ActiveTabType = 'home' | 'create' | 'upload' | 'assign' | 'classes' | 'generator' | 'slides' | 'matrix' | 'bank' | 'question-bank';

export default function App() {
  const isStudentMode = new URLSearchParams(window.location.search).get('mode') === 'student';

  const [currentTest, setCurrentTest] = useState<GeneratedTest>(() => {
    const defaultCfg = {
      title: 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018',
      grade: '12',
      durationMinutes: 45,
      selectedTopicIds: [],
      selectedLessonIds: [],
      selectedOutcomes: [],
      topics: [],
      questionCountByType: { multipleChoice: 12, trueFalse: 4, shortAnswer: 6 },
    };
    try {
      return createDefaultTest(defaultCfg as any);
    } catch {
      return {
        id: `test_${Date.now()}`,
        title: defaultCfg.title,
        config: defaultCfg,
        questions: [],
        createdAt: new Date().toISOString(),
      } as any;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTabType>('home');
  const [tabHistory, setTabHistory] = useState<ActiveTabType[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleNavigate = (newTab: ActiveTabType) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTab(prevTab);
    } else {
      setActiveTab('home');
    }
  };

  if (isStudentMode) {
    return (
      <StudentPortal
        testConfig={currentTest.config}
        assignmentTitle={currentTest.title}
      />
    );
  }

  const handleSaveQuestion = (updated: Question) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleExportWord = () => {
    exportTestToWord(currentTest);
  };

  const handleQuickSaveToBank = () => {
    try {
      saveTestToBank(currentTest);
      alert('Đã lưu đề thi vào Kho lưu trữ thành công!');
    } catch (err) {
      console.error(err);
    }
  };

  // TẠO ĐỀ BẰNG AI GEMINI ĐỒNG BỘ ĐÚNG MA TRẬN
  const handleGenerateExamWithAI = async (overrideConfig?: TestConfig) => {
    const targetConfig = overrideConfig || currentTest.config;
    setIsGenerating(true);
    let newTest: GeneratedTest | null = null;

    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: targetConfig }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length >= 6) {
          newTest = {
            id: `test_ai_${Date.now()}`,
            title: data.title || targetConfig.title,
            config: targetConfig,
            questions: data.questions,
            createdAt: new Date().toISOString(),
          } as any;
        }
      }
    } catch (err) {
      console.warn('Lỗi AI, chuyển sang chế độ chuẩn:', err);
    }

    if (!newTest) {
      newTest = createDefaultTest(targetConfig);
    }

    setCurrentTest(newTest);
    setIsGenerating(false);
    handleNavigate('generator');
  };

  const isAtHome = activeTab === 'home';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      {/* CỘT ICON SIDEBAR */}
      <aside className="w-16 bg-blue-900 text-white min-h-screen h-screen sticky top-0 flex flex-col items-center justify-between py-5 shrink-0 shadow-lg z-30">
        <div className="flex flex-col items-center space-y-6 w-full">
          <div
            onClick={() => handleNavigate('home')}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-black text-xs cursor-pointer shadow"
            title="Màn hình chính"
          >
            THPT
          </div>

          <div className="flex flex-col items-center space-y-3 w-full">
            <button type="button" onClick={() => handleNavigate('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Màn hình chính"><Home className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('assign')} className={`p-3 rounded-2xl transition-all ${activeTab === 'assign' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Bài tập"><FileText className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('create')} className={`p-3 rounded-2xl transition-all ${activeTab === 'create' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Tạo đề mới"><Sparkles className="w-5 h-5 text-amber-300" /></button>
            <button type="button" onClick={() => handleNavigate('classes')} className={`p-3 rounded-2xl transition-all ${activeTab === 'classes' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Quản lý lớp"><StackIcon className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('bank')} className={`p-3 rounded-2xl transition-all ${activeTab === 'bank' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Kho nội dung"><BookOpen className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('matrix')} className={`p-3 rounded-2xl transition-all ${activeTab === 'matrix' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Ma trận & Bản đặc tả"><Table className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('question-bank')} className={`p-3 rounded-2xl transition-all ${activeTab === 'question-bank' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Ngân hàng câu hỏi"><Landmark className="w-5 h-5" /></button>
            <button type="button" onClick={() => handleNavigate('slides')} className={`p-3 rounded-2xl transition-all ${activeTab === 'slides' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`} title="Trình chiếu Slide"><Bookmark className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="text-[10px] text-blue-300 font-mono">2026</div>
      </aside>

      {/* VÙNG NỘI DUNG */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="w-36">
            {!isAtHome && (
              <button
                type="button"
                onClick={handleGoBack}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-wide">TOÁN THPT</h1>
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold border border-blue-200">GDPT 2018</span>
          </div>

          <div className="flex items-center space-x-2.5 text-right">
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-xs block leading-tight">Thầy Nguyễn Quốc Tâm</span>
              <span className="text-[10px] text-slate-500">THPT Mai Thanh Thế</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">QT</div>
          </div>
        </header>

        {isGenerating && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            <span>AI Gemini đang biên soạn đề thi chuẩn ma trận GDPT 2018 (kèm Bảng biến thiên & Bảng xét dấu)...</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TRANG CHỦ */}
          {isAtHome && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 px-1">Quản lý học tập</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div onClick={() => handleNavigate('assign')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileText className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Bài tập</span>
                  </div>
                  <div onClick={() => handleNavigate('create')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Sparkles className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Đề thi</span>
                  </div>
                  <div onClick={() => handleNavigate('classes')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><StackIcon className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Quản lý lớp</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 px-1">Nội dung & Công cụ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div onClick={() => handleNavigate('bank')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Kho nội dung</span>
                  </div>
                  {/* THẺ MA TRẬN & BẢN ĐẶC TẢ */}
                  <div onClick={() => handleNavigate('matrix')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Table className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Ma trận & Bản đặc tả</span>
                  </div>
                  <div onClick={() => handleNavigate('slides')} className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Bookmark className="w-7 h-7" /></div>
                    <span className="font-bold text-sm text-slate-800">Khóa học / Slide</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CÁC MÀN HÌNH CHỨC NĂNG */}
          {activeTab === 'create' && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-5xl mx-auto">
              <QuestionGeneratorModal
                config={currentTest.config}
                setConfig={(newConfig) => {
                  if (typeof newConfig === 'function') {
                    setCurrentTest((prev) => ({ ...prev, config: newConfig(prev.config) }));
                  } else {
                    setCurrentTest((prev) => ({ ...prev, config: newConfig }));
                  }
                }}
                onGenerate={handleGenerateExamWithAI}
                isGenerating={isGenerating}
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-4xl mx-auto">
              <FileUploadModal isOpen={true} onClose={handleGoBack} onImportQuestions={(imported) => { setCurrentTest((prev) => ({ ...prev, questions: imported })); handleNavigate('generator'); }} />
            </div>
          )}

          {activeTab === 'assign' && <AssignmentModal isOpen={true} onClose={handleGoBack} currentConfig={currentTest.config} />}
          {activeTab === 'classes' && <ClassManager />}

          {/* XEM ĐỀ THI HIỆN TẠI */}
          {activeTab === 'generator' && (
            <QuestionList
              test={currentTest}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveToBank={handleQuickSaveToBank}
              onOpenBank={() => handleNavigate('bank')}
            />
          )}

          {/* TRÌNH CHIẾU SLIDE */}
          {activeTab === 'slides' && <SlideViewer test={currentTest} />}

          {/* MA TRẬN & BẢN ĐẶC TẢ ĐỒNG BỘ 100% VỚI ĐỀ THI */}
          {activeTab === 'matrix' && <MatrixTable test={currentTest} />}

          {/* NGÂN HÀNG CÂU HỎI */}
          {activeTab === 'question-bank' && <QuestionBankManager />}

          {/* KHO LƯU TRỮ ĐỀ */}
          {activeTab === 'bank' && <TestBankModal isOpen={true} onClose={handleGoBack} onSelectTest={(t) => { setCurrentTest(t); handleNavigate('generator'); }} />}
        </main>
      </div>

      <AssistantChat />

      {editingQuestion && (
        <EditorModal
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
