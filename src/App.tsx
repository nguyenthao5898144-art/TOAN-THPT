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
import { exportTestToWord } from './wordExporter';
import { saveTestToBank } from './testBankStorage';
import {
  Home, FileText, FolderArchive, Users, BookOpen, Layers,
  Table, Sparkles, Upload, Send, Download, ArrowLeft,
  Award, ChevronRight, Calendar
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

  const handleQuickSaveToBank = () => {
    saveTestToBank(currentTest);
    alert('Đã lưu đề thi vào Kho Lưu Trữ thành công!');
  };

  const isAtHome = activeTab === 'home';

  // Danh sách các chuyên đề Toán 12 trọng tâm gợi ý theo tuần
  const mathTopicsPreview = [
    { week: 'Chuyên đề 1', title: 'Ứng dụng đạo hàm để khảo sát & vẽ đồ thị hàm số', grade: 'Toán 12' },
    { week: 'Chuyên đề 2', title: 'Tọa độ vectơ trong không gian Oxyz', grade: 'Toán 12' },
    { week: 'Chuyên đề 3', title: 'Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm', grade: 'Toán 12' },
    { week: 'Chuyên đề 4', title: 'Nguyên hàm, Tích phân và Ứng dụng hình học', grade: 'Toán 12' },
    { week: 'Chuyên đề 5', title: 'Phương trình mặt phẳng, đường thẳng và mặt cầu Oxyz', grade: 'Toán 12' },
    { week: 'Chuyên đề 6', title: 'Xác suất có điều kiện và Công thức Bayes', grade: 'Toán 12' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex">
      {/* 1. CỘT BIỂU TƯỢNG SIÊU MẢNH BÊN TRÁI (W-16) */}
      <aside className="w-16 bg-slate-900 text-white min-h-screen h-screen sticky top-0 flex flex-col items-center justify-between py-4 shrink-0 shadow-xl z-30 border-r border-slate-800">
        <div className="flex flex-col items-center space-y-5 w-full">
          {/* Logo THPT */}
          <div
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-black text-xs cursor-pointer shadow transition-all"
            title="Màn hình chính"
          >
            THPT
          </div>

          {/* Các nút icon chuyển nhanh */}
          <div className="flex flex-col items-center space-y-2.5 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Màn hình chính"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'create' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Tạo đề mới (Ma trận)"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'assign' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Giao bài kiểm tra"
            >
              <Send className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'classes' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Quản lý lớp học"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'generator' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Xem đề thi"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slides')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'slides' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Trình chiếu Slide"
            >
              <Layers className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'matrix' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Ma trận & Bản đặc tả"
            >
              <Table className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === 'bank' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Kho lưu trữ đề"
            >
              <FolderArchive className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">2026</div>
      </aside>

      {/* 2. VÙNG NỘI DUNG CHÍNH */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0 bg-slate-50">
        {/* THANH TIÊU ĐỀ CANH GIỮA TRANG WEB */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
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

          {/* Tiêu đề phần mềm canh giữa trang trọng */}
          <div className="flex items-center space-x-2">
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-wide">
              TOÁN THPT
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold border border-blue-200">
              GDPT 2018
            </span>
          </div>

          {/* Góc phải: Tác giả & Trường */}
          <div className="flex items-center space-x-2 text-right">
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-xs block leading-tight">Thầy Nguyễn Quốc Tâm</span>
              <span className="text-[10px] text-slate-500">THPT Mai Thanh Thế</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
              QT
            </div>
          </div>
        </header>

        {/* NỘI DUNG HIỂN THỊ (BỐ CỤC DASHBOARD HOẶC CHỨC NĂNG ĐỘC LẬP) */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* BỐ CỤC MÀN HÌNH CHÍNH (THEO ĐÚNG BỐ CỤC MẪU ẢNH) */}
          {isAtHome && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Banner chào mừng xanh đen sang trọng */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                    Chào mừng Thầy Nguyễn Quốc Tâm 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Hệ thống Khảo sát, Soạn đề & Quản lý học tập môn Toán THPT theo Chương trình GDPT 2018
                  </p>
                </div>
              </div>

              {/* NHÓM 1: KHẢO SÁT & SOẠN ĐỀ THI (3 THẺ LỚN) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
                  Khảo sát & Soạn thảo đề thi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Thẻ 1: Tạo đề mới */}
                  <div
                    onClick={() => setActiveTab('create')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Tạo đề mới (Ma trận CV 7991)</h4>
                    <p className="text-[11px] text-slate-400">Soạn đề thi chuẩn Bộ GD&ĐT cho Toán 10, 11, 12</p>
                  </div>

                  {/* Thẻ 2: Tải lên đề Word */}
                  <div
                    onClick={() => setActiveTab('upload')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Tải lên đề Word</h4>
                    <p className="text-[11px] text-slate-400">Nạp file .docx sẵn có để bóc tách câu hỏi tự động</p>
                  </div>

                  {/* Thẻ 3: Xem đề thi */}
                  <div
                    onClick={() => setActiveTab('generator')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Xem & Hiệu chỉnh đề thi</h4>
                    <p className="text-[11px] text-slate-400">Đang có {currentTest.questions.length} câu hỏi chuẩn hóa</p>
                  </div>
                </div>
              </div>

              {/* NHÓM 2: GIẢNG DẠY & QUẢN LÝ HỌC SINH (3 THẺ LỚN) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
                  Giảng dạy & Quản lý học sinh
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Giao bài học sinh */}
                  <div
                    onClick={() => setActiveTab('assign')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Giao bài kiểm tra trực tuyến</h4>
                    <p className="text-[11px] text-slate-400">Cấu hình thi, đếm ngược giờ và tạo link cho học sinh</p>
                  </div>

                  {/* Quản lý lớp học */}
                  <div
                    onClick={() => setActiveTab('classes')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Quản lý lớp & Bảng điểm</h4>
                    <p className="text-[11px] text-slate-400">Tự do đặt tên lớp, dán học sinh từ Excel, theo dõi điểm</p>
                  </div>

                  {/* Trình chiếu slide */}
                  <div
                    onClick={() => setActiveTab('slides')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Trình chiếu Slide bài giảng</h4>
                    <p className="text-[11px] text-slate-400">Phục vụ trình chiếu câu hỏi và đáp án trên lớp</p>
                  </div>
                </div>
              </div>

              {/* NHÓM 3: DỮ LIỆU & XUẤT BẢN (3 THẺ LỚN) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
                  Dữ liệu & Xuất bản tài liệu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Ma trận & Bản đặc tả */}
                  <div
                    onClick={() => setActiveTab('matrix')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Table className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Ma trận & Bản đặc tả</h4>
                    <p className="text-[11px] text-slate-400">Xem bảng phân chia mức độ nhận thức chuẩn Bộ GD&ĐT</p>
                  </div>

                  {/* Kho lưu trữ đề */}
                  <div
                    onClick={() => setActiveTab('bank')}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Kho lưu trữ đề thi</h4>
                    <p className="text-[11px] text-slate-400">Lưu và mở lại các bộ đề thi đã tạo theo năm học</p>
                  </div>

                  {/* Xuất file Word */}
                  <div
                    onClick={handleExportWord}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-600 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                      <Download className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Xuất đề ra Word (.docx)</h4>
                    <p className="text-[11px] text-slate-400">Tải file Word chuẩn đề thi, đáp án và ma trận</p>
                  </div>
                </div>
              </div>

              {/* NHÓM 4: GỢI Ý CHUYÊN ĐỀ TRỌNG TÂM GDPT 2018 (DÃY THẺ CUỘN NGANG) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
                  Gợi ý chuyên đề trọng tâm (Chương trình GDPT 2018)
                </h3>
                <div className="flex gap-3.5 overflow-x-auto pb-2 pr-1">
                  {mathTopicsPreview.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveTab('create')}
                      className="min-w-[210px] max-w-[230px] p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between shrink-0 space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-blue-600">{item.week}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">{item.grade}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 leading-snug line-clamp-3">
                          {item.title}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold pt-2 border-t border-slate-100">
                        Soạn đề theo ma trận <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CÁC GIAO DIỆN CHUYÊN BIỆT KHI CLICK VÀO TỪNG THẺ */}
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

          {activeTab === 'assign' && (
            <AssignmentModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              currentConfig={currentTest.config}
            />
          )}

          {activeTab === 'classes' && <ClassManager />}

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

      {/* Modal Sửa chi tiết câu hỏi */}
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
