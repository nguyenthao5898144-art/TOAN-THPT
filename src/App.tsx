import React, { useState } from 'react';
import { GeneratedTest, Question, TestConfig } from './types';
import { createDefaultTest } from './testGenerator';
import { HeaderMenu } from './HeaderMenu';
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
import { exportTestToWord } from './wordExporter';
import { saveTestToBank } from './testBankStorage';

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

  const [activeTab, setActiveTab] = useState<'generator' | 'slides' | 'editor' | 'matrix' | 'bank' | 'classes'>('generator');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isGenModalOpen, setIsGenModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
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

  const handleQuickSaveToBank = () => {
    saveTestToBank(currentTest);
    alert('Đã lưu đề thi vào Kho Lưu Trữ thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex">
      {/* 1. CỘT MENU CHỨC NĂNG DỌC BÊN TRÁI */}
      <HeaderMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionCount={currentTest.questions.length}
        onExportWord={handleExportWord}
        onGenerateNew={() => setIsGenModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAssign={() => setIsAssignModalOpen(true)}
      />

      {/* 2. VÙNG NỘI DUNG BÊN PHẢI VỚI HEADER CANH GIỮA TRANG TRỌNG */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* HEADER CHÍNH NẰM TRÊN CÙNG VÀ CANH GIỮA */}
        <header className="bg-slate-900 text-white py-4 px-6 shadow-md border-b border-slate-800">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow">
                THPT
              </div>
              <h1 className="font-black text-xl sm:text-2xl text-white tracking-wide">
                TOÁN THPT
              </h1>
              <span className="px-2 py-0.5 bg-blue-500/25 text-blue-300 rounded-full font-bold text-xs border border-blue-400/30">
                GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Tác giả: <strong className="text-white">NGUYỄN QUỐC TÂM</strong> • THPT MAI THANH THẾ
            </p>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH CỦA TAB ĐƯỢC CHỌN */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'generator' && (
            <QuestionList
              test={currentTest}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveToBank={handleQuickSaveToBank}
              onOpenBank={() => setActiveTab('bank')}
            />
          )}

          {activeTab === 'slides' && <SlideViewer test={currentTest} />}
          {activeTab === 'matrix' && <MatrixTable test={currentTest} />}
          {activeTab === 'bank' && (
            <TestBankModal
              isOpen={true}
              onClose={() => setActiveTab('generator')}
              onSelectTest={(test) => {
                setCurrentTest(test);
                setActiveTab('generator');
              }}
            />
          )}
          {activeTab === 'classes' && <ClassManager />}
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

      {/* CỬA SỔ MODAL TẠO ĐỀ THI THEO MA TRẬN */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 relative p-4 sm:p-6">
            <button
              type="button"
              onClick={() => setIsGenModalOpen(false)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer z-50 shadow-sm"
              title="Đóng bảng tạo đề"
            >
              ✕ Đóng bảng
            </button>

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
                setIsGenModalOpen(false);
                const targetConfig = overrideConfig || currentTest.config;
                try {
                  const newTest = createDefaultTest(targetConfig);
                  setCurrentTest(newTest);
                } catch (err) {
                  console.error('Lỗi tạo đề:', err);
                }
              }}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      )}

      {/* CỬA SỔ GIAO BÀI CHO HỌC SINH */}
      {isAssignModalOpen && (
        <AssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          currentConfig={currentTest.config}
        />
      )}

      {/* Modal Chỉnh sửa chi tiết câu hỏi */}
      {editingQuestion && (
        <EditorModal
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Modal Tải file Word lên */}
      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onImportQuestions={(importedQuestions, appendMode) => {
            setIsUploadModalOpen(false);
            setCurrentTest((prev) => ({
              ...prev,
              questions: appendMode ? [...prev.questions, ...importedQuestions] : importedQuestions,
            }));
          }}
        />
      )}
    </div>
  );
}
