import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
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
  Bookmark, Landmark, Layers as StackIcon
} from 'lucide-react';

export type ActiveTabType = 'home' | 'create' | 'upload' | 'assign' | 'classes' | 'generator' | 'slides' | 'matrix' | 'bank';

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
      questionCountByType: {
        multipleChoice: 12,
        trueFalse: 4,
        shortAnswer: 6,
      },
    };
    try {
      return createDefaultTest(defaultCfg as any);
    } catch (e) {
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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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

  const isAtHome = activeTab === 'home';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      {/* 1. THANH ICON BÊN TRÁI SIÊU GỌN */}
      <aside className="w-16 bg-blue-900 text-white min-h-screen h-screen sticky top-0 flex flex-col items-center justify-between py-5 shrink-0 shadow-lg z-30">
        <div className="flex flex-col items-center space-y-6 w-full">
          <div
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-black text-xs cursor-pointer shadow transition-all"
            title="Màn hình chính"
          >
            THPT
          </div>

          <div className="flex flex-col items-center space-y-3 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'home' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Màn hình chính"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'assign' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Bài tập"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'create' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Đề thi"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'classes' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Quản lý lớp"
            >
              <StackIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'bank' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Kho nội dung"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'matrix' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Ngân hàng câu hỏi"
            >
              <Landmark className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slides')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'slides' ? 'bg-white/20 text-white shadow' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Khóa học / Slide"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-[10px] text-blue-300 font-mono">2026</div>
      </aside>

      {/* 2. VÙNG HIỂN THỊ CHÍNH */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="w-36">
            {!isAtHome && (
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200"
              >
                <ArrowLeft className="w-4 h-4" /> Màn hình chính
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-wide">
              TOÁN THPT
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold border border-blue-200">
              GDPT 2018
            </span>
          </div>

          <div className="flex items-center space-x-2.5 text-right">
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-xs block leading-tight">Thầy Nguyễn Quốc Tâm</span>
              <span className="text-[10px] text-slate-500">THPT Mai Thanh Thế</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
              QT
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* MÀN HÌNH CHÍNH (ĐÚNG 100% THEO MẪU ẢNH) */}
          {isAtHome && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* NHÓM 1: QUẢN LÝ HỌC TẬP (3 THẺ LỚN) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 px-1">
                  Quản lý học tập
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div
                    onClick={() => setActiveTab('assign')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Bài tập</span>
                  </div>

                  <div
                    onClick={() => setActiveTab('create')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderArchive className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Đề thi</span>
                  </div>

                  <div
                    onClick={() => setActiveTab('classes')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <StackIcon className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Quản lý lớp</span>
                  </div>
                </div>
              </div>

              {/* NHÓM 2: NỘI DUNG & CÔNG CỤ (3 THẺ LỚN) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 px-1">
                  Nội dung & Công cụ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div
                    onClick={() => setActiveTab('bank')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Kho nội dung</span>
                  </div>

                  {/* THẺ NGÂN HÀNG CÂU HỎI -> MỞ QUESTIONBANKMANAGER */}
                  <div
                    onClick={() => setActiveTab('matrix')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Landmark className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Ngân hàng câu hỏi</span>
                  </div>

                  <div
                    onClick={() => setActiveTab('slides')}
                    className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[150px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/90 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bookmark className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Khóa học</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GIAO DIỆN TẠO ĐỀ MỚI THEO MA TRẬN */}
          {activeTab === 'create' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto">
              <QuestionGeneratorModal
                config={currentTest.config}
                setConfig={(newConfig) => {
                  if (typeof newConfig === 'function') {
                    setCurrentTest((prev) => ({ ...prev, config: newConfig(prev.config) }));
                  } else {
                    setCurrentTest((prev) => ({ ...prev, config: newConfig }));
                  }
                }}
                onGenerate={(overrideConfig) => {
                  const targetConfig = overrideConfig || currentTest.config;
                  try {
                    const newTest = createDefaultTest(targetConfig);
                    setCurrentTest(newTest);
                    setActiveTab('generator');
                  } catch (err) {
                    console.error('Lỗi tạo đề:', err);
                  }
                }}
                isGenerating={isGenerating}
              />
            </div>
          )}

          {/* GIAO DIỆN TẢI LÊN ĐỀ WORD */}
          {activeTab === 'upload' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
              <FileUploadModal
                isOpen={true}
                onClose={() => setActiveTab('home')}
                onImportQuestions={(importedQuestions, appendMode) => {
                  setCurrentTest((prev) => ({
                    ...prev,
                    questions: appendMode ? [...prev.questions, ...importedQuestions] : importedQuestions,
                  }));
                  setActiveTab('generator');
                }}
              />
            </div>
          )}

          {/* GIAO DIỆN BÀI TẬP & GIAO BÀI */}
          {activeTab === 'assign' && (
            <AssignmentModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              currentConfig={currentTest.config}
            />
          )}

          {/* GIAO DIỆN QUẢN LÝ LỚP HỌC */}
          {activeTab === 'classes' && <ClassManager />}

          {/* GIAO DIỆN XEM ĐỀ THI HIỆN TẠI */}
          {activeTab === 'generator' && (
            <QuestionList
              test={currentTest}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveToBank={handleQuickSaveToBank}
              onOpenBank={() => setActiveTab('bank')}
            />
          )}

          {/* GIAO DIỆN TRÌNH CHIẾU SLIDE */}
          {activeTab === 'slides' && <SlideViewer test={currentTest} />}

          {/* GIAO DIỆN NGÂN HÀNG CÂU HỎI (CHUẨN ẢNH 129 & 130) */}
          {activeTab === 'matrix' && <QuestionBankManager />}

          {/* GIAO DIỆN KHO NỘI DUNG / LƯU TRỮ ĐỀ */}
          {activeTab === 'bank' && (
            <TestBankModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              onSelectTest={(test) => {
                setCurrentTest(test);
                setActiveTab('generator');
              }}
            />
          )}
        </main>
      </div>

      {/* Trợ lý AI Gemini */}
      <AssistantChat
        currentTest={currentTest}
        onGenerateCommand={(prompt) => {
          console.log('AI Prompt:', prompt);
        }}
        isGenerating={isGenerating}
      />

      {/* Modal Sửa câu hỏi */}
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
