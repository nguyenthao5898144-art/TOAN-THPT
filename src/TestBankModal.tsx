import React, { useState, useEffect } from 'react';
import { GeneratedTest, Question } from '../types';
import {
  StoredTestItem,
  getStoredTestBank,
  saveTestToBank,
  deleteStoredTest,
  deleteMultipleStoredTests,
  clearAllStoredTests,
  updateStoredTest,
  duplicateStoredTest,
  exportTestBankToJson,
  importTestBankFromJson,
  generateSeedBank,
  saveTestBankToStorage,
  formatStandardTestFileName,
  extractTestMetadata,
  findDuplicateStoredTest,
  generateSequencedFileName,
} from '../utils/testBankStorage';
import { exportTestToWord } from '../utils/wordExporter';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { MatrixTable } from './MatrixTable';
import { resolveQuestionDiagram } from '../utils/mathGraphParser';
import {
  FolderArchive,
  Search,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Share2,
  X,
  Check,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';

interface TestBankModalProps {
  currentTest: GeneratedTest;
  onLoadTest: (test: GeneratedTest) => void;
  onSaveCurrentTest?: () => void;
  onClose?: () => void;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  currentTest,
  onLoadTest,
  onClose,
}) => {
  const [bank, setBank] = useState<StoredTestItem[]>(() => getStoredTestBank());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('Tất cả');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('Tất cả');

  // Multi-selection state for batch file operations (delete, download)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals inside test bank
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [previewTest, setPreviewTest] = useState<StoredTestItem | null>(null);
  const [editingItem, setEditingItem] = useState<StoredTestItem | null>(null);

  // Dedicated In-App Confirmation Modals for file deletions
  const [itemToDelete, setItemToDelete] = useState<StoredTestItem | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isRestoreDefaultsModalOpen, setIsRestoreDefaultsModalOpen] = useState(false);

  // Form state for saving current test with standard filename: Toán (10, 11, 12)-tên chủ đề-tên bài học
  const defaultMeta = extractTestMetadata(currentTest);
  const [saveGrade, setSaveGrade] = useState(defaultMeta.grade);
  const [saveClass, setSaveClass] = useState(defaultMeta.className || 'Lớp 12');
  const [saveTopic, setSaveTopic] = useState(defaultMeta.topicName || 'Ứng dụng đạo hàm để khảo sát hàm số');
  const [saveLesson, setSaveLesson] = useState(defaultMeta.lessonName || 'Tính đơn điệu của hàm số');
  const [saveDuration, setSaveDuration] = useState(currentTest.config.durationMinutes || 45);
  const [saveSchool, setSaveSchool] = useState(currentTest.config.schoolName || 'TRƯỜNG THPT MAI THANH THẾ');

  // Preview of the standard generated filename in real-time
  const computedStandardFileName = formatStandardTestFileName(saveGrade, saveTopic, saveLesson, true);
  const computedDisplayName = formatStandardTestFileName(saveGrade, saveTopic, saveLesson, false);

  // Notification toast inside bank
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyFileName = (fileName: string, id: string) => {
    navigator.clipboard.writeText(`${fileName}.docx`);
    setCopiedId(id);
    showToast(`📋 Đã copy tên file chuẩn: ${fileName}.docx`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const refreshBank = () => {
    const updated = getStoredTestBank();
    setBank(updated);
    // Prune any selectedIds that no longer exist
    const existingIds = new Set(updated.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => existingIds.has(id)));
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredItems: StoredTestItem[]) => {
    const filteredIds = filteredItems.map((item) => item.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...filteredIds]));
      setSelectedIds(merged);
    }
  };

  // 1. Save current test to bank
  const handleConfirmSaveCurrentTest = () => {
    const isDup = findDuplicateStoredTest(computedStandardFileName, saveTopic, saveLesson);
    const saved = saveTestToBank(currentTest, {
      grade: saveGrade,
      className: saveClass,
      topicName: saveTopic,
      lessonName: saveLesson,
      fileName: computedStandardFileName,
      displayName: computedDisplayName,
      allowDuplicateSequence: !!isDup,
    });
    refreshBank();
    setIsSaveModalOpen(false);
    if (isDup) {
      showToast(`✅ Đã lưu đề với số thứ tự mới: "${saved.fileName}.docx"!`);
    } else {
      showToast(`✅ Đã lưu đề "${saved.fileName}.docx" vào kho lưu trữ thành công!`);
    }
  };

  // 2. Load test to workspace
  const handleApplyTestToWorkspace = (item: StoredTestItem) => {
    onLoadTest(item.test);
    showToast(`🚀 Đã nạp đề "${item.displayName}" vào bàn làm việc!`);
    if (onClose) onClose();
  };

  // 3. Export Word directly with standard name
  const handleExportWordDirect = async (item: StoredTestItem) => {
    try {
      await exportTestToWord(item.test, `${item.fileName}.docx`);
      showToast(`📄 Đã tải xuống file Word: ${item.fileName}.docx`);
    } catch (err) {
      console.error('Word export error:', err);
      showToast('❌ Có lỗi khi xuất file Word.');
    }
  };

  // 4. Duplicate test
  const handleDuplicate = (id: string) => {
    const dup = duplicateStoredTest(id);
    if (dup) {
      refreshBank();
      showToast(`📋 Đã nhân bản đề thành "${dup.displayName}"!`);
    }
  };

  // 5. Delete individual test item
  const handleConfirmDeleteSingle = (target?: StoredTestItem) => {
    const item = target || itemToDelete;
    if (!item) return;
    const { id, fileName } = item;
    const updated = deleteStoredTest(id);
    setBank(updated);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (previewTest?.id === id) setPreviewTest(null);
    setItemToDelete(null);
    showToast(`🗑️ Đã xóa file "${fileName}.docx" khỏi kho lưu trữ!`);
  };

  // 6. Batch Delete Selected Files
  const handleConfirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const updated = deleteMultipleStoredTests(selectedIds);
    setBank(updated);
    setSelectedIds([]);
    if (previewTest && selectedIds.includes(previewTest.id)) {
      setPreviewTest(null);
    }
    setIsBatchDeleteModalOpen(false);
    showToast(`🗑️ Đã xóa vĩnh viễn ${count} file đã chọn khỏi kho!`);
  };

  // 7. Batch Download Word Files
  const handleBatchDownloadWord = async () => {
    const itemsToDownload = bank.filter((item) => selectedIds.includes(item.id));
    if (itemsToDownload.length === 0) return;
    showToast(`📥 Đang xuất ${itemsToDownload.length} file Word...`);
    for (const item of itemsToDownload) {
      try {
        await exportTestToWord(item.test, `${item.fileName}.docx`);
      } catch (e) {
        console.error('Export error for', item.fileName, e);
      }
    }
    showToast(`✅ Đã tải xuống ${itemsToDownload.length} file Word hoàn tất!`);
  };

  // 8. Clear all files
  const handleConfirmClearAll = () => {
    clearAllStoredTests();
    setSelectedIds([]);
    setBank([]);
    setPreviewTest(null);
    setIsClearAllModalOpen(false);
    showToast('🗑️ Đã dọn sạch toàn bộ kho đề thi lưu trữ!');
  };

  // 9. Save edit item
  const handleConfirmEdit = () => {
    if (!editingItem) return;
    updateStoredTest(editingItem.id, {
      grade: editingItem.grade,
      className: editingItem.className,
      topicName: editingItem.topicName,
      lessonName: editingItem.lessonName,
      topicLesson: `${editingItem.topicName} - ${editingItem.lessonName}`,
      fileName: editingItem.fileName,
      displayName: editingItem.displayName,
      durationMinutes: editingItem.durationMinutes,
      schoolName: editingItem.schoolName,
    });
    refreshBank();
    setEditingItem(null);
    showToast('💾 Đã cập nhật thông tin và tên file đề thi!');
  };

  // 10. Backup & Restore
  const handleExportAllJson = () => {
    exportTestBankToJson();
    showToast('📤 Đã tải xuống file sao lưu Ngân hàng đề thi (JSON)!');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importTestBankFromJson(content);
        if (res.success) {
          refreshBank();
          showToast(`📥 Đã nạp thành công ${res.count} đề thi vào Ngân hàng lưu trữ!`);
        } else {
          showToast(`❌ Lỗi: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestoreDefaults = () => {
    const seeds = generateSeedBank();
    saveTestBankToStorage(seeds);
    setBank(seeds);
    setSelectedIds([]);
    setIsRestoreDefaultsModalOpen(false);
    showToast('🔄 Đã nạp lại các bộ đề mẫu chuẩn GDPT 2018!');
  };

  // Filtering
  const filteredBank = bank.filter((item) => {
    const topicStr = (item.topicName || item.topicLesson || '').toLowerCase();
    const lessonStr = (item.lessonName || '').toLowerCase();
    const gradeStr = (item.grade || '').toLowerCase();
    const nameStr = (item.displayName || '').toLowerCase();
    const fileStr = (item.fileName || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchSearch =
      query === '' ||
      fileStr.includes(query) ||
      nameStr.includes(query) ||
      topicStr.includes(query) ||
      lessonStr.includes(query) ||
      gradeStr.includes(query);

    const matchGrade = selectedGradeFilter === 'Tất cả' || item.grade === selectedGradeFilter;
    const matchTopic =
      selectedTopicFilter === 'Tất cả' ||
      topicStr.includes(selectedTopicFilter.toLowerCase()) ||
      lessonStr.includes(selectedTopicFilter.toLowerCase());

    return matchSearch && matchGrade && matchTopic;
  });

  // Calculate stats
  const totalQuestionsInBank = bank.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  const isAllFilteredSelected =
    filteredBank.length > 0 && filteredBank.every((item) => selectedIds.includes(item.id));

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center space-x-2 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                <FolderArchive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span>NGÂN HÀNG LƯU TRỮ ĐỀ ĐÃ TẠO</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                    {bank.length} đề thi
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportAllJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Tải toàn bộ ngân hàng đề về máy tính (.json)"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sao lưu kho (JSON)</span>
            </button>

            <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Nạp từ file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>

            {/* Clear all files button */}
            {bank.length > 0 && (
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="px-2.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs font-semibold rounded-xl border border-rose-800/60 transition-all flex items-center space-x-1 cursor-pointer"
                title="Xóa toàn bộ kho file đề thi"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Xóa tất cả file</span>
              </button>
            )}

            <button
              onClick={() => setIsRestoreDefaultsModalOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Khôi phục lại các đề mẫu chuẩn GDPT 2018"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Tổng số đề đã lưu</span>
            <span className="text-base font-extrabold text-blue-300">{bank.length} đề thi</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Tổng số câu hỏi trong kho</span>
            <span className="text-base font-extrabold text-emerald-300">{totalQuestionsInBank} câu</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Định dạng xuất bản</span>
            <span className="text-base font-extrabold text-amber-300">Word (.docx) & JSON</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm: Toán 12, Tên chủ đề, Tên bài học, file docx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grade Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Môn & Khối:
          </span>
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tất cả">Tất cả môn (10, 11, 12)</option>
            <option value="Toán 12">Toán 12</option>
            <option value="Toán 11">Toán 11</option>
            <option value="Toán 10">Toán 10</option>
          </select>
        </div>
      </div>

      {/* Batch Selection Action Bar (when 1 or more files are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950 text-white rounded-2xl p-3 sm:px-4 shadow-md border border-indigo-800 flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              Đã chọn {selectedIds.length} / {bank.length} file
            </span>
            <button
              onClick={() => handleSelectAll(filteredBank)}
              className="text-indigo-200 hover:text-white underline font-semibold text-xs cursor-pointer"
            >
              {isAllFilteredSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả ${filteredBank.length} file đang hiển thị`}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchDownloadWord}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Tải hàng loạt các file Word đã chọn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải {selectedIds.length} file Word</span>
            </button>

            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Xóa vĩnh viễn các file đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedIds.length} file đã chọn</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900 cursor-pointer"
              title="Hủy chọn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Select All shortcut bar when bank has items but none selected */}
      {bank.length > 0 && selectedIds.length === 0 && filteredBank.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <button
            onClick={() => handleSelectAll(filteredBank)}
            className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 font-semibold cursor-pointer py-1"
          >
            <Square className="w-4 h-4 text-slate-400" />
            <span>Chọn nhiều file để xóa hoặc tải hàng loạt</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Hiển thị {filteredBank.length} file
          </span>
        </div>
      )}

      {/* Tests Grid */}
      {filteredBank.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Chưa tìm thấy đề thi phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Hãy điều chỉnh từ khóa tìm kiếm hoặc chọn bộ lọc để tìm đề thi theo định dạng <strong>Toán (10, 11, 12)-tên chủ đề-tên bài học</strong>.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGradeFilter('Tất cả');
            }}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBank.map((item) => {
            const isCopied = copiedId === item.id;
            const isSelected = selectedIds.includes(item.id);
            const displayLesson = item.lessonName || item.topicLesson?.split(' - ')[1] || item.topicLesson;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-400/30 shadow-md bg-indigo-50/20'
                    : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                {/* Card Header with Checkbox & File Name Badge */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      {/* Checkbox for batch select */}
                      <button
                        onClick={() => handleToggleSelect(item.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-300 hover:border-indigo-400 text-transparent'
                        }`}
                        title={isSelected ? 'Bỏ chọn file này' : 'Chọn file này để xóa hoặc tải'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {item.grade || 'Toán 12'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Standard File Name Box */}
                  <div className="bg-slate-900 text-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between gap-2 shadow-xs group-hover:ring-1 group-hover:ring-emerald-400/50 transition-all">
                    <div className="flex items-center space-x-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate" title={`${item.fileName}.docx`}>
                        {item.fileName}.docx
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyFileName(item.fileName, item.id)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer transition-all"
                      title="Copy tên file chuẩn: Toán(10,11,12)-chủ đề-bài học"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Test Display Title */}
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm mt-2.5 line-clamp-2 leading-snug">
                    {item.displayName}
                  </h3>

                  {/* Subject & Lesson details */}
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-500 inline shrink-0" />
                    <span className="truncate" title={displayLesson}>
                      {displayLesson}
                    </span>
                  </p>
                </div>

                {/* Question Breakdown & Info */}
                <div className="p-4 space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Thời gian: <strong>{item.durationMinutes} phút</strong>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <Layers className="w-3 h-3" />
                      {item.totalQuestions} câu hỏi
                    </span>
                  </div>

                  {/* Structure badges */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                    <div className="bg-blue-50 text-blue-800 rounded p-1 border border-blue-100 font-medium">
                      MCQ: <strong>{item.questionCountByType.multipleChoice}</strong>
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 rounded p-1 border border-emerald-100 font-medium">
                      Đúng/Sai: <strong>{item.questionCountByType.trueFalse}</strong>
                    </div>
                    <div className="bg-purple-50 text-purple-800 rounded p-1 border border-purple-100 font-medium">
                      Trả lời ngắn: <strong>{item.questionCountByType.shortAnswer}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1 truncate">
                    Trường: {item.schoolName} • Năm học {item.academicYear}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  {/* Main Use Button */}
                  <button
                    onClick={() => handleApplyTestToWorkspace(item)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    title="Mở đề này vào khu vực soạn thảo và làm việc"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở đề này</span>
                  </button>

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewTest(item)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    title="Xem nhanh chi tiết đề thi và đáp án"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Direct Word Export */}
                  <button
                    onClick={() => handleExportWordDirect(item)}
                    className="p-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-all cursor-pointer"
                    title={`Tải xuống file Word chuẩn: ${item.fileName}.docx`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    title="Nhân bản đề này"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit Meta */}
                  <button
                    onClick={() => {
                      const itemCopy = JSON.parse(JSON.stringify(item));
                      if (!itemCopy.topicName && itemCopy.topicLesson) {
                        itemCopy.topicName = itemCopy.topicLesson.split(' - ')[0] || 'Ứng dụng đạo hàm';
                      }
                      if (!itemCopy.lessonName && itemCopy.topicLesson) {
                        itemCopy.lessonName = itemCopy.topicLesson.split(' - ')[1] || itemCopy.topicLesson;
                      }
                      setEditingItem(itemCopy);
                    }}
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    title="Đổi tên file / Chỉnh sửa thông tin đề"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete File Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 hover:border-rose-300 transition-all cursor-pointer"
                    title="Xóa file đề thi này khỏi kho lưu trữ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Xác nhận xóa file đơn lẻ (Safe in-app modal, no browser confirm dialog) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  XÁC NHẬN XÓA FILE ĐỀ THI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hành động này sẽ xóa vĩnh viễn file khỏi kho lưu trữ
                </p>
              </div>
            </div>

            {/* File info preview */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="bg-slate-900 text-emerald-300 px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{itemToDelete.fileName}.docx</span>
              </div>

              <div className="text-slate-800 font-bold leading-snug">
                {itemToDelete.displayName}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>{itemToDelete.grade}</span>
                <span>•</span>
                <span>{itemToDelete.totalQuestions} câu hỏi</span>
                <span>•</span>
                <span>{itemToDelete.durationMinutes} phút</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleConfirmDeleteSingle(itemToDelete)}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa file này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa nhiều file hàng loạt */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  XÓA HÀNG LOẠT {selectedIds.length} FILE ĐỀ THI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bạn có chắc chắn muốn xóa {selectedIds.length} file đã chọn khỏi kho lưu trữ?
                </p>
              </div>
            </div>

            {/* List of files to be deleted */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              {bank
                .filter((item) => selectedIds.includes(item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-medium flex items-center justify-between gap-2"
                  >
                    <span className="font-mono text-emerald-800 truncate">
                      {item.fileName}.docx
                    </span>
                    <span className="text-slate-400 shrink-0 text-[10px]">
                      {item.totalQuestions} câu
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa {selectedIds.length} file</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa toàn bộ kho */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  DỌN SẠCH TOÀN BỘ KHO FILE
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tất cả {bank.length} file đề thi trong kho lưu trữ sẽ bị xóa.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              💡 Thầy/Cô có thể nhấn nút <strong>"Sao lưu kho (JSON)"</strong> trước khi xóa để lưu lại bản sao dự phòng trên máy tính.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa sạch toàn bộ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận khôi phục đề mẫu */}
      {isRestoreDefaultsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  KHÔI PHỤC ĐỀ MẪU GDPT 2018
                </h3>
                <p className="text-[11px] text-slate-500">
                  Nạp lại các bộ đề mẫu chuẩn GDPT 2018 vào kho lưu trữ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Hệ thống sẽ tái thiết lập các bộ đề mẫu Toán 12 theo đúng quy chuẩn tên file: <code>Toán (10, 11, 12)-tên chủ đề-tên bài học</code>.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRestoreDefaultsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRestoreDefaults}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục đề mẫu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Save Current Test with Standard Format: Toán (10, 11, 12)-tên chủ đề-tên bài học */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    LƯU ĐỀ THI VÀO NGÂN HÀNG LƯU TRỮ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Quy chuẩn: <strong>Toán (10, 11, 12) - Tên chủ đề - Tên bài học</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Grade */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Môn & Khối học:
                </label>
                <select
                  value={saveGrade}
                  onChange={(e) => setSaveGrade(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Toán 12">Toán 12 (Lớp 12)</option>
                  <option value="Toán 11">Toán 11 (Lớp 11)</option>
                  <option value="Toán 10">Toán 10 (Lớp 10)</option>
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Tên chủ đề:
                </label>
                <input
                  type="text"
                  value={saveTopic}
                  onChange={(e) => setSaveTopic(e.target.value)}
                  placeholder="Ví dụ: Ứng dụng đạo hàm để khảo sát hàm số, Toạ độ và Vectơ trong không gian..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lesson */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Tên bài học:
                </label>
                <input
                  type="text"
                  value={saveLesson}
                  onChange={(e) => setSaveLesson(e.target.value)}
                  placeholder="Ví dụ: Tính đơn điệu của hàm số, Tọa độ của vectơ trong không gian Oxyz..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Real-time Generated File Name Preview */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl space-y-1.5 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                  TIÊU ĐỀ & TÊN FILE TỰ ĐỘNG SINH RA:
                </span>
                <div className="font-mono text-xs text-emerald-300 font-extrabold break-all flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{computedStandardFileName}.docx</span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  Tiêu đề đề thi: <strong className="text-white">{computedDisplayName}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSaveCurrentTest}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác nhận Lưu vào kho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Preview Stored Test */}
      {previewTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {previewTest.fileName}.docx
                  </span>
                  <span className="text-xs text-slate-400">
                    {previewTest.totalQuestions} câu hỏi • {previewTest.durationMinutes} phút
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {previewTest.displayName}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportWordDirect(previewTest)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải Word</span>
                </button>
                <button
                  onClick={() => {
                    handleApplyTestToWorkspace(previewTest);
                    setPreviewTest(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Nạp vào bàn làm việc</span>
                </button>
                <button
                  onClick={() => {
                    setItemToDelete(previewTest);
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-900/50 rounded-lg border border-rose-800 cursor-pointer"
                  title="Xóa file đề thi này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewTest(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions list body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50 text-xs">
              {previewTest.test.questions.map((q, idx) => {
                const diagId = resolveQuestionDiagram(q);
                return (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="text-blue-700 font-extrabold">
                        Câu {idx + 1}{' '}
                        <span className="text-slate-400 font-normal">
                          ({q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : q.type === 'true_false' ? 'Trắc nghiệm Đúng/Sai' : 'Trả lời ngắn'})
                        </span>
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Mức độ: {q.level}
                      </span>
                    </div>

                    <div className="text-slate-900 font-medium text-xs leading-relaxed">
                      <MathText text={q.content} />
                    </div>

                    {/* Diagram preview */}
                    <DiagramRenderer
                      diagramId={diagId}
                      questionContent={q.content}
                      imageUrl={q.imageUrl}
                    />

                    {/* Options */}
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.key}
                            className={`p-2 rounded-xl border text-[11px] ${
                              opt.key === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{opt.key}.</span>
                            <MathText text={opt.text} />
                            {opt.key === q.correctAnswer && (
                              <span className="ml-1 text-emerald-600 text-[10px]"> (Đáp án đúng)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True False Statements */}
                    {q.type === 'true_false' && (
                      <div className="space-y-1 pt-1">
                        {q.statements.map((st) => (
                          <div
                            key={st.id}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex-1 pr-2">
                              <span className="font-bold mr-1">({st.id})</span>
                              <MathText text={st.text} />
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                st.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Short answer */}
                    {q.type === 'short_answer' && (
                      <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-[11px]">
                        Đáp án: <strong className="text-purple-900">{q.correctAnswer}</strong>
                      </div>
                    )}

                    {/* Solution */}
                    {q.solution && (
                      <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 mt-2">
                        <span className="font-bold block text-amber-900 mb-0.5">Lời giải chi tiết:</span>
                        <MathText text={q.solution} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ma trận đề thi tự động đồng bộ nằm ngay dưới đề thi */}
              <div className="pt-6 border-t border-slate-200">
                <MatrixTable test={previewTest.test} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Item Metadata */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                CHỈNH SỬA TIÊU ĐỀ & TÊN FILE ĐỀ THI
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Môn & Khối (10, 11, 12):</label>
                <select
                  value={editingItem.grade}
                  onChange={(e) => {
                    const grade = e.target.value;
                    setEditingItem((prev) =>
                      prev
                        ? {
                            ...prev,
                            grade,
                            fileName: formatStandardTestFileName(grade, prev.topicName || 'ChuDe', prev.lessonName || 'BaiHoc', true),
                            displayName: formatStandardTestFileName(grade, prev.topicName || 'Chủ đề', prev.lessonName || 'Bài học', false),
                          }
                        : null
                    );
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Toán 12">Toán 12</option>
                  <option value="Toán 11">Toán 11</option>
                  <option value="Toán 10">Toán 10</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên chủ đề:</label>
                <input
                  type="text"
                  value={editingItem.topicName || ''}
                  onChange={(e) => {
                    const topicName = e.target.value;
                    setEditingItem((prev) =>
                      prev
                        ? {
                            ...prev,
                            topicName,
                            fileName: formatStandardTestFileName(prev.grade, topicName, prev.lessonName || 'BaiHoc', true),
                            displayName: formatStandardTestFileName(prev.grade, topicName, prev.lessonName || 'Bài học', false),
                          }
                        : null
                    );
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên bài học:</label>
                <input
                  type="text"
                  value={editingItem.lessonName || ''}
                  onChange={(e) => {
                    const lessonName = e.target.value;
                    setEditingItem((prev) =>
                      prev
                        ? {
                            ...prev,
                            lessonName,
                            fileName: formatStandardTestFileName(prev.grade, prev.topicName || 'ChuDe', lessonName, true),
                            displayName: formatStandardTestFileName(prev.grade, prev.topicName || 'Chủ đề', lessonName, false),
                          }
                        : null
                    );
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên file (.docx):</label>
                <input
                  type="text"
                  value={editingItem.fileName}
                  onChange={(e) => {
                    const fileName = e.target.value;
                    setEditingItem((prev) => (prev ? { ...prev, fileName } : null));
                  }}
                  className="w-full p-2 bg-slate-900 text-emerald-300 font-mono font-bold border border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề hiển thị:</label>
                <input
                  type="text"
                  value={editingItem.displayName}
                  onChange={(e) => {
                    const displayName = e.target.value;
                    setEditingItem((prev) => (prev ? { ...prev, displayName } : null));
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

