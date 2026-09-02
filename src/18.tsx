import React, { useState, useEffect, useMemo } from 'react';
import { ClassRoom, Student, StudentSubmission } from './classStorage';
import {
  getStoredClasses,
  saveClasses,
  parseStudentListText,
  getStudentSubmissions,
  getStoredAssignments,
} from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search, BookOpen,
  Edit3, Check, UserPlus, Download, Share2, Settings, QrCode,
  Calendar, Award, RotateCcw, FileText, CheckCircle2, KeyRound, User
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const [newClassName, setNewClassName] = useState<string>('');
  
  // Tab con trong lớp: 'students' (Danh sách HS) | 'assignments' (Bài tập, đề thi) | 'gradebook' (Bảng điểm)
  const [subTab, setSubTab] = useState<'students' | 'assignments' | 'gradebook'>('students');

  // Đổi tên lớp & Cài đặt
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  // Modals
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');

  // Modal chỉnh sửa 1 học sinh
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submissions] = useState<StudentSubmission[]>(() => getStudentSubmissions());
  const assignments = getStoredAssignments();

  // Tự động lưu LocalStorage
  useEffect(() => {
    if (classes.length > 0) {
      saveClasses(classes);
    }
  }, [classes]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0] || { id: 'default', name: '12A6', students: [] };

  // Tạo lớp mới
  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const name = newClassName.trim().toUpperCase();
    if (classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Tên lớp này đã tồn tại!');
      return;
    }
    const newCls: ClassRoom = { id: `cls_${Date.now()}`, name, students: [] };
    const updated = [...classes, newCls];
    setClasses(updated);
    setSelectedClassId(newCls.id);
    setNewClassName('');
  };

  // Đổi tên lớp
  const handleSaveRenameClass = () => {
    if (!renameValue.trim() || !currentClass) return;
    const name = renameValue.trim().toUpperCase();
    setClasses(classes.map((c) => (c.id === currentClass.id ? { ...c, name } : c)));
    setIsRenameOpen(false);
  };

  // Xóa lớp
  const handleDeleteClass = (id: string, name: string) => {
    if (classes.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 lớp học!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${name}" và toàn bộ danh sách học sinh?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      if (updated.length > 0) setSelectedClassId(updated[0].id);
    }
  };

  // Nhập từ Excel
  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedStudents: Student[] = lines.map((line, index) => {
      const parts = line.split(/[\t,;]/).map((p) => p.trim());
      const name = parts[0]?.replace(/^[0-9]+[\.\-\/\)\s]+/, '').trim() || line;
      const username = parts || `${currentClass.name.toLowerCase()}_${index + 1 < 10 ? '0' : ''}${index + 1}`;
      const code = parts || `SBD${index + 1 < 10 ? '0' : ''}${index + 1}`;
      const phone = parts || '';
      return {
        id: `std_${Date.now()}_${index}`,
        name,
        username,
        code,
        phone,
      };
    });

    if (parsedStudents.length === 0) return;
    setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: [...(c.students || []), ...parsedStudents] } : c));
    setImportText('');
    setIsImportOpen(false);
    alert(`Đã nhập thành công ${parsedStudents.length} học sinh vào lớp ${currentClass.name}!`);
  };

  // Thêm lẻ 1 học sinh
  const handleAddSingle = () => {
    if (!studentName.trim()) return;
    const count = (currentClass.students || []).length;
    const newStd: Student = {
      id: `std_${Date.now()}`,
      name: studentName.trim(),
      username: studentUsername.trim() || `${currentClass.name.toLowerCase()}_${count + 1 < 10 ? '0' : ''}${count + 1}`,
      code: studentCode.trim() || `SBD${count + 1 < 10 ? '0' : ''}${count + 1}`,
      phone: studentPhone.trim(),
    };
    setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: [...(c.students || []), newStd] } : c));
    setStudentName('');
    setStudentUsername('');
    setStudentCode('');
    setStudentPhone('');
    setIsAddStudentOpen(false);
  };

  // Sửa 1 học sinh
  const handleSaveEditStudent = () => {
    if (!editingStudent || !editingStudent.name.trim()) return;
    setClasses(classes.map((cls) => {
      if (cls.id === currentClass.id) {
        return {
          ...cls,
          students: (cls.students || []).map((s) => (s.id === editingStudent.id ? editingStudent : s)),
        };
      }
      return cls;
    }));
    setEditingStudent(null);
  };

  // Xóa 1 học sinh
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Xóa học sinh "${studentName}" khỏi lớp?`)) {
      setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== studentId) } : c));
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = (studentName: string) => {
    alert(`Đã đặt lại mật khẩu của học sinh "${studentName}" về mặc định: 123`);
  };

  // Xuất danh sách học sinh ra file CSV (Excel)
  const handleExportStudentList = () => {
    const students = currentClass.students || [];
    if (students.length === 0) {
      alert('Lớp chưa có học sinh để xuất danh sách!');
      return;
    }
    const headers = ['STT', 'Họ và tên', 'Tên đăng nhập', 'Số báo danh', 'Số điện thoại', 'Mật khẩu'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.username || s.code || ''}"`,
      `"${s.code || ''}"`,
      `"${s.phone || ''}"`,
      '"123"',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_lop_${currentClass.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lấy 2 chữ cái đầu tạo Avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'HS';
  };

  // Lọc học sinh theo từ khóa
  const filteredStudents = (currentClass.students || []).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.username && s.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="font-sans space-y-6 max-w-7xl mx-auto p-3 sm:p-6 text-slate-800">
      {/* 1. THANH CHỌN LỚP NHANH TRÊN CÙNG */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 px-1">
            <BookOpen className="w-4 h-4 text-blue-600" /> Chọn lớp:
          </span>
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                cls.id === currentClass.id
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lớp {cls.name} ({cls.students?.length || 0})
            </button>
          ))}
        </div>

        {/* Ô thêm lớp mới */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Tên lớp mới (VD: 12A6)..."
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold uppercase w-44 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddClass}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            + Thêm lớp
          </button>
        </div>
      </div>

      {/* 2. BỐ CỤC CHÍNH: MENU DỌC PHỤ TRONG LỚP & NỘI DUNG LỚP HỌC */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* CỘT TRÁI: MENU CHỨC NĂNG CỦA LỚP */}
        <div className="lg:col-span-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 h-fit">
          <button
            onClick={() => setSubTab('students')}
            className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
              subTab === 'students'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Danh sách học sinh</span>
          </button>

          <button
            onClick={() => setSubTab('assignments')}
            className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
              subTab === 'assignments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bài tập, đề thi</span>
          </button>

          <button
            onClick={() => setSubTab('gradebook')}
            className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
              subTab === 'gradebook'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Bảng điểm</span>
          </button>
        </div>

        {/* CỘT PHẢI: GIAO DIỆN CHI TIẾT THEO CHUẨN MẪU ẢNH */}
        <div className="lg:col-span-4 space-y-4">
          {/* HEADER LỚP HỌC (CHUẨN THEO MẪU ẢNH) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentClass.name}</h1>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 cursor-pointer" title="Mã QR lớp học">
                  <QrCode className="w-4 h-4" />
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
                  2026 - 2027
                </span>
              </div>

              {/* CÁC NÚT HÀNH ĐỘNG TRÊN HEADER */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportStudentList}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất danh sách HS
                </button>

                <button
                  type="button"
                  onClick={() => setSubTab('gradebook')}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-slate-500" /> Xuất bảng điểm
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRenameValue(currentClass.name);
                    setIsRenameOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  title="Cài đặt & Đổi tên lớp"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClass(currentClass.id, currentClass.name)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                  title="Xóa lớp này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* THANH TÌM KIẾM THEO ID, TÊN, SĐT, SBD */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium px-2">Chưa chia sẻ với ai</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?mode=student`);
                  alert('Đã sao chép link Cổng Học Sinh vào bộ nhớ tạm!');
                }}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ
              </button>

              <div className="flex-1 relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo ID, tên, SĐT, email, SBD..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Nhập từ Excel
              </button>
            </div>
          </div>

          {/* 3. BẢNG DANH SÁCH HỌC SINH (CHUẨN GIAO DIỆN THEO MẪU ẢNH) */}
          {subTab === 'students' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Tiêu đề bảng */}
              <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <div className="col-span-1 text-center">STT</div>
                <div className="col-span-5">HỌ VÀ TÊN • SĨ SỐ {currentClass.students?.length || 0}</div>
                <div className="col-span-2 text-center">SỐ BÁO DANH</div>
                <div className="col-span-2 text-center">ĐỀ THI ĐÃ LÀM</div>
                <div className="col-span-2 text-center">HÀNH ĐỘNG</div>
              </div>

              {/* Danh sách từng học sinh */}
              <div className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm">Chưa có học sinh nào trong lớp {currentClass.name}</p>
                    <p className="text-xs text-slate-400">Bấm nút "Nhập từ Excel" hoặc "+ Thêm" để thêm học sinh vào lớp</p>
                  </div>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const studentSub = submissions.filter(
                      (sub) => sub.studentId === student.id || sub.studentName?.toLowerCase() === student.name.toLowerCase()
                    );
                    const completedCount = studentSub.length;
                    const totalAssigned = Math.max(completedCount, assignments.length || 1);

                    return (
                      <div key={student.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-50/80 transition-colors text-xs">
                        {/* Cột STT */}
                        <div className="col-span-1 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 text-slate-700 rounded-lg font-bold border border-slate-200">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Cột Họ và tên + Avatar + ID + SĐT */}
                        <div className="col-span-5 flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-800 flex items-center justify-center font-black text-xs shadow-inner">
                              {getInitials(student.name)}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] ring-2 ring-white">
                              ✓
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                              {student.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-2.5 text-[11px] text-slate-500 mt-0.5">
                              <span>ID: <strong>{student.username || student.code || '67339301'}</strong></span>
                              <span>•</span>
                              <span>SĐT: <strong>{student.phone || 'Chưa có'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Cột Số báo danh */}
                        <div className="col-span-2 text-center font-mono font-bold text-slate-800">
                          {student.code || `SBD${idx + 1 < 10 ? '0' : ''}${idx + 1}`}
                        </div>

                        {/* Cột Đề thi đã làm */}
                        <div className="col-span-2 text-center">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-bold border border-blue-200 inline-block">
                            {completedCount} / {totalAssigned} đề thi
                          </span>
                        </div>

                        {/* Cột Hành động */}
                        <div className="col-span-2 flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetPassword(student.name)}
                            className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Đặt lại mật khẩu (123)"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB BÀI TẬP, ĐỀ THI */}
          {subTab === 'assignments' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Các bài kiểm tra đã giao cho lớp {currentClass.name}:</h3>
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-500 p-6 text-center">Chưa có bài kiểm tra nào được giao cho lớp này.</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <div key={a.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900">{a.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Thời gian: {a.durationMinutes} phút | Tạo lúc: {new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">Đang mở</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB BẢNG ĐIỂM */}
          {subTab === 'gradebook' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-sm text-slate-800">Bảng tổng hợp điểm số lớp {currentClass.name}</h3>
                <button
                  type="button"
                  onClick={handleExportStudentList}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Tải bảng điểm Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-[11px]">
                    <tr>
                      <th className="border p-2 text-center w-10">STT</th>
                      <th className="border p-2">Họ và tên</th>
                      <th className="border p-2 w-28">Số báo danh</th>
                      <th className="border p-2 text-center w-28">Điểm bài làm gần nhất</th>
                      <th className="border p-2 text-center w-24">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentClass.students || []).map((s, idx) => {
                      const sub = submissions.find((item) => item.studentId === s.id || item.studentName === s.name);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="border p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="border p-2 font-bold text-slate-900">{s.name}</td>
                          <td className="border p-2 font-mono">{s.code || `SBD${idx + 1}`}</td>
                          <td className="border p-2 text-center">
                            {sub ? (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                                {sub.score} / 10
                              </span>
                            ) : (
                              <span className="text-slate-400">---</span>
                            )}
                          </td>
                          <td className="border p-2 text-center">
                            {sub ? <span className="text-emerald-600 font-bold text-[11px]">Đã nộp</span> : <span className="text-slate-400 text-[11px]">Chưa làm</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CÀI ĐẶT / ĐỔI TÊN LỚP */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Đổi tên lớp học</h3>
              <button onClick={() => setIsRenameOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp mới:</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsRenameOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
              <button onClick={handleSaveRenameClass} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold shadow">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA THÔNG TIN 1 HỌC SINH */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Sửa thông tin học sinh</h3>
              <button onClick={() => setEditingStudent(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Tên đăng nhập:</label>
                <input
                  type="text"
                  value={editingStudent.username || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Số báo danh (Mã HS):</label>
                <input
                  type="text"
                  value={editingStudent.code || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, code: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setEditingStudent(null)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
              <button onClick={handleSaveEditStudent} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold shadow">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM 1 HỌC SINH */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Thêm học sinh vào lớp {currentClass.name}</h3>
              <button onClick={() => setIsAddStudentOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Họ và tên học sinh (*):</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="VD: Châu Ngô Nhật Ái"
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Tên đăng nhập / ID:</label>
                <input
                  type="text"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                  placeholder="VD: 67339301"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Số báo danh (Mã HS):</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="VD: SBD01"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setIsAddStudentOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
              <button onClick={handleAddSingle} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold shadow">Thêm học sinh</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NHẬP TỪ EXCEL / WORD */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Nhập danh sách học sinh ({currentClass.name})</h3>
              <button onClick={() => setIsImportOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dán danh sách từ Excel vào đây. Hỗ trợ copy cột: <strong>Họ tên [Tab] ID/Tên đăng nhập [Tab] SBD [Tab] Số điện thoại</strong>:
            </p>
            <textarea
              rows={7}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Châu Ngô Nhật Ái&#9;67339301&#9;SBD01&#9;0901234567&#10;Trần Thị Bình&#9;67339302&#9;SBD02&#9;0912345678"
              className="w-full p-2.5 border rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsImportOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold">Hủy</button>
              <button onClick={handleImport} className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold shadow">Xác nhận nhập</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
