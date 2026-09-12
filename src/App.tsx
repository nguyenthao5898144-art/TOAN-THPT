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
  Folder, FolderPlus, Layers, Edit3, ArrowLeft, Bookmark, BookOpen, Home
} from 'lucide-react';

interface MatrixFolder {
  id: string;
  name: string;
  grade: string;
}

export const App: React.FC = () => {
  // 1. HÀM ÉP BUỘC ĐỊNH DẠNG TÊN: MA_TRẬN_[...].json
  const formatMatrixFileName = (rawTitle: string): string => {
    let clean = (rawTitle || 'DE_THI').trim().replace(/\.json$/i, '');
    let core = clean.replace(/^MA_TRẬN_(\[)?/i, '').replace(/\]$/, '').trim();
    return `MA_TRẬN_[${core}].json`;
  };

  const extractCleanTitle = (matrixFileName: string): string => {
    return (matrixFileName || 'ĐỀ KIỂM TRA TOÁN')
      .replace(/^MA_TRẬN_(\[)?/i, '')
      .replace(/\]\.json$/i, '')
      .replace(/\.json$/i, '')
      .trim();
  };

  const [currentTest, setCurrentTest] = useState<GeneratedTest>(() => {
    return createDefaultTest({ grade: '12', title: 'ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_12_-_GDPT_2018' } as any);
  });

  // TỰ ĐỘNG CHUẨN HÓA MỌI FILE ĐÃ LƯU VỀ DẠNG MA_TRẬN_[...].json
  const [savedTests, setSavedTests] = useState<GeneratedTest[]>(() => {
    try {
      const s = getStoredBankTests();
      if (s?.length) return s.map(t => ({ ...t, title: formatMatrixFileName(t.title) }));
      return [
        {
          id: 'test_12_default',
          title: 'MA_TRẬN_[ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_12_-_GDPT_2018].json',
          config: { grade: '12', durationMinutes: 45 },
          questions: MATH_10_QUESTIONS,
          createdAt: '2026-09-12T00:00:00Z',
        } as any,
        {
          id: 'test_10_default',
          title: 'MA_TRẬN_[ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_10_-_GDPT_2018].json',
          config: { grade: '10', durationMinutes: 45 },
          questions: MATH_10_QUESTIONS,
          createdAt: '2026-09-12T00:00:00Z',
        } as any,
      ];
    } catch {
      return [];
    }
  });

  const [view, setView] = useState<'generator' | 'matrix' | 'bank' | 'classes' | 'student_portal'>('bank');
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);

  // DANH SÁCH THƯ MỤC MA TRẬN (CHUẨN ẢNH 184)
  const [matrixFolders, setMatrixFolders] = useState<MatrixFolder[]>([
    { id: 'f11', name: 'TOÁN 11', grade: '11' },
    { id: 'f12', name: 'TOÁN 12', grade: '12' },
    { id: 'f10', name: 'TOÁN 10', grade: '10' },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('f12');

  // State Cài đặt
  const [editingSettingsTest, setEditingSettingsTest] = useState<GeneratedTest | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(45);
  const [editGrade, setEditGrade] = useState<string>('12');

  useEffect(() => {
    if (savedTests.length) saveStoredBankTests(savedTests);
  }, [savedTests]);

  // 1. NÚT MỞ FILE: MỞ ĐỀ THI RA SOẠN THẢO
  const handleOpenSavedTest = (test: GeneratedTest) => {
    const cleanTitle = extractCleanTitle(test.title);
    const safeTest: GeneratedTest = {
      ...test,
      title: cleanTitle,
      questions: Array.isArray(test.questions) && test.questions.length > 0 ? test.questions : MATH_10_QUESTIONS,
    };
    setCurrentTest(safeTest);
    setView('generator');
  };

  // 2. NÚT ĐỔI TÊN: ĐỔI TÊN VÀ TỰ ĐỘNG BỌC MA_TRẬN_[...]
  const handleRenameTest = (t: GeneratedTest) => {
    const currentCore = extractCleanTitle(t.title);
    const newCore = prompt('Nhập tên mới cho file ma trận:', currentCore);
    if (newCore && newCore.trim()) {
      const formattedTitle = formatMatrixFileName(newCore.trim());
      const updatedTest = { ...t, title: formattedTitle };
      const updatedList = savedTests.map(item => item.id === t.id ? updatedTest : item);
      setSavedTests(updatedList);
      saveStoredBankTests(updatedList);
      if (currentTest.id === t.id) setCurrentTest({ ...currentTest, title: newCore.trim() });
      alert(`Đã đổi tên thành công: ${formattedTitle}`);
    }
  };

  // 3. NÚT CÀI ĐẶT
  const handleOpenSettings = (t: GeneratedTest) => {
    setEditingSettingsTest(t);
    setEditTitle(extractCleanTitle(t.title));
    setEditDuration(t.config?.durationMinutes || 45);
    setEditGrade(t.config?.grade || '12');
  };

  // 4. NÚT XOÁ
  const handleDeleteSavedTest = (id: string, title: string) => {
    if (confirm(`Thầy có chắc chắn muốn xóa file "${title}"?`)) {
      const updated = savedTests.filter((t) => t.id !== id);
      setSavedTests(updated);
      saveStoredBankTests(updated);
    }
  };

  // LƯU VÀO KHO MA TRẬN
  const handleSaveCurrentTestToBank = () => {
    const matrixFileName = formatMatrixFileName(currentTest.title);
    const savedItem: GeneratedTest = {
      ...currentTest,
      title: matrixFileName,
    };
    const updatedList = [savedItem, ...savedTests.filter((t) => t.id !== savedItem.id)];
    setSavedTests(updatedList);
    saveStoredBankTests(updatedList);
    alert(`Đã lưu vào Ngân hàng ma trận với tên:\n${matrixFileName}`);
  };

  const selectedFolder = matrixFolders.find(f => f.id === selectedFolderId) || matrixFolders;
  const testsInFolder = savedTests.filter(t => (t.config?.grade || '12') === selectedFolder.grade);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* THANH MENU DỌC ICON BÊN TRÁI (CHUẨN ẢNH 184) */}
      <aside className="w-16 bg-blue-900 flex flex-col items-center py-4 justify-between shrink-0 shadow-lg text-white">
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-10 h-10 bg-blue-700 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner">
            THPT
          </div>

          <nav className="space-y-3 flex flex-col items-center">
            <button type="button" onClick={() => setView('generator')} className={`p-2.5 rounded-xl transition-all ${view === 'generator' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:text-white'}`} title="Trang chủ"><Home className="w-5 h-5" /></button>
            <button type="button" onClick={() => setView('generator')} className="p-2.5 text-blue-200 hover:text-white rounded-xl" title="Đề thi"><FileText className="w-5 h-5" /></button>
            <button type="button" onClick={() => setIsGeneratorModalOpen(true)} className="p-2.5 text-blue-200 hover:text-white rounded-xl" title="Tạo đề AI"><Sparkles className="w-5 h-5" /></button>
            <button type="button" onClick={() => setView('classes')} className={`p-2.5 rounded-xl transition-all ${view === 'classes' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:text-white'}`} title="Quản lý lớp"><Layers className="w-5 h-5" /></button>
            {/* ICON BOOKOPEN ĐANG CHỌN TRONG ẢNH 184 */}
            <button type="button" onClick={() => setView('bank')} className={`p-2.5 rounded-xl transition-all ${view === 'bank' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:text-white'}`} title="Thư mục ma trận"><BookOpen className="w-5 h-5" /></button>
            <button type="button" onClick={() => setView('matrix')} className={`p-2.5 rounded-xl transition-all ${view === 'matrix' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:text-white'}`} title="Ma trận đặc tả"><Grid className="w-5 h-5" /></button>
            <button type="button" onClick={() => setView('student_portal')} className="p-2.5 text-blue-200 hover:text-white rounded-xl" title="Lưu trữ"><Bookmark className="w-5 h-5" /></button>
          </nav>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER TRÊN CÙNG: QUAY LẠI - TOÁN THPT - THÔNG TIN THẦY NGUYỄN QUỐC TÂM (CHUẨN ẢNH 184) */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setView('generator')}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-black text-slate-900 text-lg tracking-tight">TOÁN THPT</h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">GDPT 2018</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h4 className="font-bold text-xs text-slate-900">Thầy Nguyễn Quốc Tâm</h4>
              <p className="text-[11px] text-slate-400">THPT Mai Thanh Thế</p>
            </div>
            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow">
              QT
            </div>
          </div>
        </header>

        {/* NỘI DUNG MÀN HÌNH THƯ MỤC MA TRẬN */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'bank' && (
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-6">
              {/* KHUNG TRÁI: THƯ MỤC MA TRẬN (CHUẨN ẢNH 184) */}
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
                        const newF: MatrixFolder = { id: `f_${Date.now()}`, name: name.trim().toUpperCase(), grade: '12' };
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
                    const count = savedTests.filter(t => (t.config?.grade || '12') === f.grade).length;
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
                              if (confirm(`Xóa thư mục "${f.name}"?`)) setMatrixFolders(matrixFolders.filter(x => x.id !== f.id));
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

              {/* KHUNG PHẢI: THẺ FILE CÓ ĐỦ 4 NÚT VÀ TÊN MA_TRẬN_[...].json (CHUẨN ẢNH 184) */}
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
                      className="border border-slate-200 rounded-3xl p-5 hover:border-emerald-500 hover:shadow-md transition-all space-y-3 bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          TOÁN {t.config?.grade || selectedFolder.grade}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">12/9/2026</span>
                      </div>

                      {/* TỰ ĐỘNG ÉP HIỂN THỊ CHUẨN XÁC: MA_TRẬN_[...].json */}
                      <h3 className="font-black text-slate-900 text-sm break-words">
                        {formatMatrixFileName(t.title)}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium">
                        Thời gian làm bài: {t.config?.durationMinutes || 45} phút
                      </p>

                      {/* ĐẦY ĐỦ 4 NÚT BẤM: [MỞ FILE] - [ĐỔI TÊN] - [CÀI ĐẶT] - [XOÁ] */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenSavedTest(t)}
                            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Mở file
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRenameTest(t)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" /> Đổi tên
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenSettings(t)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-600" /> Cài đặt
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSavedTest(t.id, t.title)}
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

      {/* MODAL CÀI ĐẶT THÔNG SỐ */}
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
                <label className="block text-slate-700 font-bold mb-1">Tên ma trận:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-xs outline-none"
                />
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
                  const formatted = formatMatrixFileName(editTitle);
                  const updatedTest: GeneratedTest = {
                    ...editingSettingsTest,
                    title: formatted,
                    config: { ...editingSettingsTest.config, grade: editGrade, durationMinutes: Number(editDuration) || 45 },
                  };
                  setSavedTests(savedTests.map(t => t.id === updatedTest.id ? updatedTest : t));
                  if (currentTest.id === updatedTest.id) setCurrentTest({ ...currentTest, title: editTitle.trim() });
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

      {/* MODAL TẠO ĐỀ MA TRẬN MỚI */}
      {isGeneratorModalOpen && (
        <QuestionGeneratorModal
          isOpen={isGeneratorModalOpen}
          onClose={() => setIsGeneratorModalOpen(false)}
          onGenerate={(newCfg) => {
            const created = createDefaultTest(newCfg);
            setCurrentTest(created);
            setIsGeneratorModalOpen(false);
            setView('generator');
          }}
        />
      )}
    </div>
  );
};

export default App;
