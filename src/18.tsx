import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student, getStoredClasses, saveClasses } from './classStorage';
import { Plus, Trash2, FileSpreadsheet, X, Search, ChevronLeft, QrCode, KeyRound, CloudDownload, Download, Settings, User, Calendar, Newspaper, BarChart2, BookOpen, Share2 } from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses() || [
    {
      id: '1', name: '10A2', students: [
        { id: '1', name: 'Nguyễn Văn A', username: 'ngvanA2193', phone: '0123456789', parentPhone: '0987654321', email: 'nguyenvana@gmail.com', dob: '23/02/2001', gender: 'Nam', code: '00000001', className: 'Lớp 1A2' },
        { id: '2', name: 'Phạm Thị B', username: 'phthiB1202', phone: '0123456790', parentPhone: '0987654322', email: 'phamthib@gmail.com', dob: '25/06/2001', gender: 'Nữ', code: '00000002', className: 'Lớp 10A3' },
        { id: '3', name: 'Hồ Văn E1', username: 'hovanE1', phone: '0123456793', parentPhone: '', email: '', dob: '', gender: 'Nữ', code: '', className: 'Lớp 10A4' },
        { id: '4', name: 'Phạm Thị BC', username: 'phamlai', phone: '0123456732', parentPhone: '', email: '', dob: '', gender: '', code: '', className: '' },
        { id: '5', name: 'Hồ Văn ED', username: 'hophi', phone: '0123456777', parentPhone: '', email: '', dob: '', gender: '', code: '', className: '' },
      ]
    },
    { id: '2', name: '10A10', students: [] }
  ]);

  const [level, setLevel] = useState<'grid' | 'detail'>('detail');
  const [selId, setSelId] = useState<string>('1');
  const [search, setSearch] = useState<string>('');
  const [isExcel, setIsExcel] = useState<boolean>(false);
  const [excelText, setExcelText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);
  const curClass = classes.find(c => c.id === selId) || classes[0];

  const handleDownloadSample = () => {
    const csv = '\uFEFFSTT,Họ và tên,Username,Số điện thoại,Số điện thoại phụ huynh,Email,Ngày sinh,Giới tính,Số báo danh,Mật khẩu,Lớp\n1,Nguyễn Văn A,ngvanA2193,0123456789,0987654321,nguyenvana@gmail.com,23/02/2001,Nam,00000001,,Lớp 1A2\n2,Phạm Thị B,phthiB1202,0123456790,0987654322,phamthib@gmail.com,25/06/2001,Nữ,00000002,,Lớp 10A3\n3,Hồ Văn E1,hovanE1,0123456793,,,,Nữ,,,Lớp 10A4\n4,Phạm Thị BC,phamlai,0123456732,,,,,,,\n5,Hồ Văn ED,hophi,0123456777,,,,,,,';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `list-student_${curClass.name}.csv`;
    a.click();
  };

  const handleExportClassList = () => {
    const lines = ['STT,Họ và tên,Username,Số điện thoại,SĐT phụ huynh,Email,Ngày sinh,Giới tính,Số báo danh,Lớp'];
    (curClass.students || []).forEach((s: any, i) => {
      lines.push(`${i+1},"${s.name}","${s.username||''}","${s.phone||''}","${s.parentPhone||''}","${s.email||''}","${s.dob||''}","${s.gender||''}","${s.code||''}","${s.className||curClass.name}"`);
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `Danh_sach_${curClass.name}.csv`;
    a.click();
  };

  const parseXlsx = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const sst = (await zip.file('xl/sharedStrings.xml')?.async('text')) || '';
      const strings = Array.from(new DOMParser().parseFromString(sst, 'text/xml').getElementsByTagName('si')).map(s => s.textContent || '');
      const sheet = (await zip.file('xl/worksheets/sheet1.xml')?.async('text')) || '';
      const rows = Array.from(new DOMParser().parseFromString(sheet, 'text/xml').getElementsByTagName('row'));
      return rows.map(r => Array.from(r.getElementsByTagName('c')).map(c => (c.getAttribute('t') === 's' ? strings[parseInt(c.textContent || '0', 10)] : c.textContent) || '').join('\t')).join('\n');
    } catch { return ''; }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.name.toLowerCase().endsWith('.xlsx')) {
      setExcelText(await parseXlsx(f));
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
      return {
        id: `std_${Date.now()}_${i}`,
        name: p.slice(1, 2)[0] || p.slice(0, 1)[0] || `Học sinh ${i+1}`,
        username: p.slice(2, 3)[0] || '',
        phone: p.slice(3, 4)[0] || '',
        parentPhone: p.slice(4, 5)[0] || '',
        email: p.slice(5, 6)[0] || '',
        dob: p.slice(6, 7)[0] || '',
        gender: p.slice(7, 8)[0] || '',
        code: p.slice(8, 9)[0] || '',
        password: p.slice(9, 10)[0] || '123',
        className: p.slice(10, 11)[0] || curClass.name,
      } as any;
    });

    const updated = classes.map(c => c.id === curClass.id ? { ...c, students: [...(c.students || []), ...newSts] } : c);
    setClasses(updated);
    saveClasses(updated);
    setIsExcel(false);
    setFileName('');
    setExcelText('');
    alert(`Đã nạp ${newSts.length} học sinh thành công!`);
  };

  const filtered = (curClass.students || []).filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search) || s.code?.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-800 space-y-4 font-sans">
      {level === 'grid' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div><h2 className="text-xl font-black">Danh sách lớp</h2><p className="text-xs text-slate-500">{classes.length} lớp học</p></div>
            <button onClick={() => { const n = prompt('Tên lớp mới:'); if (n) setClasses([...classes, { id: `c_${Date.now()}`, name: n.toUpperCase(), students: [] }]); }} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer"><Plus className="w-4 h-4" /> Thêm lớp</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div key={cls.id} onClick={() => { setSelId(cls.id); setLevel('detail'); }} className="bg-white p-5 rounded-2xl border shadow-sm hover:border-blue-400 cursor-pointer space-y-2">
                <div className="flex justify-between items-center"><h3 className="text-lg font-black">{cls.name}</h3><span className="text-xs text-blue-600 font-bold">Vào lớp →</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>Sĩ số: <strong>{cls.students?.length || 0} HS</strong></span><span>Năm: <strong>2026 - 2027</strong></span></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setLevel('grid')} className="px-3 py-1.5 bg-white border rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"><ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp</button>
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2"><h1 className="text-2xl font-black">{curClass.name}</h1><span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold">2026 - 2027</span></div>
              <div className="flex gap-2">
                <button onClick={handleExportClassList} className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"><Download className="w-3.5 h-3.5" /> Xuất danh sách</button>
                <button onClick={() => setIsExcel(true)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer"><FileSpreadsheet className="w-3.5 h-3.5" /> Nhập từ Excel (.xlsx)</button>
              </div>
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm học sinh theo tên, SBD..." className="w-full p-2 bg-slate-50 border rounded-xl text-xs outline-none" />
            <div className="border rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                <thead className="bg-blue-800 text-white font-bold text-[11px] uppercase">
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
                  {filtered.map((st: any, i) => (
                    <tr key={st.id || i} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-bold text-slate-500 border-r">{i + 1}</td>
                      <td className="p-3 font-bold text-slate-900 border-r">{st.name}</td>
                      <td className="p-3 font-mono text-slate-700 border-r">{st.username || '---'}</td>
                      <td className="p-3 font-mono text-slate-700 border-r">{st.phone || '---'}</td>
                      <td className="p-3 font-mono text-slate-500 border-r">{st.parentPhone || '---'}</td>
                      <td className="p-3 text-slate-600 border-r">{st.email || '---'}</td>
                      <td className="p-3 text-center font-mono text-slate-600 border-r">{st.dob || '---'}</td>
                      <td className="p-3 text-center font-bold border-r">{st.gender?.includes('Nữ') ? <span className="text-pink-600">Nữ ♀</span> : <span className="text-blue-600">Nam ♂</span>}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800 border-r">{st.code || '---'}</td>
                      <td className="p-3 text-center font-medium text-slate-700 border-r">{st.className || curClass.name}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => setClasses(classes.map(c => c.id === curClass.id ? { ...c, students: c.students.filter((s: any) => s.id !== st.id) } : c))} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={() => alert(`Mật khẩu của ${st.name} là: 123`)} className="p-1 text-amber-500"><KeyRound className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isExcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="font-black text-base text-slate-900">Thêm nhanh bằng file excel</h3>
            {fileName ? (
              <div className="bg-slate-50 border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-black text-sm">X</div>
                  <div><p className="font-bold text-xs text-slate-900">{fileName}</p><p className="text-[11px] text-slate-400 font-mono">0.01mb</p></div>
                </div>
                <button onClick={() => { setFileName(''); setExcelText(''); }} className="p-1.5 text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="rounded-2xl p-8 text-center bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 block cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2"><FileSpreadsheet className="w-6 h-6" /></div>
                <p className="text-xs font-bold text-blue-700">Kéo thả file Excel hoặc Click để chọn file</p>
                <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} className="hidden" />
              </label>
            )}
            <div className="text-center"><button type="button" onClick={handleDownloadSample} className="text-xs text-blue-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"><CloudDownload className="w-4 h-4" /> Tải file biểu mẫu</button></div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => { setIsExcel(false); setFileName(''); setExcelText(''); }} className="px-5 py-2 bg-slate-100 rounded-xl text-xs font-bold">Hủy</button>
              <button onClick={handleConfirmExcel} className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white font-black rounded-xl text-xs shadow">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
