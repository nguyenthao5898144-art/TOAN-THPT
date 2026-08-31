import React, { useState } from 'react';
import { ClassRoom, StudentAccount } from '../types';
import { getStoredClasses, saveClasses, parseStudentListText } from '../utils/classStorage';
import { Users, Plus, Upload, Trash2, FileSpreadsheet, CheckCircle2, Copy, X, KeyRound, Phone } from 'lucide-react';

interface ClassManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassManagementModal: React.FC<ClassManagementModalProps> = ({ isOpen, onClose }) => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => getStoredClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  // State tạo lớp mới
  const [newClassName, setNewClassName] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);
  
  // State nhập học sinh bằng text/Excel
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassRoom = {
      id: `class_${Date.now()}`,
      name: newClassName.trim().toUpperCase(),
      academicYear: '2026 - 2027',
      students: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    saveClasses(updated);
    setSelectedClassId(newClass.id);
    setNewClassName('');
    setIsAddingClass(false);
    showToast(`Đã tạo lớp ${newClass.name} thành công!`);
  };

  const handleImportStudents = () => {
    if (!importText.trim() || !currentClass) return;
    const newStudents = parseStudentListText(importText, currentClass.name);
    if (newStudents.length === 0) {
      showToast('Không tìm thấy thông tin học sinh hợp lệ.');
      return;
    }

    const updatedClasses = classes.map(c => {
      if (c.id === currentClass.id) {
        // Gộp và loại trùng SĐT
        const phoneSet = new Set(c.students.map(s => s.phone));
        const uniqueIncoming = newStudents.filter(s => !phoneSet.has(s.phone));
        return {
          ...c,
          students: [...c.students, ...uniqueIncoming]
        };
      }
      return c;
    });

    setClasses(updatedClasses);
    saveClasses(updatedClasses);
    setImportText('');
    setIsImporting(false);
    showToast(`Đã thêm ${newStudents.length} học sinh và tạo tài khoản tự động!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = classes.map(c => {
      if (c.id === currentClass.id) {
        return {
          ...c,
          students: c.students.filter(s => s.id !== studentId)
        };
      }
      return c;
    });
    setClasses(updated);
    saveClasses(updated);
    showToast('Đã xóa học sinh khỏi danh sách lớp.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">QUẢN LÝ LỚP HỌC & TÀI KHOẢN HỌC SINH</h2>
              <p className="text-xs text-slate-400">Tự động tạo tài khoản đăng nhập từ Số điện thoại của học sinh</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Lớp học bên trái, Danh sách HS bên phải */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Cột trái: Danh sách lớp */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Danh sách lớp</span>
              <button
                onClick={() => setIsAddingClass(true)}
                className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm lớp
              </button>
            </div>

            {isAddingClass && (
              <div className="p-2.5 bg-white border border-blue-300 rounded-xl space-y-2 shadow-xs">
                <input
                  type="text"
                  placeholder="Tên lớp (VD: 12A1)"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold"
                />
                <div className="flex justify-end gap-1">
                  <button onClick={() => setIsAddingClass(false)} className="px-2 py-1 text-[11px] text-slate-500">Hủy</button>
                  <button onClick={handleCreateClass} className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-bold">Lưu</button>
                </div>
              </div>
            )}

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {classes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    currentClass?.id === c.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Lớp {c.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    currentClass?.id === c.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.students.length} HS
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cột phải: Chi tiết học sinh của lớp */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {currentClass ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Danh Sách Lớp {currentClass.name}</h3>
                    <p className="text-xs text-slate-500">Tổng số: <strong>{currentClass.students.length} học sinh</strong></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsImporting(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Nhập từ Excel / File SĐT</span>
                    </button>
                  </div>
                </div>

                {/* Form Import dán danh sách */}
                {isImporting && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        Dán trực tiếp danh sách học sinh từ Excel vào đây:
                      </span>
                      <button onClick={() => setIsImporting(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      * Định dạng hỗ trợ: <code>Họ và tên [Tab] Số điện thoại</code> hoặc <code>STT [Tab] Họ tên [Tab] Lớp [Tab] SĐT</code>
                    </p>
                    <textarea
                      rows={5}
                      value={importText}
                      onChange={e => setImportText(e.target.value)}
                      placeholder={"Nguyễn Văn An\t0912345671\nTrần Thị Mai\t0912345672\nLê Hoàng Nam\t0912345673"}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsImporting(false)} className="px-3 py-1.5 bg-white border rounded-xl text-xs">Hủy</button>
                      <button onClick={handleImportStudents} className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
                        Tạo tài khoản tự động ({importText.split('\n').filter(Boolean).length} HS)
                      </button>
                    </div>
                  </div>
                )}

                {/* Bảng danh sách tài khoản học sinh */}
                {currentClass.students.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-semibold">Chưa có học sinh trong lớp {currentClass.name}</p>
                    <button onClick={() => setIsImporting(true)} className="mt-2 text-xs text-blue-600 font-bold underline">
                      + Tải lên hoặc Dán danh sách học sinh kèm SĐT
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-12 text-center">STT</th>
                          <th className="p-3">Họ và tên</th>
                          <th className="p-3">Số điện thoại (Username)</th>
                          <th className="p-3">Mật khẩu mặc định</th>
                          <th className="p-3 text-center w-16">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentClass.students.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                            <td className="p-3 font-mono font-semibold text-blue-700 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{s.phone}</span>
                            </td>
                            <td className="p-3 font-mono text-emerald-700 flex items-center gap-1">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              <span>{s.password || s.phone.slice(-4) || '123'}</span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-500">Vui lòng chọn hoặc tạo lớp học.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
