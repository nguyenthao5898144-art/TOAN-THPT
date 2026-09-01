import React, { useState, useEffect } from 'react';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses, parseStudentListText } from './classStorage';
import { Users, Trash2, FileSpreadsheet, X, Search, BookOpen, Edit3, Check, UserPlus } from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const [newClassName, setNewClassName] = useState<string>('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState<string>('');
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (classes.length > 0) {
      saveClasses(classes);
    }
  }, [classes]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0] || { id: 'default', name: '12A1', students: [] };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const name = newClassName.trim();
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

  const handleSaveRename = (id: string) => {
    if (!editingClassName.trim()) return;
    setClasses(classes.map((c) => (c.id === id ? { ...c, name: editingClassName.trim() } : c)));
    setEditingClassId(null);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Xóa lớp "${name}" và toàn bộ học sinh?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      if (updated.length > 0) setSelectedClassId(updated[0].id);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const parsed = parseStudentListText(importText);
    if (parsed.length === 0) return;
    setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: [...(c.students || []), ...parsed] } : c));
    setImportText('');
    setIsImportOpen(false);
  };

  const handleAddSingle = () => {
    if (!studentName.trim()) return;
    const count = (currentClass.students || []).length;
    const newStd: Student = {
      id: `std_${Date.now()}`,
      name: studentName.trim(),
      code: studentCode.trim() || `HS${count + 1}`,
    };
    setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: [...(c.students || []), newStd] } : c));
    setStudentName('');
    setStudentCode('');
    setIsAddStudentOpen(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    setClasses(classes.map((c) => c.id === currentClass.id ? { ...c, students: (c.students || []).filter((s) => s.id !== studentId) } : c));
  };

  const students = (currentClass.students || []).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      <div className="bg-white p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> QUẢN TRỊ LỚP HỌC & HỌC SINH
          </h2>
          <p className="text-xs text-slate-500">Tự do đặt tên lớp, dán danh sách từ Excel và cấp tài khoản học sinh</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddStudentOpen(true)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
            <UserPlus className="w-4 h-4" /> + 1 Học sinh
          </button>
          <button onClick={() => setIsImportOpen(true)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer">
            <FileSpreadsheet className="w-4 h-4" /> 📋 Nhập từ Excel/Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 border-b pb-2 flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-600" /> CÁC LỚP HỌC ({classes.length})
          </h3>
          <div className="flex gap-1">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Nhập tên lớp..."
              className="flex-1 p-1.5 border rounded text-xs font-bold"
            />
            <button onClick={handleAddClass} className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold cursor-pointer">
              + Thêm
            </button>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {classes.map((cls) => {
              const isSelected = cls.id === currentClass.id;
              const isEditing = editingClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingClassName}
                        onChange={(e) => setEditingClassName(e.target.value)}
                        className="p-1 border rounded text-xs w-full font-bold"
                        autoFocus
                      />
                      <button onClick={() => handleSaveRename(cls.id)} className="p-1 bg-emerald-600 text-white rounded cursor-pointer"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditingClassId(null)} className="p-1 bg-slate-200 rounded cursor-pointer"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <span>{cls.name} ({cls.students?.length || 0} HS)</span>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingClassId(cls.id); setEditingClassName(cls.name); }} className="p-1 text-slate-400 hover:text-blue-600" title="Đổi tên lớp"><Edit3 className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name); }} className="p-1 text-slate-400 hover:text-rose-600" title="Xóa lớp"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-4 rounded-xl border space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold">Danh sách học sinh lớp <span className="text-emerald-600">{currentClass.name}</span></h3>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên..."
                className="w-full pl-7 pr-2 py-1 border rounded text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="border p-2 text-center w-10">STT</th>
                  <th className="border p-2">Họ và tên</th>
                  <th className="border p-2 w-28">Mã HS</th>
                  <th className="border p-2 text-center w-20">Mật khẩu</th>
                  <th className="border p-2 text-center w-12">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">Lớp chưa có học sinh. Hãy dán danh sách từ Excel vào!</td></tr>
                ) : (
                  students.map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="border p-2 text-center">{i + 1}</td>
                      <td className="border p-2 font-bold">{st.name}</td>
                      <td className="border p-2 font-mono text-blue-700">{st.code || `HS${i + 1}`}</td>
                      <td className="border p-2 text-center font-mono">123</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleDeleteStudent(st.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Nhập danh sách học sinh ({currentClass.name})</h3>
              <button onClick={() => setIsImportOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Dán danh sách tên học sinh vào đây (mỗi em một dòng):</p>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Nguyễn Văn An&#10;Trần Thị Bình&#10;Lê Hoàng Cường"
              className="w-full p-2 border rounded text-xs font-sans outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsImportOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold cursor-pointer">Hủy</button>
              <button onClick={handleImport} className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold shadow cursor-pointer">Xác nhận nhập</button>
            </div>
          </div>
        </div>
      )}

      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Thêm học sinh ({currentClass.name})</h3>
              <button onClick={() => setIsAddStudentOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold mb-1">Họ và tên:</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nhập tên học sinh..." className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-bold mb-1">Mã HS (Tùy chọn):</label>
                <input type="text" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="VD: HS01" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsAddStudentOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded text-xs font-bold cursor-pointer">Hủy</button>
              <button onClick={handleAddSingle} className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold shadow cursor-pointer">Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
