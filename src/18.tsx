import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import { Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft, QrCode, KeyRound, CloudDownload, MoreHorizontal, Edit3, Copy } from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses() || [
    { id: '1', name: '12A6', students: [
      { id: '1', name: 'Châu Ngô Nhật Ái', gender: 'Nữ', username: '67339301', code: 'SBD01', phone: '0901234567' },
      { id: '2', name: 'Lê Yến Duy', gender: 'Nam', username: '67339302', code: 'SBD02', phone: '0901234568' }
    ]}
  ]);

  const [level, setLevel] = useState<'grid' | 'detail'>('grid');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [targetName, setTargetName] = useState<string>('12A6');
  const [excelText, setExcelText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);
  const curClass = classes.find(c => c.id === selId) || classes[0];

  const handleDownloadSample = () => {
    const csv = '\uFEFFSTT,Họ và tên,Giới tính,Tên đăng nhập,Số báo danh,Số điện thoại,Ghi chú\n1,Châu Ngô Nhật Ái,Nữ,67339301,SBD01,0901234567,\n2,Lê Yến Duy,Nam,67339302,SBD02,0901234568,';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'Mau_danh_sach_hoc_sinh.csv';
    a.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.name.endsWith('.xlsx')) {
      try {
        const zip = await JSZip.loadAsync(f);
        const sst = (await zip.file('xl/sharedStrings.xml')?.async('text')) || '';
        const strings = Array.from(new DOMParser().parseFromString(sst, 'text/xml').getElementsByTagName('si')).map(s => s.textContent || '');
        const sheet = (await zip.file('xl/worksheets/sheet1.xml')?.async('text')) || '';
        const rows = Array.from(new DOMParser().parseFromString(sheet, 'text/xml').getElementsByTagName('row'));
        const txt = rows.map(r => Array.from(r.getElementsByTagName('c')).map(c => (c.getAttribute('t') === 's' ? strings[parseInt(c.textContent || '0', 10)] : c.textContent) || '').join('\t')).join('\n');
        setExcelText(txt);
      } catch { setExcelText(''); }
    } else {
      const r = new FileReader();
      r.onload = ev => setExcelText(ev.target?.result as string);
      r.readAsText(f);
    }
  };

  const handleConfirmExcel = () => {
    const lines = excelText.split(/\r?\n/).filter(l => l.trim() && !l.includes('STT') && !l.includes('Họ và tên'));
    const newSts: Student[] = lines.map((l, i) => {
      const p = l.split(/[\t,;]/).map(s => s.replace(/^"|"$/g, '').trim());
      const name = isNaN(Number(p[0])) ? p[0] : p;
      const g = (isNaN(Number(p[0])) ? p : p) || '';
      const u = (isNaN(Number(p[0])) ? p : p) || '';
      const c = (isNaN(Number(p[0])) ? p : p) || '';
      const ph = (isNaN(Number(p[0])) ? p : p) || '';
      return { id: `std_${Date.now()}_${i}`, name: name || `Học sinh ${i+1}`, gender: g.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam', username: u || c || `hs_${i+1}`, code: c || `SBD${i+1}`, phone: ph };
    });

    const idx = classes.findIndex(c => c.name.toUpperCase() === targetName.trim().toUpperCase());
    if (idx >= 0) {
      setClasses(classes.map((c, i) => i === idx ? { ...c, students: [...(c.students || []), ...newSts] } : c));
      setSelId(classes[idx].id);
    } else {
      const nc = { id: `cls_${Date.now()}`, name: targetName.trim().toUpperCase(), students: newSts };
      setClasses([...classes, nc]);
      setSelId(nc.id);
    }
    setIsExcel(false);
    alert(`Đã nạp ${newSts.length} học sinh thành công!`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-800 space-y-4 font-sans">
      {level === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div><h2 className="text-xl font-black">Danh sách lớp</h2><p className="text-xs text-slate-500">{classes.length} lớp học</p></div>
            <button onClick={() => setIsExcel(true)} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer"><Plus className="w-4 h-4" /> Thêm lớp bằng Excel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(cls => (
              <div key={cls.id} onClick={() => { setSelId(cls.id); setLevel('detail'); }} className="bg-white p-5 rounded-2xl border shadow-sm hover:border-blue-400 cursor-pointer space-y-2">
                <div className="flex justify-between items-center"><h3 className="text-lg font-black">{cls.name}</h3><span className="text-xs text-blue-600 font-bold">Xem lớp →</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>Sĩ số: <strong>{cls.students?.length || 0} HS</strong></span><span>Năm: <strong>2026 - 2027</strong></span></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setLevel('grid')} className="px-3 py-1.5 bg-white border rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"><ChevronLeft className="w-4 h-4" /> Quay lại danh sách lớp</button>
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2"><h1 className="text-2xl font-black">{curClass.name}</h1><span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold">2026 - 2027</span></div>
              <button onClick={() => { setTargetName(curClass.name); setIsExcel(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"><FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel (.xlsx)</button>
            </div>
            <div className="border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-600 uppercase border-b"><div className="col-span-1 text-center">STT</div><div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {curClass.students?.length || 0}</div><div className="col-span-3 text-center">TÊN ĐĂNG NHẬP / SBD</div><div className="col-span-3 text-center">THAO TÁC</div></div>
              <div className="divide-y divide-slate-100">
                {(curClass.students || []).map((st, i) => (
                  <div key={st.id} className="grid grid-cols-12 p-3 items-center text-xs hover:bg-slate-50">
                    <div className="col-span-1 text-center font-bold text-slate-500">{i + 1}</div>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${st.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>{st.name.slice(0, 2).toUpperCase()}</div>
                      <div><h4 className="font-bold text-slate-900 flex items-center gap-1">{st.name} <span className={st.gender === 'Nữ' ? 'text-pink-600 font-bold' : 'text-blue-600 font-bold'}>{st.gender === 'Nữ' ? '♀' : '♂'}</span></h4><p className="text-[10px] text-slate-400">SĐT: <strong>{st.phone || 'Chưa có'}</strong></p></div>
                    </div>
                    <div className="col-span-3 text-center font-mono font-bold text-slate-700">{st.username || st.code}</div>
                    <div className="col-span-3 flex justify-center gap-2">
                      <button onClick={() => { if (confirm(`Xóa "${st.name}"?`)) setClasses(classes.map(c => c.id === curClass.id ? { ...c, students: (c.students || []).filter(s => s.id !== st.id) } : c)); }} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => alert(`Đặt lại mật khẩu cho "${st.name}" về 123`)} className="p-1 text-amber-500 hover:text-amber-700"><KeyRound className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isExcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex justify-between items-center border-b pb-2"><h3 className="font-black text-sm">Tạo danh sách lớp bằng Excel (.xlsx)</h3><button onClick={() => setIsExcel(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button></div>
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 text-center bg-slate-50 space-y-1 block cursor-pointer">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-blue-600 text-xs">{fileName ? `Đã chọn: ${fileName}` : 'Kéo thả file Excel (.xlsx, .csv, .txt, .xls) hoặc Click để chọn file'}</p>
              <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} className="hidden" />
            </label>
            <div className="text-center"><button type="button" onClick={handleDownloadSample} className="text-xs text-blue-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"><CloudDownload className="w-4 h-4" /> ☁ Tải file biểu mẫu chuẩn (7 cột)</button></div>
            <div className="flex gap-2 text-xs">
              <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="Tên lớp áp dụng..." className="flex-1 p-2 border rounded-xl font-bold uppercase" />
              <input type="text" readOnly value="2026 - 2027" className="w-28 p-2 bg-slate-100 border rounded-xl font-bold text-slate-500 text-center" />
            </div>
            <textarea rows={3} value={excelText} onChange={e => setExcelText(e.target.value)} placeholder="Hoặc dán trực tiếp dữ liệu từ Excel..." className="w-full p-2 border rounded-xl text-xs font-mono outline-none" />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsExcel(false)} className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Hủy</button>
              <button onClick={handleConfirmExcel} className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow">Xác nhận nạp học sinh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
