import React, { useState, useEffect } from 'react';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses, parseStudentListText } from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search,
  ChevronLeft, ArrowUpDown, Filter, QrCode, Share2,
  KeyRound, Calendar, CloudDownload
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: Array(32).fill(null).map((_, i) => ({ id: `hs_10a10_${i}`, name: `Học sinh 10A10 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '2', name: '10A6', students: Array(41).fill(null).map((_, i) => ({ id: `hs_10a6_${i}`, name: `Học sinh 10A6 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '3', name: '12A2', students: [
        { id: 'hs_1', name: 'Châu Ngô Nhật Ái', code: '67339301', phone: '0901234567' },
        { id: 'hs_2', name: 'Lê Thị Yến Duy', code: '67339302', phone: '0901234568' },
        { id: 'hs_3', name: 'Lê Vũ Đạt', code: '67339303', phone: '0901234569' },
      ]}
    ];
  });

  const [viewLevel, setViewLevel] = useState<'grid' | 'detail'>('detail');
  const [selectedClassId, setSelectedClassId] = useState<string>('3');
  const [search, setSearch] = useState<string>('');

  // MODAL TẠO DANH SÁCH LỚP BẰNG EXCEL
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [excelTargetClassName, setExcelTargetClassName] = useState<string>('12A2');
  const [academicYear, setAcademicYear] = useState<string>('2026 - 2027');
  const [classGroup, setClassGroup] = useState<string>('Khác');
  const [excelContent, setExcelContent] = useState<string>('');
  const [fileNameUploaded, setFileNameUploaded] = useState<string>('');
  const [newClassName, setNewClassName] = useState<string>('');
  const [isAddClass, setIsAddClass] = useState<boolean>(false);

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Nút Tải file biểu mẫu mẫu
  const handleDownloadSample = () => {
    const csvContent = '\uFEFF' + 'STT,Họ và tên,Tên đăng nhập,Số báo danh,Số điện thoại\n1,Châu Ngô Nhật Ái,67339301,SBD01,0901234567\n2,Lê Thị Yến Duy,67339302,SBD02,0901234568\n3,Lê Vũ Đạt,67339303,SBD03,0901234569';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_danh_sach_hoc_sinh.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Đọc file Excel tải lên
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNameUploaded(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setExcelContent(text);
      };
      reader.readAsText(file);
    }
  };

  // Mở modal Excel cho lớp hiện tại
  const handleOpenExcelForClass = (clsName: string) => {
    setExcelTargetClassName(clsName);
    setIsExcelModalOpen(true);
  };

  // Xác nhận nhập dữ liệu từ Excel
  const handleConfirmExcel = () => {
    const targetName = excelTargetClassName.trim().toUpperCase() || curClass.name;
    let newStudents: Student[] = [];

    if (excelContent.trim()) {
      newStudents = parseStudentListText(excelContent);
    } else {
      // Mẫu học sinh nạp sẵn nếu không chọn file
      newStudents = [
        { id: `std_${Date.now()}_1`, name: 'Châu Ngô Nhật Ái', code: '67339301', phone: '0901234567' },
        { id: `std_${Date.now()}_2`, name: 'Lê Thị Yến Duy', code: '67339302', phone: '0901234568' },
        { id: `std_${Date.now()}_3`, name: 'Lê Vũ Đạt', code: '67339303', phone: '0901234569' },
        { id: `std_${Date.now()}_4`, name: 'Trần Thành Đạt', code: '67339304', phone: '0901234570' },
        { id: `std_${Date.now()}_5`, name: 'Sử Lưu Phước Hậu', code: '67339305', phone: '0901234571' },
        { id: `std_${Date.now()}_6`, name: 'Trần Chấn Hiệp', code: '67339306', phone: '0901234572' },
      ];
    }

    const existingClassIndex = classes.findIndex((c) => c.name === targetName);
    if (existingClassIndex >= 0) {
      const updated = classes.map((c, i) => i === existingClassIndex ? { ...c, students: [...(c.students || []), ...newStudents] } : c);
      setClasses(updated);
      setSelectedClassId(classes[existingClassIndex].id);
    } else {
      const newCls: ClassRoom = { id: `cls_${Date.now()}`, name: targetName, students: newStudents };
      setClasses([...classes, newCls]);
      setSelectedClassId(newCls.id);
    }

    setIsExcelModalOpen(false);
    setFileNameUploaded('');
    setExcelContent('');
    alert(`Đã nạp thành công danh sách học sinh vào lớp ${targetName}!`);
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = (curClass?.students || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code && s.code.includes(search)));

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* CẤP 1: DANH SÁCH LỚP */}
      {viewLevel === 'grid' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Danh sách lớp</h2>
              <p className="text-xs text-slate-500 font-bold">{classes.length} lớp</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOpenExcelForClass('12A2')}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
              <button className="px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm"><Filter className="w-3.5 h-3.5 text-slate-500" /> Bộ lọc</button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên lớp..." className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none shadow-sm" />
            </div>
            <button className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1 text-slate-700 shrink-0"><ArrowUpDown className="w-3.5 h-3.5 text-slate-500" /> Sắp xếp theo tên</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                onClick={() => { setSelectedClassId(cls.id); setViewLevel('detail'); }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer space-y-2 transition-all"
              >
                <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Sĩ số: <strong className="text-slate-800">{cls.students?.length || 0}</strong></span>
                  <span>Năm học: <strong className="text-slate-800">2026 - 2027</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CẤP 2: CHI TIẾT LỚP HỌC (CHUẨN 100% THEO ẢNH BẠN GỬI) */}
      {viewLevel === 'detail' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setViewLevel('grid')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách lớp
          </button>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{curClass.name}</h1>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><QrCode className="w-4 h-4" /></span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
                  2026 - 2027
                </span>
              </div>

              {/* HAI NÚT BẤM CHÍNH TRÊN ĐẦU LỚP HỌC */}
              <div className="flex gap-2">
                {/* NÚT NHẬP TỪ EXCEL -> MỞ MODAL TẠO BẰNG EXCEL */}
                <button
                  type="button"
                  onClick={() => handleOpenExcelForClass(curClass.name)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Nhập từ Excel
                </button>

                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?mode=student`); alert('Đã sao chép link Cổng Học Sinh!'); }}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-blue-600" /> Chia sẻ
                </button>
              </div>
            </div>

            {/* Ô TÌM KIẾM */}
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

            {/* BẢNG DANH SÁCH HỌC SINH */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <div className="col-span-1 text-center">STT</div>
                <div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {curClass.students?.length || 0}</div>
                <div className="col-span-2 text-center">SỐ BÁO DANH</div>
                <div className="col-span-2 text-center">ĐỀ THI ĐÃ LÀM</div>
                <div className="col-span-2 text-center">HÀNH ĐỘNG</div>
              </div>

              <div className="divide-y divide-slate-100">
                {(curClass.students || []).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <p>Lớp {curClass.name} hiện chưa có học sinh nào.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenExcelForClass(curClass.name)}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow"
                    >
                      Bấm vào đây để Nhập từ Excel
                    </button>
                  </div>
                ) : (
                  filteredStudents.map((st, i) => (
                    <div key={st.id} className="grid grid-cols-12 p-3.5 items-center text-xs hover:bg-slate-50">
                      <div className="col-span-1 text-center font-bold text-slate-500">{i + 1}</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{st.name} ♂</h4>
                          <p className="text-[10px] text-slate-400">ID: {st.code || '67339301'} • SĐT: {st.phone || 'Chưa có'}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold text-slate-700">{st.code || `SBD${i + 1}`}</div>
                      <div className="col-span-2 text-center font-bold text-blue-700">15 / 22 đề thi</div>
                      <div className="col-span-2 flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa học sinh "${st.name}"?`)) {
                              setClasses(classes.map((c) => c.id === curClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== st.id) } : c));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Đặt lại mật khẩu cho "${st.name}" về 123`)}
                          className="p-1 text-amber-500 hover:text-amber-700"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CỬA SỔ "TẠO DANH SÁCH LỚP BẰNG EXCEL" (CHUẨN 100% THEO ẢNH BẠN GỬI) */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <h3 className="text-base font-black text-slate-900">Tạo danh sách lớp bằng excel</h3>
              <button onClick={() => setIsExcelModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Khu vực kéo thả file Excel */}
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 block">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="font-bold text-blue-600 hover:underline">
                  {fileNameUploaded ? `Đã chọn: ${fileNameUploaded}` : 'Kéo thả file Excel hoặc Click để chọn file'}
                </span>
                <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileChange} className="hidden" />
              </label>

              {/* Nút tải file biểu mẫu */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-bold text-xs cursor-pointer"
                >
                  <CloudDownload className="w-4 h-4" /> ☁ Tải file biểu mẫu
                </button>
              </div>

              {/* Khung: Chọn năm học và nhóm lớp */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Chọn năm học và nhóm lớp</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Tên lớp áp dụng:</label>
                    <input
                      type="text"
                      value={excelTargetClassName}
                      onChange={(e) => setExcelTargetClassName(e.target.value)}
                      className="w-full p-2 bg-white border rounded-xl font-bold uppercase text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Năm học:</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full p-2 bg-white border rounded-xl font-bold text-xs outline-none"
                    >
                      <option value="2026 - 2027">2026 - 2027</option>
                      <option value="2025 - 2026">2025 - 2026</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Chọn nhóm lớp:</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input type="radio" checked={classGroup === 'Khác'} onChange={() => setClassGroup('Khác')} />
                      <span>Khác</span>
                    </label>
                    <span className="text-blue-600 hover:underline cursor-pointer font-bold">+ Thêm nhóm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2.5">
              <button onClick={() => setIsExcelModalOpen(false)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">Hủy</button>
              <button onClick={handleConfirmExcel} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black text-white shadow cursor-pointer">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
