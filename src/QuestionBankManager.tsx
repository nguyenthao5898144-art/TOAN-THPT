import React, { useState, useEffect } from 'react';
import { Search, Plus, Landmark, Trash2, BookOpen, Share2, X, ChevronRight } from 'lucide-react';

export interface QuestionBankItem {
  id: string;
  name: string;
  grade: string;
  questionCount: number;
  sharedStatus: 'none' | 'shared' | 'received';
  createdAt: string;
}

export const QuestionBankManager: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBankItem[]>(() => {
    try {
      const saved = localStorage.getItem('stored_question_banks_list');
      return saved ? JSON.parse(saved) : [
        { id: 'qb_1', name: 'Ngân hàng Ứng dụng Đạo hàm & Khảo sát hàm số', grade: 'Khối 12', questionCount: 120, sharedStatus: 'none', createdAt: '2026' },
        { id: 'qb_2', name: 'Ngân hàng Hình học không gian Oxyz', grade: 'Khối 12', questionCount: 85, sharedStatus: 'none', createdAt: '2026' },
        { id: 'qb_3', name: 'Ngân hàng Thống kê & Xác suất GDPT 2018', grade: 'Khối 12', questionCount: 64, sharedStatus: 'none', createdAt: '2026' },
      ];
    } catch {
      return [];
    }
  });

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('Tất cả');
  const [selectedShareFilter, setSelectedShareFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('');
  const [newBankGrade, setNewBankGrade] = useState<string>('Khối 12');

  useEffect(() => {
    try {
      localStorage.setItem('stored_question_banks_list', JSON.stringify(banks));
    } catch {}
  }, [banks]);

  const handleCreate = () => {
    if (!newBankName.trim()) return;
    const item: QuestionBankItem = {
      id: `qb_${Date.now()}`,
      name: newBankName.trim(),
      grade: newBankGrade,
      questionCount: 0,
      sharedStatus: 'none',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setBanks([...banks, item]);
    setNewBankName('');
    setIsCreateOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Xóa ngân hàng câu hỏi "${name}"?`)) {
      setBanks(banks.filter((b) => b.id !== id));
    }
  };

  const gradeList = ['Tất cả', 'Khối 10', 'Khối 11', 'Khối 12', 'Khác'];

  const filteredBanks = banks.filter((b) => {
    const matchGrade = selectedGradeFilter === 'Tất cả' || b.grade === selectedGradeFilter;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    return matchGrade && matchSearch;
  });

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* 1. HEADER CHUẨN MẪU ẢNH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Ngân hàng câu hỏi</h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5">{filteredBanks.length} Ngân hàng</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo ngân hàng mới
        </button>
      </div>

      {/* 2. Ô TÌM KIẾM */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3" />
      </div>

      {/* 3. BỘ LỌC LỚP & CHIA SẺ (CHUẨN ẢNH) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Dòng 1: LỚP */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> LỚP:
          </span>
          {gradeList.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGradeFilter(g)}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                selectedGradeFilter === g
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100"></div>

        {/* Dòng 2: CHIA SẺ */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" /> CHIA SẺ:
          </span>
          <button
            type="button"
            onClick={() => setSelectedShareFilter('none')}
            className={`px-3 py-1 rounded-full font-bold ${
              selectedShareFilter === 'none' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⊖ Không chia sẻ
          </button>
          <button
            type="button"
            onClick={() => setSelectedShareFilter('shared')}
            className={`px-3 py-1 rounded-full font-bold ${
              selectedShareFilter === 'shared' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔗 Đã chia sẻ
          </button>
          <button
            type="button"
            onClick={() => setSelectedShareFilter('received')}
            className={`px-3 py-1 rounded-full font-bold ${
              selectedShareFilter === 'received' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ✉ Được chia sẻ
          </button>
        </div>
      </div>

      {/* 4. KHU VỰC CÁC NGÂN HÀNG CÂU HỎI */}
      {filteredBanks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Landmark className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Chưa có ngân hàng câu hỏi nào</h3>
          <p className="text-xs text-slate-400">Bấm nút "+ Tạo ngân hàng mới" ở trên để khởi tạo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all space-y-3 cursor-pointer group">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px] border border-blue-200">
                  {b.grade}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(b.id, b.name); }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Xóa ngân hàng này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {b.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Số câu hỏi: <strong className="text-emerald-600 font-bold">{b.questionCount} câu</strong>
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Khởi tạo: {b.createdAt}</span>
                <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                  Mở ngân hàng <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO NGÂN HÀNG MỚI */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" /> Tạo ngân hàng câu hỏi mới
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên ngân hàng câu hỏi (*):</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="VD: Ngân hàng Đạo hàm & Khảo sát hàm số..."
                  className="w-full p-2.5 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                <select
                  value={newBankGrade}
                  onChange={(e) => setNewBankGrade(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold bg-white outline-none"
                >
                  <option value="Khối 12">Khối 12</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                Hủy
              </button>
              <button onClick={handleCreate} className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow">
                Tạo ngân hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager;
