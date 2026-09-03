import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import {
  Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft,
  ArrowUpDown, Filter, Settings, BookOpen, FolderPlus,
  QrCode, KeyRound, CloudDownload, Download, ChevronDown,
  User, Calendar, Newspaper, BarChart2, Share2, Inbox,
  MoreHorizontal, Edit3, Copy, Archive
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: [] },
      { id: '2', name: '10A2', students: [
        { id: 'hs_1', name: 'Nguyễn Văn A', gender: 'Nam', username: 'ngvanA2193', code: '00000001', phone: '0123456789' },
        { id: 'hs_2', name: 'Phạm Thị B', gender: 'Nữ', username: 'phthiB1202', code: '00000002', phone: '0123456790' },
        { id: 'hs_3', name: 'Hồ Văn E1', gender: 'Nữ', username: 'hovanE1', code: '00000003', phone: '0123456793' },
      ]},
      { id: '3', name: '10A4', students: [] },
      { id: '4', name: '12A6', students: [] },
    ];
  });

  const [level, setLevel] = useState<'grid' | 'detail'>('detail');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [classSubTab, setClassSubTab] = useState<'students' | 'tests' | 'news' | 'grades' | 'courses'>('students');

  // Menu 3 chấm trên thẻ lớp
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);

  // Modal tạo lớp học
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('10A2');

  // MODAL "THÊM NHANH BẰNG FILE EXCEL" (CHUẨN 100% ẢNH 167)
  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [excelText, setExcelText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => { saveClasses(classes); }, [classes]);
  const curClass = classes.find((c) => c.id === selId) || classes[0] || { id: '1', name: '10A10', students: [] };

  // 1. TẢI BIỂU MẪU CHUẨN 11 CỘT (ẢNH 165)
  const handleDownloadSample = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const cName = curClass?.name || '10A2';

    const csv = '\uFEFF' +
      'STT,Họ và tên,Username,Số điện thoại,Số điện thoại phụ huynh,Email,Ngày sinh,Giới tính,Số báo danh,Mật khẩu,Lớp\n' +
      '1,Nguyễn Văn A,ngvanA2193,0123456789,0987654321,nguyenvana@gmail.com,23/02/2001,Nam,00000001,,Lớp 10A2\n' +
      '2,Phạm Thị B,phthiB1202,0123456790,0987654322,phamthib@gmail.com,25/06/2001,Nữ,00000002,,Lớp 10A3\n' +
      '3,Hồ Văn E1,hovanE1,0123456793,,,,Nữ,,,Lớp 10A4';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `list-student_${cName}_${day}_${month}_${year}.csv`;
    a.click();
  };

  // 2. GIẢI MÃ FILE .XLSX
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

  // 3. BÓC TÁCH CHUẨN XÁC DỮ LIỆU TỪNG CỘT
  const parseStudentData = (text: string): Student[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: Student[] = [];

    lines.forEach((line, index) => {
      if (line.includes('STT') || line.includes('Họ và tên') || line.includes('Username')) return;
      const parts = line.split(/[\t,;]/).map((s) => s.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        let name = '';
        let username = '';
        let phone = '';
        let gender = 'Nam';
        let code = '';

        if (parts.length >= 8) {
          name = parts.slice(1, 2)[0] || '';
          username = parts.slice(2, 3)[0] || '';
          phone = parts.slice(3, 4)[0] || '';
          gender = parts.slice(7, 8)[0] || 'Nam';
          code = parts.slice(8, 9)[0] || '';
        } else {
          const isNum = !isNaN(Number(parts.slice(0, 1)[0]));
          name = isNum ? parts.slice(1, 2)[0] : parts.slice(0, 1)[0];
          gender = isNum ? parts.slice(2, 3)[0] : parts.slice(1, 2)[0];
          username = isNum ? parts.slice(3, 4)[0] : parts.slice(2, 3)[0];
          code = isNum ? parts.slice(4, 5)[0] : parts.slice(3, 4)[0];
          phone = isNum ? parts.slice(5, 6)[0] : parts.slice(4, 5)[0];
        }

        result.push({
          id: `std_${Date.now()}_${index}`,
          name: name || `Học sinh ${index + 1}`,
          gender: (gender || '').toLowerCase().includes('nữ') ? 'Nữ' : 'Nam',
          username: username || code || `hs_${index + 1}`,
          code: code || `SBD${index + 1 < 10 ? '0' : ''}${index + 1}`,
          phone: phone || '',
        });
      }
    });
    return result;
  };

  // 4. CHỌN FILE EXCEL HOẶC KÉO THẢ -> HIỆN THẺ XEM TRƯỚC FILE (CHUẨN ẢNH 167)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    // Tính dung lượng hiển thị (VD: 0.01mb)
    const mb = (f.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${mb}mb`);

    if (f.name.toLowerCase().endsWith('.xlsx')) {
      const extracted = await parseXlsxFile(f);
      setExcelText(extracted);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setExcelText((ev.target?.result as string) || '');
      reader.readAsText(f);
    }
  };

  // 5. BẤM NÚT "XÁC NHẬN" -> LƯU VÀO LỚP ĐANG MỞ
  const handleConfirmExcel = () => {
    if (!excelText.trim()) {
      alert('Vui lòng chọn file Excel trước khi bấm Xác nhận!');
      return;
    }

    const newSts = parseStudentData(excelText);
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
    setFileSize('');
    setExcelText('');
    alert(`Đã nạp thành công ${newSts.length} học sinh vào lớp ${curClass.name}!`);
  };

  const filteredStudents = (curClass.students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
    (s.username && s.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4 font-sans"
      onClick={() => {
        setIsAddMenuOpen(false);
        setActiveCardMenuId(null);
      }}
    >
      {/* 1. MÀN HÌNH DANH SÁCH LỚP */}
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
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>

                {isAddMenuOpen && (
                  <div
                    className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-2xl border p-1.5 z-40 text-xs font-bold text-slate-700 space-y-1 animate-in fade-in text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
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

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên lớp..."
                className="w-full pl-10 pr-3 py-2 bg-white border rounded-xl text-xs outline-none shadow-sm"
              />
            </div>
            <button className="px-3.5 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp theo tên
            </button>
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
        /* 2. MÀN HÌNH CHI TIẾT LỚP HỌC */
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setLevel('grid')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
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

              {/* BẢNG HỌC SINH */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm học sinh theo tên, SBD..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs outline-none" />
                  </div>
                  <button onClick={() => setIsExcel(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                    <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel (.xlsx)
                  </button>
                </div>

                <div className="border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-600 uppercase border-b">
                    <div className="col-span-1 text-center">STT</div>
                    <div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {curClass.students?.length || 0}</div>
                    <div className="col-span-3 text-center">SỐ BÁO DANH</div>
                    <div className="col-span-3 text-center">THAO TÁC</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredStudents.map((st, i) => (
                      <div key={st.id} className="grid grid-cols-12 p-3.5 items-center text-xs hover:bg-slate-50">
                        <div className="col-span-1 text-center font-bold text-slate-500">{i + 1}</div>
                        <div className="col-span-5 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${st.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                              {st.name} <span className={st.gender === 'Nữ' ? 'text-pink-600 font-bold' : 'text-blue-600 font-bold'}>{st.gender === 'Nữ' ? '♀' : '♂'}</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Username: <strong className="text-slate-700 font-mono">{st.username}</strong></p>
                          </div>
                        </div>
                        <div className="col-span-3 text-center font-mono font-bold text-slate-800 text-xs">{st.code}</div>
                        <div className="col-span-3 flex justify-center gap-2">
                          <button onClick={() => setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: c.students.filter((s) => s.id !== st.id) } : c))} className="p-1.5 text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => alert(`Mật khẩu học sinh: 123`)} className="p-1.5 text-amber-500">
                            <KeyRound className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. MODAL "THÊM NHANH BẰNG FILE EXCEL" (CHUẨN 100% ẢNH 167) */}
      {/* ======================================================= */}
      {isExcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-100 font-sans animate-in fade-in">
            <h3 className="font-black text-base text-slate-900">
              Thêm nhanh bằng file excel
            </h3>

            {/* HIỂN THỊ THẺ FILE PREVIEW KHI ĐÃ CHỌN (CHUẨN 100% Y HỆT ẢNH 167) */}
            {fileName ? (
              <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  {/* LOGO EXCEL XANH LÁ CHỮ X TRẮNG */}
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-black text-sm shadow">
                    X
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{fileName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{fileSize || '0.01mb'}</p>
                  </div>
                </div>

                {/* ICON THÙNG RÁC ĐỎ ĐỂ XÓA CHỌN LẠI FILE KHÁC */}
                <button
                  type="button"
                  onClick={() => {
                    setFileName('');
                    setFileSize('');
                    setExcelText('');
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Gỡ bỏ file đã chọn"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            ) : (
              /* KHUNG KÉO THẢ KHI CHƯA CHỌN FILE */
              <label className="rounded-2xl p-10 text-center bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 space-y-3 block cursor-pointer transition-all">
                <div className="w-12 h-12 bg-emerald-100/90 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-600">
                  <strong className="text-blue-700 font-black">Kéo thả file Excel</strong> hoặc Click để chọn file
                </p>
                <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} className="hidden" />
              </label>
            )}

            {/* LINK TẢI BIỂU MẪU */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-blue-700 hover:text-blue-800 hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CloudDownload className="w-4 h-4 text-blue-600" /> Tải file biểu mẫu
              </button>
            </div>

            {/* CẶP NÚT HỦY VÀ XÁC NHẬN (XÁC NHẬN MÀU XANH DƯƠNG ĐẬM CHUẨN ẢNH 167) */}
            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsExcel(false); setFileName(''); setExcelText(''); }}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmExcel}
                className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white font-black rounded-xl text-xs shadow transition-all cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM LỚP HỌC MỚI */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border font-sans animate-in fade-in">
            <h3 className="font-black text-base text-slate-900">Thêm lớp học</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Tên lớp</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Nhập tên lớp (VD: 10A2)..."
                  className="w-full p-2.5 border rounded-xl font-bold text-sm outline-none uppercase"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setIsCreateClassOpen(false)} className="px-5 py-2 bg-slate-100 rounded-xl text-xs font-bold">Hủy</button>
              <button
                onClick={() => {
                  if (!newClassName.trim()) return;
                  const nc: ClassRoom = { id: `cls_${Date.now()}`, name: newClassName.trim().toUpperCase(), students: [] };
                  setClasses([...classes, nc]);
                  setSelId(nc.id);
                  setIsCreateClassOpen(false);
                  setLevel('detail');
                }}
                className="px-6 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Lưu và đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
