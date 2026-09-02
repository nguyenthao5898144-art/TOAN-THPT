import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { createDefaultTest } from './testGenerator';
import { HeaderMenu, ActiveTabType } from './HeaderMenu';
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

  // Tab đang hoạt động mặc định: 'generator' (Xem đề thi)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('generator');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Nếu là chế độ học sinh làm bài
  if (isStudentMode) {
    return (
      <StudentPortal
        testConfig={currentTest.config}
        assignmentTitle={currentTest.title}
      />
    );
  }

  // Cập nhật câu hỏi khi sửa
  const handleSaveQuestion = (updated: Question) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
    setEditingQuestion(null);
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (id: string) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  // Xuất file Word
  const handleExportWord = () => {
    exportTestToWord(currentTest);
  };

  // Lưu vào kho
  const handleQuickSaveToBank = () => {
    saveTestToBank(currentTest);
    alert('Đã lưu đề thi vào Kho Lưu Trữ thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex">
      {/* 1. CỘT MENU DỌC CỐ ĐỊNH BÊN TRÁI (TẤT CẢ CHỨC NĂNG NẰM Ở ĐÂY) */}
      <HeaderMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionCount={currentTest.questions.length}
        onExportWord={handleExportWord}
      />

      {/* 2. VÙNG HIỂN THỊ DUY NHẤT NỘI DUNG THEO MENU ĐƯỢC CHỌN */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* HEADER CHÍNH CANH GIỮA TRANG WEB */}
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
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Tác giả: <strong className="text-white">NGUYỄN QUỐC TÂM</strong> • THPT MAI THANH THẾ
            </p>
          </div>
        </header>

        {/* NỘI DUNG ĐỘC LẬP CHÍNH XÁC THEO TAB ĐƯỢC CHỌN */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* 1. MÀN HÌNH TẠO ĐỀ MỚI THEO MA TRẬN */}
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
                    setActiveTab('generator'); // Tự động chuyển sang xem đề sau khi tạo
                  } catch (err) {
                    console.error('Lỗi tạo đề:', err);
                  }
                }}
                isGenerating={isGenerating}
              />
            </div>
          )}

          {/* 2. MÀN HÌNH TẢI LÊN ĐỀ WORD */}
          {activeTab === 'upload' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
              <FileUploadModal
                isOpen={true}
                onClose={() => setActiveTab('generator')}
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

          {/* 3. MÀN HÌNH GIAO BÀI CHO HỌC SINH */}
          {activeTab === 'assign' && (
            <AssignmentModal
              isOpen={true}
              onClose={() => setActiveTab('generator')}
              currentConfig={currentTest.config}
            />
          )}

          {/* 4. MÀN HÌNH QUẢN LÝ LỚP HỌC */}
          {activeTab === 'classes' && <ClassManager />}

          {/* 5. MÀN HÌNH XEM ĐỀ THI */}
          {activeTab === 'generator' && (
            <QuestionList
              test={currentTest}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveToBank={handleQuickSaveToBank}
              onOpenBank={() => setActiveTab('bank')}
            />
          )}

          {/* 6. MÀN HÌNH TRÌNH CHIẾU SLIDE */}
          {activeTab === 'slides' && <SlideViewer test={currentTest} />}

          {/* 7. MÀN HÌNH MA TRẬN & BẢN ĐẶC TẢ */}
          {activeTab === 'matrix' && <MatrixTable test={currentTest} />}

          {/* 8. MÀN HÌNH KHO LƯU TRỮ ĐỀ */}
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
      </div>

      {/* Trợ lý AI Gemini */}
      <AssistantChat
        currentTest={currentTest}
        onGenerateCommand={(prompt) => {
          console.log('AI Prompt:', prompt);
        }}
        isGenerating={isGenerating}
      />

      {/* Modal Chỉnh sửa chi tiết 1 câu hỏi khi bấm nút Sửa */}
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
