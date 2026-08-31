import React, { useState } from 'react';
import { DiagramItem, DIAGRAM_BANK, BBTData, GraphData } from '../data/diagramBank';
import { MathText } from './MathText';
import { parseMathFunction, extractFormulaFromText, hasUnknownParameters, ParsedMathFunction, parseAsciiBBT, resolveQuestionDiagram } from '../utils/mathGraphParser';
import {
  renderBBTToCanvasImage,
  renderGraphToCanvasImage,
  renderOxyzToCanvasImage,
  render3DGeometryToCanvasImage,
  downloadDiagramImageAsPng,
  copyDiagramImageToClipboard,
} from '../utils/diagramImageGenerator';
import {
  generateBBTTikZCode,
  generateGraphTikZCode,
  generateOxyzTikZCode,
  generate3DGeometryTikZCode,
  extractTikZFromText,
  ParsedTikZResult,
} from '../utils/tikzParser';
import { Download, Copy, Code, Check, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface DiagramRendererProps {
  diagramId?: string;
  diagramItem?: DiagramItem;
  bbtData?: BBTData;
  imageUrl?: string;
  imageTitle?: string;
  questionContent?: string;
  tikzCode?: string;
  tikzPrompt?: string;
  formula?: string;
  className?: string;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  diagramId,
  diagramItem: passedItem,
  bbtData: passedBbtData,
  imageUrl,
  imageTitle = 'BẢNG GIÁ TRỊ (DẠNG ẢNH)',
  questionContent,
  tikzCode,
  tikzPrompt,
  formula,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTikZ, setCopiedTikZ] = useState(false);
  const [showTikZModal, setShowTikZModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. If imageUrl is provided
  if (imageUrl) {
    return (
      <div className={`my-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto overflow-hidden text-center ${className}`}>
        <div className="text-[11px] font-bold text-slate-500 text-center mb-2 uppercase tracking-wide flex items-center justify-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>{imageTitle}</span>
        </div>
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-center overflow-x-auto">
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-h-[320px] w-auto max-w-full object-contain rounded-lg shadow-xs hover:scale-[1.02] transition-transform duration-200"
          />
        </div>
      </div>
    );
  }

  // 1.2. If TikZ is embedded in questionContent or passed directly via tikzCode
  const tikzExtract: ParsedTikZResult = tikzCode
    ? extractTikZFromText(tikzCode)
    : questionContent
    ? extractTikZFromText(questionContent)
    : { hasTikZ: false, cleanContent: '' };

  // 1.5. If explicit bbtData passed directly
  let activeBbtData: BBTData | undefined = passedBbtData || tikzExtract.bbtData;

  // Check 3D / Oxyz intent
  const lowerQC = (questionContent || '').toLowerCase() + ' ' + (tikzCode || '').toLowerCase();
  const isOxyzIntent =
    tikzExtract.tikzType === 'oxyz' ||
    ((lowerQC.includes('oxyz') || lowerQC.includes('hệ trục tọa độ oxyz') || lowerQC.includes('tọa độ không gian')) &&
      (lowerQC.includes('hình vẽ') || lowerQC.includes('hình bên') || lowerQC.includes('như hình')));
  const is3DGeometryIntent =
    tikzExtract.tikzType === 'geometry_3d' ||
    ((lowerQC.includes('hình chóp') || lowerQC.includes('tứ diện') || lowerQC.includes('lăng trụ')) &&
      (lowerQC.includes('hình vẽ') || lowerQC.includes('hình bên') || lowerQC.includes('như hình')));

  // If question content already contains a markdown table, skip rendering duplicate diagrams
  const normalizedQC = (questionContent || '').replace(/\\n/g, '\n');
  const hasEmbeddedTable =
    /\|[\s\-\$\w\+\\\/]+\|/.test(normalizedQC) &&
    (normalizedQC.toLowerCase().includes('x') || normalizedQC.includes("y'") || normalizedQC.includes("f'"));
  if (hasEmbeddedTable && !diagramId && !imageUrl && !activeBbtData && !isOxyzIntent && !is3DGeometryIntent && !tikzCode) {
    return null;
  }

  // 2. Resolve diagram item or parsed math function
  const effectiveDiagId = diagramId || (questionContent ? resolveQuestionDiagram({ content: questionContent }) : undefined);
  let item = passedItem || (effectiveDiagId && !effectiveDiagId.startsWith('formula:') ? DIAGRAM_BANK.find((d) => d.id === effectiveDiagId) : undefined);
  let parsedMath: ParsedMathFunction | null = null;

  // Check if formula was passed or diagramId specifies a custom formula
  const targetFormula = formula || (effectiveDiagId?.startsWith('formula:') ? effectiveDiagId.replace('formula:', '') : null);

  if (targetFormula && !hasUnknownParameters(targetFormula)) {
    parsedMath = parseMathFunction(targetFormula);
  }

  // If item is a graph in DIAGRAM_BANK, also check if we can parse its expression dynamically for precision
  if (!parsedMath && item?.type === 'graph' && item.graphData?.expression && !hasUnknownParameters(item.graphData.expression)) {
    parsedMath = parseMathFunction(item.graphData.expression);
  }

  if (!item && !parsedMath && !activeBbtData && !isOxyzIntent && !is3DGeometryIntent) return null;

  const isBXD = item?.category === 'Bảng xét dấu' || (activeBbtData && (!activeBbtData.fValues || activeBbtData.fValues.length === 0));
  const isBBT = (item?.type === 'bbt' || !!activeBbtData) && !isBXD;

  // Calculate TikZ code
  let tikzCodeString = tikzCode || tikzExtract.rawTikZ || '';
  if (!tikzCodeString) {
    if (activeBbtData) {
      tikzCodeString = generateBBTTikZCode(activeBbtData);
    } else if (item?.bbtData) {
      tikzCodeString = generateBBTTikZCode(item.bbtData);
    } else if (isOxyzIntent) {
      tikzCodeString = generateOxyzTikZCode();
    } else if (is3DGeometryIntent) {
      tikzCodeString = generate3DGeometryTikZCode();
    } else if (parsedMath || item?.graphData) {
      tikzCodeString = generateGraphTikZCode(item?.graphData, parsedMath?.expressionDisplay);
    }
  }

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      let imgData = null;
      if (activeBbtData) {
        imgData = await renderBBTToCanvasImage(activeBbtData);
      } else if (item?.bbtData) {
        imgData = await renderBBTToCanvasImage(item.bbtData);
      } else if (isOxyzIntent) {
        imgData = await renderOxyzToCanvasImage();
      } else if (is3DGeometryIntent) {
        imgData = await render3DGeometryToCanvasImage();
      } else if (parsedMath || item?.graphData) {
        imgData = await renderGraphToCanvasImage(item?.graphData, parsedMath);
      }

      if (imgData) {
        downloadDiagramImageAsPng(imgData, `HinhVe_${diagramId || 'Toan12'}.png`);
      }
    } catch (err) {
      console.error('Error downloading PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      let imgData = null;
      if (activeBbtData) {
        imgData = await renderBBTToCanvasImage(activeBbtData);
      } else if (item?.bbtData) {
        imgData = await renderBBTToCanvasImage(item.bbtData);
      } else if (isOxyzIntent) {
        imgData = await renderOxyzToCanvasImage();
      } else if (is3DGeometryIntent) {
        imgData = await render3DGeometryToCanvasImage();
      } else if (parsedMath || item?.graphData) {
        imgData = await renderGraphToCanvasImage(item?.graphData, parsedMath);
      }

      if (imgData) {
        const success = await copyDiagramImageToClipboard(imgData);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error('Error copying image:', err);
    }
  };

  const handleCopyTikZCode = async () => {
    if (!tikzCodeString) return;
    try {
      await navigator.clipboard.writeText(tikzCodeString);
      setCopiedTikZ(true);
      setTimeout(() => setCopiedTikZ(false), 2000);
    } catch (err) {
      console.error('Error copying TikZ code:', err);
    }
  };

  return (
    <div className={`my-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto overflow-x-auto relative group ${className}`}>
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 flex-wrap">
        <div className="text-[11px] font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              isBXD ? 'bg-teal-600' : isBBT ? 'bg-purple-600' : isOxyzIntent ? 'bg-emerald-600' : is3DGeometryIntent ? 'bg-indigo-600' : 'bg-blue-600'
            }`}
          ></span>
          <span>
            {isBXD ? (
              <span>BẢNG XÉT DẤU ĐẠO HÀM y'</span>
            ) : isBBT ? (
              'BẢNG BIẾN THIÊN HÀM SỐ'
            ) : isOxyzIntent ? (
              'HỆ TRỤC TỌA ĐỘ Oxyz (3D)'
            ) : is3DGeometryIntent ? (
              'HÌNH KHÔNG GIAN S.ABC (3D)'
            ) : item?.id === 'graph_fprime_1' || item?.category === 'Đồ thị đạo hàm' || item?.graphData?.kind === 'f_prime' ? (
              <>
                <span>ĐỒ THỊ HÀM SỐ </span>
                <span className="font-semibold text-slate-800 italic">y = f'(x)</span>
              </>
            ) : item?.graphData?.titleLabel ? (
              item.graphData.titleLabel.startsWith('ĐỒ THỊ') || item.graphData.titleLabel.startsWith('Đồ thị') ? (
                item.graphData.titleLabel
              ) : (
                <>
                  <span>ĐỒ THỊ HÀM SỐ </span>
                  <span className="font-semibold text-slate-800 italic">{item.graphData.titleLabel}</span>
                </>
              )
            ) : parsedMath?.expressionDisplay ? (
              <>
                <span>ĐỒ THỊ HÀM SỐ </span>
                <span className="font-semibold text-slate-800 italic">{parsedMath.expressionDisplay}</span>
              </>
            ) : (
              <>
                <span>ĐỒ THỊ HÀM SỐ </span>
                <span className="font-semibold text-slate-800 italic">y = f'(x)</span>
              </>
            )}
          </span>
        </div>

        {/* Action buttons: Download PNG, Copy Image, TikZ Code */}
        <div className="flex items-center space-x-1 text-[11px]">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-all flex items-center space-x-1 cursor-pointer border border-slate-200"
            title="Tải file ảnh PNG chất lượng cao để dán vào Word / PowerPoint"
          >
            <Download className="w-3 h-3 text-blue-600" />
            <span>Tải ảnh</span>
          </button>

          <button
            onClick={handleCopyImage}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium transition-all flex items-center space-x-1 cursor-pointer border border-slate-200"
            title="Sao chép ảnh vào Clipboard để dán trực tiếp (Ctrl+V)"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
            <span>{copied ? 'Đã chép!' : 'Chép ảnh'}</span>
          </button>

          {tikzCodeString && (
            <button
              onClick={() => setShowTikZModal(true)}
              className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-all flex items-center space-x-1 cursor-pointer border border-purple-200"
              title="Xem và sao chép mã TikZ LaTeX"
            >
              <Code className="w-3 h-3 text-purple-600" />
              <span>TikZ</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Figure Content */}
      {isOxyzIntent && renderOxyzSvg()}
      {is3DGeometryIntent && render3DGeometrySvg()}
      {(isBBT || isBXD) && (activeBbtData ? renderBBT(activeBbtData) : item?.bbtData ? renderBBT(item.bbtData) : null)}
      {!isBBT && !isBXD && !isOxyzIntent && !is3DGeometryIntent && renderDynamicOrStaticGraph(parsedMath, item?.graphData)}

      {/* TikZ Code Modal */}
      {showTikZModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Mã nguồn TikZ (LaTeX)</h3>
              </div>
              <button
                onClick={() => setShowTikZModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Mã TikZ chuẩn hóa có thể dán trực tiếp vào file TeX (Overleaf / TeXmaker) hoặc xuất ảnh:
            </p>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
              {tikzCodeString}
            </pre>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={handleCopyTikZCode}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedTikZ ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTikZ ? 'Đã sao chép mã TikZ!' : 'Sao chép mã TikZ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Render 3D Oxyz System in SVG
function renderOxyzSvg() {
  const ox = 130;
  const oy = 150;
  return (
    <div className="flex justify-center p-2">
      <svg width="340" height="230" viewBox="0 0 340 230" className="overflow-visible font-serif">
        <defs>
          <marker id="arrow-o" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* Axes */}
        <line x1={ox} y1={oy} x2={ox - 80} y2={oy + 65} stroke="#0f172a" strokeWidth="2" markerEnd="url(#arrow-o)" />
        <line x1={ox} y1={oy} x2={ox + 180} y2={oy} stroke="#0f172a" strokeWidth="2" markerEnd="url(#arrow-o)" />
        <line x1={ox} y1={oy} x2={ox} y2={oy - 120} stroke="#0f172a" strokeWidth="2" markerEnd="url(#arrow-o)" />

        {/* Labels */}
        <text x={ox - 95} y={oy + 75} fontSize="14" fontWeight="bold" fill="#0f172a">x</text>
        <text x={ox + 190} y={oy + 5} fontSize="14" fontWeight="bold" fill="#0f172a">y</text>
        <text x={ox - 10} y={oy - 125} fontSize="14" fontWeight="bold" fill="#0f172a">z</text>
        <text x={ox - 15} y={oy + 15} fontSize="14" fontWeight="bold" fill="#0f172a">O</text>

        {/* Vectors i, j, k */}
        <line x1={ox} y1={oy} x2={ox - 32} y2={oy + 26} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-red)" />
        <text x={ox - 45} y={oy + 38} fontSize="12" fontWeight="bold" fill="#dc2626">i⃗</text>

        <line x1={ox} y1={oy} x2={ox + 50} y2={oy} stroke="#059669" strokeWidth="3" markerEnd="url(#arrow-green)" />
        <text x={ox + 48} y={oy - 8} fontSize="12" fontWeight="bold" fill="#059669">j⃗</text>

        <line x1={ox} y1={oy} x2={ox} y2={oy - 45} stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrow-blue)" />
        <text x={ox + 8} y={oy - 38} fontSize="12" fontWeight="bold" fill="#2563eb">k⃗</text>
      </svg>
    </div>
  );
}

// Render 3D Geometry S.ABC in SVG
function render3DGeometrySvg() {
  const S = { x: 170, y: 35 };
  const A = { x: 60, y: 160 };
  const B = { x: 150, y: 200 };
  const C = { x: 270, y: 160 };

  return (
    <div className="flex justify-center p-2">
      <svg width="340" height="220" viewBox="0 0 340 220" className="overflow-visible font-serif">
        {/* Dashed line AC */}
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />

        {/* Solid lines */}
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="2" />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="2" />
        <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="2" />
        <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="2" />
        <line x1={S.x} y1={S.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="2" />

        {/* Points & Labels */}
        <circle cx={S.x} cy={S.y} r="3" fill="#0f172a" />
        <text x={S.x - 4} y={S.y - 8} fontSize="14" fontWeight="bold" fill="#0f172a">S</text>

        <circle cx={A.x} cy={A.y} r="3" fill="#0f172a" />
        <text x={A.x - 16} y={A.y + 4} fontSize="14" fontWeight="bold" fill="#0f172a">A</text>

        <circle cx={B.x} cy={B.y} r="3" fill="#0f172a" />
        <text x={B.x - 4} y={B.y + 16} fontSize="14" fontWeight="bold" fill="#0f172a">B</text>

        <circle cx={C.x} cy={C.y} r="3" fill="#0f172a" />
        <text x={C.x + 8} y={C.y + 4} fontSize="14" fontWeight="bold" fill="#0f172a">C</text>
      </svg>
    </div>
  );
}

// Render Bảng biến thiên (BBT) or Bảng xét dấu (BXD) in clean SVG/HTML Table format
export const BBTTableRenderer: React.FC<{ data: BBTData; compact?: boolean; className?: string }> = ({
  data,
  compact = false,
  className = '',
}) => {
  const instanceId = React.useId ? React.useId().replace(/:/g, '') : 'bbt-' + Math.random().toString(36).slice(2, 7);
  const N = data.xValues.length;
  const isBXD = !data.fValues || data.fValues.length === 0;
  const pad = 12; // 12% padding left & right for end values (-infinity, +infinity)

  // Get X coordinate (%) for x-values (0 to N-1)
  const getXPos = (i: number): number => {
    if (N <= 1) return 50;
    return pad + (i * (100 - 2 * pad)) / (N - 1);
  };

  // Get X coordinate (%) for interval between x_i and x_{i+1}
  const getIntervalPos = (i: number): number => {
    return (getXPos(i) + getXPos(i + 1)) / 2;
  };

  // Helper to get X coordinate (%) for fValues
  const getFValPos = (i: number): number => {
    if (!data.fValues) return getXPos(i);
    const valObj = data.fValues[i];
    if (valObj && valObj.xPos !== undefined) {
      return valObj.xPos;
    }
    if (data.fValues.length === N) {
      // Continuous function: 1-to-1 match with xValues
      return getXPos(i);
    }
    // Discontinuous function (e.g. N=3, fValues.length=4)
    let asympIdx = 1;
    const doubleLineInFPrime = data.fPrimeValues.findIndex((fp) => fp === '||');
    if (doubleLineInFPrime !== -1) {
      asympIdx = Math.floor(doubleLineInFPrime / 2) + (doubleLineInFPrime % 2);
    }
    if (i < asympIdx) {
      return getXPos(i);
    } else if (i === asympIdx) {
      return getXPos(asympIdx) - 6; // Just left of double line
    } else if (i === asympIdx + 1) {
      return getXPos(asympIdx) + 6; // Just right of double line
    } else {
      return getXPos(i - 1);
    }
  };

  // Helper to safely render math strings in BBT cells with size 14px
  const renderMathValue = (val: string, extraClass: string = '') => {
    if (!val) return null;
    if (val === '||') {
      return <span className="text-red-600 font-black tracking-tighter text-[14px]">||</span>;
    }
    let clean = val.trim();
    if (clean.startsWith('$') && clean.endsWith('$') && clean.length > 1) {
      clean = clean.slice(1, -1).trim();
    }
    const mathStr = `$${clean}$`;
    return (
      <span className={`text-[14px] inline-block font-bold ${extraClass}`}>
        <MathText text={mathStr} inline className={`inline-block text-[14px] font-bold ${extraClass}`} />
      </span>
    );
  };

  // Determine effective arrows (use explicit arrows or auto-derive from fValues, unless hideArrows is true)
  const effectiveArrows =
    data.hideArrows
      ? []
      : data.arrows && data.arrows.length > 0
      ? data.arrows
      : (() => {
          if (!data.fValues || data.fValues.length < 2) return [];
          const autoArr: Array<{ fromIndex: number; toIndex: number; direction: 'up' | 'down'; fromVal: string; toVal: string }> = [];
          for (let i = 0; i < data.fValues.length - 1; i++) {
            const v1 = data.fValues[i];
            const v2 = data.fValues[i + 1];
            if (v1.value === '||' || v2.value === '||') continue;
            // Check if jumping across vertical asymptote
            const isJump =
              (v1.position === 'top' && v2.position === 'bottom') ||
              (v1.position === 'bottom' && v2.position === 'top' && Math.abs(getFValPos(i + 1) - getFValPos(i)) < 15);
            if (!isJump) {
              const dir: 'up' | 'down' = v1.position === 'bottom' || v2.position === 'top' ? 'up' : 'down';
              autoArr.push({
                fromIndex: i,
                toIndex: i + 1,
                direction: dir,
                fromVal: v1.value,
                toVal: v2.value,
              });
            }
          }
          return autoArr;
        })();

  const xLabel = data.xLabel || '$\\boldsymbol{x}$';
  const fPrimeLabel = data.fPrimeLabel || '$\\boldsymbol{y\'}$';
  const fLabel = data.fLabel || '$\\boldsymbol{y}$';

  const row3Height = compact ? 'min-h-[110px] h-[110px]' : 'min-h-[135px] h-[135px]';

  return (
    <div
      className={`w-full min-w-[260px] max-w-full text-[14px] font-sans text-slate-900 border border-slate-300 rounded-xl overflow-hidden bg-slate-50/50 select-none shadow-xs style-bbt ${className}`}
    >
      {/* Row 1: x */}
      <div className="flex border-b border-slate-300 items-center bg-slate-100/90 h-10">
        <div className="w-14 h-full font-bold text-slate-800 text-center border-r border-slate-300 shrink-0 flex items-center justify-center text-[14px]">
          <MathText text={xLabel} inline className="text-[14px] font-bold" />
        </div>
        <div className="flex-1 relative h-full font-bold text-slate-900 text-[14px]">
          {data.xValues.map((xVal, i) => (
            <div
              key={i}
              style={{ left: `${getXPos(i)}%` }}
              className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center font-bold text-[14px]"
            >
              {renderMathValue(xVal, 'text-slate-900 font-bold')}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: f'(x) / y' */}
      <div className={`flex items-center bg-white h-10 relative ${isBXD ? '' : 'border-b border-slate-300'}`}>
        <div className="w-14 h-full font-bold text-slate-800 text-center border-r border-slate-300 shrink-0 flex items-center justify-center text-[14px] z-10 bg-white">
          <MathText text={fPrimeLabel} inline className="text-[14px] font-bold" />
        </div>
        <div className="flex-1 relative h-full font-bold text-slate-900 text-[14px]">
          {/* Hatched region in row 2 if any */}
          {data.hatchedRegions?.map((hr, hrIdx) => {
            const left = getXPos(hr.fromXIndex);
            const width = getXPos(hr.toXIndex) - left;
            return (
              <div
                key={`hr-prime-${hrIdx}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                className="absolute top-0 bottom-0 z-0 bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_1px,transparent_1px,transparent_6px)] opacity-50"
              />
            );
          })}

          {/* Render single divider in row 2 */}
          {data.singleDividers?.map((sd, i) => {
            if (sd.rows === 'f') return null;
            return (
              <div
                key={`sd-prime-${i}`}
                style={{ left: `${getXPos(sd.xIndex)}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-10"
              >
                <span className="inline-block border-l border-slate-600 h-full" />
              </div>
            );
          })}

          {/* Render double lines in row 2 */}
          {data.doubleLines?.map((dl, i) => {
            if (dl.rows === 'f') return null;
            const isRed = dl.color === 'red';
            return (
              <div
                key={`dl-prime-${i}`}
                style={{ left: `${getXPos(dl.xIndex)}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-10"
              >
                <span className={`inline-block border-l-2 border-r-2 ${isRed ? 'border-red-500' : 'border-slate-700'} h-full w-2`} />
              </div>
            );
          })}

          {data.fPrimeValues.map((fp, i) => {
            let posX = 0;
            if (data.fPrimeValues.length === 2 * N - 3) {
              if (i % 2 === 0) {
                posX = getIntervalPos(i / 2);
              } else {
                posX = getXPos((i + 1) / 2);
              }
            } else if (data.fPrimeValues.length === N) {
              posX = getXPos(i);
            } else {
              posX = pad + (i * (100 - 2 * pad)) / (data.fPrimeValues.length - 1);
            }

            if (!fp || fp === '&nbsp;') return null;

            return (
              <div
                key={i}
                style={{ left: `${posX}%` }}
                className={`absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center text-[14px] font-bold z-10 ${
                  fp === '||'
                    ? 'text-red-600 font-black tracking-tighter'
                    : fp === '|'
                    ? 'text-slate-600 font-bold'
                    : fp === '0'
                    ? 'text-slate-600 font-bold'
                    : 'text-blue-700 font-bold'
                }`}
              >
                {fp === '||' ? (
                  <span className="inline-block border-l-2 border-r-2 border-slate-700 h-full w-1.5" />
                ) : fp === '|' ? (
                  <span className="inline-block border-l border-slate-600 h-full" />
                ) : (
                  renderMathValue(fp, fp === '0' ? 'text-slate-600 font-bold' : 'text-blue-700 font-bold')
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: f(x) / y with Arrows & Values (only for full BBT) */}
      {!isBXD && (
        <div className={`flex bg-white ${row3Height} relative overflow-hidden`}>
          <div className="w-14 py-4 px-2 font-bold text-slate-800 text-center border-r border-slate-300 flex items-center justify-center shrink-0 text-[14px] z-20 bg-white">
            <MathText text={fLabel} inline className="text-[14px] font-bold" />
          </div>
          <div className="flex-1 relative h-full text-[14px]">
            {/* Hatched region in row 3 if any */}
            {data.hatchedRegions?.map((hr, hrIdx) => {
              const left = getXPos(hr.fromXIndex);
              const width = getXPos(hr.toXIndex) - left;
              return (
                <div
                  key={`hr-f-${hrIdx}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className="absolute top-0 bottom-0 z-0 bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_1px,transparent_1px,transparent_6px)] opacity-50"
                />
              );
            })}

            {/* Render single divider in row 3 */}
            {data.singleDividers?.map((sd, i) => {
              if (sd.rows === 'prime') return null;
              return (
                <div
                  key={`sd-f-${i}`}
                  style={{ left: `${getXPos(sd.xIndex)}%` }}
                  className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-none"
                >
                  <span className="inline-block border-l border-slate-600 h-full" />
                </div>
              );
            })}

            {/* Render double lines for asymptote in row 3 */}
            {data.doubleLines
              ? data.doubleLines.map((dl, i) => {
                  if (dl.rows === 'prime') return null;
                  const isRed = dl.color === 'red';
                  return (
                    <div
                      key={`dl-f-${i}`}
                      style={{ left: `${getXPos(dl.xIndex)}%` }}
                      className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-none"
                    >
                      <span
                        className={`inline-block border-l-2 border-r-2 ${
                          isRed ? 'border-red-500' : 'border-slate-700'
                        } h-full w-2`}
                      />
                    </div>
                  );
                })
              : data.fPrimeValues.map((fp, i) => {
                  if (fp !== '||') return null;
                  const posX = getXPos((i + 1) / 2);
                  return (
                    <div
                      key={`dl-${i}`}
                      style={{ left: `${posX}%` }}
                      className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-0 pointer-events-none"
                    >
                      <span className="inline-block border-l-2 border-r-2 border-slate-700 h-full w-2" />
                    </div>
                  );
                })}

            {/* Render SVG Arrows with slender line and sharp arrowhead */}
            {effectiveArrows.length > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Upward arrow marker (Blue) */}
                  <marker
                    id={`bbt-marker-up-${instanceId}`}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerUnits="userSpaceOnUse"
                    markerWidth="9"
                    markerHeight="9"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 L 2 5 Z" fill="#1d4ed8" />
                  </marker>
                  {/* Downward arrow marker (Red) */}
                  <marker
                    id={`bbt-marker-down-${instanceId}`}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerUnits="userSpaceOnUse"
                    markerWidth="9"
                    markerHeight="9"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 L 2 5 Z" fill="#dc2626" />
                  </marker>
                </defs>
                {effectiveArrows.map((arr, i) => {
                  const x1 = getFValPos(arr.fromIndex);
                  const x2 = getFValPos(arr.toIndex);
                  const fromValObj = data.fValues?.[arr.fromIndex];
                  const toValObj = data.fValues?.[arr.toIndex];

                  const isUp =
                    arr.direction === 'up' ||
                    (fromValObj?.position === 'bottom' && toValObj?.position !== 'bottom') ||
                    toValObj?.position === 'top';

                  let y1 = isUp ? 78 : 22;
                  if (fromValObj?.position === 'top') y1 = 22;
                  else if (fromValObj?.position === 'bottom') y1 = 78;
                  else if (fromValObj?.position === 'middle') y1 = 50;

                  let y2 = isUp ? 22 : 78;
                  if (toValObj?.position === 'top') y2 = 22;
                  else if (toValObj?.position === 'bottom') y2 = 78;
                  else if (toValObj?.position === 'middle') y2 = 50;

                  const dx = x2 - x1;
                  const dy = y2 - y1;

                  // Trim start and end so arrow tip is placed right outside the value
                  const trimStart = 0.14;
                  const trimEnd = 0.14;

                  const startX = x1 + dx * trimStart;
                  const startY = y1 + dy * trimStart;
                  const endX = x2 - dx * trimEnd;
                  const endY = y2 - dy * trimEnd;

                  const color = isUp ? '#1d4ed8' : '#dc2626';
                  const marker = isUp
                    ? `url(#bbt-marker-up-${instanceId})`
                    : `url(#bbt-marker-down-${instanceId})`;

                  return (
                    <line
                      key={i}
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke={color}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      markerEnd={marker}
                    />
                  );
                })}
              </svg>
            )}

            {/* Render fValues with elevated z-index */}
            {data.fValues?.map((fv, i) => {
              const posX = getFValPos(i);
              let posClass = 'top-1/2 -translate-y-1/2';
              if (fv.position === 'top') posClass = 'top-2.5';
              if (fv.position === 'bottom') posClass = 'bottom-2.5';

              return (
                <div
                  key={i}
                  style={{ left: `${posX}%` }}
                  className={`absolute ${posClass} -translate-x-1/2 flex items-center justify-center font-bold text-[14px] z-20`}
                >
                  <span className="bg-white/90 px-1 py-0.5 rounded shadow-2xs">
                    {renderMathValue(fv.value, 'text-slate-900 font-bold')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function renderBBT(data: BBTData) {
  return <BBTTableRenderer data={data} />;
}

// Render Coordinate Graph (Oxy) dynamically from parsed math or static graph data
function renderDynamicOrStaticGraph(parsedMath: ParsedMathFunction | null, graphData?: GraphData) {
  const width = 360;
  const height = 260;

  // Determine bounds and evaluation function
  let xMin = parsedMath ? parsedMath.xMin : graphData?.xMin ?? -3.5;
  let xMax = parsedMath ? parsedMath.xMax : graphData?.xMax ?? 3.5;
  let yMin = parsedMath ? parsedMath.yMin : graphData?.yMin ?? -3.5;
  let yMax = parsedMath ? parsedMath.yMax : graphData?.yMax ?? 3.5;

  // Pad slightly for clear margin around axes and key points
  const spanX = Math.max(2, xMax - xMin);
  const spanY = Math.max(2, yMax - yMin);

  // SVG coordinate transformation
  const padLeft = 32;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 24;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const toSvgX = (x: number) => padLeft + ((x - xMin) / spanX) * plotW;
  const toSvgY = (y: number) => padTop + ((yMax - y) / spanY) * plotH;

  const originX = toSvgX(0);
  const originY = toSvgY(0);

  // Discontinuities (vertical asymptotes)
  const discontinuities: number[] = [];
  if (parsedMath) {
    discontinuities.push(...parsedMath.discontinuities);
  } else if (graphData?.asymptotes) {
    graphData.asymptotes
      .filter((a) => a.type === 'vertical')
      .forEach((a) => discontinuities.push(a.val));
  }

  // Curve evaluation function
  const evalFn = (x: number): number => {
    if (parsedMath) return parsedMath.evaluate(x);
    if (!graphData) return 0;
    if (graphData.expression && !hasUnknownParameters(graphData.expression)) {
      const pm = parseMathFunction(graphData.expression);
      if (pm) return pm.evaluate(x);
    }
    if (graphData.kind === 'cubic') {
      return graphData.expression?.includes('-x^3') ? -x * x * x + 3 * x : x * x * x - 3 * x + 1;
    }
    if (graphData.kind === 'quartic') {
      return x * x * x * x - 2 * x * x - 1;
    }
    if (graphData.kind === 'rational') {
      return graphData.expression?.includes('2x + 1') || graphData.expression?.includes('2*x + 1')
        ? (2 * x + 1) / (x - 1)
        : (2 * x - 1) / (x + 1);
    }
    if (graphData.kind === 'oblique') {
      return (x * x - x + 1) / (x - 1);
    }
    if (graphData.kind === 'f_prime') {
      return 0.3 * (x + 2) * (x - 1) * (x - 3);
    }
    return 0;
  };

  // Key points to render
  const keyPoints = parsedMath?.keyPoints || graphData?.keyPoints || [];
  const asymptotes = parsedMath?.asymptotes || graphData?.asymptotes || [];

  // Generate curve segments (split around discontinuities)
  const paths: string[] = [];
  const intervals: [number, number][] = [];

  if (discontinuities.length === 0) {
    intervals.push([xMin - 0.5, xMax + 0.5]);
  } else {
    const sortedDisc = [...discontinuities].sort((a, b) => a - b);
    let start = xMin - 0.5;
    sortedDisc.forEach((d) => {
      intervals.push([start, d - 0.08]);
      start = d + 0.08;
    });
    intervals.push([start, xMax + 0.5]);
  }

  intervals.forEach(([iStart, iEnd]) => {
    const p = generateSmoothPath(evalFn, iStart, iEnd, toSvgX, toSvgY, yMin - 4, yMax + 4);
    if (p) paths.push(p);
  });

  // Calculate integer grid ticks
  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x !== 0) xTicks.push(x);
  }
  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y !== 0) yTicks.push(y);
  }

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-slate-50 rounded-xl border border-slate-200 shadow-2xs"
      >
        {/* Background Grid */}
        <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2,2">
          {xTicks.map((x) => (
            <line key={`gx-${x}`} x1={toSvgX(x)} y1="0" x2={toSvgX(x)} y2={height} />
          ))}
          {yTicks.map((y) => (
            <line key={`gy-${y}`} x1="0" y1={toSvgY(y)} x2={width} y2={toSvgY(y)} />
          ))}
        </g>

        {/* Axes Ox and Oy */}
        <g stroke="#1e293b" strokeWidth="1.6">
          {/* Ox */}
          {originY >= 5 && originY <= height - 5 ? (
            <line x1="8" y1={originY} x2={width - 8} y2={originY} />
          ) : (
            <line x1="8" y1={height - 20} x2={width - 8} y2={height - 20} />
          )}
          {/* Oy */}
          {originX >= 5 && originX <= width - 5 ? (
            <line x1={originX} y1={height - 8} x2={originX} y2="8" />
          ) : (
            <line x1={30} y1={height - 8} x2={30} y2="8" />
          )}
        </g>

        {/* Axis Arrows */}
        <polygon
          points={`${width - 6},${Math.min(height - 10, Math.max(10, originY)) - 3.5} ${width - 1},${Math.min(height - 10, Math.max(10, originY))} ${width - 6},${Math.min(height - 10, Math.max(10, originY)) + 3.5}`}
          fill="#1e293b"
        />
        <polygon
          points={`${Math.min(width - 10, Math.max(10, originX)) - 3.5},6 ${Math.min(width - 10, Math.max(10, originX))},1 ${Math.min(width - 10, Math.max(10, originX)) + 3.5},6`}
          fill="#1e293b"
        />

        {/* Axis Labels x, y, O */}
        <text
          x={width - 14}
          y={Math.min(height - 15, Math.max(15, originY)) - 6}
          fontSize="11"
          fontWeight="bold"
          fill="#1e293b"
        >
          x
        </text>
        <text
          x={Math.min(width - 20, Math.max(15, originX)) + 6}
          y={15}
          fontSize="11"
          fontWeight="bold"
          fill="#1e293b"
        >
          y
        </text>
        <text
          x={Math.min(width - 20, Math.max(15, originX)) - 11}
          y={Math.min(height - 10, Math.max(15, originY)) + 12}
          fontSize="10"
          fontWeight="bold"
          fill="#475569"
        >
          O
        </text>

        {/* Asymptotes */}
        {asymptotes.map((asyp, idx) => {
          if (asyp.type === 'vertical') {
            const sx = toSvgX(asyp.val);
            return (
              <g key={`asyp-v-${idx}`}>
                <line x1={sx} y1="0" x2={sx} y2={height} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x={sx + 4} y={24} fontSize="10" fill="#dc2626" fontWeight="bold">
                  {asyp.eq}
                </text>
              </g>
            );
          }
          if (asyp.type === 'horizontal') {
            const sy = toSvgY(asyp.val);
            return (
              <g key={`asyp-h-${idx}`}>
                <line x1="0" y1={sy} x2={width} y2={sy} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x={padLeft + 4} y={sy - 4} fontSize="10" fill="#dc2626" fontWeight="bold">
                  {asyp.eq}
                </text>
              </g>
            );
          }
          if (asyp.type === 'oblique') {
            const slope = (asyp as any).slope !== undefined ? (asyp as any).slope : 1;
            const intercept = (asyp as any).intercept !== undefined ? (asyp as any).intercept : 0;
            const x1 = xMin;
            const y1 = slope * x1 + intercept;
            const x2 = xMax;
            const y2 = slope * x2 + intercept;

            return (
              <g key={`asyp-o-${idx}`}>
                <line
                  x1={toSvgX(x1)}
                  y1={toSvgY(y1)}
                  x2={toSvgX(x2)}
                  y2={toSvgY(y2)}
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                <text x={toSvgX(xMax - 0.8)} y={toSvgY(y2) - 6} fontSize="10" fill="#dc2626" fontWeight="bold">
                  {asyp.eq}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Function Curve Paths */}
        {paths.map((p, pIdx) => (
          <path key={`curve-seg-${pIdx}`} d={p} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        ))}

        {/* Key Points (Extrema, Intercepts, Roots) */}
        {keyPoints.map((pt, idx) => {
          const sx = toSvgX(pt.x);
          const sy = toSvgY(pt.y);

          // Only render if within plot box
          if (sx < 0 || sx > width || sy < 0 || sy > height) return null;

          return (
            <g key={`kp-${idx}`}>
              {/* Dotted projection lines to axes */}
              {Math.abs(pt.x) > 0.05 && (
                <line
                  x1={sx}
                  y1={sy}
                  x2={sx}
                  y2={Math.min(height - 10, Math.max(10, originY))}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}
              {Math.abs(pt.y) > 0.05 && (
                <line
                  x1={sx}
                  y1={sy}
                  x2={Math.min(width - 10, Math.max(10, originX))}
                  y2={sy}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}

              {/* Point Circle */}
              <circle cx={sx} cy={sy} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />

              {/* Label */}
              {pt.label && (
                <text
                  x={pt.x >= 0 ? sx + 5 : sx - 38}
                  y={pt.y >= 0 ? sy - 7 : sy + 14}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  className="drop-shadow-xs"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Generate smooth path avoiding asymptote jumps
function generateSmoothPath(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
  yMinClip: number,
  yMaxClip: number,
  steps = 140
) {
  let path = '';
  const stepSize = (xMax - xMin) / steps;
  let prevValid = false;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * stepSize;
    const y = fn(x);

    if (isNaN(y) || !isFinite(y) || y < yMinClip || y > yMaxClip) {
      prevValid = false;
      continue;
    }

    const sx = toSvgX(x);
    const sy = toSvgY(y);

    if (!prevValid || path === '') {
      path += ` M ${sx.toFixed(1)},${sy.toFixed(1)}`;
    } else {
      path += ` L ${sx.toFixed(1)},${sy.toFixed(1)}`;
    }
    prevValid = true;
  }

  return path;
}
