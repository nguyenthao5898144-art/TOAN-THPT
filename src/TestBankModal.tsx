import React, { useState, useEffect } from 'react';
import { GeneratedTest } from './types';
import { MATH_10_QUESTIONS } from './testGenerator';
import {
  Folder, FolderPlus, Trash2, Eye, Edit3, Settings,
  Layers, X, Check, ArrowLeft
} from 'lucide-react';

interface TestBankModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTest?: (test: GeneratedTest) => void;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  isOpen = true,
  onClose,
  onSelectTest,
}) => {
  // HÀM ÉP BUỘC CHUẨN ĐỊNH DẠNG: MA_TRẬN_[...].json
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

  // TỰ ĐỘNG CHUẨN HÓA TOÀN BỘ FILE ĐÃ LƯU TRONG MÁY VỀ DẠNG MA_TRẬN_[...].json
  const [savedTests, setSavedTests] = useState<GeneratedTest[]>(() => {
    try {
      const s = localStorage.getItem('stored_bank_tests');
      const list = s ? JSON.parse(s) : [];
      if (list.length) {
        return list.map((t: any) => ({
          ...t,
          title: formatMatrixFileName(t.title),
        }));
      }
      return [{
        id: 'test_10_default',
        title: 'MA_TRẬN_[ĐỀ_KHẢO_SÁT_&_ĐÁNH_GIÁ_TOÁN_10_-_GDPT_2018].json',
        config: { grade: '10', durationMinutes: 45 },
        questions: MATH_10_QUESTIONS,
        createdAt: '2026-09-12T00:00:00Z',
      } as any];
    } catch {
      return [];
    }
  });

  const [folders, setFolders] = useState([
    { id: 'f11', name: 'TOÁN 11', grade: '11' },
    { id: 'f12', name: 'TOÁN 12', grade: '12' },
    { id: 'f10', name: 'TOÁN 10', grade: '10' },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('f10');

  // State Cài đặt
  const [editingTest, setEditingTest] = useState<GeneratedTest | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(45);
  const [editGrade, setEditGrade] = useState<string>('10');

  useEffect(() => {
    localStorage.setItem('stored_bank_tests', JSON.stringify(savedTests));
  }, [savedTests]);

  // 1. NÚT MỞ FILE
  const handleOpenFile = (t: GeneratedTest) => {
    if (onSelectTest) {
      const cleanTitle = extractCleanTitle(t.title);
      onSelectTest({ ...t, title: cleanTitle });
    }
    if (onClose) onClose();
  };

  // 2. NÚT ĐỔI TÊN
  const handleRename = (t: GeneratedTest) => {
    const currentCore = extractCleanTitle(t.title);
    const newCore = prompt('Nhập tên mới cho file ma trận:', currentCore);
    if (newCore && newCore.trim()) {
      const formatted = formatMatrixFileName(newCore.trim());
      const updated = savedTests.map(x => x.id === t.id ? { ...x, title: formatted } : x);
      setSavedTests(updated);
      alert(`Đã đổi tên thành công: ${formatted}`);
    }
  };

  // 3. NÚT CÀI ĐẶT
  const handleOpenSettings = (t: GeneratedTest) => {
    setEditingTest(t);
    setEditTitle(extractCleanTitle(t.title));
    setEditDuration(t.config?.durationMinutes || 45);
    setEditGrade(t.config?.grade || '10');
  };

  // 4. NÚT XOÁ
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Thầy có chắc chắn muốn xóa file "${title}"?`)) {
      setSavedTests(savedTests.filter(x => x.id !== id));
    }
  };

  const currentFolder = folders.find(f => f.id === selectedFolderId) || folders;
  const testsInFolder = savedTests.filter(t => (t.config?.grade || '10') === currentFolder.grade);

  return (
    <div className="font-sans max-w-6xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại
        </button>
      )}

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* CỘT TRÁI: THƯ MỤC MA TRẬN (CHUẨN ẢNH 179) */}
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
                  const newF = { id: `f_${Date.now()}`, name: name.trim().toUpperCase(), grade: '10' };
                  setFolders([...folders, newF]);
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
            {folders.map((f) => {
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
                        if (confirm(`Xóa thư mục "${f.name}"?`)) setFolders(folders.filter(x => x.id !== f.id));
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

        {/* CỘT PHẢI: DANH SÁCH FILE TRONG THƯ MỤC MA TRẬN */}
        <div className="flex-1 w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-900">
              Danh sách ma trận: <span className="text-emerald-600">{currentFolder.name}</span>
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
                    TOÁN {t.config?.grade || '10'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">12/9/2026</span>
                </div>

                {/* LUÔN ÉP HIỂN THỊ ĐÚNG DẠNG: MA_TRẬN_[...].json */}
                <h3 className="font-black text-slate-900 text-sm break-words">
                  {formatMatrixFileName(t.title)}
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  Thời gian làm bài: {t.config?.durationMinutes || 45} phút
                </p>

                {/* ĐỦ 4 NÚT BẤM: [MỞ FILE] - [ĐỔI TÊN] - [CÀI ĐẶT] - [XOÁ] */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(t)}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Mở file
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRename(t)}
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
                    onClick={() => handleDelete(t.id, t.title)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                    title="Xóa file"
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

      {/* MODAL CÀI ĐẶT */}
      {editingTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border font-sans">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-700" /> Cài đặt thông số ma trận
              </h3>
              <button onClick={() => setEditingTest(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
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
              <button onClick={() => setEditingTest(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Hủy</button>
              <button
                onClick={() => {
                  const formatted = formatMatrixFileName(editTitle);
                  const updatedTest: GeneratedTest = {
                    ...editingTest,
                    title: formatted,
                    config: { ...editingTest.config, grade: editGrade, durationMinutes: Number(editDuration) || 45 },
                  };
                  setSavedTests(savedTests.map(t => t.id === updatedTest.id ? updatedTest : t));
                  setEditingTest(null);
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
    </div>
  );
};

export default TestBankModal;
