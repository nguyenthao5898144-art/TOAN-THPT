import React, { useState } from 'react';
import { GeneratedTest } from './types';
import { StoredTestItem, getStoredTestBank, deleteStoredTest } from './testBankStorage';
import { exportTestToWord } from './wordExporter';
import {
  Search, Plus, FolderPlus, FileText,
  Clock, Download, Trash2, Folder,
  Database, ChevronRight
} from 'lucide-react';

export interface TestBankModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTest?: (test: GeneratedTest) => void;
  onCreateNew?: () => void;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  onSelectTest,
  onCreateNew,
}) => {
  const [storedTests, setStoredTests] = useState<StoredTestItem[]>(() => {
    try {
      return getStoredTestBank();
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>('');

  // Đường dẫn thư mục hiện tại (Ví dụ: [] là thư mục gốc 'Tất cả', ['TOÁN 12'] là bên trong Toán 12)
  const [folderPath, setFolderPath] = useState<string[]>([]);

  // Cấu trúc thư mục đa cấp
  const [folderTree, setFolderTree] = useState<Record<string, string[]>>({
    root: ['TOÁN 12', 'TOÁN 11', 'TOÁN 10', 'KIỂM TRA 2026-2027', 'ÔN TẬP RÈN LUYỆN'],
    'TOÁN 12': ['TO12-GK1', 'TO12-CK1', 'TO12-GK2', 'TO12-CK2'],
    'TOÁN 11': ['TO11-GK1', 'TO11-CK1', 'TO11-GK2', 'TO11-CK2'],
    'TOÁN 10': ['TO10-GK1', 'TO10-CK1', 'TO10-GK2', 'TO10-CK2'],
  });

  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);

  // Thư mục hiện tại đang mở
  const currentParentKey = folderPath.length === 0 ? 'root' : folderPath[folderPath.length - 1];
  const currentSubFolders = folderTree[currentParentKey] || [];

  // Tạo thư mục mới trong thư mục hiện tại
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim().toUpperCase();
    const existing = folderTree[currentParentKey] || [];
    if (existing.includes(name)) {
      alert('Thư mục này đã tồn tại!');
      return;
    }
    setFolderTree((prev) => ({
      ...prev,
      [currentParentKey]: [...existing, name],
    }));
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  // Mở 1 thư mục con
  const handleOpenFolder = (folderName: string) => {
    setFolderPath([...folderPath, folderName]);
  };

  // Điều hướng Breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setFolderPath([]); // Về thư mục gốc Tất cả
    } else {
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  // Xóa đề thi
  const handleDeleteTest = (id: string, fileName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đề "${fileName}"?`)) {
      deleteStoredTest(id);
      setStoredTests(getStoredTestBank());
    }
  };

  // Lọc theo tìm kiếm
  const filteredFolders = currentSubFolders.filter((f) =>
    f.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTests = storedTests.filter((t) =>
    (t.fileName && t.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.displayName && t.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* 1. THANH TÌM KIẾM & 3 NÚT LỆNH TRÊN CÙNG (CHUẨN 100% THEO ẢNH) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-200" /> Tạo đề từ ngân hàng chung
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi
          </button>

          <button
            type="button"
            onClick={() => setIsCreateFolderOpen(true)}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-300" /> Tạo thư mục
          </button>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG BREADCRUMB (CHUẨN 100%: Tất cả > TOÁN 12...) */}
      <div className="flex items-center space-x-2 text-sm font-bold px-1">
        <button
          type="button"
          onClick={() => handleBreadcrumbClick(-1)}
          className={`cursor-pointer transition-colors ${
            folderPath.length === 0 ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          Tất cả
        </button>

        {folderPath.map((folder, idx) => {
          const isLast = idx === folderPath.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(idx)}
                className={`cursor-pointer transition-colors ${
                  isLast ? 'text-blue-600 font-black' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {folder}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. BẢNG DANH SÁCH THƯ MỤC & ĐỀ THI (CHUẨN BẢNG ẢNH 134 & 135) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3.5">Tên</th>
                <th className="p-3.5 text-center w-28">Số bài đã nộp</th>
                <th className="p-3.5 text-center w-28">Trạng Thái</th>
                <th className="p-3.5 w-32">Đã Giao Cho</th>
                <th className="p-3.5 w-36">Thời gian giao đề</th>
                <th className="p-3.5 w-28">Thời gian tạo</th>
                <th className="p-3.5 text-center w-24">Giá đề thi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* DANH SÁCH CÁC THƯ MỤC TRONG ĐƯỜNG DẪN HIỆN TẠI */}
              {filteredFolders.map((fName, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleOpenFolder(fName)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3.5 flex items-center gap-3 font-bold text-slate-900 group-hover:text-blue-600">
                    <Folder className="w-5 h-5 text-slate-700 fill-slate-600 shrink-0 group-hover:text-blue-600 group-hover:fill-blue-500" />
                    <span>{fName}</span>
                  </td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-500 font-mono">2026</td>
                  <td className="p-3.5 text-center text-slate-400">Miễn phí</td>
                </tr>
              ))}

              {/* NẾU LÀ THƯ MỤC CON CUỐI: HIỂN THỊ CÁC ĐỀ THI CỦA KỲ THI ĐÓ */}
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-center">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3.5">
                    <div
                      onClick={() => onSelectTest && test.test && onSelectTest(test.test)}
                      className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{test.fileName || test.displayName}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-emerald-700">16 bài</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      Đang mở
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-semibold">{test.className || 'Khối 12'}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">23/04/2026</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">2026</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => test.test && exportTestToWord(test.test)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Tải Word"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTest(test.id, test.fileName)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Xóa đề"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO THƯ MỤC MỚI */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-blue-600" /> Tạo thư mục mới
              </h3>
              <button onClick={() => setIsCreateFolderOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên thư mục trong {currentParentKey === 'root' ? 'Tất cả' : currentParentKey}:
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="VD: TO12-GK1, HỌC KỲ 1..."
                className="w-full p-2 border rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsCreateFolderOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold">Hủy</button>
              <button onClick={handleCreateFolder} className="px-4 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold shadow">Tạo thư mục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestBankModal;
