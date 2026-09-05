import React, { useState, useEffect } from 'react';
import { 
  Folder, FolderPlus, FileText, Trash2, 
  Search, X, Check, BookOpen, Layers 
} from 'lucide-react';
import { getSavedMatrices, deleteMatrixFromBank, SavedMatrix } from './matrixStorage';

interface MatrixBankManagerProps {
  onClose?: () => void;
  onSelectMatrix?: (matrix: SavedMatrix) => void;
}

export const QuestionBankManager: React.FC<MatrixBankManagerProps> = ({ onClose, onSelectMatrix }) => {
  const [matrices, setMatrices] = useState<SavedMatrix[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('TẤT CẢ');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Chỉ giữ lại "TẤT CẢ", các thư mục sẽ tự động cập nhật theo dữ liệu thực tế hoặc do thầy tự tạo
  const [folders, setFolders] = useState<string[]>([
    'TẤT CẢ'
  ]);

  // Modal tạo thư mục ma trận mới
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    loadMatrices();
  }, []);

  const loadMatrices = () => {
    try {
      const data = getSavedMatrices();
      setMatrices(data || []);
      
      // Tự động quét các thư mục từ danh sách ma trận đã lưu để hiển thị nếu có
      if (data && data.length > 0) {
        const existingFolders = Array.from(new Set(data.map((m: any) => m.folderName).filter(Boolean)));
        setFolders(prev => Array.from(new Set([...prev, ...existingFolders])));
      }
    } catch (e) {
      console.error(e);
      setMatrices([]);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Thầy có chắc chắn muốn xóa ma trận "${title}" không?`)) {
      deleteMatrixFromBank(id);
      loadMatrices();
    }
  };

  const handleCreateFolder = () => {
    const trimmed = newFolderName.trim().toUpperCase();
    if (!trimmed) {
      alert('Vui lòng nhập tên thư mục!');
      return;
    }
    if (folders.includes(trimmed)) {
      alert('Thư mục này đã tồn tại!');
      return;
    }
    setFolders([...folders, trimmed]);
    setSelectedFolder(trimmed);
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
  };

  const filteredMatrices = matrices.filter((m: any) => {
    const folderMatch = selectedFolder === 'TẤT CẢ' || (m.folderName || '').toUpperCase() === selectedFolder;
    const searchMatch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return folderMatch && searchMatch;
  });

  return (
    <div className="font-sans bg-slate-50 min-h-screen p-4 sm:p-6 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & TÌM KIẾM */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                NGÂN HÀNG MA TRẬN ĐỀ THI
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Lưu trữ và quản lý khung ma trận kiến thức, tỷ lệ YCCĐ chương trình GDPT 2018
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm khung ma trận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* CỘT TRÁI: THƯ MỤC & NÚT TẠO MỚI */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
            <div className="flex items-center justify-between border-b pb-3 px-1">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Thư mục ma trận
              </span>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(true)}
                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" /> Tạo mới
              </button>
            </div>

            <div className="space-y-1.5">
              {folders.map((folder) => {
                const count = folder === 'TẤT CẢ' 
                  ? matrices.length 
                  : matrices.filter((m: any) => (m.folderName || '').toUpperCase() === folder).length;
                
                const isSelected = selectedFolder === folder;

                return (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                      <span className="truncate">{folder}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH MA TRẬN */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                Danh mục: <span className="text-emerald-600">{selectedFolder}</span> ({filteredMatrices.length} ma trận)
              </h2>
            </div>

            {filteredMatrices.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-500">
                  Chưa có khung ma trận nào được lưu trong mục này.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredMatrices.map((matrix: any) => (
                  <div 
                    key={matrix.id}
                    className="p-4 bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200 rounded-2xl transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono">
                          {matrix.folderName || `TOÁN ${matrix.grade || '10'}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {matrix.createdAt ? new Date(matrix.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2">
                        {matrix.title || 'Khung ma trận khảo sát'}
                      </h3>
                      
                      <p className="text-[11px] text-slate-500 font-medium">
                        Thời gian làm bài: <strong>{matrix.durationMinutes || 45} phút</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      {onSelectMatrix && (
                        <button
                          type="button"
                          onClick={() => onSelectMatrix(matrix)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> Dùng ma trận này
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(matrix.id, matrix.title)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                        title="Xóa ma trận"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL TẠO THƯ MỤC MỚI */}
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 font-sans">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-emerald-600" /> Tạo thư mục mới
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên thư mục (*):
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Tạo thư mục
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionBankManager;
