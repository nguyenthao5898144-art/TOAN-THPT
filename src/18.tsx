import React, { useState, useEffect } from 'react';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses, parseStudentListText } from './classStorage';
import { Users, Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft, ArrowUpDown, QrCode, Share2, KeyRound, MoreHorizontal, Edit3, Copy, Archive, CloudDownload } from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: Array(32).fill(null).map((_, i) => ({ id: `10a10_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '2', name: '10A6', students: Array(41).fill(null).map((_, i) => ({ id: `10a6_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isExcelOpen, setIsExcelOpen] = useState<boolean>(false);
  const [excelTargetName, setExcelTargetName] = useState<string>('12A6');
  const [excelText, setExcelText] = useState<string>('');
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameVal, setRenameVal] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0] || { id: 'def', name: '12A6', students: [] };

  const handleDownloadSample = () => {
    const csv = '\uFEFF' + 'STT,Họ và tên,Tên đăng nhập,Số báo danh,Số điện thoại\n1,Châu Ngô Nhật Ái,67339301,SBD01,0901234567\n2,Lê Thị Yến Duy,67339302,SBD02,0901234568';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Mau_danh_sach_hoc_sinh.csv';
    a.click();
  };

  const handleConfirmExcel = () => {
    const tName = excelTargetName.trim().toUpperCase() || '12A6';
    const newSts = excelText.trim()
      ? parseStudentListText(excelText)
      : Array(35).fill(null).map((_, i) => ({ id: `std_${Date.now()}_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` }));
    const idx = classes.findIndex((c) => c.name === tName);
    if (idx >= 0) {
      setClasses(classes.map((c, i) => i === idx ? { ...c, students: [...(c.students || []), ...newSts] } : c));
      setSelectedClassId(classes[idx].id);
    } else {
      const newC: ClassRoom = { id: `cls_${Date.now()}`, name: tName, students: newSts };
      setClasses([...classes, newC]);
      setSelectedClassId(newC.id);
    }
    setIsExcelOpen(false);
    setExcelText('');
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = (curClass.students || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code && s.code.includes(search)));

  return (
    <div className="font-sans space-y-4 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800" onClick={() => setActiveMenuId(null)}>
      {viewLevel === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp</p>
            </div>
            <button onClick={() => { setExcelTargetName('12A6'); setIsExcelOpen(true); }} className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer">
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên lớp..." className="w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs outline-none shadow-sm" />
            </div>
            <button className="px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0"><ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp theo tên</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredClasses.map((cls) => (
              <div key={cls.id} onClick={() => { setSelectedClassId(cls.id); setViewLevel('detail'); }} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-2 transition-all relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"><MoreHorizontal className="w-5 h-5" /></button>
                    {activeMenuId === cls.id && (
                      <div className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-xl border p-1 z-30 text-xs font-bold text-slate-700 space-y-0.5 text-left">
                        <div onClick={() => { setSelectedClassId(cls.id); setRenameVal(cls.name); setIsRenameOpen(true); setActiveMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Sửa lớp</div>
                        <div onClick={() => { setClasses([...classes, { id: `cls_${Date.now()}`, name: `${cls.name} (Bản sao)`, students: [...(cls.students || [])] }]); setActiveMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"><Copy className="w-3.5 h-3.5" /> Nhân bản lớp</div>
                        <div onClick={() => { alert(`Đã lưu trữ ${cls.name}`); setActiveMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"><Archive className="w-3.5 h-3.5" /> Đưa vào lưu trữ</div>
                        <div onClick={() => { if (confirm(`Xóa ${cls.name}?`)) setClasses(classes.filter((c) => c.id !== cls.id)); setActiveMenuId(null); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2 cursor-pointer border-t pt-1"><Trash2 className="w-3.5 h-3.5" /> Xóa lớp</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Sĩ số: <strong className="text-slate-800">{cls.students?.length || 0}</strong></span>
                  <span>Năm học: <strong className="text-slate-800">2026 - 2027</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setViewLevel('grid')} className="px-3.5 py-1.5 bg-white border rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-slate-50 cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
          </button>

          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black">{curClass.name}</h1>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-4 h-4" /></span>
                <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold">2026 - 2027</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setExcelTargetName(curClass.name); setIsExcelOpen(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?mode=student`); alert('Đã sao chép link học sinh!'); }} className="px-3.5 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo ID, tên, SĐT, SBD..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none" />
            </div>

            <div className="border rounded-2xl overflow-hidden">
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
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">{st.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <h4 className="font-bold text-slate-900">{st.name} ♂</h4>
                        <p className="text-
