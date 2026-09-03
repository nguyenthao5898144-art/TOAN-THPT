import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import {
  Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft,
  Filter, Settings, BookOpen, FolderPlus,
  QrCode, KeyRound, CloudDownload, Download,
  User, Calendar, Newspaper, BarChart2, Share2, Inbox
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s || [
      {
        id: '1',
        name: '10A2',
        students: [
          { id: 'hs_1', name: 'Nguyễn Văn A', gender: 'Nam', username: 'ngvanA2193', code: '00000001', phone: '0123456789' },
          { id: 'hs_2', name: 'Phạm Thị B', gender: 'Nữ', username: 'phthiB1202', code: '00000002', phone: '0123456790' },
          { id: 'hs_3', name: 'Hồ Văn E1', gender: 'Nữ', username: 'hovanE1', code: '00000003', phone: '0123456793' },
        ],
      },
    ];
  });

  const [level, setLevel] = useState<'grid' | 'detail'>('detail');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [classSubTab, setClassSubTab] = useState<'students' | 'tests' | 'news' | 'grades' | 'courses'>('students');

  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('10A2');

  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [excelText, setExcelText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => { saveClasses(classes); }, [classes]);
  const curClass = classes.find((c) => c.id === selId) || classes[0] || { id: '1', name: '10A2', students: [] };

  // 1. TẢI FILE BIỂU MẪU ĐÚNG 11 CỘT CHUẨN Y HỆT ẢNH CỦA THẦY
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

  // 2. XUẤT DANH SÁCH LỚP HIỆN TẠI
  const handleExportClassList = () => {
    if (!curClass.students?.length) {
      alert('Lớp chưa có học sinh!');
      return;
    }
    const lines = ['STT,Họ và tên,Username,Số điện thoại,Giới tính,Số báo danh'];
    curClass.students.forEach((s, idx) => {
      lines.push(`${idx + 1},"${s.name}","${s.username || s.code}","${s.phone || ''}","${s.gender || 'Nam'}","${s.code || ''}"`);
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `Danh_sach_lop_${curClass.name}.csv`;
    a.click();
  };

  // 3. GIẢI MÃ FILE .XLSX BẰNG JSZIP
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

  // 4. BÓC TÁCH CHUẨN XÁC 11 CỘT (AZOTA FORM)
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

        // Nếu là biểu mẫu 11 cột của Thầy (Image 165)
        if (parts.length >= 8) {
          name = parts.slice(1, 2)[0] || '';
          username = parts.slice(2, 3)[0] || '';
          phone = parts.slice(3, 4)[0] || '';
          gender = parts.slice(7, 8)[0] || 'Nam';
          code = parts.slice(8, 9)[0] || '';
        } else {
          // Biểu mẫu 7 cột rút gọn
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
          gender: gender.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam',
          username: username || code || `hs_${index + 1}`,
          code: code || `SBD${index + 1 < 10 ? '0' : ''}${index + 1}`,
          phone: phone || '',
        });
      }
    });
    return result;
  };

  // 5. TỰ ĐỘNG LƯU VÀO ĐÚNG LỚP ĐANG MỞ
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

  const filteredStudents = (curClass.students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
    (s.username && s.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4 font-sans" onClick={() => setIsAddMenuOpen(false)}>
      {/* 1. MÀN HÌNH DANH SÁCH CÁC LỚP */}
      {level === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp học</p>
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
                    <div onClick={() => { setIsAddMenuOpen(false); setNewClassName('10A2'); setIsCreateClassOpen(true); }} className="p-2.5 hover:bg-slate-50 hover:text-blue-700 rounded-xl flex items-center gap-2.5 cursor-pointer">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => { setSelId(cls.id); setLevel('detail'); }}
                className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-2.5 transition-all"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
                  <span className="text-xs text-blue-600 font-bold">Vào lớp →</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Sĩ số: <strong className="text-slate-800">{cls.students?.length || 0} học sinh</strong></span>
                  <span>Năm: <strong className="text-slate-800">2026 - 2027</strong></span>
                </div>
              </div>
            ))}
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
            {/* Menu phụ bên trái */}
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

            {/* Nội dung bảng học sinh */}
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

              {/* BẢNG DANH SÁCH HỌC SINH */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm học sinh theo tên, SBD..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleExportClassList} className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất danh sách
                    </button>
                    <button onClick={() => setIsExcel(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                      <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel (.xlsx)
                    </button>
                  </div>
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
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Username: <strong className="text-slate-700 font-mono">{st.username}</strong> • SĐT: <strong>{st.phone || 'Chưa có'}</strong>
                            </p>
                          </div>
                        </div>
                        <div className="col-span-3 text-center font-mono font-bold text-slate-800 text-xs">{st.code}</div>
                        <div className="col-span-3 flex justify-center gap-2">
                          <button onClick={() => setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== st.id) } : c))} className="p-1.5 text-slate-400 hover:text-rose-600">
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
      {/* 3. MODAL "THÊM NHANH BẰNG FILE EXCEL" CHUẨN 100% ẢNH 163 */}
      {/* ======================================================= */}
      {isExcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-100 font-sans animate-in fade-in">
            <h3 className="font-black text-base text-slate-900">
              Thêm nhanh bằng file excel
            </h3>

            <label className="rounded-2xl p-10 text-center bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 space-y-3 block cursor-pointer transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-blue-700 font-black">Kéo thả file Excel</strong> hoặc Click để chọn file
              </p>
              {fileName && (
                <p className="text-xs text-emerald-700 font-bold font-mono">
                  ✓ Đã chọn file: {fileName}
                </p>
              )}
              <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} className="hidden" />
            </label>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-blue-700 hover:text-blue-800 hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CloudDownload className="w-4 h-4 text-blue-600" /> Tải file biểu mẫu
              </button>
            </div>

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
                onClick={() => {
                  if (!excelText.trim()) {
                    alert('Vui lòng chọn file Excel trước khi bấm Xác nhận!');
                    return;
                  }
                  autoSaveToClass(excelText);
                }}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
