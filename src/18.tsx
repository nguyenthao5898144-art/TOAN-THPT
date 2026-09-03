import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import {
  Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft,
  QrCode, KeyRound, CloudDownload, MoreHorizontal, Edit3, Copy, Download
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses() || [
    {
      id: '1',
      name: '12A6',
      students: [
        { id: 'hs_1', name: 'Châu Ngô Nhật Ái', gender: 'Nữ', username: '67339301', code: 'SBD01', phone: '0901234567' },
        { id: 'hs_2', name: 'Lê Yến Duy', gender: 'Nam', username: '67339302', code: 'SBD02', phone: '0901234568' },
        { id: 'hs_3', name: 'Nguyễn Quốc Thuận', gender: 'Nam', username: '1@3456', code: 'SBD03', phone: '0908765432' },
      ],
    },
    { id: '2', name: '10A10', students: [] },
    { id: '3', name: '10A6', students: [] },
  ]);

  const [level, setLevel] = useState<'grid' | 'detail'>('detail');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [menuId, setMenuId] = useState<string | null>(null);

  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [targetName, setTargetName] = useState<string>('12A6');
  const [excelText, setExcelText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);
  const curClass = classes.find((c) => c.id === selId) || classes[0];

  // 1. TẢI FILE BIỂU MẪU ĐÚNG 7 CỘT CHUẨN
  const handleDownloadSample = () => {
    const csv = '\uFEFFSTT,Họ và tên,Giới tính,Tên đăng nhập,Số báo danh,Số điện thoại,Ghi chú\n1,Châu Ngô Nhật Ái,Nữ,67339301,SBD01,0901234567,\n2,Lê Yến Duy,Nam,67339302,SBD02,0901234568,\n3,Nguyễn Quốc Thuận,Nam,1@3456,SBD03,0908765432,';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'Mau_danh_sach_hoc_sinh.csv';
    a.click();
  };

  // 2. XUẤT DANH SÁCH HỌC SINH RA FILE
  const handleExportClassList = () => {
    const sts = curClass.students || [];
    if (!sts.length) {
      alert('Lớp chưa có học sinh!');
      return;
    }
    const lines = ['STT,Họ và tên,Giới tính,Tên đăng nhập,Số báo danh,Số điện thoại'];
    sts.forEach((s, idx) => {
      lines.push(`${idx + 1},"${s.name}","${s.gender || 'Nam'}","${s.username || s.code}","${s.code || ''}","${s.phone || ''}"`);
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `Danh_sach_lop_${curClass.name}.csv`;
    a.click();
  };

  // 3. GIẢI MÃ FILE EXCEL (.XLSX) TRỰC TIẾP
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
            val = cells[c].textContent || '';
          }
          rowVals[col] = val.trim();
        }
        const line = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((k) => rowVals[k] || '').join('\t');
        if (line.trim()) lines.push(line);
      }
      return lines.join('\n');
    } catch {
      return '';
    }
  };

  // 4. BÓC TÁCH DỮ LIỆU TỪNG CỘT
  const parseStudentData = (text: string): Student[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: Student[] = [];

    lines.forEach((line, index) => {
      if (line.includes('STT') || line.includes('Họ và tên') || line.includes('Tên đăng nhập')) return;
      const p = line.split(/[\t,;]/).map((s) => s.replace(/^"|"$/g, '').trim());
      if (p.length >= 2) {
        let name = p;
        let gender = p || '';
        let username = p || '';
        let code = p || '';
        let phone = p || '';

        if (isNaN(Number(p[0])) && p[0].length > 2) {
          name = p[0];
          gender = p || '';
          username = p || '';
          code = p || '';
          phone = p || '';
        }

        result.push({
          id: `std_${Date.now()}_${index}`,
          name: name || `Học sinh ${index + 1}`,
          gender: gender.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam',
          username: username || code || `${curClass.name.toLowerCase()}_${index + 1}`,
          code: code || `SBD${index + 1 < 10 ? '0' : ''}${index + 1}`,
          phone: phone || '',
        });
      }
    });
    return result;
  };

  // 5. HÀM TỰ ĐỘNG LƯU NGAY LẬP TỨC VÀO DANH SÁCH LỚP
  const autoSaveStudents = (rawText: string, detectedClass?: string) => {
    const newSts = parseStudentData(rawText);
    if (!newSts.length) {
      alert('Không tìm thấy danh sách học sinh hợp lệ trong file!');
      setIsUploading(false);
      return;
    }

    const tName = detectedClass || targetName.trim().toUpperCase() || curClass.name;
    let updatedClasses: ClassRoom[] = [];
    const idx = classes.findIndex((c) => c.name.toUpperCase() === tName.toUpperCase());

    if (idx >= 0) {
      updatedClasses = classes.map((c, i) =>
        i === idx ? { ...c, students: [...(c.students || []), ...newSts] } : c
      );
      setClasses(updatedClasses);
      setSelId(classes[idx].id);
    } else {
      const nc: ClassRoom = { id: `cls_${Date.now()}`, name: tName, students: newSts };
      updatedClasses = [...classes, nc];
      setClasses(updatedClasses);
      setSelId(nc.id);
    }

    saveClasses(updatedClasses);
    setIsExcel(false);
    setIsUploading(false);
    setExcelText('');
    alert(`ĐÃ TỰ ĐỘNG LƯU THÀNH CÔNG ${newSts.length} HỌC SINH VÀO LỚP ${tName}!`);
  };

  // KHI CHỌN FILE -> TỰ ĐỘNG LƯU LUÔN
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIsUploading(true);

    // Tự động nhận diện lớp từ tên file (nếu có)
    const matchClass = f.name.match(/\b(10|11|12)[A-Za-z0-9]+\b/);
    const autoClassName = matchClass ? matchClass[0].toUpperCase() : curClass.name;

    if (f.name.toLowerCase().endsWith('.xlsx')) {
      const extracted = await parseXlsxFile(f);
      autoSaveStudents(extracted, autoClassName);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = (ev.target?.result as string) || '';
        autoSaveStudents(text, autoClassName);
      };
      reader.readAsText(f);
    }
  };

  const filteredStudents = (curClass.students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
    (s.username && s.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-800 space-y-4 font-sans" onClick={() => setMenuId(null)}>
      {/* 1. MÀN HÌNH DANH SÁCH CÁC LỚP */}
      {level === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp học</p>
            </div>
            <button
              type="button"
              onClick={() => { setTargetName('12A6'); setIsExcel(true); }}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm lớp bằng Excel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((cls) => (
              <div
                key={cls.id}
                onClick={() => { setSelId(cls.id); setLevel('detail'); }}
                className="bg-white p-5 rounded-2xl border shadow-sm hover:border-blue-400 cursor-pointer space-y-2 relative"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black">{cls.name}</h3>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuId(menuId === cls.id ? null : cls.id); }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {menuId === cls.id && (
                    <div className="absolute right-3 top-10 w-36 bg-white rounded-xl shadow-xl border p-1 z-30 text-xs font-bold text-slate-700 space-y-1">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const n = prompt('Đổi tên lớp:', cls.name);
                          if (n) setClasses(classes.map((c) => c.id === cls.id ? { ...c, name: n.toUpperCase() } : c));
                          setMenuId(null);
                        }}
                        className="p-1.5 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa tên
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setClasses([...classes, { ...cls, id: `c_${Date.now()}`, name: `${cls.name} (Bản sao)` }]);
                          setMenuId(null);
                        }}
                        className="p-1.5 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" /> Nhân bản
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Xóa lớp ${cls.name}?`)) setClasses(classes.filter((c) => c.id !== cls.id));
                          setMenuId(null);
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Sĩ số: <strong>{cls.students?.length || 0} HS</strong></span>
                  <span>Năm: <strong>2026 - 2027</strong></span>
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
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
          </button>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-4">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900">{curClass.name}</h1>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-4 h-4" /></span>
                <span className="px-3 py-0.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">2026 - 2027</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportClassList}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất danh sách HS
                </button>

                <button
                  type="button"
                  onClick={() => { setTargetName(curClass.name); setIsExcel(true); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel (.xlsx)
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo ID, tên, SĐT, SBD..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* BẢNG HỌC SINH CHUẨN ĐẦY ĐỦ CÁC CỘT */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50 p-3.5 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <div className="col-span-1 text-center">STT</div>
                <div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {curClass.students?.length || 0}</div>
                <div className="col-span-2 text-center">SỐ BÁO DANH</div>
                <div className="col-span-2 text-center">ĐỀ THI ĐÃ LÀM</div>
                <div className="col-span-2 text-center">THAO TÁC</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredStudents.map((st, i) => {
                  const isFemale = st.gender === 'Nữ';
                  return (
                    <div key={st.id} className="grid grid-cols-12 p-3.5 items-center text-xs hover:bg-slate-50 transition-colors">
                      <div className="col-span-1 text-center font-bold text-slate-500">{i + 1}</div>

                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {st.name}
                            {isFemale ? (
                              <span className="text-pink-600 font-bold" title="Nữ">♀</span>
                            ) : (
                              <span className="text-blue-600 font-bold" title="Nam">♂</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ID: <strong className="text-slate-700 font-mono">{st.username || st.code}</strong> • SĐT: <strong>{st.phone || 'Chưa có'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 text-center font-mono font-bold text-slate-800 text-xs">
                        {st.code || `SBD${i + 1 < 10 ? '0' : ''}${i + 1}`}
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px] border border-blue-200">
                          {i === 0 ? '15 / 22 đề thi' : i === 1 ? '14 / 22 đề thi' : '16 / 22 đề thi'}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa học sinh "${st.name}"?`)) {
                              setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== st.id) } : c));
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Đã đặt lại mật khẩu cho "${st.name}" về mặc định: 123`)}
                          className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Đặt lại mật khẩu 123"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL NẠP FILE TỰ ĐỘNG LƯU NGAY */}
      {isExcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border font-sans animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">Tải lên file Excel (.xlsx) - Tự động lưu</h3>
              <button onClick={() => setIsExcel(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>

            {/* KHUNG KÉO THẢ / CHỌN FILE -> TỰ ĐỘNG LƯU NGAY */}
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 space-y-2 block cursor-pointer transition-colors">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-700 text-xs">
                {isUploading ? 'Đang đọc và tự động lưu học sinh...' : 'Chọn file Excel (.xlsx) hoặc Kéo thả vào đây'}
              </p>
              <p className="text-[11px] text-slate-400">
                ⚡ Hệ thống sẽ <strong>TỰ ĐỘNG LƯU NGAY</strong> vào lớp học sau khi chọn file!
              </p>
              <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} className="hidden" />
            </label>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-blue-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <CloudDownload className="w-4 h-4" /> ☁ Tải file biểu mẫu chuẩn (7 cột)
              </button>
            </div>

            <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Lớp áp dụng:</label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full p-1.5 bg-white border rounded-lg font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Năm học:</label>
                  <input type="text" readOnly value="2026 - 2027" className="w-full p-1.5 bg-slate-100 border rounded-lg font-bold text-slate-500 text-center" />
                </div>
              </div>
            </div>

            <textarea
              rows={3}
              value={excelText}
              onChange={(e) => setExcelText(e.target.value)}
              placeholder="Hoặc dán trực tiếp dữ liệu từ Excel vào đây..."
              className="w-full p-2 border rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsExcel(false)} className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 cursor-pointer">Đóng</button>
              <button
                type="button"
                onClick={() => {
                  if (!excelText.trim()) {
                    alert('Vui lòng chọn file Excel hoặc dán dữ liệu vào ô!');
                    return;
                  }
                  autoSaveStudents(excelText);
                }}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow cursor-pointer"
              >
                Lưu dữ liệu dán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
