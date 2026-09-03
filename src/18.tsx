import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses } from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search,
  ChevronLeft, ArrowUpDown, QrCode, Share2, KeyRound,
  CloudDownload, MoreHorizontal, Edit3, Copy, Archive
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: Array(32).fill(null).map((_, i) => ({ id: `10a10_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '2', name: '10A6', students: Array(41).fill(null).map((_, i) => ({ id: `10a6_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '3', name: '12A6', students: [
        { id: 'hs_1', name: 'Châu Ngô Nhật Ái', gender: 'Nữ', username: '67339301', code: 'SBD01', phone: '0901234567' },
        { id: 'hs_2', name: 'Lê Yến Duy', gender: 'Nam', username: '67339302', code: 'SBD02', phone: '0901234568' },
      ]}
    ];
  });

  const [viewLevel, setViewLevel] = useState<'grid' | 'detail'>('grid');
  const [selectedClassId, setSelectedClassId] = useState<string>('3');
  const [search, setSearch] = useState<string>('');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameVal, setRenameVal] = useState<string>('');

  const [isExcelOpen, setIsExcelOpen] = useState<boolean>(false);
  const [excelTargetName, setExcelTargetName] = useState<string>('12A6');
  const [excelText, setExcelText] = useState<string>('');
  const [fileNameUploaded, setFileNameUploaded] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // 1. TẢI FILE BIỂU MẪU ĐÚNG 7 CỘT CHUẨN EXCEL NHƯ TRONG ẢNH
  const handleDownloadSample = () => {
    const csv = '\uFEFF' +
      'STT,Họ và tên,Giới tính,Tên đăng nhập,Số báo danh,Số điện thoại,Ghi chú\n' +
      '1,Châu Ngô Nhật Ái,Nữ,67339301,SBD01,0901234567,\n' +
      '2,Lê Yến Duy,Nam,67339302,SBD02,0901234568,';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Mau_danh_sach_hoc_sinh.csv';
    a.click();
  };

  // 2. BỘ GIẢI MÃ FILE EXCEL (.XLSX) TRỰC TIẾP BẰNG JSZIP VÀ DOMPARSER
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
          const ref = cells[c].getAttribute('r') || '';
          const col = ref.replace(/[0-9]/g, '');
          const type = cells[c].getAttribute('t');
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
    } catch (err) {
      console.error('Lỗi đọc xlsx:', err);
      return '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileNameUploaded(file.name);

    if (file.name.toLowerCase().endsWith('.xlsx')) {
      const extracted = await parseXlsxFile(file);
      setExcelText(extracted);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => setExcelText(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  // 3. TẠO DANH SÁCH HỌC SINH TỪ DỮ LIỆU ĐÃ ĐỌC
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

  const handleConfirmExcel = () => {
    const tName = excelTargetName.trim().toUpperCase() || curClass.name;
    const newSts = excelText.trim() ? parseStudentData(excelText) : [];

    if (!newSts.length) {
      alert('Chưa có dữ liệu học sinh! Vui lòng chọn file .xlsx hoặc dán danh sách.');
      return;
    }

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
    setFileNameUploaded('');
    setExcelText('');
    alert(`Đã nạp thành công ${newSts.length} học sinh vào lớp ${tName}!`);
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = (curClass?.students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code && s.code.includes(search)) ||
    (s.username && s.username.includes(search))
  );

  return (
    <div className="font-sans space-y-4 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800" onClick={() => setActiveMenuId(null)}>
      {/* CẤP 1: LƯỚI THẺ LỚP HỌC */}
      {viewLevel === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp học</p>
            </div>
            <button
              type="button"
              onClick={() => { setExcelTargetName('12A6'); setIsExcelOpen(true); }}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm lớp mới
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên lớp..."
                className="w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                onClick={() => { setSelectedClassId(cls.id); setViewLevel('detail'); }}
                className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-2 transition-all relative"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {activeMenuId === cls.id && (
                      <div className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-xl border p-1 z-30 text-xs font-bold text-slate-700 space-y-0.5 text-left">
                        <div onClick={() => { setSelectedClassId(cls.id); setRenameVal(cls.name); setIsRenameOpen(true); setActiveMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Sửa tên</div>
                        <div onClick={() => { setClasses([...classes, { id: `cls_${Date.now()}`, name: `${cls.name} (Sao chép)`, students: [...(cls.students || [])] }]); setActiveMenuId(null); }} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"><Copy className="w-3.5 h-3.5" /> Nhân bản</div>
                        <div onClick={() => { if (confirm(`Xóa lớp ${cls.name}?`)) set
