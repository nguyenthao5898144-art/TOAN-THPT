import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import {
  Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft,
  Filter, Settings, BookOpen, FolderPlus,
  QrCode, KeyRound, CloudDownload, Download, ChevronDown,
  User, Calendar, Newspaper, BarChart2, Share2, MoreHorizontal, Edit3, Copy, Archive
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      {
        id: '1',
        name: '10A2',
        students: [
          { id: 'hs_1', name: 'Nguyễn Văn A', username: 'ngvanA2193', phone: '0123456789', parentPhone: '0987654321', email: 'nguyenvana@gmail.com', dob: '23/02/2001', gender: 'Nam', code: '00000001', className: 'Lớp 1A2' },
          { id: 'hs_2', name: 'Phạm Thị B', username: 'phthiB1202', phone: '0123456790', parentPhone: '0987654322', email: 'phamthib@gmail.com', dob: '25/06/2001', gender: 'Nữ', code: '00000002', className: 'Lớp 10A3' },
          { id: 'hs_3', name: 'Hồ Văn E1', username: 'hovanE1', phone: '0123456793', parentPhone: '', email: '', dob: '', gender: 'Nữ', code: '', className: 'Lớp 10A4' },
          { id: 'hs_4', name: 'Phạm Thị BC', username: 'phamlai', phone: '0123456732', parentPhone: '', email: '', dob: '', gender: '', code: '', className: '' },
          { id: 'hs_5', name: 'Hồ Văn ED', username: 'hophi', phone: '0123456777', parentPhone: '', email: '', dob: '', gender: '', code: '', className: '' },
        ],
      },
      { id: '2', name: '10A10', students: [] },
      { id: '3', name: '10A4', students: [] },
      { id: '4', name: '12A6', students: [] },
    ];
  });

  const [level, setLevel] = useState<'grid' | 'detail'>('detail');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [classSubTab, setClassSubTab] = useState<'students' | 'tests' | 'news' | 'grades' | 'courses'>('students');

  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('10A2');

  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [excelText, setExcelText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => { saveClasses(classes); }, [classes]);
  const curClass = classes.find((c) => c.id === selId) || classes[0] || { id: '1', name: '10A2', students: [] };

  // 1. TẢI FILE BIỂU MẪU ĐÚNG 11 CỘT VÀ 5 HỌC SINH MẪU (CHUẨN ẢNH 169)
  const handleDownloadSample = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const cName = curClass?.name || '10A2';

    const csv = '\uFEFF' +
      'STT,Họ và tên,Username,Số điện thoại,Số điện thoại phụ huynh,Email,Ngày sinh,Giới tính,Số báo danh,Mật khẩu,Lớp\n' +
      '1,Nguyễn Văn A,ngvanA2193,0123456789,0987654321,nguyenvana@gmail.com,23/02/2001,Nam,00000001,,Lớp 1A2\n' +
      '2,Phạm Thị B,phthiB1202,0123456790,0987654322,phamthib@gmail.com,25/06/2001,Nữ,00000002,,Lớp 10A3\n' +
      '3,Hồ Văn E1,hovanE1,0123456793,,,,Nữ,,,Lớp 10A4\n' +
      '4,Phạm Thị BC,phamlai,0123456732,,,,,,,\n' +
      '5,Hồ Văn ED,hophi,0123456777,,,,,,,';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `list-student_${cName}_${day}_${month}_${year}.csv`;
    a.click();
  };

  // 2. XUẤT DANH SÁCH HỌC SINH CỦA LỚP
  const handleExportClassList = () => {
    if (!curClass.students?.length) {
      alert('Lớp chưa có học sinh!');
      return;
    }
    const lines = ['STT,Họ và tên,Username,Số điện thoại,Số điện thoại phụ huynh,Email,Ngày sinh,Giới tính,Số báo danh,Lớp'];
    curClass.students.forEach((s: any, idx) => {
      lines.push(`${idx + 1},"${s.name}","${s.username || ''}","${s.phone || ''}","${s.parentPhone || ''}","${s.email || ''}","${s.dob || ''}","${s.gender || ''}","${s.code || ''}","${s.className || curClass.name}"`);
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `Danh_sach_lop_${curClass.name}.csv`;
    a.click();
  };

  // 3. GIẢI MÃ FILE .XLSX TRỰC TIẾP
  const parseXlsxFile = async (file: File): Promise<string> => {
    try {
      const zip = await JSZip.loadAsync(file);
      const sstFile = zip.file('xl/sharedStrings.xml');
      const sharedStrings: string[] = [];
      if (sstFile) {
        const sstXml = await sstFile.async('text');
        const doc = new DOMParser().parseFromString(sstXml, 'text/xml');
        const siTags = doc.getElementsByTagName('si');
        for (let i = 0; i < siTags.length; i++) {
          sharedStrings.push(siTags[i].textContent || '');
        }
      }

      const sheetFile = zip.file('xl/worksheets/sheet1.xml');
      if (!sheetFile) return '';
      const sheetXml = await sheetFile.async('text');
      const doc = new DOMParser().parseFromString(sheetXml, 'text/xml');
      const rows = doc.getElementsByTagName('row');

      const lines: string[] = [];
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getElementsByTagName('c');
        const rowVals: Record<string, string> = {};
        for (let c = 0; c < cells.length; c++) {
          const cell = cells[c];
          const ref = cell.getAttribute('r') || '';
          const col = ref.replace(/[0-9]/g, '');
          const type = cell.getAttribute('t');
          let val = '';
          if (type === 's') {
            const idx = parseInt(cells[c].textContent || '0', 10);
            val = sharedStrings[idx] || '';
          } else {
            val = cell.textContent || '';
          }
          rowVals[col] = val.trim();
        }
        const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
        const line = cols.map((k) => rowVals[k] || '').join('\t');
        if (line.trim()) lines.push(line);
      }
      return lines.join('\n');
    } catch {
      return '';
    }
  };

  // 4. BÓC TÁCH CHUẨN XÁC ĐỦ 11 CỘT (MẪU ẢNH 169)
  const parseStudentData = (text: string): Student[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: Student[] = [];

    lines.forEach((line, index) => {
      if (line.includes('STT') || line.includes('Họ và tên') || line.includes('Username')) return;
      const p = line.split(/[\t,;]/).map((s) => s.replace(/^"|"$/g, '').trim());
      if (p.length >= 2) {
        result.push({
          id: `std_${Date.now()}_${index}`,
          name: p.slice(1, 2)[0] || p.slice(0, 1)[0] || `Học sinh ${index + 1}`,
          username: p.slice(2, 3)[0] || '',
          phone: p.slice(3, 4)[0] || '',
          parentPhone: p.slice(4, 5)[0] || '',
          email: p.slice(5, 6)[0] || '',
          dob: p.slice(6, 7)[0] || '',
          gender: p.slice(7, 8)[0] || '',
          code: p.slice(8, 9)[0] || '',
          password: p.slice(9, 10)[0] || '123',
          className: p.slice(10, 11)[0] || curClass.name,
        } as any);
      }
    });
    return result;
  };

  // 5. TỰ ĐỘNG LƯU VÀO LỚP ĐANG MỞ
  const autoSaveToClass = (rawText: string) => {
    const newSts = parseStudentData(rawText);
    if (!newSts.length) {
      alert('Không tìm thấy danh sách học sinh hợp lệ trong file!');
      return;
    }

    const updated = classes.map((c) => {
      if (c.id === curClass.id) {
        return {
          ...c,
          students: [...(c.students || []), ...newSts],
        };
      }
      return c;
    });

    setClasses(updated);
    saveClasses(updated);
    setIsExcel(false);
    setFileName('');
    setExcelText('');
    alert(`Đã lưu thành công ${newSts.length} học sinh vào lớp ${curClass.name}!`);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    if (f.name.toLowerCase().endsWith('.xlsx')) {
      const extracted = await parseXlsxFile(f);
      setExcelText(extracted);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setExcelText((ev.target?.result as string) || '');
      reader.readAsText(f);
    }
  };

  const filteredStudents = (curClass.students || []).filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.code?.includes(search)
  );

  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4 font-sans"
      onClick={() => {
        setIsAddMenuOpen(false);
        setActiveCardMenuId(null);
      }}
    >
      {/* 1. MÀN HÌNH DANH SÁCH CÁC LỚP */}
      {level === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsAddMenuOpen(!isAddMenuOpen); }}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>

                {isAddMenuOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-2xl border p-1.5 z-40 text-xs font-bold text-slate-700 space-y-1 animate-in fade-in text-left">
                    <div onClick={() => { setIsAddMenuOpen(false); setNewClassName(''); setIsCreateClassOpen(true); }} className="p-2.5 hover:bg-slate-50 hover:text-blue-700 rounded-xl flex items-center gap-2.5 cursor-pointer">
                      <Plus className="w-4 h-4 text-blue-600" /> Tạo lớp học
                    </div>
                    <div onClick={() => { setIsAddMenuOpen(false); setIsExcel(true); }} className="p-2.5 hover:bg-slate-50 hover:text-blue-700 rounded-xl flex items-center gap-2.5 cursor-pointer">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Tạo danh sách lớp bằng excel
                    </div>
                  </div>
                )}
              </div>

              <button type="button" className="px-3.5 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm"><Filter className="w-4 h-4 text-slate-500" /> Bộ lọc</button>
              <button type="button" className="p-2 bg-white border rounded-xl shadow-sm"><Settings className="w-4 h-4 text-slate-500" /></button>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-3 cursor-pointer select-none">
              <ChevronDown className="w-4 h-4 text-slate-600" />
              <span>Khác ({classes.length} lớp)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => { setSelId(cls.id); setLevel('detail'); }}
                  className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-3 transition-all relative"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-slate-900">{cls.name}</h3>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveCardMenuId(activeCardMenuId === cls.id ? null : cls.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {activeCardMenuId === cls.id && (
                        <div className="absolute right-0 top-7 w-44 bg-white rounded-2xl shadow-2xl border p-1.5 z-40 text-xs font-bold text-slate-700 space-y-1 text-left">
                          <div onClick={() => { const nn = prompt('Sửa tên lớp:', cls.name); if (nn) setClasses(classes.map(c => c.id === cls.id ? { ...c, name: nn.toUpperCase() } : c)); setActiveCardMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"><Edit3 className="w-4 h-4" /> Sửa lớp</div>
                          <div onClick={() => { setClasses([...classes, { ...cls, id: `c_${Date.now()}`, name: `${cls.name} - Copy` }]); setActiveCardMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"><Copy className="w-4 h-4" /> Nhân bản lớp</div>
                          <div onClick={() => { if (confirm(`Xóa lớp "${cls.name}"?`)) setClasses(classes.filter(c => c.id !== cls.id)); setActiveCardMenuId(null); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 cursor-pointer border-t"><Trash2 className="w-4 h-4" /> Xóa lớp</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Sĩ số: <strong className="text-slate-700">{cls.students?.length || 0}</strong></span>
                    <span>Năm học: <strong className="text-slate-700">2026 - 2027</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================= */
        /* 2. MÀN HÌNH CHI TIẾT LỚP HỌC (CHUẨN 100% 11 CỘT THEO ẢNH 169) */
        /* ======================================================= */
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setLevel('grid')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Menu bên trái */}
            <div className="md:col-span-3 bg-white p-3 rounded-2xl border shadow-sm space-y-1 text-xs font-bold text-slate-700">
              <button onClick={() => setClassSubTab('students')} className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 ${classSubTab === 'students' ? 'bg-blue-900 text-white shadow' : 'hover:bg-slate-50'}`}>
                <User className="w-4 h-4" /> Danh sách học sinh
              </button>
              <button onClick={() => setClassSubTab('tests')} className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 ${classSubTab === 'tests' ? 'bg-blue-900 text-white shadow' : 'hover:bg-slate-50'}`}>
                <Calendar className="w-4 h-4" /> Bài tập, đề thi
              </button>
              <button onClick={() => setClassSubTab('news')} className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 ${classSubTab === 'news' ? 'bg-blue-900 text-white shadow' : 'hover:bg-slate-50'}`}>
                <Newspaper className="w-4 h-4" /> Bảng tin
              </button>
              <button onClick={() => setClassSubTab('grades')} className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 ${classSubTab === 'grades' ? 'bg-blue-900 text-white shadow' : 'hover:bg-slate-50'}`}>
                <BarChart2 className="w-4 h-4" /> Bảng điểm
              </button>
              <button onClick={() => setClassSubTab('courses')} className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 ${classSubTab === 'courses' ? 'bg-blue-900 text-white shadow' : 'hover:bg-slate-50'}`}>
                <BookOpen className="w-4 h-4" /> Khóa học trong lớp
              </button>
            </div>

            {/* VÙNG NỘI DUNG CHÍNH: BẢNG DANH SÁCH 11 CỘT CHUẨN XÁC */}
            <div className="md:col-span-9 bg-white p-6 rounded-3xl border shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900">{curClass.name}</h1>
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-4 h-4" /></span>
                  <span className="px-3 py-0.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">2026 - 2027</span>
                </div>
                <button type="button" className="p-2 bg-white border rounded-xl hover:bg-slate-50">
                  <Settings className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-3 bg-slate-50/70 border rounded-2xl flex items-center justify-between text-xs text-slate-500">
                <span>Chưa chia sẻ với ai</span>
                <button onClick={() => alert(`Link: ${window.location.origin}/?mode=student`)} className="px-3.5 py-1.5 bg-white border rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ
                </button>
              </div>

              {/* THANH TÌM KIẾM & NÚT NHẬP/XUẤT */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm học sinh..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleExportClassList} className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất danh sách
                    </button>
                    <button onClick={() => setIsExcel(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                      <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel (.xlsx)
                    </button>
                  </div>
                </div>

                {/* BẢNG 11 CỘT CHUẨN XÁC THEO ĐÚNG ẢNH EXCEL 169 CỦA THẦY */}
                <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                    <thead className="bg-blue-800 text-white font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 text-center w-12 border-r border-blue-700">STT</th>
                        <th className="p-3 min-w-[150px] border-r border-blue-700">Họ và tên</th>
                        <th className="p-3 min-w-[110px] border-r border-blue-700">Username</th>
                        <th className="p-3 min-w-[110px] border-r border-blue-700">Số điện thoại</th>
                        <th className="p-3 min-w-[120px] border-r border-blue-700">SĐT phụ huynh</th>
                        <th className="p-3 min-w-[160px] border-r border-blue-700">Email</th>
                        <th className="p-3 min-w-[90px] border-r border-blue-700 text-center">Ngày sinh</th>
                        <th className="p-3 min-w-[80px] border-r border-blue-700 text-center">Giới tính</th>
                        <th className="p-3 min-w-[100px] border-r border-blue-700 text-center">Số báo danh</th>
                        <th className="p-3 min-w-[90px] border-r border-blue-700 text-center">Lớp</th>
                        <th className="p-3 text-center w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredStudents.map((st: any, i: number) => {
                        const isFemale = st.gender?.toLowerCase().includes('nữ');
                        return (
                          <tr key={st.id || i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-500 border-r">{i + 1}</td>
                            <td className="p-3 font-bold text-slate-900 border-r">{st.name}</td>
                            <td className="p-3 font-mono text-slate-700 border-r">{st.username || '---'}</td>
                            <td className="p-3 font-mono text-slate-700 border-r">{st.phone || '---'}</td>
                            <td className="p-3 font-mono text-slate-500 border-r">{st.parentPhone || '---'}</td>
                            <td className="p-3 text-slate-600 border-r">{st.email || '---'}</td>
                            <td className="p-3 text-center font-mono text-slate-600 border-r">{st.dob || '---'}</td>
                            <td className="p-3 text-center font-bold border-r">
                              {isFemale ? (
                                <span className="text-pink-600 font-bold flex items-center justify-center gap-1">Nữ ♀</span>
                              ) : st.gender ? (
                                <span className="text-blue-600 font-bold flex items-center justify-center gap-1">Nam ♂</span>
                              ) : '---'}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800 border-r">{st.code || '---'}</td>
                            <td className="p-3 text-center font-medium text-slate-700 border-r">{st.className || curClass.name}</td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Xóa học sinh "${st.name}"?`)) {
                                      setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: c.students.filter((s: any) => s.id !== st.id) } : c));
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Xóa học sinh"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`Mật khẩu học sinh: 123`)}
                                  className="p-1 text-amber-500 hover:text-amber-700"
                                  title="Đặt lại mật khẩu 123"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. MODAL "THÊM NHANH BẰNG FILE EXCEL" (CHUẨN ẢNH 167) */}
      {/*
