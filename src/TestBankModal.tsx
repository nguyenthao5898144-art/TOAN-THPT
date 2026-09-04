import React, { useState, useEffect } from 'react';
import { GeneratedTest } from './types';
import {
  Folder, FileText, MoreVertical, Trash2, ArrowLeft,
  Search, Plus, CheckSquare, Square, Share2, Copy, Edit3,
  ExternalLink, Check, ChevronRight, FolderPlus
} from 'lucide-react';

interface TestBankModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTest?: (test: GeneratedTest) => void;
}

interface BankFolder {
  id: string;
  name: string;
  year?: string;
}

interface BankExam {
  id: string;
  title: string;
  folderId?: string;
  submittedCount: number;
  status: string;
  assignedClass: string;
  assignedTime: string;
  createdAt: string;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  isOpen = true,
  onClose,
  onSelectTest,
}) => {
  // 1. DANH SÁCH THƯ MỤC TRONG KHO ĐỀ
  const [folders, setFolders] = useState<BankFolder[]>(() => {
    try {
      const saved = localStorage.getItem('stored_test_bank_folders');
      return saved ? JSON.parse(saved) : [
        { id: 'f_azota', name: 'Kho đề Azota', year: '2026' },
        { id: 'f_toan12', name: 'TOÁN 12', year: '2026' },
        { id: 'f_toan11', name: 'TOÁN 11', year: '2026' },
        { id: 'f_toan10', name: 'TOÁN 10', year: '2026' },
        { id: 'f_kt', name: 'KIỂM TRA 2026-2027', year: '2026' },
        { id: 'f_on', name: 'ÔN TẬP RÈN LUYỆN', year: '2026' },
      ];
    } catch {
      return [];
    }
  });

  // 2. DANH SÁCH ĐỀ THI (ĐÃ XÓA SẠCH 2 FILE MẪU CŨ THEO YÊU CẦU CỦA THẦY)
  const [exams, setExams] = useState<BankExam[]>(() => {
    try {
      const saved = localStorage.getItem('stored_test_bank_exams');
      // Mặc định làm sạch, không còn chứa 2 file cũ
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lưu trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('stored_test_bank_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('stored_test_bank_exams', JSON.stringify(exams));
  }, [exams]);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // XÓA 1 FILE ĐỀ THI
  const handleDeleteExam = (id: string, name: string) => {
    if (confirm(`Thầy có chắc chắn muốn xóa file đề thi "${name}"?`)) {
      setExams((prev) => prev.filter((e) => e.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setActiveMenuId(null);
    }
  };

  // XÓA 1 THƯ MỤC
  const handleDeleteFolder = (id: string, name: string) => {
    if (confirm(`Thầy có chắc chắn muốn xóa thư mục "${name}"?`)) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setActiveMenuId(null);
    }
  };

  // XÓA HÀNG LOẠT CÁC MỤC ĐƯỢC TÍCH Ô VUÔNG
  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    if (confirm(`Thầy có chắc chắn muốn xóa ${selectedIds.length} mục đã chọn không?`)) {
      setExams((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setFolders((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
      setSelectedIds([]);
      alert('Đã xóa thành công các mục đã chọn!');
    }
  };

  // TÍCH CHỌN TẤT CẢ HOẶC BỎ CHỌN
  const handleToggleSelectAll = () => {
    const allVisibleIds = [
      ...folders.map((f) => f.id),
      ...exams.map((e) => e.id),
    ];
    if (selectedIds.length === allVisibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allVisibleIds);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  return (
    <div className="font-sans max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4" onClick={() => setActiveMenuId(null)}>
      {/* 1. THANH ĐIỀU HƯỚNG & NÚT QUAY LẠI */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại
            </button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm font-black text-slate-900 ml-2">
            <span
              onClick={() => setCurrentFolderId(null)}
              className={`cursor-pointer hover:text-blue-600 ${!currentFolderId ? 'text-blue-600' : 'text-slate-500'}`}
            >
              Tất cả
            </span>
            {currentFolder && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-blue-600">{currentFolder.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Nút tác vụ hàng loạt khi có tích chọn ô vuông */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.length} mục đã chọn)
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const name = prompt('Nhập tên thư mục mới:');
              if (name && name.trim()) {
                setFolders([...folders, { id: `f_${Date.now()}`, name: name.trim(), year: '2026' }]);
              }
            }}
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" /> Tạo thư mục
          </button>
        </div>
      </div>

      {/* 2. BẢNG DANH SÁCH THƯ MỤC & ĐỀ THI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === (folders.length + exams.length)}
                    onChange={handleToggleSelectAll}
                    className="cursor-pointer rounded w-4 h-4"
                  />
                </th>
                <th className="p-3 min-w-[220px]">Tên</th>
                <th className="p-3 text-center w-28">Số bài đã nộp</th>
                <th className="p-3 text-center w-28">Trạng Thái</th>
                <th className="p-3 text-center w-24">Đã Giao Cho</th>
                <th className="p-3 text-center min-w-[160px]">Thời gian giao đề</th>
                <th className="p-3 text-center w-24">Thời gian tạo</th>
                <th className="p-3 text-center w-16">Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* CÁC HÀNG THƯ MỤC */}
              {!currentFolderId && folders.map((f) => {
                const isSelected = selectedIds.includes(f.id);
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(f.id)}
                        className="cursor-pointer rounded w-4 h-4"
                      />
                    </td>
                    <td
                      className="p-3 cursor-pointer"
                      onClick={() => setCurrentFolderId(f.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder className="w-5 h-5 text-blue-700 fill-blue-700/20 shrink-0" />
                        <span className="font-black text-slate-900 text-xs hover:text-blue-600">{f.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-slate-400">---</td>
                    <td className="p-3 text-center text-slate-400">---</td>
                    <td className="p-3 text-center text-slate-400">---</td>
                    <td className="p-3 text-center text-slate-400">---</td>
                    <td className="p-3 text-center text-slate-600 font-bold">{f.year || '2026'}</td>
                    <td className="p-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === f.id ? null : f.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenuId === f.id && (
                        <div className="absolute right-3 top-8 w-36 bg-white rounded-xl shadow-xl border p-1 z-30 text-xs font-bold text-slate-700 space-y-1 text-left">
                          <div onClick={() => handleDeleteFolder(f.id, f.name)} className="p-2 hover:bg-rose-50 text-rose-600 rounded flex items-center gap-2 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Xóa thư mục
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* CÁC HÀNG ĐỀ THI */}
              {exams.map((ex) => {
                const isSelected = selectedIds.includes(ex.id);
                return (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(ex.id)}
                        className="cursor-pointer rounded w-4 h-4"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="font-black text-slate-900 text-xs">{ex.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">{ex.submittedCount}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ex.status === 'Đã xuất bản' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{ex.assignedClass || '12A6'}</td>
                    <td className="p-3 text-center font-mono text-slate-500 text-[11px]">{ex.assignedTime || '---'}</td>
                    <td className="p-3 text-center font-mono text-slate-500 text-[11px]">{ex.createdAt || '2026'}</td>
                    <td className="p-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === ex.id ? null : ex.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenuId === ex.id && (
                        <div className="absolute right-3 top-8 w-36 bg-white rounded-xl shadow-xl border p-1 z-30 text-xs font-bold text-slate-700 space-y-1 text-left">
                          <div onClick={() => handleDeleteExam(ex.id, ex.title)} className="p-2 hover:bg-rose-50 text-rose-600 rounded flex items-center gap-2 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Xóa đề thi
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {folders.length === 0 && exams.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Thư mục trống. Chưa có đề thi nào trong kho lưu trữ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestBankModal;
