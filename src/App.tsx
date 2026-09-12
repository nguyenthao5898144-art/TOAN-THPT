import React, { useState, useEffect } from 'react';
import { GeneratedTest, Question } from './types';
import { createDefaultTest, MATH_10_QUESTIONS } from './testGenerator';
import { QuestionList } from './QuestionList';
import { MatrixTable } from './MatrixTable';
import { QuestionGeneratorModal } from './QuestionGeneratorModal';
import { ClassManager } from './18';
import { StudentPortal } from './14';
import { getStoredBankTests, saveStoredBankTests } from './testBankStorage';
import {
  FileText, Database, Users, GraduationCap, Grid,
  Upload, Sparkles, Eye, Settings, Trash2, X, Check,
  Folder, FolderPlus, Layers, Edit3
} from 'lucide-react';

interface MatrixFolder {
  id: string;
  name: string;
  grade: string;
}

export const App: React.FC = () => {
  // 1. QUY TẮC ĐẶT TÊN BẮT BUỘC: MA_TRẬN_[...].json
  const formatMatrixFileName = (rawTitle: string): string => {
    let clean = (rawTitle || 'DE_THI').trim().replace(/\.json$/i, '');
    let core = clean.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]$/, '').trim();
    return `MA_TRẬN_[${core}].json`;
  };

  const [currentTest, setCurrentTest] = useState<GeneratedTest>(() => {
    const t = createDefaultTest({ grade: '10', title: 'ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_10_-_GDPT_2018' } as any);
    return { ...t, title: formatMatrixFileName(t.title) };
  });

  const [savedTests, setSavedTests] = useState<GeneratedTest[]>(() => {
    try {
      const s = getStoredBankTests();
      if (s?.length) return s.map(t => ({ ...t, title: formatMatrixFileName(t.title) }));
      const initial = createDefaultTest({ grade: '10', title: 'ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_10_-_GDPT_2018' } as any);
      return [{ ...initial, title: formatMatrixFileName(initial.title) }];
    } catch {
      return [];
    }
  });

  const [view, setView] = useState<'generator' | 'matrix' | 'bank' | 'classes' | 'student_portal'>('bank');
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);

  // Danh sách thư mục ma trận
  const [matrixFolders, setMatrixFolders] = useState<MatrixFolder[]>([
    { id: 'f11', name: 'TOÁN 11', grade: '11' },
    { id: 'f12', name: 'TOÁN 12', grade: '12' },
    { id: 'f10', name: 'TOÁN 10', grade: '10' },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('f10');

  // State Cài đặt đề thi
  const [editingSettingsTest, setEditingSettingsTest] = useState<GeneratedTest | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(45);
  const [editGrade, setEditGrade] = useState<string>('10');

  useEffect(() => {
    if (savedTests.length) saveStoredBankTests(savedTests);
  }, [savedTests]);

  // 1. NÚT MỞ FILE
  const handleOpenSavedTest = (test: GeneratedTest) => {
    const safeTest: GeneratedTest = {
      id: test.id || `test_${Date.now()}`,
      title: formatMatrixFileName(test.title),
      config: test.config || {
        grade: '10',
        durationMinutes: 45,
        questionCountByType: { multipleChoice: 12, trueFalse: 4, shortAnswer: 6 },
        selectedTopicIds: [],
        selectedLessonIds: [],
        selectedOutcomes: [],
      },
      questions: Array.isArray(test.questions) && test.questions.length > 0 ? test.questions : MATH_10_QUESTIONS,
      createdAt: test.createdAt || new Date().toISOString(),
    };

    setCurrentTest(safeTest);
    setView('generator'); // Chuyển sang màn hình xem đề thi
  };

  // 2. NÚT ĐỔI TÊN FILE
  const handleRenameTest = (t: GeneratedTest) => {
    const currentCore = t.title.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]\.json$/i, '');
    const newCore = prompt('Nhập tên mới cho file ma trận:', currentCore);
    if (newCore && newCore.trim()) {
      const formattedTitle = formatMatrixFileName(newCore.trim());
      const updatedTest = { ...t, title: formattedTitle };
      const updatedList = savedTests.map(item => item.id === t.id ? updatedTest : item);
      setSavedTests(updatedList);
      saveStoredBankTests(updatedList);
      if (currentTest.id === t.id) setCurrentTest(updatedTest);
      alert(`Đã đổi tên thành công: ${formattedTitle}`);
    }
  };

  // 3. NÚT CÀI ĐẶT THÔNG SỐ
  const handleOpenSettings = (test: GeneratedTest) => {
    setEditingSettingsTest(test);
    setEditTitle(test.title.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]\.json$/i, ''));
    setEditDuration(test.config?.durationMinutes || 45);
    setEditGrade(test.config?.grade || '10');
  };

  // 4. NÚT XOÁ FILE
  const handleDeleteSavedTest = (id: string, title: string) => {
    if (confirm(`Thầy có chắc chắn muốn xóa file "${title}" khỏi ngân hàng ma trận?`)) {
      const updated = savedTests.filter((t) => t.id !== id);
      setSavedTests(updated);
      saveStoredBankTests(updated);
    }
  };

  // LƯU ĐỀ VÀO KHO
  const handleSaveCurrentTestToBank = () => {
    const formattedTitle = formatMatrixFileName(currentTest.title);
    const updatedTest: GeneratedTest = {
      ...currentTest,
      title: formattedTitle,
    };
    setCurrentTest(updatedTest);

    const updatedList = [updatedTest, ...savedTests.filter((t) => t.id !== updatedTest.id)];
    setSavedTests(updatedList);
    saveStoredBankTests(updatedList);
    alert(`Đã lưu thành công vào ngân hàng ma trận: ${formattedTitle}`);
  };

  // NẠP VÀ MỞ FILE JSON TỪ MÁY TÍNH
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const questions: Question[] = Array.isArray(parsed.questions) ? parsed.questions : MATH_10_QUESTIONS;

        const newTest: GeneratedTest = {
          id: parsed.id || `test_json_${Date.now()}`,
          title: formatMatrixFileName(parsed.title || file.name),
          config: parsed.config || {
            grade: file.name.includes('11') ? '11' : (file.name.includes('12') ? '12' : '10'),
            durationMinutes: 45,
            questionCountByType: { multipleChoice: 12, trueFalse: 4, shortAnswer: 6 },
            selectedTopicIds: [],
            selectedLessonIds: [],
            selectedOutcomes: [],
          },
          questions,
          createdAt: new Date().toISOString(),
        };

        const updated = [newTest, ...savedTests.filter((t) => t.id !== newTest.id)];
        setSavedTests(updated);
        saveStoredBankTests(updated);

        handleOpenSavedTest(newTest);
        alert(`Đã nạp và mở thành công: ${newTest.title}`);
      } catch {
        alert('Lỗi: File JSON không đúng định dạng!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedFolder = matrixFolders.find(f => f.id === selectedFolderId) || matrixFolders[0];
  const testsInFolder = savedTests.filter(t => (t.config?.grade || '10') === selectedFolder.grade);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* THANH ĐIỀU HƯỚNG TRÁI */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow">
              ∑
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-sm tracking-tight">TOÁN THPT</h1>
              <p className="text-[11px] text-slate-400 font-bold">GDPT 2018</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setView('bank')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                view === 'bank' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4" /> Ngân hàng ma trận ({savedTests.length})
            </button>

            <button
              type="button"
              onClick={() => setView('generator')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                view === 'generator' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" /> Biên tập đề thi
            </button>

            <button
              type="button"
              onClick={() => setView('matrix')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                view === 'matrix' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4" /> Ma trận & Bản đặc tả
            </button>

            <button
              type="button"
              onClick={() => setView('classes')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                view === 'classes' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" /> Quản lý lớp học
            </button>

            <button
              type="button"
              onClick={() => setView('student_portal')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                view === 'student_portal' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Cổng làm bài học sinh
            </button>
          </nav>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-slate-900 max-w-md truncate">
              {currentTest?.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              TOÁN {currentTest?.config?.grade || '10'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-600" /> Nạp file JSON
              <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleSaveCurrentTestToBank}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-700" /> Lưu vào Kho ma trận
            </button>

            <button
              type="button"
              onClick={() => setIsGeneratorModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Tạo đề ma trận mới
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* ======================================================= */}
          {/* GIAO DIỆN NGÂN HÀNG MA TRẬN VỚI ĐỦ 4 NÚT CHỨC NĂNG */}
          {/* ======================================================= */}
          {view === 'bank' && (
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-6">
              {/* THƯ MỤC MA TRẬN (BÊN TRÁI) */}
              <div className="w-full md:w-72 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-xs text-slate-900 uppercase tracking-tight">THƯ MỤC MA TRẬN</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt('Nhập tên thư mục mới:');
                      if (name && name.trim()) {
                        const newF: MatrixFolder = { id: `f_${Date.now()}`, name: name.trim().toUpperCase(), grade: '10' };
                        setMatrixFolders([...matrixFolders, newF]);
                        setSelectedFolderId(newF.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Tạo mới
                  </button>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2">
                  {matrixFolders.map((f) => {
                    const isSelected = selectedFolderId === f.id;
                    const count = savedTests.filter(t => (t.config?.grade || '10') === f.grade).length;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Folder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                          <span className="font-bold text-xs">{f.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-800/80 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Xóa thư mục "${f.name}"?`)) {
                                setMatrixFolders(matrixFolders.filter(x => x.id !== f.id));
                              }
                            }}
                            className={`p-1 rounded-lg ${isSelected ? 'text-emerald-200 hover:text-white' : 'text-slate-400 hover:text-rose-600'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DANH SÁCH FILE MA TRẬN (BÊN PHẢI) */}
              <div className="flex-1 w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="font-black text-sm text-slate-900">
                    Danh sách ma trận: <span className="text-emerald-600">{selectedFolder.name}</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">{testsInFolder.length} file</span>
                </div>

                <div className="space-y-4">
                  {testsInFolder.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleOpenSavedTest(t)}
                      className="border border-slate-200 rounded-3xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          TOÁN {t.config?.grade || '10'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">12/9/2026</span>
                      </div>

                      {/* TÊN FILE CHUẨN MA_TRẬN_[...].json */}
                      <h3 className="font-black text-slate-900 text-sm break-words">
                        {formatMatrixFileName(t.title)}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium">
                        Thời gian làm bài: {t.config?.durationMinutes || 45} phút • {t.questions?.length || 22} câu
                      </p>

                      {/* ĐẦY ĐỦ 4 NÚT: [MỞ FILE] - [ĐỔI TÊN] - [CÀI ĐẶT] - [XOÁ] */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* 1. NÚT MỞ FILE */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSavedTest(t);
                            }}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                            title="Mở file ma trận và đề thi"
                          >
                            <Eye className="w-3.5 h-3.5" /> Mở file
                          </button>

                          {/* 2. NÚT ĐỔI TÊN */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameTest(t);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Đổi tên file ma trận"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" /> Đổi tên
                          </button>

                          {/* 3. NÚT CÀI ĐẶT */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSettings(t);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Cài đặt thông số"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-600" /> Cài đặt
                          </button>
                        </div>

                        {/* 4. NÚT XOÁ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedTest(t.id, t.title);
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                          title="Xóa file ma trận"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {testsInFolder.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">
                      Thư mục này chưa có ma trận nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'generator' && <QuestionList test={currentTest} onUpdateTest={setCurrentTest} />}
          {view === 'matrix' && <MatrixTable test={currentTest} onBack={() => setView('generator')} />}
          {view === 'classes' && <ClassManager />}
          {view === 'student_portal' && <StudentPortal />}
        </div>
      </main>

      {/* POPUP CÀI ĐẶT ĐỀ THI */}
      {editingSettingsTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border font-sans animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-700" /> Cài đặt thông số ma trận
              </h3>
              <button onClick={() => setEditingSettingsTest(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên ma trận / đề thi:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-xs outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Hệ thống sẽ tự động lưu dưới dạng: <strong>MA_TRẬN_[{editTitle}].json</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Khối lớp:</label>
                  <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)} className="w-full p-2 border rounded-xl font-bold text-xs bg-white">
                    <option value="10">Toán 10</option>
                    <option value="11">Toán 11</option>
                    <option value="12">Toán 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thời gian (phút):</label>
                  <input type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} className="w-full p-2 border rounded-xl font-bold text-xs" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditingSettingsTest(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Hủy</button>
              <button
                onClick={() => {
                  const updatedTest: GeneratedTest = {
                    ...editingSettingsTest,
                    title: formatMatrixFileName(editTitle),
                    config: { ...editingSettingsTest.config, grade: editGrade, durationMinutes: Number(editDuration) || 45 },
                  };
                  setSavedTests(savedTests.map(t => t.id === updatedTest.id ? updatedTest : t));
                  if (currentTest.id === updatedTest.id) setCurrentTest(updatedTest);
                  setEditingSettingsTest(null);
                  alert('Đã lưu cài đặt thành công!');
                }}
                className="px-5 py-2 bg-blue-900 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP TẠO ĐỀ MA TRẬN MỚI */}
      {isGeneratorModalOpen && (
        <QuestionGeneratorModal
          isOpen={isGeneratorModalOpen}
          onClose={() => setIsGeneratorModalOpen(false)}
          onGenerate={(newCfg) => {
            const created = createDefaultTest(newCfg);
            const formatted = { ...created, title: formatMatrixFileName(created.title) };
            setCurrentTest(formatted);
            setSavedTests([formatted, ...savedTests]);
            setIsGeneratorModalOpen(false);
            setView('generator');
          }}
        />
      )}
    </div>
  );
};

export default App;
