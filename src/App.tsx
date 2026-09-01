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
import { Send, Sparkles, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      {/* Thanh Menu điều hướng phía trên */}
      <HeaderMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionCount={currentTest.questions.length}
        onExportWord={handleExportWord}
        onGenerateNew={() => setIsGenModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAssign={() => setIsAssignModalOpen(true)}
        onQuickSaveToBank={handleQuickSaveToBank}
        isGenerating={isGenerating}
      />

      {/* Nút hành động nhanh dưới Header */}
      {activeTab !== 'classes' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-emerald-300"
            >
              <Send className="w-4 h-4" /> 📲 GIAO BÀI CHO HỌC SINH (TẠO LINK)
            </button>

            <button
              type="button"
              onClick={() => setIsGenModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> TẠO ĐỀ THEO MA TRẬN
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Đề hiện tại: <strong className="text-slate-800">{currentTest.title}</strong> ({currentTest.questions.length} câu)
          </div>
        </div>
      )}

      {/* Vùng hiển thị nội dung chính theo Tab */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'generator' && (
          <QuestionList
            test={currentTest}
            onEditQuestion={(q) => setEditingQuestion(q)}
            onDeleteQuestion={handleDeleteQuestion}
            onSaveToBank={handleQuickSaveToBank}
            onOpenBank={() => setActiveTab('bank')}
          />
        )}

        {activeTab === 'slides' && (
          <SlideViewer test={currentTest} />
        )}

        {activeTab === 'matrix' && (
          <MatrixTable test={currentTest} />
        )}

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

        {/* TAB HIỂN THỊ QUẢN LÝ LỚP HỌC */}
        {activeTab === 'classes' && (
          <ClassManager />
        )}
      </main>

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
