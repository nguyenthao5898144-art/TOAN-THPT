import React, { useState, useEffect } from 'react';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses, parseStudentListText } from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search, Edit3,
  ChevronLeft, ArrowUpDown, Filter, QrCode, Download, Share2, KeyRound
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: Array(32).fill(null).map((_, i) => ({ id: `hs_10a10_${i}`, name: `Học sinh 10A10 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '2', name: '10A6', students: Array(41).fill(null).map((_, i) => ({ id: `hs_10a6_${i}`, name: `Học sinh 10A6 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '3', name: '12A6', students: [
        { id: 'hs_1', name: 'Châu Ngô Nhật Ái', code: '67339301', phone: '0901234567' },
        { id: 'hs_2', name: 'Lê Thị Yến Duy', code: '67339302', phone: '0901234568' },
        { id: 'hs_3', name: 'Lê Vũ Đạt', code: '67339303', phone: '0901234569' },
      ]}
    ];
  });

  const [viewLevel, setViewLevel] = useState<'grid' | 'detail'>('grid');
  const [selectedClassId, setSelectedClassId] = useState<string>('3');
  const [search, setSearch] = useState<string>('');
  const [isAddClass, setIsAddClass] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [isImport, setIsImport] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const newC: ClassRoom = { id: `cls_${Date.now()}`, name: newClassName.trim().toUpperCase(), students: [] };
    setClasses([...classes, newC]);
    setSelectedClassId(newC.id);
    setNewClassName('');
    setIsAddClass(false);
  };

  const handleImportStudents = () => {
    if (!importText.trim()) return;
    const parsed = parseStudentListText(importText);
    setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: [...(c.students || []), ...parsed] } : c));
    setImportText('');
    setIsImport(false);
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = (curClass.students || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code && s.code.includes(search)));

  if (viewLevel === 'grid') {
    return (
      <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh sách lớp</h2>
            <p className="text-xs text-slate-500 font-bold">{classes.length} lớp</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsAddClass(true)} className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer">
              <Plus className="w-4 h-4" /> Thêm
            </button>
            <button className="px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm"><Filter className="w-3.5 h-3.5" /> Bộ lọc</button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên lớp..." className="w-full pl-10 pr-3 py-2 bg-white border rounded-xl text-xs sm:text-sm outline-none shadow-sm" />
          </div>
          <button className="px-3 py-2 bg-white border rounded-xl text-xs font-bold flex items-center gap-1 text-slate-700 shrink-0"><ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp theo tên</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredClasses.map((cls) => (
            <div key={cls.id} onClick={() => { setSelectedClassId(cls.id); setViewLevel('detail'); }} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-2 transition-all">
              <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Sĩ số: <strong className="text-slate-800">{cls.students?.length || 0}</strong></span>
                <span>Năm học: <strong className="text-slate-800">2026 - 2027</strong></span>
              </div>
            </div>
          ))}
        </div>

        {isAddClass && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm">Thêm lớp học</h3>
                <button onClick={() => setIsAddClass(false)}><X className="w-4 h-4" /></button>
              </div>
              <input type="text" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Tên lớp (VD: 12A6)..." className="w-full p-2 border rounded-lg text-sm font-bold uppercase outline-none" autoFocus />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={() => setIsAddClass(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
                <button onClick={handleAddClass} className="px-4 py-1.5 bg-blue-900 text-white rounded text-xs font-bold shadow">Tạo lớp</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      <button onClick={() => setViewLevel('grid')} className="px-3.5 py-1.5 bg-white border rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-slate-50 cursor-pointer">
        <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
      </button>

      <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black">{curClass.name}</h1>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-4 h-4" /></span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold">2026 - 2027</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsImport(true)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Nhập từ Excel
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?mode=student`); alert('Đã sao chép link học sinh!'); }} className="px-3.5 py-1.5 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
              <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo ID, tên, SĐT, SBD..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none" />
        </div>

        <div className="border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-600 uppercase border-b">
            <div className="col-span-1 text-center">STT</div>
            <div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {curClass.students?.length || 0}</div>
            <div className="col-span-2 text-center">SỐ BÁO DANH</div>
            <div className="col-span-2 text-center">ĐỀ THI ĐÃ LÀM</div>
            <div className="col-span-2 text-center">HÀNH ĐỘNG</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((st, i) => (
              <div key={st.id} className="grid grid-cols-12 p-3 items-center text-xs hover:bg-slate-50">
                <div className="col-span-1 text-center font-bold text-slate-500">{i + 1}</div>
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">{st.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{st.name} ♂</h4>
                    <p className="text-[10px] text-slate-400">ID: {st.code || '67339301'} • SĐT: {st.phone || 'Chưa có'}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-slate-700">{st.code || `SBD${i + 1}`}</div>
                <div className="col-span-2 text-center font-bold text-blue-700">15 / 22 đề thi</div>
                <div className="col-span-2 flex justify-center gap-1.5">
                  <button onClick={() => { if (confirm(`Xóa "${st.name}"?`)) setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== st.id) } : c)); }} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => alert(`Đặt lại mật khẩu cho "${st.name}" về 123`)} className="p-1 text-amber-500 hover:text-amber-700"><KeyRound className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isImport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Nhập danh sách học sinh ({curClass.name})</h3>
              <button onClick={() => setIsImport(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Dán danh sách từ Excel vào đây (Họ tên [Tab] SBD [Tab] SĐT):</p>
            <textarea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Châu Ngô Nhật Ái&#9;67339301&#9;0901234567" className="w-full p-2 border rounded text-xs font-mono outline-none" />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsImport(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
              <button onClick={handleImportStudents} className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold shadow">Nhập danh sách</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
