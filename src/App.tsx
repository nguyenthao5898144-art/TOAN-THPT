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
import { ArrowLeft, Menu, Sparkles, BookOpen, Users, Send, FileText, Layers, Table, FolderArchive } from 'lucide-react';

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

  // Mặc định ở Trang chủ ('home') có đầy đủ menu dọc bên trái
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

  const handleQuickSaveToBank = () => {
    saveTestToBank(currentTest);
    alert('Đã lưu đề thi vào Kho Lưu Trữ thành công!');
  };

  // Kiểm tra xem hiện tại có đang ở Trang chủ hay đang vào giao diện của một nút
  const isAtHome = activeTab === 'home';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex">
      {/* 1. CHỈ HIỆN CỘT MENU DỌC KHI Ở TRANG CHỦ (KHI VÀO GIAO DIỆN CỦA NÚT THÌ ẨN HOÀN TOÀN) */}
      {isAtHome && (
        <HeaderMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          questionCount={currentTest.questions.length}
          onExportWord={handleExportWord}
        />
      )}

      {/* 2. VÙNG HIỂN THỊ NỘI DUNG CHÍNH (TOÀN MÀN HÌNH KHI VÀO CHỨC NĂNG) */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* HEADER TRÊN CÙNG CANH GIỮA */}
        <header className="bg-slate-900 text-white py-3.5 px-6 shadow-md border-b border-slate-800 flex items-center justify-between">
          {/* Nút Quay lại Menu khi đang ở trong một chức năng */}
          {!isAtHome ? (
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Menu Trang chủ
            </button>
          ) : (
            <div className="w-24"></div>
          )}

          {/* Tên phần mềm & Tác giả canh giữa */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                THPT
              </div>
              <h1 className="font-black text-lg sm:text-xl text-white tracking-wide">
                TOÁN THPT
              </h1>
              <span className="px-2 py-0.2 bg-blue-500/25 text-blue-300 rounded-full font-bold text-[10px] border border-blue-400/30">
                GDPT 2018
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Tác giả: <strong className="text-white">NGUYỄN QUỐC TÂM</strong> • THPT MAI THANH THẾ
            </p>
          </div>

          <div className="w-24 flex justify-end">
            {!isAtHome && (
              <span className="text-xs text-slate-400 font-medium">Toàn màn hình</span>
            )}
          </div>
        </header>

        {/* NỘI DUNG RIÊNG BIỆT CỦA TỪNG CHỨC NĂNG (HOÀN TOÀN KHÔNG CÓ NÚT LỆNH THỪA) */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* MÀN HÌNH TRANG CHỦ KHI VỪA MỞ WEB */}
          {isAtHome && (
            <div className="max-w-4xl mx-auto space-y-6 pt-4">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">HỆ THỐNG QUẢN TRỊ & SOẠN ĐỀ TOÁN THPT</h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Chào mừng Thầy <strong>NGUYỄN QUỐC TÂM</strong>! Vui lòng chọn chức năng ở cột menu dọc bên trái để bắt đầu làm việc.
                </p>
              </div>

              {/* Lưới các chức năng nhanh trên trang chủ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div onClick={() => setActiveTab('create')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">Tạo đề mới (Ma trận)</h4>
                  <p className="text-xs text-slate-500">Soạn đề theo ma trận CV 7991 cho Toán 10, 11, 12</p>
                </div>

                <div onClick={() => setActiveTab('upload')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-cyan-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <BookOpen className="w-6 h-6 text-cyan-600" />
                  <h4 className="font-bold text-sm text-slate-900">Tải lên đề Word</h4>
                  <p className="text-xs text-slate-500">Nạp file .docx để bóc tách câu hỏi tự động</p>
                </div>

                <div onClick={() => setActiveTab('assign')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <Send className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Giao bài cho học sinh</h4>
                  <p className="text-xs text-slate-500">Cấu hình kiểm tra & tạo link làm bài trực tuyến</p>
                </div>

                <div onClick={() => setActiveTab('classes')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <Users className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Quản lý Lớp học</h4>
                  <p className="text-xs text-slate-500">Tự do đặt tên lớp, dán học sinh từ Excel</p>
                </div>

                <div onClick={() => setActiveTab('generator')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">Xem đề thi ({currentTest.questions.length} câu)</h4>
                  <p className="text-xs text-slate-500">Xem và sửa chi tiết từng câu hỏi trong đề</p>
                </div>

                <div onClick={() => setActiveTab('matrix')} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-500 cursor-pointer shadow-sm hover:shadow transition-all space-y-1">
                  <Table className="w-6 h-6 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">Ma trận & Bản đặc tả</h4>
                  <p className="text-xs text-slate-500">Xem bảng phân bổ nhận thức chuẩn Bộ GD&ĐT</p>
                </div>
              </div>
            </div>
          )}

          {/* 1. GIAO DIỆN TẠO ĐỀ MỚI THEO MA TRẬN */}
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
                    setActiveTab('generator'); // Chuyển sang xem đề thi
                  } catch (err) {
                    console.error('Lỗi tạo đề:', err);
                  }
                }}
                isGenerating={isGenerating}
              />
            </div>
          )}

          {/* 2. GIAO DIỆN TẢI LÊN ĐỀ WORD */}
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

          {/* 3. GIAO DIỆN GIAO BÀI CHO HỌC SINH */}
          {activeTab === 'assign' && (
            <AssignmentModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              currentConfig={currentTest.config}
            />
          )}

          {/* 4. GIAO DIỆN QUẢN LÝ LỚP HỌC */}
          {activeTab === 'classes' && <ClassManager />}

          {/* 5. GIAO DIỆN XEM ĐỀ THI */}
          {activeTab === 'generator' && (
            <QuestionList
              test={currentTest}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveToBank={handleQuickSaveToBank}
              onOpenBank={() => setActiveTab('bank')}
            />
          )}

          {/* 6. GIAO DIỆN TRÌNH CHIẾU SLIDE */}
          {activeTab === 'slides' && <SlideViewer test={currentTest} />}

          {/* 7. GIAO DIỆN MA TRẬN & BẢN ĐẶC TẢ */}
          {activeTab === 'matrix' && <MatrixTable test={currentTest} />}

          {/* 8. GIAO DIỆN KHO LƯU TRỮ ĐỀ */}
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

      {/* Modal Chỉnh sửa chi tiết 1 câu hỏi */}
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
