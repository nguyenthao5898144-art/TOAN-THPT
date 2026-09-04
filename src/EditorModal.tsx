import React, { useState } from 'react';
import { Question } from './types';
import { MathText } from './MathText';
import { DIAGRAM_BANK } from './diagramBank';
import { DiagramRenderer } from './DiagramRenderer';
import { generateTableSvgDataUrl, extractTableDataFromText } from './tableImageGenerator';
import { sanitizeQuestionMath } from './testGenerator';
import { Save, X, Edit3, Plus, Trash2, Image as ImageIcon, Sparkles, Table as TableIcon, RefreshCw } from 'lucide-react';

interface EditorModalProps {
  question: Question | null;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({
  question,
  onSave,
  onClose,
}) => {
  if (!question) return null;

  const [formData, setFormData] = useState<Question>(() => {
    const q = { ...question };
    if (q.type === 'true_false') {
      const rawSts = Array.isArray((q as any).statements) ? (q as any).statements : [];
      (q as any).statements = ['a', 'b', 'c', 'd'].map((letter, idx) => {
        const existing = rawSts[idx] || rawSts.find((s: any) => (s.id || s.key || '').toLowerCase() === letter) || {};
        const textVal =
          existing.text ||
          existing.statement ||
          existing.content ||
          existing.value ||
          `Mệnh đề (${letter})`;
        return {
          id: letter as 'a' | 'b' | 'c' | 'd',
          text: textVal,
          isCorrect: typeof existing.isCorrect === 'boolean' ? existing.isCorrect : true,
        };
      });
    }
    return q;
  });

  // Table of Values Builder States
  const [rowX, setRowX] = useState<string>('-2, -1, 0, 1, 2');
  const [rowY, setRowY] = useState<string>('4, 1, 0, 1, 4');
  const [tableTitle, setTableTitle] = useState<string>('BẢNG GIÁ TRỊ HÀM SỐ');

  const handleGenerateTableImage = () => {
    const xVals = rowX.split(',').map((s) => s.trim()).filter(Boolean);
    const yVals = rowY.split(',').map((s) => s.trim()).filter(Boolean);

    if (xVals.length === 0 || yVals.length === 0) return;

    const rows = [
      ['x', ...xVals],
      ['f(x)', ...yVals],
    ];

    const svgUrl = generateTableSvgDataUrl(rows, tableTitle);
    if (svgUrl) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: svgUrl,
        tableData: { rows, title: tableTitle },
      }));
    }
  };

  const handleAutoExtractTable = () => {
    const extracted = extractTableDataFromText(formData.content + '\n' + (formData.solution || ''));
    if (extracted && extracted.rows.length >= 1) {
      const svgUrl = generateTableSvgDataUrl(extracted.rows, extracted.title);
      if (svgUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: svgUrl,
          tableData: extracted,
        }));
      }
    }
  };

  const handleSave = () => {
    onSave(sanitizeQuestionMath(formData));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">CHỈNH SỬA CÂU HỎI VÀ ĐÁP ÁN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800">
          {/* Level & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bài học / Chủ đề</label>
              <input
                type="text"
                value={formData.lessonName}
                onChange={(e) => setFormData({ ...formData, lessonName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ nhận thức</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="NhanBiet">Nhận biết</option>
                <option value="ThongHieu">Thông hiểu</option>
                <option value="VanDung">Vận dụng</option>
              </select>
            </div>
          </div>

          {/* Question Content */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung câu hỏi (sử dụng LaTeX kẹp $...$)</label>
            <textarea
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            <div className="mt-1 p-2 bg-slate-50 border rounded text-slate-700">
              <span className="text-[10px] text-slate-400 block font-sans">Xem trước hiển thị LaTeX:</span>
              <MathText text={formData.content} />
            </div>
          </div>

          {/* Diagram / Graph Selector & Table of Values Image Builder */}
          <div className="p-3.5 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
              <label className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-blue-600" />
                <span>BẢNG GIÁ TRỊ DẠNG ẢNH & ĐỒ THỊ ĐÍNH KÈM</span>
              </label>
              <button
                type="button"
                onClick={handleAutoExtractTable}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                title="Tự động bóc tách các bảng giá trị/LaTeX array có sẵn trong nội dung thành dạng ảnh"
              >
                <Sparkles className="w-3 h-3" />
                <span>Bóc tách Bảng từ nội dung thành Ảnh</span>
              </button>
            </div>

            {/* Quick Table of Values Generator */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tạo Bảng Giá Trị Hàm Số mới (Dạng Ảnh SVG):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Các giá trị x (phân cách bằng dấu phẩy):</label>
                  <input
                    type="text"
                    value={rowX}
                    onChange={(e) => setRowX(e.target.value)}
                    placeholder="-2, -1, 0, 1, 2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Các giá trị f(x) / y (phân cách bằng dấu phẩy):</label>
                  <input
                    type="text"
                    value={rowY}
                    onChange={(e) => setRowY(e.target.value)}
                    placeholder="4, 1, 0, 1, 4"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <input
                  type="text"
                  value={tableTitle}
                  onChange={(e) => setTableTitle(e.target.value)}
                  placeholder="Tiêu đề bảng (ví dụ: BẢNG GIÁ TRỊ HÀM SỐ)"
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-[11px] w-1/2"
                />
                <button
                  type="button"
                  onClick={handleGenerateTableImage}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Tạo & Lưu Bảng Dạng Ảnh</span>
                </button>
              </div>
            </div>

            {/* Display Attached Image or Table Image preview */}
            {formData.imageUrl && (
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center relative">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Bảng giá trị / Hình ảnh hiện tại của câu hỏi:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: undefined, tableData: undefined })}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold underline"
                  >
                    Xóa ảnh này
                  </button>
                </div>
                <DiagramRenderer imageUrl={formData.imageUrl} imageTitle="BẢNG GIÁ TRỊ HÀM SỐ (DẠNG ẢNH)" />
              </div>
            )}

            {/* Existing Diagram Selector */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hoặc chọn Đồ thị / BBT có sẵn từ Thư viện:</label>
              <select
                value={formData.diagramId || ''}
                onChange={(e) => setFormData({ ...formData, diagramId: e.target.value || undefined })}
                className="w-full px-3 py-1.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-xs"
              >
                <option value="">-- Không đính kèm đồ thị thư viện --</option>
                {DIAGRAM_BANK.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.category}] {d.title}
                  </option>
                ))}
              </select>

              {formData.diagramId && (
                <div className="mt-2">
                  <DiagramRenderer diagramId={formData.diagramId} />
                </div>
              )}
            </div>

            {/* TikZ LaTeX Code (Optional / PROMPT TIKZ) */}
            <div className="pt-2 border-t border-blue-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>MÃ NGUỒN TIKZ (LATEX) & PROMPT TIKZ (TỰ ĐỘNG XUẤT ẢNH):</span>
                </label>
                {formData.tikzCode && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tikzCode: undefined, tikzPrompt: undefined })}
                    className="text-[10px] text-rose-500 hover:text-rose-700 underline font-semibold"
                  >
                    Xóa mã TikZ
                  </button>
                )}
              </div>

              {/* Quick TikZ Preset Templates */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Chèn mẫu nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tikzCode: `\\begin{tikzpicture}\n  \\tkzTabInit{$x$/1, $y'$/1, $y$/2}{$-\\infty$, $-1$, $1$, $+\\infty$}\n  \\tkzTabLine{, +, 0, -, 0, +, }\n  \\tkzTabVar{-/ $-\\infty$, +/ $3$, -/ $-1$, +/ $+\\infty$}\n\\end{tikzpicture}`,
                      tikzPrompt: 'Bảng biến thiên hàm số bậc ba có 2 cực trị',
                    })
                  }
                  className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-medium transition-all"
                >
                  📊 BBT Bậc 3
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tikzCode: `\\begin{tikzpicture}\n  \\tkzTabInit{$x$/1, $y'$/1}{$-\\infty$, $-2$, $1$, $3$, $+\\infty$}\n  \\tkzTabLine{, -, 0, +, 0, -, 0, +, }\n\\end{tikzpicture}`,
                      tikzPrompt: 'Bảng xét dấu đạo hàm y = f\'(x)',
                    })
                  }
                  className="px-2 py-0.5 rounded bg-teal-100 hover:bg-teal-200 text-teal-800 text-[10px] font-medium transition-all"
                >
                  📋 Bảng xét dấu y'
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tikzCode: `\\begin{tikzpicture}[scale=0.8, >=stealth]\n  \\draw[->, thick] (-3,0) -- (3,0) node[below] {$x$};\n  \\draw[->, thick] (0,-3) -- (0,3) node[left] {$y$};\n  \\node[below left] at (0,0) {$O$};\n  \\draw[blue, thick, smooth, samples=100, domain=-2.2:2.2] plot (\\x, {\\x^3 - 3*\\x + 1});\n\\end{tikzpicture}`,
                      tikzPrompt: 'Đồ thị hàm số bậc ba y = x^3 - 3x + 1',
                    })
                  }
                  className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-medium transition-all"
                >
                  📈 Đồ thị Bậc 3
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tikzCode: `\\begin{tikzpicture}[scale=0.9, >=stealth]\n  \\coordinate (A) at (0,0);\n  \\coordinate (B) at (1.5,-1.2);\n  \\coordinate (C) at (4.5,0);\n  \\coordinate (S) at (2,4);\n  \\draw[dashed, thick] (A) -- (C);\n  \\draw[thick] (A) -- (B) -- (C) -- (S) -- (A) (S) -- (B);\n  \\filldraw (A) circle (1pt) node[left] {$A$};\n  \\filldraw (B) circle (1pt) node[below] {$B$};\n  \\filldraw (C) circle (1pt) node[right] {$C$};\n  \\filldraw (S) circle (1pt) node[above] {$S$};\n\\end{tikzpicture}`,
                      tikzPrompt: 'Hình chóp tam giác S.ABC',
                    })
                  }
                  className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-medium transition-all"
                >
                  🔺 Hình chóp S.ABC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tikzCode: `\\begin{tikzpicture}[scale=0.9, >=stealth, x={(-0.5cm,-0.5cm)}, y={(1cm,0cm)}, z={(0cm,1cm)}]\n  \\draw[->, thick] (0,0,0) -- (4,0,0) node[below left] {$x$};\n  \\draw[->, thick] (0,0,0) -- (0,5,0) node[right] {$y$};\n  \\draw[->, thick] (0,0,0) -- (0,0,4) node[above] {$z$};\n  \\node[above right] at (0,0,0) {$O$};\n  \\draw[->, red, very thick] (0,0,0) -- (1,0,0) node[midway, above left] {$\\vec{i}$};\n  \\draw[->, green!60!black, very thick] (0,0,0) -- (0,1,0) node[midway, below] {$\\vec{j}$};\n  \\draw[->, blue, very thick] (0,0,0) -- (0,0,1) node[midway, left] {$\\vec{k}$};\n\\end{tikzpicture}`,
                      tikzPrompt: 'Hệ tọa độ Oxyz không gian 3 chiều',
                    })
                  }
                  className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-medium transition-all"
                >
                  📐 Tọa độ Oxyz
                </button>
              </div>

              <textarea
                value={formData.tikzCode || ''}
                onChange={(e) => setFormData({ ...formData, tikzCode: e.target.value || undefined })}
                rows={4}
                placeholder="Nhập mã LaTeX TikZ (ví dụ: \begin{tikzpicture} ... \end{tikzpicture} hoặc \begin{tkzTab} ... \end{tkzTab})"
                className="w-full px-3 py-2 font-mono text-[11px] border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              />

              {/* Live TikZ Preview in Editor */}
              {formData.tikzCode && (
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-purple-300 block mb-1">
                    Xem trước kết quả hình vẽ TikZ (sẽ xuất dạng ảnh vào Word):
                  </span>
                  <DiagramRenderer tikzCode={formData.tikzCode} questionContent={formData.content} />
                </div>
              )}
            </div>
          </div>

          {/* Multiple Choice Options Edit */}
          {formData.type === 'multiple_choice' && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Các phương án lựa chọn:</label>
              {formData.options.map((opt, idx) => (
                <div key={opt.key} className="flex items-center space-x-2">
                  <span className="font-bold w-6 text-center text-blue-700">{opt.key}</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].text = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctAnswer: opt.key })}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] ${
                      formData.correctAnswer === opt.key
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 border'
                    }`}
                  >
                    {formData.correctAnswer === opt.key ? 'ĐÁP ÁN ĐÚNG' : 'Chọn đúng'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* True / False Edit */}
          {formData.type === 'true_false' && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Các phát biểu Đúng / Sai:</label>
              {formData.statements.map((st, idx) => (
                <div key={st.id} className="flex items-center space-x-2">
                  <span className="font-bold w-6 text-center text-indigo-700">{st.id.toLowerCase()})</span>
                  <input
                    type="text"
                    value={st.text}
                    onChange={(e) => {
                      const newSts = [...formData.statements];
                      newSts[idx].text = e.target.value;
                      setFormData({ ...formData, statements: newSts });
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSts = [...formData.statements];
                      newSts[idx].isCorrect = !newSts[idx].isCorrect;
                      setFormData({ ...formData, statements: newSts });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] ${
                      st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Short Answer Edit */}
          {formData.type === 'short_answer' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đáp số chính xác (Dạng điền kết quả - Tối đa 4 ký tự):
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value.slice(0, 4) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold font-mono text-purple-900 tracking-wider text-base"
                placeholder="VD: 12, -0.5, 3.25"
              />
              <p className="text-xs text-slate-500 mt-1">
                * Đáp số điền trên phiếu trắc nghiệm GDPT 2018 dài tối đa 4 ký tự (chứa các số, dấu âm '-' hoặc dấu thập phân).
              </p>
            </div>
          )}

          {/* Solution Text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lời giải chi tiết (sử dụng LaTeX kẹp $...$)</label>
            <textarea
              rows={3}
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center space-x-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
