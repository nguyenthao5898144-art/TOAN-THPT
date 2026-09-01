import React, { useState, useEffect } from 'react';
import { ClassRoom, Student, StudentSubmission } from './classStorage';
import {
  getStoredClasses,
  saveClasses,
  parseStudentListText,
  getStudentSubmissions,
} from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet,
  X, Search, BookOpen, Edit3, Check, UserPlus, Phone, KeyRound
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const [newClassName, setNewClassName] = useState<string>('');
  
  // Trạng thái đổi tên lớp
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState<string>('');

  // Trạng thái nhập học sinh từ Excel / Thêm lẻ
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [singleStudentName, setSingleStudentName] = useState<string>('');
  const [singleStudentCode, setSingleStudentCode] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submissions] = useState<StudentSubmission[]>(() => getStudentSubmissions());

  // Lưu tự động vào LocalStorage
  useEffect(() => {
    if (classes.length > 0) {
      saveClasses(classes);
    }
  }, [classes]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // 1. Quản trị viên thêm lớp mới (Tên tự do)
  const handleAddClass = () => {
    if (!newClassName.trim()) {
      alert('Vui lòng nhập tên lớp cần tạo!');
      return;
    }
    const name = newClassName.trim();
    if (classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert(`Lớp "${name}" đã tồn tại trong danh sách!`);
      return;
    }
    const newCls: ClassRoom = {
      id: `cls_${Date.now()}`,
      name,
      students: [],
    };
    const updated = [...classes, newCls];
    setClasses(updated);
    setSelectedClassId(newCls.id);
    setNewClassName('');
  };

  // 2. Quản trị viên chỉnh sửa đổi tên lớp
  const handleStartRename = (cls: ClassRoom) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
  };

  const handleSaveRename = (id: string) => {
    if (!editingClassName.trim()) return;
    const name = editingClassName.trim();
    const updated = classes.map((c) => (c.id === id ? { ...c, name } : c));
    setClasses(updated);
    setEditingClassId(null);
  };

  // 3. Xóa lớp học
  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${name}" và toàn bộ danh sách học sinh của lớp này?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      if (updated.length > 0) {
        setSelectedClassId(updated[0].id);
      }
    }
  };

  // 4. Nhập danh sách học sinh từ Excel / Word
  const handleImportStudents = () => {
    if (!importText.trim() || !currentClass) return;
    const parsedStudents = parseStudentListText(importText);
    if (parsedStudents.length === 0) {
      alert('Không phân tích được danh sách học sinh!');
      return;
    }

    const updatedClasses = classes.map((cls) => {
      if (cls.id === currentClass.id) {
        return {
          ...cls,
          students: [...(cls.students || []), ...parsedStudents],
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setImportText('');
    setIsImportModalOpen(false);
    alert(`Đã thêm thành công ${parsedStudents.length} học sinh vào lớp ${currentClass.name}!`);
  };

  // 5. Thêm lẻ 1 học sinh
  const handleAddSingleStudent = () => {
    if (!singleStudentName.trim() || !currentClass) return;
    const count = (currentClass.students || []).length;
    const newStudent: Student = {
      id: `std_${Date.now()}`,
      name: singleStudentName.trim(),
      code: singleStudentCode.trim() || `HS${count + 1 < 10 ? '0' : ''}${count + 1}`,
    };

    const updatedClasses = classes.map((cls) => {
      if (cls.id === currentClass.id) {
        return {
          ...cls,
          students: [...(cls.students || []), newStudent],
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setSingleStudentName('');
    setSingleStudentCode('');
    setIsAddStudentModalOpen(false);
  };

  // 6. Xóa 1 học sinh
  const handleDeleteStudent = (studentId: string) => {
    if (!currentClass) return;
    const updatedClasses = classes.map((cls) => {
      if (cls.id === currentClass.id) {
        return {
          ...cls,
          students: (cls.students || []).filter((s) => s.id !== studentId),
        };
      }
      return cls;
    });
    setClasses(updatedClasses);
  };

  const studentList = (currentClass?.students || []).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="font-sans space-y-6 text-slate-800 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Quản trị */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> QUẢN TRỊ LỚP HỌC & DANH SÁCH HỌC SINH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị viên tự do đặt tên lớp, nhập danh sách học sinh từ Excel và theo dõi kết quả nộp bài
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-slate-300"
          >
            <UserPlus className="w-4 h-4 text-slate-600" /> + Thêm 1 học sinh
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> 📋 Nhập từ Excel / Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CỘT TRÁI: QUẢN TRỊ VIÊN ĐẶT & CHỈNH TÊN LỚP */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" /> CÁC LỚP ({classes.length})
            </h3>
          </div>

          {/* Ô nhập tên lớp do Quản trị tự đặt */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">Tạo tên lớp mới tùy ý:</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="VD: 12A1, 12 Chuyên, 11 Toán..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-sm"
              >
                + Tạo
              </button>
            </div>
          </div>

          {/* Danh sách lớp & Chức năng đổi tên lớp */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 pt-1">
            {classes.map((cls) => {
              const isSelected = cls.id === currentClass?.id;
              const isEditing = editingClassId === cls.id;
              const count = cls.students?.length || 0;

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingClassName}
                        onChange={(e) => setEditingClassName(e.target.value)}
                        className="flex-1 p-1 bg-white border border-emerald-500 rounded text-xs font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cls.id)}
                        className="p-1 bg-emerald-600 text-white rounded"
                        title="Lưu tên lớp"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingClassId(null)}
                        className="p-1 bg-slate-200 text-slate-600 rounded"
                        title="Hủy"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-black text-slate-900">{cls.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[10px] font-semibold">
                          {count} HS
                        </span>

                        {/* Nút đổi tên lớp */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(cls);
                          }}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-white"
                          title="Đổi tên lớp"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Nút xóa lớp */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls.id, cls.name);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white"
                          title="Xóa lớp này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG DANH SÁCH HỌC SINH CỦA LỚP */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                DANH SÁCH HỌC SINH LỚP <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">{currentClass?.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sĩ số: <strong>{currentClass?.students?.length || 0} học sinh</strong>
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên hoặc mã học sinh..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th className="border border-slate-200 p-2.5 text-center w-12">STT</th>
                  <th className="border border-slate-200 p-2.5">Họ và tên học sinh</th>
                  <th className="border border-slate-200 p-2.5 w-36">Tài khoản đăng nhập</th>
                  <th className="border border-slate-200 p-2.5 w-28 text-center">Mật khẩu</th>
                  <th className="border border-slate-200 p-2.5 w-36 text-center">Kết quả làm bài</th>
                  <th className="border border-slate-200 p-2.5 text-center w-16">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 leading-relaxed">
                      Lớp <strong>{currentClass?.name}</strong> hiện chưa có học sinh nào.<br />
                      Bấm vào nút <strong>"📋 Nhập từ Excel / Word"</strong> hoặc <strong>"+ Thêm 1 học sinh"</strong> ở trên để thêm danh sách lớp!
                    </td>
                  </tr>
                ) : (
                  studentList.map((student, idx) => {
                    const studentSub = submissions.find(
                      (sub) => sub.studentId === student.id || sub.studentName.toLowerCase() === student.name.toLowerCase()
                    );
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="border border-slate-200 p-2.5 font-bold text-slate-900">{student.name}</td>
                        <td className="border border-slate-200 p-2.5 font-mono text-blue-700 bg-blue-50/40 font-bold">
                          {student.code || `${currentClass.name.toLowerCase()}_${idx + 1 < 10 ? '0' : ''}${
