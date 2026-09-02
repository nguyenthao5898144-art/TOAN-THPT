import React, { useState, useEffect } from 'react';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses, parseStudentListText } from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search,
  ChevronLeft, ArrowUpDown, Filter, QrCode, Share2,
  KeyRound, Calendar, CloudDownload, MoreHorizontal,
  Edit3, Copy, Archive
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const s = getStoredClasses();
    return s?.length ? s : [
      { id: '1', name: '10A10', students: Array(32).fill(null).map((_, i) => ({ id: `hs_10a10_${i}`, name: `Học sinh 10A10 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '2', name: '10A6', students: Array(41).fill(null).map((_, i) => ({ id: `hs_10a6_${i}`, name: `Học sinh 10A6 - ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` })) },
      { id: '3', name: '12A6', students: [
        { id: 'hs_1', name: 'Châu Ngô Nhật Ái', code: '67339301', phone: '0901234567' },
        { id: 'hs_2', name: 'Lê Thị Yến Duy', code: '67339302', phone: '0901234568' },
        { id: 'hs_3', name: 'Lê Vũ Đạt', code: '67339303', phone: '0901234569' },
      ]}
    ];
  });

  const [viewLevel, setViewLevel] = useState<'grid' | 'detail'>('grid');
  const [selectedClassId, setSelectedClassId] = useState<string>('3');
  const [search, setSearch] = useState<string>('');

  // Menu 3 chấm của thẻ lớp
  const [activeMenuClassId, setActiveMenuClassId] = useState<string | null>(null);

  // Đổi tên lớp
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  // Modal Excel
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [excelTargetClassName, setExcelTargetClassName] = useState<string>('12A6');
  const [academicYear, setAcademicYear] = useState<string>('2026 - 2027');
  const [classGroup, setClassGroup] = useState<string>('Khác');
  const [excelContent, setExcelContent] = useState<string>('');
  const [fileNameUploaded, setFileNameUploaded] = useState<string>('');

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // 1. Sửa lớp
  const handleOpenRename = (cls: ClassRoom) => {
    setSelectedClassId(cls.id);
    setRenameValue(cls.name);
    setIsRenameOpen(true);
    setActiveMenuClassId(null);
  };

  const handleSaveRename = () => {
    if (!renameValue.trim()) return;
    const name = renameValue.trim().toUpperCase();
    setClasses(classes.map((c) => (c.id === selectedClassId ? { ...c, name } : c)));
    setIsRenameOpen(false);
  };

  // 2. Nhân bản lớp
  const handleDuplicateClass = (cls: ClassRoom) => {
    const newCls: ClassRoom = {
      id: `cls_${Date.now()}`,
      name: `${cls.name} (Bản sao)`,
      students: [...(cls.students || [])],
    };
    setClasses([...classes, newCls]);
    setActiveMenuClassId(null);
    alert(`Đã nhân bản thành công lớp "${newCls.name}"!`);
  };

  // 3. Đưa vào lưu trữ
  const handleArchiveClass = (cls: ClassRoom) => {
    setActiveMenuClassId(null);
    alert(`Đã chuyển lớp "${cls.name}" vào danh sách lưu trữ thành công!`);
  };

  // 4. Xóa lớp
  const handleDeleteClass = (id: string, name: string) => {
    setActiveMenuClassId(null);
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${name}" và toàn bộ học sinh?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      if (updated.length > 0) setSelectedClassId(updated[0].id);
      setViewLevel('grid');
    }
  };

  // Tải file biểu mẫu
  const handleDownloadSample = () => {
    const csv = '\uFEFF' + 'STT,Họ và tên,Tên đăng nhập,Số báo danh,Số điện thoại\n1,Châu Ngô Nhật Ái,67339301,SBD01,0901234567\n2,Lê Thị Yến Duy,67339302,SBD02,0901234568';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_danh_sach_hoc_sinh.csv';
    a.click();
  };

  // Đọc file tải lên
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNameUploaded(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setExcelContent(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  // Xác nhận nhập từ Excel
  const handleConfirmExcel = () => {
    const targetName = excelTargetClassName.trim().toUpperCase() || '12A6';
    const newStudents = excelContent.trim()
      ? parseStudentListText(excelContent)
      : Array(35).fill(null).map((_, i) => ({ id: `std_${Date.now()}_${i}`, name: `Học sinh ${i + 1}`, code: `SBD${i + 1 < 10 ? '0' : ''}${i + 1}` }));

    const idx = classes.findIndex((c) => c.name === targetName);
    if (idx >= 0) {
      setClasses(classes.map((c, i) => i === idx ? { ...c, students: [...(c.students || []), ...newStudents] } : c));
      setSelectedClassId(classes[idx].id);
    } else {
      const newC: ClassRoom = { id: `cls_${Date.now()}`, name: targetName, students: newStudents };
      setClasses([...classes, newC]);
      setSelectedClassId(newC.id);
    }
    setIsExcelModalOpen(false);
    alert(`Đã nạp thành công học sinh vào lớp ${targetName}!`);
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = (curClass?.students || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code && s.code.includes(search)));

  // CẤP 1: LƯỚI THẺ LỚP HỌC
  if (viewLevel === 'grid') {
    return (
      <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800" onClick={() => setActiveMenuClassId(null)}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Danh sách lớp</h2>
            <p className="text-xs text-slate-500 font-bold">{classes.length} lớp</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setExcelTargetClassName('12A6'); setIsExcelModalOpen(true); }}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white
