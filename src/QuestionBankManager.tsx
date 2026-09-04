import React, { useState, useEffect } from 'react';
import { Search, Plus, Landmark, Trash2, BookOpen, Share2, X, ChevronRight, Check } from 'lucide-react';

export interface QuestionBankItem {
  id: string;
  name: string;
  grade: string;
  subject: string;
  book: string;
  questionCount: number;
  sharedStatus: 'none' | 'shared' | 'received';
  createdAt: string;
}

export const QuestionBankManager: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBankItem[]>(() => {
    try {
      const saved = localStorage.getItem('stored_question_banks_list');
      return saved ? JSON.parse(saved) : [
        {
          id: 'qb_1',
          name: 'Ứng dụng Đạo hàm khảo sát đồ thị hàm số',
          grade: 'Khối 12',
          subject: 'Toán',
          book: 'Toán 12 - Kết nối tri thức',
          questionCount: 120,
          sharedStatus: 'none',
          createdAt: '2026',
        },
        {
          id: 'qb_2',
          name: 'Phương pháp tọa độ trong không gian Oxyz',
          grade: 'Khối 12',
          subject: 'Toán',
          book: 'Toán 12 - Cánh diều',
          questionCount: 85,
          sharedStatus: 'none',
          createdAt: '2026',
        },
      ];
    } catch {
      return [];
    }
  });

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('Tất cả');
  const [selectedShareFilter, setSelectedShareFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // MODAL TẠO NGÂN HÀNG CÂU HỎI MỚI (CHUẨN 100% THEO ẢNH)
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('');
  const [newBankGrade, setNewBankGrade] = useState<string>('Khối 12');
  const [newBankSubject, setNewBankSubject] = useState<string>('Toán');
  const [newBankBook, setNewBankBook] = useState<string>('Toán 12 - Kết nối tri thức');

  useEffect(() => {
    try {
      localStorage.setItem('stored_question_banks_list', JSON.stringify(banks));
    } catch {}
  }, [banks]);

  // Danh sách bộ sách theo khối lớp
  const getBooksByGrade = (g: string) => {
    return [
      `Toán ${g.replace('Khối ', '')} - Kết nối tri thức`,
      `Toán ${g.replace('Khối ', '')} - Cánh diều`,
      `Toán ${g.replace('Khối ', '')} - Chân trời sáng tạo`,
    ];
  };

  const handleGradeChange = (g: string) => {
    setNewBankGrade(g);
    setNewBankBook(`Toán ${g.replace('Khối ', '')} - Kết nối tri thức`);
  };

  const handleCreate = () => {
    if (!newBankName.trim()) {
      alert('Vui lòng nhập tên ngân hàng câu hỏi!');
      return;
    }
    const item: QuestionBankItem = {
      id: `qb_${Date.now()}`,
      name: newBankName.trim(),
      grade: newBankGrade,
      subject: newBankSubject,
      book: newBankBook,
      questionCount: 0,
      sharedStatus: 'none',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setBanks([...banks, item]);
    setNewBankName('');
    setIsCreateOpen(false);
    alert(`Đã tạo thành công ngân hàng: "${item.name}"!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Xóa ngân hàng câu hỏi "${name}"?`)) {
      setBanks(banks.filter((b) => b.id !== id));
    }
  };

  const gradeList = ['Tất cả', 'Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9', 'Khối 10', 'Khối 11', 'Khối 12', 'Khác'];

  const filteredBanks = banks.filter((b) => {
    const matchGrade = selectedGradeFilter === 'Tất cả' || b.grade === selectedGradeFilter;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.book.toLowerCase().includes(search.toLowerCase());
    return matchGrade && matchSearch;
  });

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* 1. HEADER */}
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

      {/* 3. BỘ LỌC LỚP & CHIA SẺ (CHUẨN THEO ẢNH) */}
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
            className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ⊖ Không chia sẻ
          </button>
          <button
            type="button"
            onClick={() => setSelectedShareFilter('shared')}
            className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            🔗 Đã chia sẻ
          </button>
          <button
            type="button"
            onClick={() => setSelectedShareFilter('received')}
            className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ✉ Được chia sẻ
          </button>
        </div>
      </div>

      {/* 4. HIỂN THỊ CÁC THẺ NGÂN HÀNG CÂU HỎI */}
      {filteredBanks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Landmark className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Chưa có ngân hàng câu hỏi nào</h3>
          <p className="text-xs text-slate-400">Bấm nút "+ Tạo ngân hàng mới" ở trên để khởi tạo ngân hàng câu hỏi cho môn học!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all space-y-3 cursor-pointer group">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px] border border-blue-200">
                  {b.grade} • {b.book}
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
                  Số lượng: <strong className="text-emerald-600 font-bold">{b.questionCount} câu hỏi</strong>
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Năm học: {b.createdAt}</span>
                <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                  Mở ngân hàng <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. CỬA SỔ MODAL: "TẠO NGÂN HÀNG CÂU HỎI MỚI" (CHUẨN 100% THEO ẢNH) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border font-sans animate-in fade-in">
            {/* Tiêu đề modal */}
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Tạo ngân hàng câu hỏi mới
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Các trường nhập liệu chuẩn 100% theo ảnh */}
            <div className="space-y-4 text-xs">
              {/* 1. Tên */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tên</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="Nhập tên"
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  autoFocus
                />
              </div>

              {/* 2. Khối học & Môn học (2 cột song song) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Khối học</label>
                  <select
                    value={newBankGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Khối 12">Khối 12</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 10">Khối 10</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Môn học</label>
                  <select
                    value={newBankSubject}
                    onChange={(e) => setNewBankSubject(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Toán">Toán</option>
                  </select>
                </div>
              </div>

              {/* 3. Sách (SGK GDPT 2018) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Sách</label>
                <select
                  value={newBankBook}
                  onChange={(e) => setNewBankBook(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl font-bold text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getBooksByGrade(newBankGrade).map((bookName) => (
                    <option key={bookName} value={bookName}>
                      {bookName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hai nút hành động: Hủy & Lưu (Chuẩn theo ảnh) */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-7 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager;
