import React, { useState } from 'react';
import { GeneratedTest } from './types';
import { Layers, Download, Printer, Copy, Check, FileText, Sparkles, BookOpen, Info, Sliders, ListChecks, Table as TableIcon } from 'lucide-react';
import { buildStandardMatrixData, StandardMatrixData, StandardMatrixRow } from './matrixStandardGenerator';
import { exportStandardMatrixOnlyWord, exportSpecMatrixOnlyWord, exportBothMatricesWord, exportTestToWord, exportQuestionAndOutcomeMatricesWord } from './wordExporter';
import { MATH_12_SYLLABUS } from './math12Syllabus';

interface MatrixTableProps {
  test: GeneratedTest;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ test }) => {
  const [viewMode, setViewMode] = useState<'step2' | 'standard' | 'spec' | 'all'>('step2');
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const matrixData: StandardMatrixData = buildStandardMatrixData(test);
  const { summary, rows } = matrixData;

  const { questions, config } = test;
  const mcq = questions.filter((q) => q.type === 'multiple_choice');
  const tf = questions.filter((q) => q.type === 'true_false');
  const sa = questions.filter((q) => q.type === 'short_answer');

  const counts = {
    mcq: {
      nb: mcq.filter((q) => q.level === 'NhanBiet').length,
      th: mcq.filter((q) => q.level === 'ThongHieu').length,
      vd: mcq.filter((q) => q.level === 'VanDung').length,
      total: mcq.length,
    },
    tf: {
      nb: tf.filter((q) => q.level === 'NhanBiet').length,
      th: tf.filter((q) => q.level === 'ThongHieu').length,
      vd: tf.filter((q) => q.level === 'VanDung').length,
      total: tf.length,
    },
    sa: {
      nb: sa.filter((q) => q.level === 'NhanBiet').length,
      th: sa.filter((q) => q.level === 'ThongHieu').length,
      vd: sa.filter((q) => q.level === 'VanDung').length,
      total: sa.length,
    },
  };

  const totalNB = counts.mcq.nb + counts.tf.nb + counts.sa.nb;
  const totalTH = counts.mcq.th + counts.tf.th + counts.sa.th;
  const totalVD = counts.mcq.vd + counts.tf.vd + counts.sa.vd;
  const totalQuestions = questions.length;
  const totalScore = (counts.mcq.total * 0.25 + counts.tf.total * 1.0 + counts.sa.total * 0.5).toFixed(1);

  // Outcome breakdown rows
  interface Step2OutcomeItem {
    topicName: string;
    lessonName: string;
    outcomeText: string;
    nb: number;
    th: number;
    vd: number;
    total: number;
  }

  const outcomeMap = new Map<string, { topicName: string; lessonName: string; nb: number; th: number; vd: number }>();

  if (config.outcomeMatrix && Object.keys(config.outcomeMatrix).length > 0) {
    Object.entries(config.outcomeMatrix).forEach(([outcomeText, c]: [string, any]) => {
      let tName = 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số';
      let lName = 'Tính đơn điệu của hàm số';

      for (const t of MATH_12_SYLLABUS) {
        for (const l of t.lessons) {
          if (l.outcomes.includes(outcomeText)) {
            tName = t.name;
            lName = l.name;
            break;
          }
        }
      }

      outcomeMap.set(outcomeText, {
        topicName: tName,
        lessonName: lName,
        nb: c.nhanBiet || 0,
        th: c.thongHieu || 0,
        vd: c.vanDung || 0,
      });
    });
  }

  questions.forEach((q) => {
    const outcomeText = q.learningOutcome?.trim() || 'Vận dụng kiến thức bài học để giải quyết bài toán.';
    const tName = q.topicName?.trim() || 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số';
    const lName = q.lessonName?.trim() || 'Tính đơn điệu của hàm số';

    if (!outcomeMap.has(outcomeText)) {
      outcomeMap.set(outcomeText, {
        topicName: tName,
        lessonName: lName,
        nb: 0,
        th: 0,
        vd: 0,
      });
    }

    const item = outcomeMap.get(outcomeText)!;
    if (q.level === 'NhanBiet') item.nb += 1;
    else if (q.level === 'ThongHieu') item.th += 1;
    else if (q.level === 'VanDung') item.vd += 1;
  });

  if (outcomeMap.size === 0) {
    outcomeMap.set('Nhận biết tính đồng biến, nghịch biến của hàm số trên một khoảng.', {
      topicName: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
      lessonName: 'Tính đơn điệu của hàm số',
      nb: 1,
      th: 1,
      vd: 0,
    });
  }

  const step2OutcomeRows: Step2OutcomeItem[] = [];
  let outcomeCounter = 1;
  outcomeMap.forEach((val, outText) => {
    step2OutcomeRows.push({
      topicName: val.topicName,
      lessonName: val.lessonName,
      outcomeText: outText.startsWith('[YCCĐ') || outText.startsWith('YCCĐ') ? outText : `[YCCĐ ${outcomeCounter}] ${outText}`,
      nb: val.nb,
      th: val.th,
      vd: val.vd,
      total: val.nb + val.th + val.vd,
    });
    outcomeCounter++;
  });

  const uniqueTopics = Array.from(new Set(questions.map((q) => q.topicName || 'Toán 12')));
  const uniqueLessons = Array.from(new Set(questions.map((q) => q.lessonName || 'Toán 12')));

  const handleExportBothMatricesWord = async () => {
    setIsExporting(true);
    try {
      await exportBothMatricesWord(test);
    } catch (err) {
      console.error('Error exporting both matrices word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStep2OnlyWord = async () => {
    setIsExporting(true);
    try {
      await exportQuestionAndOutcomeMatricesWord(test);
    } catch (err) {
      console.error('Error exporting step2 matrices word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMatrixWord = async () => {
    setIsExporting(true);
    try {
      if (viewMode === 'spec') {
        await exportSpecMatrixOnlyWord(test);
      } else if (viewMode === 'step2') {
        await exportQuestionAndOutcomeMatricesWord(test);
      } else {
        await exportStandardMatrixOnlyWord(test);
      }
    } catch (err) {
      console.error('Error exporting matrix word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFullTestWord = async () => {
    setIsExporting(true);
    try {
      await exportTestToWord(test);
    } catch (err) {
      console.error('Error exporting full test word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTable = () => {
    const tableElement = document.getElementById(
      viewMode === 'step2'
        ? 'step2-matrix-section'
        : viewMode === 'spec'
        ? 'spec-matrix-table'
        : 'standard-matrix-table'
    );
    if (!tableElement) return;

    const range = document.createRange();
    range.selectNode(tableElement);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand('copy');
        selection.removeAllRanges();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy matrix table:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-7 mb-8 print:p-0 print:border-none print:shadow-none">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4 print:hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                MA TRẬN & BẢNG ĐẶC TẢ ĐỀ THI
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-extrabold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                CHUẨN BỘ GD&ĐT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống ma trận phân bổ theo dạng câu hỏi, mức độ nhận thức, chi tiết YCCĐ và khung 19 cột chuẩn GDPT 2018
            </p>
          </div>
        </div>

        {/* View mode toggle & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle View */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('step2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'step2'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ma trận dạng câu & YCCĐ</span>
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'standard'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Ma trận định kỳ 19 cột</span>
            </button>
            <button
              onClick={() => setViewMode('spec')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'spec'
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Bảng đặc tả YCCĐ</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toàn bộ 3 bảng</span>
            </button>
          </div>

          {/* Copy Table */}
          <button
            onClick={handleCopyTable}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Sao chép bảng ma trận vào Clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            title="In hoặc Lưu PDF ma trận"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In / PDF</span>
          </button>

          {/* Export All Matrices Word */}
          <button
            onClick={handleExportBothMatricesWord}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Tải riêng file Word (.docx) chứa toàn bộ 3 Bảng Ma trận & Bảng đặc tả"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất 3 Ma trận (.docx)</span>
          </button>

          {/* Export Full Test Word */}
          <button
            onClick={handleExportFullTestWord}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Tải toàn bộ Đề thi + Đáp án + Cả 3 Bảng Ma trận & Bảng đặc tả sang Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất Đề + 3 Ma trận (.docx)</span>
          </button>
        </div>
      </div>

      {/* Summary Score Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:hidden">
        <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Phần I: Nhiều lựa chọn</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-blue-950">{summary.totalCount.mcq.total} câu</span>
            <span className="text-xs font-bold text-blue-700">{summary.score.mcq}đ ({summary.percentage.mcq}%)</span>
          </div>
        </div>

        <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Phần II: “Đúng – Sai”</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-indigo-950">{summary.totalCount.trueFalse.total} ý ({test.summary.totalTrueFalse} câu)</span>
            <span className="text-xs font-bold text-indigo-700">{summary.score.trueFalse}đ ({summary.percentage.trueFalse}%)</span>
          </div>
        </div>

        <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">Phần III: Trả lời ngắn</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-purple-950">{summary.totalCount.shortAnswer.total} câu</span>
            <span className="text-xs font-bold text-purple-700">{summary.score.shortAnswer}đ ({summary.percentage.shortAnswer}%)</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Tổng Điểm & Tỉ lệ nhận thức</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-emerald-950">{summary.score.total} điểm</span>
            <span className="text-[11px] font-bold text-emerald-700">
              {summary.percentage.byLevel.nhanBiet}% - {summary.percentage.byLevel.thongHieu}% - {summary.percentage.byLevel.vanDung}%
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: 2 MA TRẬN TRONG ẢNH (DẠNG CÂU HỎI & CHI TIẾT YCCĐ) */}
      {(viewMode === 'step2' || viewMode === 'all') && (
        <div id="step2-matrix-section" className="space-y-6">
          {/* Table 1: Ma trận theo dạng câu hỏi */}
          <div className="bg-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-emerald-200/80">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-black text-xs shadow-xs">
                  BẢNG 1
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>BẢNG MA TRẬN THEO DẠNG CÂU HỎI (ĐỊNH DẠNG BỘ GD&ĐT)</span>
                </h3>
              </div>
              <button
                onClick={handleExportStep2OnlyWord}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Word 2 bảng này</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white mb-4 shadow-xs">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Dạng câu hỏi (Định dạng Bộ GD&ĐT)</th>
                    <th className="p-3 text-center text-emerald-800 bg-emerald-50/70">Nhận biết</th>
                    <th className="p-3 text-center text-blue-800 bg-blue-50/70">Thông hiểu</th>
                    <th className="p-3 text-center text-amber-800 bg-amber-50/70">Vận dụng</th>
                    <th className="p-3 text-center bg-slate-200 font-extrabold">Tổng số câu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">
                      Phần I: Trắc nghiệm 4 lựa chọn (Chọn 1 phương án)
                    </td>
                    <td className="p-3 text-center font-bold bg-emerald-50/20 text-emerald-900">{counts.mcq.nb}</td>
                    <td className="p-3 text-center font-bold bg-blue-50/20 text-blue-900">{counts.mcq.th}</td>
                    <td className="p-3 text-center font-bold bg-amber-50/20 text-amber-900">{counts.mcq.vd}</td>
                    <td className="p-3 text-center font-extrabold text-slate-900 bg-slate-100">{counts.mcq.total} câu</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">
                      Phần II: Trắc nghiệm Đúng/Sai (Mỗi câu gồm 4 ý a, b, c, d)
                    </td>
                    <td className="p-3 text-center font-bold bg-emerald-50/20 text-emerald-900">{counts.tf.nb}</td>
                    <td className="p-3 text-center font-bold bg-blue-50/20 text-blue-900">{counts.tf.th}</td>
                    <td className="p-3 text-center font-bold bg-amber-50/20 text-amber-900">{counts.tf.vd}</td>
                    <td className="p-3 text-center font-extrabold text-slate-900 bg-slate-100">{counts.tf.total} câu</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">
                      Phần III: Trắc nghiệm trả lời ngắn / Tự luận
                    </td>
                    <td className="p-3 text-center font-bold bg-emerald-50/20 text-emerald-900">{counts.sa.nb}</td>
                    <td className="p-3 text-center font-bold bg-blue-50/20 text-blue-900">{counts.sa.th}</td>
                    <td className="p-3 text-center font-bold bg-amber-50/20 text-amber-900">{counts.sa.vd}</td>
                    <td className="p-3 text-center font-extrabold text-slate-900 bg-slate-100">{counts.sa.total} câu</td>
                  </tr>
                  {/* Summary row */}
                  <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300">
                    <td className="p-3 font-black text-slate-900 uppercase">TỔNG CỘNG SỐ CÂU:</td>
                    <td className="p-3 text-center bg-emerald-100/60 text-emerald-950">{totalNB} câu</td>
                    <td className="p-3 text-center bg-blue-100/60 text-blue-950">{totalTH} câu</td>
                    <td className="p-3 text-center bg-amber-100/60 text-amber-950">{totalVD} câu</td>
                    <td className="p-3 text-center bg-slate-300 text-slate-950 font-black">{totalQuestions} câu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Live Preview / Summary Box */}
            <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-200/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                  <span className="font-bold text-xs text-purple-950 uppercase">
                    BẢNG XEM TRƯỚC MA TRẬN & TỔNG KẾT ĐIỂM SỐ:
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <span className="bg-white px-2.5 py-0.5 rounded border border-purple-200">
                    Đã chọn: {uniqueTopics.length} chủ đề ({uniqueLessons.length} bài học)
                  </span>
                  <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded shadow-xs">
                    Tổng: {totalQuestions} câu | {totalScore} điểm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-slate-700 shadow-xs">
                  <span className="font-bold text-emerald-700 block mb-0.5">🟢 Nhận biết ({totalNB} câu):</span>
                  <span>
                    {counts.mcq.nb} MCQ | {counts.tf.nb} ĐS | {counts.sa.nb} TL
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-slate-700 shadow-xs">
                  <span className="font-bold text-blue-700 block mb-0.5">🔵 Thông hiểu ({totalTH} câu):</span>
                  <span>
                    {counts.mcq.th} MCQ | {counts.tf.th} ĐS | {counts.sa.th} TL
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-slate-700 shadow-xs">
                  <span className="font-bold text-amber-700 block mb-0.5">🟠 Vận dụng ({totalVD} câu):</span>
                  <span>
                    {counts.mcq.vd} MCQ | {counts.tf.vd} ĐS | {counts.sa.vd} TL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table 2: Ma trận chi tiết YCCĐ */}
          <div className="bg-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-emerald-200/80">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-black text-xs shadow-xs">
                  BẢNG 2
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  <span>PHÂN BỔ SỐ CÂU CHI TIẾT THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ)</span>
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs text-left text-slate-700 border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 border-r border-slate-200 w-1/4">Chủ đề</th>
                    <th className="p-3 border-r border-slate-200 w-1/4">Bài học</th>
                    <th className="p-3 border-r border-slate-200">Yêu cầu cần đạt (YCCĐ)</th>
                    <th className="p-2.5 text-center text-emerald-800 bg-emerald-50/70 border-r border-slate-200 w-16">
                      NB
                    </th>
                    <th className="p-2.5 text-center text-blue-800 bg-blue-50/70 border-r border-slate-200 w-16">
                      TH
                    </th>
                    <th className="p-2.5 text-center text-amber-800 bg-amber-50/70 border-r border-slate-200 w-16">
                      VD
                    </th>
                    <th className="p-2.5 text-center bg-slate-200 w-20 font-bold">Tổng câu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {step2OutcomeRows.map((r, idx) => (
                    <tr key={`step2-r-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 border-r border-slate-200 align-top font-bold text-slate-800 bg-slate-50/40">
                        {r.topicName}
                      </td>
                      <td className="p-3 border-r border-slate-200 align-top text-blue-900 font-semibold">
                        {r.lessonName}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-slate-700 leading-relaxed">
                        {r.outcomeText}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 font-bold bg-emerald-50/20 text-emerald-900">
                        {r.nb > 0 ? r.nb : ''}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 font-bold bg-blue-50/20 text-blue-900">
                        {r.th > 0 ? r.th : ''}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 font-bold bg-amber-50/20 text-amber-900">
                        {r.vd > 0 ? r.vd : ''}
                      </td>
                      <td className="p-2 text-center font-extrabold text-slate-900 bg-slate-100">
                        {r.total > 0 ? `${r.total} câu` : '0'}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-3 text-center uppercase tracking-wide font-black">
                      TỔNG CỘNG SỐ CÂU PHÂN BỐ THEO YCCĐ:
                    </td>
                    <td className="p-2.5 text-center bg-emerald-100/70 text-emerald-950 font-black">
                      {totalNB} NB
                    </td>
                    <td className="p-2.5 text-center bg-blue-100/70 text-blue-950 font-black">
                      {totalTH} TH
                    </td>
                    <td className="p-2.5 text-center bg-amber-100/70 text-amber-950 font-black">
                      {totalVD} VD
                    </td>
                    <td className="p-2.5 text-center bg-slate-300 text-slate-950 font-black">
                      {totalQuestions} câu
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: MA TRẬN CHUẨN 20 CỘT THEO ẢNH BỘ GD&ĐT */}
      {(viewMode === 'standard' || viewMode === 'all') && (
        <div id="standard-matrix-table" className="space-y-4">
          {/* Printable Document Title */}
          <div className="text-center space-y-1 mb-4 print:block">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
              1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
            </h1>
            <p className="text-xs text-slate-700 italic font-medium">
              Môn: TOÁN 12 - Thời gian làm bài: {matrixData.durationMinutes} phút (Cấu trúc định dạng GDPT 2018)
            </p>
          </div>

          {/* Table Container with clean borders */}
          <div className="overflow-x-auto rounded-xl border border-slate-900/90 shadow-xs">
            <table className="w-full text-xs text-slate-900 border-collapse border border-slate-900 bg-white">
              {/* Table Headers */}
              <thead>
                {/* Header Row 1 */}
                <tr className="bg-white border-b border-slate-900 font-bold text-center">
                  <th rowSpan={4} className="border border-slate-900 px-2 py-2.5 w-8">TT</th>
                  <th rowSpan={4} className="border border-slate-900 px-3 py-2.5 min-w-[120px] max-w-[150px]">
                    Chủ đề/<br />Chương
                  </th>
                  <th rowSpan={4} className="border border-slate-900 px-3 py-2.5 min-w-[130px] max-w-[160px]">
                    Nội dung/<br />đơn vị kiến thức
                  </th>
                  <th rowSpan={4} className="border border-slate-900 px-3 py-2.5 min-w-[200px] text-center">
                    Yêu cầu cần đạt
                  </th>
                  <th colSpan={12} className="border border-slate-900 px-2 py-2">
                    Mức độ đánh giá
                  </th>
                  <th colSpan={3} rowSpan={3} className="border border-slate-900 px-2 py-2">
                    Tổng
                  </th>
                  <th rowSpan={4} className="border border-slate-900 px-2 py-2.5 w-14">
                    Tỉ lệ<br />%<br />điểm
                  </th>
                </tr>

                {/* Header Row 2 */}
                <tr className="bg-white border-b border-slate-900 font-bold text-center">
                  <th colSpan={9} className="border border-slate-900 px-2 py-1.5">
                    TNKQ
                  </th>
                  <th colSpan={3} rowSpan={2} className="border border-slate-900 px-2 py-1.5">
                    Tự luận
                  </th>
                </tr>

                {/* Header Row 3 */}
                <tr className="bg-white border-b border-slate-900 font-bold text-center">
                  <th colSpan={3} className="border border-slate-900 px-2 py-1.5">
                    Nhiều lựa chọn
                  </th>
                  <th colSpan={3} className="border border-slate-900 px-2 py-1.5">
                    “Đúng – Sai”
                  </th>
                  <th colSpan={3} className="border border-slate-900 px-2 py-1.5">
                    Trả lời ngắn
                  </th>
                </tr>

                {/* Header Row 4: Biết - Hiểu - Vận dụng */}
                <tr className="bg-white border-b border-slate-900 font-semibold text-[11px] text-center">
                  {/* Nhiều lựa chọn */}
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Biết</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Hiểu</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Vận<br />dụng</th>
                  {/* Đúng - Sai */}
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[44px] font-bold">Biết</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[44px] font-bold">Hiểu</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[44px] font-bold">Vận<br />dụng</th>
                  {/* Trả lời ngắn */}
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Biết</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Hiểu</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[42px] font-bold">Vận<br />dụng</th>
                  {/* Tự luận */}
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[36px] font-bold">Biết</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[36px] font-bold">Hiểu</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[36px] font-bold">Vận<br />dụng</th>
                  {/* Tổng */}
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[38px] font-bold">Biết</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[38px] font-bold">Hiểu</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 min-w-[38px] font-bold">Vận<br />dụng</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-900">
                {/* Data Rows */}
                {rows.map((row) => (
                  <tr key={`row-${row.index}`} className="hover:bg-slate-50/70 transition-colors">
                    {/* Index */}
                    {row.isFirstInTopic && (
                      <td
                        rowSpan={row.topicRowSpan}
                        className="border border-slate-900 px-1.5 py-2 text-center font-bold align-middle"
                      >
                        {row.index}
                      </td>
                    )}

                    {/* Topic Name */}
                    {row.isFirstInTopic && (
                      <td
                        rowSpan={row.topicRowSpan}
                        className="border border-slate-900 px-2.5 py-2 font-bold text-slate-900 align-middle leading-tight"
                      >
                        {row.topicName}
                      </td>
                    )}

                    {/* Lesson Name */}
                    {row.isFirstInLesson && (
                      <td
                        rowSpan={row.lessonRowSpan}
                        className="border border-slate-900 px-2.5 py-2 font-semibold text-slate-800 align-middle leading-tight"
                      >
                        {row.lessonName}
                      </td>
                    )}

                    {/* Requirement Text (YCCĐ) */}
                    <td className="border border-slate-900 px-2.5 py-2 text-slate-700 align-middle leading-tight">
                      {row.requirementText}
                    </td>

                    {/* MCQ: Biết - Hiểu - Vận dụng */}
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.mcq.nhanBiet.count > 0 && <span className="font-bold">{row.mcq.nhanBiet.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.mcq.thongHieu.count > 0 && <span className="font-bold">{row.mcq.thongHieu.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.mcq.vanDung.count > 0 && <span className="font-bold">{row.mcq.vanDung.count}</span>}
                    </td>

                    {/* True/False: Biết - Hiểu - Vận dụng */}
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.trueFalse.nhanBiet.count > 0 && <span className="font-bold">{row.trueFalse.nhanBiet.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.trueFalse.thongHieu.count > 0 && <span className="font-bold">{row.trueFalse.thongHieu.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.trueFalse.vanDung.count > 0 && <span className="font-bold">{row.trueFalse.vanDung.count}</span>}
                    </td>

                    {/* Short Answer: Biết - Hiểu - Vận dụng */}
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.shortAnswer.nhanBiet.count > 0 && <span className="font-bold">{row.shortAnswer.nhanBiet.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.shortAnswer.thongHieu.count > 0 && <span className="font-bold">{row.shortAnswer.thongHieu.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.shortAnswer.vanDung.count > 0 && <span className="font-bold">{row.shortAnswer.vanDung.count}</span>}
                    </td>

                    {/* Essay (Tự luận): Biết - Hiểu - Vận dụng */}
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.essay.nhanBiet.count > 0 && <span className="font-bold">{row.essay.nhanBiet.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.essay.thongHieu.count > 0 && <span className="font-bold">{row.essay.thongHieu.count}</span>}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center align-middle">
                      {row.essay.vanDung.count > 0 && <span className="font-bold">{row.essay.vanDung.count}</span>}
                    </td>

                    {/* Tổng từng mức độ */}
                    <td className="border border-slate-900 px-1 py-1 text-center font-bold align-middle">
                      {row.rowKnown > 0 ? row.rowKnown : (row.isFirstInLesson && row.totalKnown > 0 ? row.totalKnown : '')}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center font-bold align-middle">
                      {row.rowUnderstand > 0 ? row.rowUnderstand : (row.isFirstInLesson && row.totalUnderstand > 0 ? row.totalUnderstand : '')}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center font-bold align-middle">
                      {row.rowApply > 0 ? row.rowApply : (row.isFirstInLesson && row.totalApply > 0 ? row.totalApply : '')}
                    </td>

                    {/* Percentage */}
                    {row.isFirstInLesson && (
                      <td
                        rowSpan={row.lessonRowSpan}
                        className="border border-slate-900 px-1.5 py-1 text-center font-bold align-middle"
                      >
                        {row.percentage ? `${row.percentage}%` : '100%'}
                      </td>
                    )}
                  </tr>
                ))}

                {/* SUMMARY ROW 1: Tổng số câu / ý */}
                <tr className="bg-white font-bold text-center border-t-2 border-slate-900">
                  <td colSpan={4} className="border border-slate-900 px-3 py-2 text-left font-extrabold uppercase">
                    Tổng số câu/ý
                  </td>
                  {/* MCQ */}
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.mcq.nhanBiet || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.mcq.thongHieu || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.mcq.vanDung || ''}</td>
                  {/* True/False */}
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.trueFalse.nhanBiet || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.trueFalse.thongHieu || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.trueFalse.vanDung || ''}</td>
                  {/* Short Answer */}
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.shortAnswer.nhanBiet || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.shortAnswer.thongHieu || ''}</td>
                  <td className="border border-slate-900 px-1 py-1">{summary.totalCount.shortAnswer.vanDung || ''}</td>
                  {/* Essay */}
                  <td className="border border-slate-900 px-1 py-1">0</td>
                  <td className="border border-slate-900 px-1 py-1">0</td>
                  <td className="border border-slate-900 px-1 py-1">0</td>
                  {/* Level Totals */}
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.totalCount.byLevel.nhanBiet}</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.totalCount.byLevel.thongHieu}</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.totalCount.byLevel.vanDung}</td>
                  <td className="border border-slate-900 px-1 py-1"></td>
                </tr>

                {/* SUMMARY ROW 2: Tổng số điểm */}
                <tr className="bg-white font-bold text-center">
                  <td colSpan={4} className="border border-slate-900 px-3 py-2 text-left font-extrabold uppercase">
                    Tổng số điểm
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.score.mcq.toFixed(1)} điểm
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.score.trueFalse.toFixed(1)} điểm
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.score.shortAnswer.toFixed(1)} điểm
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1">
                    0.0 điểm
                  </td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.score.byLevel.nhanBiet.toFixed(1)}</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.score.byLevel.thongHieu.toFixed(1)}</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.score.byLevel.vanDung.toFixed(1)}</td>
                  <td className="border border-slate-900 px-1 py-1 font-black">{summary.score.total.toFixed(1)}</td>
                </tr>

                {/* SUMMARY ROW 3: Tỉ lệ % */}
                <tr className="bg-white font-bold text-center">
                  <td colSpan={4} className="border border-slate-900 px-3 py-2 text-left font-extrabold uppercase">
                    Tỉ lệ %
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.percentage.mcq}%
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.percentage.trueFalse}%
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1 font-extrabold">
                    {summary.percentage.shortAnswer}%
                  </td>
                  <td colSpan={3} className="border border-slate-900 px-1 py-1">
                    0%
                  </td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.percentage.byLevel.nhanBiet}%</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.percentage.byLevel.thongHieu}%</td>
                  <td className="border border-slate-900 px-1 py-1 font-extrabold">{summary.percentage.byLevel.vanDung}%</td>
                  <td className="border border-slate-900 px-1 py-1 font-black">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: BẢNG ĐẶC TẢ CHI TIẾT */}
      {(viewMode === 'spec' || viewMode === 'all') && (
        <div id="spec-matrix-table" className="space-y-4">
          <div className="text-center space-y-1 mb-4 print:block">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
              2. BẢNG ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA ĐỊNH KÌ
            </h1>
            <p className="text-xs text-slate-700 italic font-medium">
              Môn: TOÁN 12 - Thời gian làm bài: {matrixData.durationMinutes} phút (Cấu trúc định dạng GDPT 2018)
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="w-full text-xs text-left text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3 w-12 text-center border-r border-slate-200">TT</th>
                  <th className="p-3 w-1/4 border-r border-slate-200">Chủ đề & Nội dung</th>
                  <th className="p-3 border-r border-slate-200">Yêu cầu cần đạt</th>
                  <th className="p-3 text-center border-r border-slate-200 text-emerald-800 bg-emerald-50/50 w-28">
                    Nhận biết
                  </th>
                  <th className="p-3 text-center border-r border-slate-200 text-blue-800 bg-blue-50/50 w-28">
                    Thông hiểu
                  </th>
                  <th className="p-3 text-center border-r border-slate-200 text-amber-800 bg-amber-50/50 w-28">
                    Vận dụng
                  </th>
                  <th className="p-3 text-center bg-purple-50/70 text-purple-900 w-24">
                    Tổng điểm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {test.matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="p-3 border-r border-slate-200 align-top">
                      <div className="font-bold text-slate-900">{row.topicName}</div>
                      <div className="text-[11px] text-blue-700 font-medium italic mt-0.5">{row.lessonName}</div>
                    </td>
                    <td className="p-3 text-slate-600 leading-relaxed">
                      {row.learningOutcome}
                    </td>
                    <td className="p-3 text-center bg-emerald-50/30">
                      <div className="font-bold text-emerald-900">
                        {row.multipleChoiceCount.nhanBiet} MCQ
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {row.trueFalseCount.nhanBiet} ĐS | {row.shortAnswerCount.nhanBiet} TL
                      </div>
                    </td>
                    <td className="p-3 text-center bg-blue-50/30">
                      <div className="font-bold text-blue-900">
                        {row.multipleChoiceCount.thongHieu} MCQ
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {row.trueFalseCount.thongHieu} ĐS | {row.shortAnswerCount.thongHieu} TL
                      </div>
                    </td>
                    <td className="p-3 text-center bg-amber-50/30">
                      <div className="font-bold text-amber-900">
                        {row.multipleChoiceCount.vanDung} MCQ
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {row.trueFalseCount.vanDung} ĐS | {row.shortAnswerCount.vanDung} TL
                      </div>
                    </td>
                    <td className="p-3 text-center bg-purple-50/50 font-black text-purple-900 text-sm">
                      {row.totalPoints} đ
                      <span className="block text-[10px] text-purple-700 font-normal">({row.percentage}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info Box */}
      <div className="mt-5 p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex items-center justify-between gap-3 text-xs text-blue-900 print:hidden">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            Bảng ma trận này được tự động đồng bộ hóa thời gian thực với đề thi hiện tại. Khi quý thầy cô thêm, xóa hoặc biên tập câu hỏi, ma trận sẽ tự động cập nhật ngay lập tức.
          </span>
        </div>
        <button
          onClick={handleExportMatrixWord}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs shrink-0 cursor-pointer"
        >
          Tải Word Ma trận (.docx)
        </button>
      </div>
    </div>
  );
};
