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
import { exportTestToWord } from './wordExporter';
import { saveTestToBank } from './testBankStorage';

export default function App() {
  // 1. Tự động nhận diện nếu link mở ở chế độ học sinh làm bài
  const isStudentMode = new URLSearchParams(window.location.search).get('mode') === 'student';

  // 2. Cấu hình & Đề thi mặc định ban đầu
  const [currentTest, setCurrentTest] = useState<GeneratedTest>(() => {
    const defaultCfg = {
      title: 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018',
      grade: '12',
      durationMinutes: 45,
      selectedTopicIds: [],
      selectedLessonIds: [],
      selectedOutcomes: [],
      topics: [],
    };
    try {
      return createDefaultTest(defaultCfg as any);
    } catch (e) {
      console.warn('Fallback test init:', e);
      return {
        id: `test_${Date.now()}`,
        title: defaultCfg.title,
        config: defaultCfg,
        questions: [],
        createdAt: new Date().toISOString(),
      } as any;
    }
  });

  const [activeTab, setActiveTab] = useState<'generator' | 'slides' | 'editor' | 'matrix' | 'bank'>('generator');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Trạng thái mở các Modal chức năng
  const [isGenModalOpen, setIsGenModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Nếu là chế độ học sinh -> Hiển thị cổng làm bài trực tuyến
  if (isStudentMode) {
    return (
      <StudentPortal
        testConfig={currentTest.config}
        assignmentTitle={currentTest.title}
      />
    );
  }

  // Xử lý lưu câu hỏi sau khi chỉnh sửa
  const handleSaveQuestion = (updated: Question) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
    setEditingQuestion(null);
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = (id: string) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  // Xuất đề thi ra file Word (.docx)
  const handleExportWord = () => {
    exportTestToWord(currentTest);
  };

  // Lưu nhanh đề thi vào Kho dữ liệu
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
        onQuickSaveToBank={handleQuickSaveToBank}
        isGenerating={isGenerating}
      />

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
      </main>

      {/* Trợ lý AI Gemini hỗ trợ soạn đề (Góc phải dưới) */}
      <AssistantChat
        currentTest={currentTest}
        onGenerateCommand={(prompt) => {
          console.log('AI Prompt:', prompt);
        }}
        isGenerating={isGenerating}
      />

      {/* CỬA SỔ NỔI (MODAL POPUP) TẠO ĐỀ THI BẬT LÊN TRÊN CÙNG */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 relative p-4 sm:p-6">
            {/* Nút Đóng góc trên bên phải */}
            <button
              type="button"
              onClick={() => setIsGenModalOpen(false)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer z-20 shadow-sm"
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

      {/* Modal Giao bài kiểm tra cho học sinh */}
      {isAssignModalOpen && (
        <AssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          currentConfig={currentTest.config}
        />
      )}
    </div>
  );
}
