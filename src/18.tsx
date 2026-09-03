import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ClassRoom, Student } from './classStorage';
import { getStoredClasses, saveClasses } from './classStorage';
import {
  Users, Plus, Trash2, FileSpreadsheet, X, Search,
  ChevronLeft, ArrowUpDown, Share2, KeyRound, CloudDownload,
  MoreHorizontal, Edit3, Copy, Archive, QrCode
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

  // Modal Excel
  const [isExcelOpen, setIsExcelOpen] = useState<boolean>(false);
  const [excelTargetName, setExcelTargetName] = useState<string>('12A6');
  const [excelText, setExcelText] = useState<string>('');
  const [fileNameUploaded, setFileNameUploaded] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  useEffect(() => { if (classes.length) saveClasses(classes); }, [classes]);

  const curClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // 1. XUẤT FILE BIỂU MẪU .XLSX (CHUẨN EXCEL 100% Y HỆT HÌNH ẢNH CỦA THẦY)
  const handleDownloadSampleXlsx = async () => {
    try {
      const zip = new JSZip();

      // Danh sách chuỗi hiển thị chuẩn
      const strings = [
        'STT', 'Họ và tên', 'Giới tính', 'Tên đăng nhập', 'Số báo danh', 'Số điện thoại', 'Ghi chú',
        'Châu Ngô Nhật Ái', 'Nữ', '67339301', 'SBD01', '0901234567',
        'Lê Yến Duy', 'Nam', '67339302', 'SBD02', '0901234568'
      ];

      const sstXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + strings.length + '" uniqueCount="' + strings.length + '">' +
        strings.map((s) => '<si><t>' + s + '</t></si>').join('') +
        '</sst>';

      const sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<sheetData>' +
        '<row r="1">' +
        '<c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c>' +
        '<c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c><c r="F1" t="s"><v>5</v></c><c r="G1" t="s"><v>6</v></c>' +
        '</row>' +
        '<row r="2">' +
        '<c r="A2"><v>1</v></c><c r="B2" t="s"><v>7</v></c><c r="C2" t="s"><v>8</v></c>' +
        '<c r="D2" t="s"><v>9</v></c><c r="E2" t="s"><v>10</v></c><c r="F2" t="s"><v>11</v></c>' +
        '</row>' +
        '<row r="3">' +
        '<c r="A3"><v>2</v></c><c r="B3" t="s"><v>12</v></c><c r="C3" t="s"><v>13</v></c>' +
        '<c r="D3" t="s"><v>14</v></c><c r="E3" t="s"><v>15</v></c><c r="F3" t="s"><v>16</v></c>' +
        '</row>' +
        '</sheetData></worksheet>';

      zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/
