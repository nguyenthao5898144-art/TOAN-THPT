import React, { useState, useEffect } from 'react';
import { GeneratedTest } from './types';
import { StoredTestItem, getStoredTestBank, saveTestToBank, deleteStoredTest } from './testBankStorage';
import { exportTestToWord } from './wordExporter';
import {
  Search, Plus, FolderPlus, FileText,
  Clock, Users, Download, Trash2, Edit3, CheckCircle2,
  Folder, Share2, Sparkles, Database, Check
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
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('test_bank_custom_folders');
      return saved ? JSON.parse(saved) : ['TOÁN 12', 'TOÁN 11', 'TOÁN 10', 'KIỂM TRA 2026-2027', 'ÔN TẬP RÈN LUYỆN'];
    } catch {
      return ['TOÁN 12', 'TOÁN 11', 'TOÁN 10', 'KIỂM TRA 2026-2027', 'ÔN TẬP RÈN LUYỆN'];
    }
  });

  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('test_bank_custom_folders', JSON.stringify(customFolders));
    } catch {}
  }, [customFolders]);

  // Tạo thư mục mới
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim().toUpperCase();
    if (customFolders.includes(name)) {
      alert('Thư mục này đã tồn tại!');
      return;
    }
    setCustomFolders([...customFolders, name]);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  // Xóa 1 đề thi
  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đề "${fileName}" khỏi Kho lưu trữ?`)) {
      deleteStoredTest(id);
      setStoredTests(getStoredTestBank());
    }
  };

  // Mở đề thi
  const handleOpen = (item: StoredTestItem) => {
    if (onSelectTest && item.test) {
      onSelectTest(item.test);
    }
  };

  // Xuất file Word
  const handleExport = (item: StoredTestItem) => {
    if (item.test) {
      exportTestToWord(item.test);
    }
  };

  // Lọc đề thi theo tìm kiếm
  const filteredTests = storedTests.filter((t) =>
    (t.fileName && t.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.displayName && t.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.topicName && t.topicName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 4 đề xuất nổi bật trên cùng
  const featuredTests = storedTests.slice(0, 4);

  return (
    <div className="font-sans space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* 1. THANH TÌM KIẾM & 3 NÚT LỆNH TRÊN CÙNG (CHUẨN MẪU ẢNH) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm đề thi, bài học, năm học..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        {/* 3 Nút chức năng góc phải */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút 1: Tạo đề từ ngân hàng chung */}
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-200" /> Tạo đề từ ngân hàng chung
          </button>

          {/* Nút 2: + Tạo đề thi */}
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi
          </button>

          {/* Nút 3: Tạo thư mục */}
          <button
            type="button"
            onClick={() => setIsCreateFolderOpen(true)}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-300" /> Tạo thư mục
          </button>
        </div>
      </div>

      {/* 2. KHỐI "ĐƯỢC ĐỀ XUẤT" (CÁC THẺ ĐỀ THI GẦN ĐÂY - DÃY THẺ NGANG) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide px-1">
          Được đề xuất
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTests.length === 0 ? (
            <div className="col-span-4 p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Chưa có đề thi nào trong kho lưu trữ. Bấm <strong>"+ Tạo đề thi"</strong> để thêm đề mới vào kho!
            </div>
          ) : (
            featuredTests.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleOpen(item)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex items-start gap-3 relative group"
              >
                {/* Icon file Word màu cam */}
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate leading-snug group-hover:text-blue-600">
                    {item.fileName || `Đề 0${idx + 1}_Đề ôn THPT Quốc Gia 2026.docx`}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ngày tạo: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '01/06/2026'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Thời gian làm bài: <strong>{item.durationMinutes || 90} phút</strong>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Lượt làm:</span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black">
                      {item.totalQuestions ? Math.max(4, item.totalQuestions - 6) : 16}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. KHỐI "TẤT CẢ" (BẢNG QUẢN LÝ THƯ MỤC & ĐỀ THI CHUẨN MẪU ẢNH) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            Tất cả
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {customFolders.length} thư mục • {filteredTests.length} đề thi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3">Tên</th>
                <th className="p-3 text-center w-28">Số bài đã nộp</th>
                <th className="p-3 text-center w-28">Trạng Thái</th>
                <th className="p-3 w-32">Đã Giao Cho</th>
                <th className="p-3 w-36">Thời gian giao đề</th>
                <th className="p-3 w-28">Thời gian tạo</th>
                <th className="p-3 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* DANH SÁCH THƯ MỤC */}
              {customFolders.map((folderName, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3 flex items-center gap-2.5 font-bold text-slate-900 cursor-pointer">
                    <Folder className="w-5 h-5 text-slate-600 fill-slate-500 shrink-0" />
                    <span>{folderName}</span>
                    {folderName.includes('AZOTA') && (
                      <span className="px-1.5 py-0.2 bg-cyan-600 text-white rounded text-[9px] font-bold">
                        Azota
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-400">---</td>
                  <td className="p-3 text-center text-slate-400">---</td>
                  <td className="p-3 text-slate-400">---</td>
                  <td className="p-3 text-slate-400">---</td>
                  <td className="p-3 text-slate-500">2026</td>
                  <td className="p-3 text-center text-slate-400">Thư mục</td>
                </tr>
              ))}

              {/* DANH SÁCH ĐỀ THI TRONG KHO */}
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3">
                    <div
                      onClick={() => handleOpen(test)}
                      className="flex items-center gap-2.5 font-bold text-blue-950 cursor-pointer hover:text-blue-600"
                    >
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate max-w-xs">{test.fileName || test.displayName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {test.totalQuestions || 16} bài
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      Đang mở
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">
                    {test.className || 'Toàn khối 12'}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : '01/06/2026'}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : '2026'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExport(test)}
                        className="p-1 text-slate-500 hover:text-blue-600"
                        title="Tải file Word"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(test.id, test.fileName)}
                        className="p-1 text-slate-500 hover:text-rose-600"
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-blue-600" /> Tạo thư mục mới
              </h3>
              <button onClick={() => setIsCreateFolderOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên thư mục:</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="VD: KIỂM TRA HỌC KỲ 1..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsCreateFolderOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold">
                Hủy
              </button>
              <button onClick={handleCreateFolder} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow">
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestBankModal;
