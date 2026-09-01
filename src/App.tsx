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
  // 1. Tự động nhận diện chế độ học sinh làm bài (nếu mở link có ?mode=student)
  const isStudentMode = new URLSearchParams(window.location.search).get('mode') === 'student';

  // 2. Cấu hình & Đề thi mặc định ban đầu
  const [currentTest, setCurrentTest] = useState<GeneratedTest>(() => {
    return createDefaultTest({
      title: 'ĐỀ KHẢO SÁT & ĐÁNH GIÁ TOÁN THPT - GDPT 2018',
      grade: '12',
      durationMinutes: 90,
      topics: [],
    } as any);
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

  // Xuất đề thi ra file Word (.docx) chuẩn quy cách Bộ GD&ĐT
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

      {/* Trợ lý AI Gemini hỗ trợ soạn đề & giải đáp (Góc phải dưới) */}
      <AssistantChat
        currentTest={currentTest}
        onGenerateCommand={(prompt) => {
          console.log('AI Prompt:', prompt);
        }}
        isGenerating={isGenerating}
      />

      {/* Modal Soạn đề thi theo ma trận */}
      {isGenModalOpen && (
        <QuestionGeneratorModal
          config={currentTest.config}
          setConfig={(newConfig) => {
            if (typeof newConfig === 'function') {
              setCurrentTest((prev) => ({ ...prev, config: newConfig(prev.config) }));
            } else {
              setCurrentTest((prev) => ({ ...prev, config: newConfig }));
            }
          }}
          {/* Modal Soạn đề thi theo ma trận */}
      {isGenModalOpen && (
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
              console.error('Lỗi khi tạo đề:', err);
            }
          }}
          isGenerating={isGenerating}
        />
      )}

      {/* Modal Tải file Word lên để trích xuất câu hỏi */}
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

      {/* Modal Giao bài kiểm tra trực tuyến cho học sinh */}
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
