import { BBTData, GraphData, DIAGRAM_BANK, DiagramItem } from './diagramBank';
import { parseMathFunction, extractFormulaFromText, hasUnknownParameters, ParsedMathFunction, resolveQuestionDiagram, parseAsciiBBT } from './mathGraphParser';
import { extractTikZFromText, parseTkzTabToBBT, getTikZCodeForQuestion } from './tikzParser';
import { Question } from './types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface GeneratedImageData {
  data: Uint8Array;
  type: 'png' | 'jpg';
  width: number;
  height: number;
}

/**
 * Clean LaTeX math strings into clean unicode characters for Canvas 2D text rendering
 */
function cleanMathForCanvas(mathStr: string): string {
  if (!mathStr) return '';
  let str = mathStr.trim();
  if (str.startsWith('$') && str.endsWith('$') && str.length > 1) {
    str = str.slice(1, -1).trim();
  }
  str = str.replace(/\\boldsymbol\{([^}]+)\}/g, '$1');
  str = str.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  str = str.replace(/\\text\{([^}]+)\}/g, '$1');
  str = str.replace(/\\mathit\{([^}]+)\}/g, '$1');
  str = str.replace(/\\prime/g, "'");

  // Fix corrupted superscript infty
  str = str.replace(/\^\{\s*-\s*\}\s*\\?inft?y\b/gi, '-∞');
  str = str.replace(/\^\{\s*\+\s*\}\s*\\?inft?y\b/gi, '+∞');
  str = str.replace(/\^-\s*\\?inft?y\b/gi, '-∞');
  str = str.replace(/\^\+\s*\\?inft?y\b/gi, '+∞');
  str = str.replace(/\^\{\s*-\s*\}\s*\\infty/gi, '-∞');
  str = str.replace(/\^\{\s*\+\s*\}\s*\\infty/gi, '+∞');
  str = str.replace(/\^-\s*\\infty/gi, '-∞');
  str = str.replace(/\^\+\s*\\infty/gi, '+∞');

  str = str.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
  str = str.replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
  str = str.replace(/\\sqrt\{([^}]+)\}/g, '√$1');
  str = str.replace(/\\sqrt/g, '√');
  str = str.replace(/-\\infty/g, '-∞');
  str = str.replace(/\+\\infty/g, '+∞');
  str = str.replace(/\\infty/g, '∞');
  str = str.replace(/\b-\s*inft?y\b/gi, '-∞');
  str = str.replace(/\b\+\s*inft?y\b/gi, '+∞');
  str = str.replace(/\binft?y\b/gi, '∞');
  str = str.replace(/\\alpha/g, 'α');
  str = str.replace(/\\beta/g, 'β');
  str = str.replace(/\\gamma/g, 'γ');
  str = str.replace(/\\delta/g, 'δ');
  str = str.replace(/\\pi/g, 'π');
  str = str.replace(/\\le/g, '≤');
  str = str.replace(/\\ge/g, '≥');
  str = str.replace(/\\neq/g, '≠');
  str = str.replace(/\\pm/g, '±');
  str = str.replace(/\\times/g, '×');

  // Convert powers to unicode superscripts for clean display
  str = str
    .replace(/\^2\b|\^\{2\}/g, '²')
    .replace(/\^3\b|\^\{3\}/g, '³')
    .replace(/\^4\b|\^\{4\}/g, '⁴')
    .replace(/\^0\b|\^\{0\}/g, '⁰')
    .replace(/\^1\b|\^\{1\}/g, '¹')
    .replace(/\^n\b|\^\{n\}/g, 'ⁿ')
    .replace(/\^m\b|\^\{m\}/g, 'ᵐ')
    .replace(/_1\b|_\{1\}/g, '₁')
    .replace(/_2\b|_\{2\}/g, '₂')
    .replace(/_0\b|_\{0\}/g, '₀');

  return str.replace(/[\$\{\}]/g, '').trim();
}

/**
 * Converts a Base64 data URL or standard URL to Uint8Array
 */
async function urlToUint8Array(url: string): Promise<Uint8Array | null> {
  try {
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const base64 = parts[1];
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      return new Uint8Array(buf);
    }
  } catch (err) {
    console.warn('Failed to convert image url to Uint8Array:', err);
    return null;
  }
}

/**
 * Helper to convert canvas to PNG Uint8Array
 */
function canvasToUint8Array(canvas: HTMLCanvasElement): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

/**
 * Render Bảng biến thiên (BBT) onto an HTML5 Canvas and export as PNG
 */
export async function renderBBTToCanvasImage(bbt: BBTData): Promise<GeneratedImageData | null> {
  try {
    const scale = 2; // High DPI crisp rendering
    const isBXD = !bbt.fValues || bbt.fValues.length === 0;
    const displayWidth = 540;
    const displayHeight = isBXD ? 116 : 236;
    const width = displayWidth * scale;
    const height = displayHeight * scale;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // 1. Background & Border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 4, displayWidth - 8, displayHeight - 8);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(4, 4, displayWidth - 8, displayHeight - 8);

    // Title at the top
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bxdTitle = bbt.fPrimeLabel && !bbt.fPrimeLabel.includes("y'")
      ? `BẢNG XÉT DẤU ${cleanMathForCanvas(bbt.fPrimeLabel)}`
      : isBXD
      ? "BẢNG XÉT DẤU"
      : 'BẢNG BIẾN THIÊN HÀM SỐ';
    ctx.fillText(bxdTitle, displayWidth / 2, 16);

    const tableTop = 28;
    const tableLeft = 8;
    const tableRight = displayWidth - 8;
    const tableWidth = tableRight - tableLeft;
    
    // Dynamically adjust header column width for longer variable/expression labels like m^2 - m - 2
    const maxHeaderLen = Math.max(
      cleanMathForCanvas(bbt.xLabel || 'x').length,
      cleanMathForCanvas(bbt.fPrimeLabel || "y'").length,
      !isBXD ? cleanMathForCanvas(bbt.fLabel || 'y').length : 0
    );
    const headerColWidth = Math.max(58, Math.min(130, maxHeaderLen * 11 + 24));
    const dataLeft = tableLeft + headerColWidth;
    const dataWidth = tableRight - dataLeft;

    const row1H = 38;
    const row2H = 38;
    const row3H = isBXD ? 0 : 120;
    const tableBottom = tableTop + row1H + row2H + row3H;

    // Background of row 1 (x)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(tableLeft, tableTop, tableWidth, row1H);

    // Inner grid borders
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;

    // Outer table box
    ctx.strokeRect(tableLeft, tableTop, tableWidth, row1H + row2H + row3H);

    // Vertical line between header column and data column
    ctx.beginPath();
    ctx.moveTo(dataLeft, tableTop);
    ctx.lineTo(dataLeft, tableBottom);
    ctx.stroke();

    // Horizontal line below row 1
    ctx.beginPath();
    ctx.moveTo(tableLeft, tableTop + row1H);
    ctx.lineTo(tableRight, tableTop + row1H);
    ctx.stroke();

    // Horizontal line below row 2 (only if full BBT with row 3)
    if (!isBXD) {
      ctx.beginPath();
      ctx.moveTo(tableLeft, tableTop + row1H + row2H);
      ctx.lineTo(tableRight, tableTop + row1H + row2H);
      ctx.stroke();
    }

    // Headers in first column: In đậm size 14
    ctx.font = 'bold 14px "Times New Roman", Times, serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(cleanMathForCanvas(bbt.xLabel || 'x'), tableLeft + headerColWidth / 2, tableTop + row1H / 2);
    ctx.fillText(cleanMathForCanvas(bbt.fPrimeLabel || "y'"), tableLeft + headerColWidth / 2, tableTop + row1H + row2H / 2);
    if (!isBXD) {
      ctx.fillText(cleanMathForCanvas(bbt.fLabel || 'y'), tableLeft + headerColWidth / 2, tableTop + row1H + row2H + row3H / 2);
    }

    // Calculate X positions for data items
    const N = bbt.xValues.length;
    const pad = 28; // padding inside data width
    const getXPos = (i: number): number => {
      if (N <= 1) return dataLeft + dataWidth / 2;
      return dataLeft + pad + (i * (dataWidth - 2 * pad)) / (N - 1);
    };

    const getIntervalPos = (i: number): number => {
      return (getXPos(i) + getXPos(i + 1)) / 2;
    };

    const getFValPos = (i: number): number => {
      if (!bbt.fValues) return getXPos(i);
      const valObj = bbt.fValues[i];
      if (valObj && valObj.xPos !== undefined) {
        return dataLeft + (valObj.xPos / 100) * dataWidth;
      }
      if (bbt.fValues.length === N) {
        return getXPos(i);
      }
      let asympIdx = 1;
      const doubleLineInFPrime = bbt.fPrimeValues.findIndex((fp) => fp === '||');
      if (doubleLineInFPrime !== -1) {
        asympIdx = Math.floor(doubleLineInFPrime / 2) + (doubleLineInFPrime % 2);
      }
      if (i < asympIdx) {
        return getXPos(i);
      } else if (i === asympIdx) {
        return getXPos(asympIdx) - 20;
      } else if (i === asympIdx + 1) {
        return getXPos(asympIdx) + 20;
      } else {
        return getXPos(i - 1);
      }
    };

    // 0. Draw hatched regions if any across Row 2 and Row 3
    if (bbt.hatchedRegions && bbt.hatchedRegions.length > 0) {
      bbt.hatchedRegions.forEach((hr) => {
        const x1 = getXPos(hr.fromXIndex);
        const x2 = getXPos(hr.toXIndex);
        const topY = tableTop + row1H;
        const bottomY = isBXD ? tableTop + row1H + row2H : tableBottom;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x1, topY, x2 - x1, bottomY - topY);
        ctx.clip();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        const spacing = 8;
        for (let x = x1 - (bottomY - topY); x <= x2 + (bottomY - topY); x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x + (bottomY - topY), bottomY);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // 0b. Draw single dividers if any
    if (bbt.singleDividers && bbt.singleDividers.length > 0) {
      bbt.singleDividers.forEach((sd) => {
        const posX = getXPos(sd.xIndex);
        const topY = sd.rows === 'f' ? tableTop + row1H + row2H : tableTop + row1H;
        const bottomY = sd.rows === 'prime' ? tableTop + row1H + row2H : tableBottom;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(posX, topY);
        ctx.lineTo(posX, bottomY);
        ctx.stroke();
      });
    }

    // 0c. Draw double lines if any
    if (bbt.doubleLines && bbt.doubleLines.length > 0) {
      bbt.doubleLines.forEach((dl) => {
        const posX = getXPos(dl.xIndex);
        const topY = dl.rows === 'f' ? tableTop + row1H + row2H : tableTop + row1H;
        const bottomY = dl.rows === 'prime' ? tableTop + row1H + row2H : tableBottom;
        const isRed = dl.color === 'red';
        ctx.strokeStyle = isRed ? '#ef4444' : '#334155';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(posX - 2.5, topY);
        ctx.lineTo(posX - 2.5, bottomY);
        ctx.moveTo(posX + 2.5, topY);
        ctx.lineTo(posX + 2.5, bottomY);
        ctx.stroke();
      });
    }

    // 1. Draw x values in Row 1: In đậm size 14
    ctx.font = 'bold 14px "Times New Roman", Times, serif';
    ctx.fillStyle = '#0f172a';
    bbt.xValues.forEach((xVal, i) => {
      const posX = getXPos(i);
      const text = cleanMathForCanvas(xVal);
      ctx.fillText(text, posX, tableTop + row1H / 2);
    });

    // 2. Draw y' signs in Row 2: In đậm size 14
    bbt.fPrimeValues.forEach((fp, i) => {
      let posX = 0;
      if (bbt.fPrimeValues.length === 2 * N - 3) {
        if (i % 2 === 0) {
          posX = getIntervalPos(i / 2);
        } else {
          posX = getXPos((i + 1) / 2);
        }
      } else if (bbt.fPrimeValues.length === N) {
        posX = getXPos(i);
      } else {
        posX = dataLeft + pad + (i * (dataWidth - 2 * pad)) / (bbt.fPrimeValues.length - 1);
      }

      if (!fp || fp === '&nbsp;') return;

      if (fp === '||') {
        if (!bbt.doubleLines) {
          // Default double vertical lines if not explicitly configured
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(posX - 2.5, tableTop + row1H);
          ctx.lineTo(posX - 2.5, tableBottom);
          ctx.moveTo(posX + 2.5, tableTop + row1H);
          ctx.lineTo(posX + 2.5, tableBottom);
          ctx.stroke();
        }
      } else if (fp === '|') {
        // Single vertical divider
        if (!bbt.singleDividers) {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(posX, tableTop + row1H);
          ctx.lineTo(posX, tableTop + row1H + row2H);
          ctx.stroke();
        }
      } else {
        ctx.font = 'bold 14px "Times New Roman", Times, serif';
        ctx.fillStyle = fp === '0' ? '#475569' : '#1d4ed8';
        ctx.fillText(fp, posX, tableTop + row1H + row2H / 2);
      }
    });

    // 3. Draw y values & arrows in Row 3: In đậm size 14 (only if full BBT)
    if (!isBXD && bbt.fValues && bbt.fValues.length > 0) {
      const row3Top = tableTop + row1H + row2H;
      const yTopPos = row3Top + 20;
      const yBottomPos = row3Top + row3H - 20;
      const yMiddlePos = row3Top + row3H / 2;

      const getYCoord = (pos?: string, isUp?: boolean, isStart?: boolean) => {
        if (pos === 'top') return yTopPos;
        if (pos === 'bottom') return yBottomPos;
        if (pos === 'middle') return yMiddlePos;
        if (isStart) return isUp ? yBottomPos : yTopPos;
        return isUp ? yTopPos : yBottomPos;
      };

      // Draw values
      ctx.font = 'bold 14px "Times New Roman", Times, serif';
      bbt.fValues.forEach((valObj, i) => {
        const posX = getFValPos(i);
        const yPos = getYCoord(valObj.position);
        const text = cleanMathForCanvas(valObj.value);
        ctx.fillStyle = valObj.position === 'top' || valObj.position === 'bottom' ? '#1e40af' : '#0f172a';
        ctx.fillText(text, posX, yPos);
      });

      // Draw arrows (if not hidden)
      if (!bbt.hideArrows) {
        const effectiveArrows =
          bbt.arrows && bbt.arrows.length > 0
            ? bbt.arrows
            : (() => {
                if (!bbt.fValues || bbt.fValues.length < 2) return [];
                const autoArr: Array<{ fromIndex: number; toIndex: number; direction: 'up' | 'down'; fromVal: string; toVal: string }> = [];
                for (let i = 0; i < bbt.fValues.length - 1; i++) {
                  const v1 = bbt.fValues[i];
                  const v2 = bbt.fValues[i + 1];
                  if (v1.value === '||' || v2.value === '||') continue;
                  const isJump =
                    (v1.position === 'top' && v2.position === 'bottom') ||
                    (v1.position === 'bottom' && v2.position === 'top' && Math.abs(getFValPos(i + 1) - getFValPos(i)) < 40);
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

        effectiveArrows.forEach((arr) => {
          if (!bbt.fValues) return;
          const fromObj = bbt.fValues[arr.fromIndex];
          const toObj = bbt.fValues[arr.toIndex];
          const isUp = arr.direction === 'up';

          const color = isUp ? '#1d4ed8' : '#dc2626';
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.fillStyle = color;

          const x1Raw = getFValPos(arr.fromIndex);
          const x2Raw = getFValPos(arr.toIndex);
          const y1Raw = getYCoord(fromObj?.position, isUp, true);
          const y2Raw = getYCoord(toObj?.position, isUp, false);

          const dx = x2Raw - x1Raw;
          const dy = y2Raw - y1Raw;
          const trim = 0.22;

          const x1 = x1Raw + dx * trim;
          const x2 = x2Raw - dx * trim;
          const y1 = y1Raw + dy * trim;
          const y2 = y2Raw - dy * trim;

          // Draw slender arrow line
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw sharp distinct arrowhead
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = 10;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(x2 - headLen * 0.75 * Math.cos(angle), y2 - headLen * 0.75 * Math.sin(angle));
          ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        });
      }
    }

    const data = await canvasToUint8Array(canvas);
    if (!data) return null;

    return {
      data,
      type: 'png',
      width: 460,
      height: 200,
    };
  } catch (err) {
    console.error('Error rendering BBT to canvas:', err);
    return null;
  }
}

/**
 * Render Coordinate Graph (Oxy) onto an HTML5 Canvas and export as PNG
 */
export async function renderGraphToCanvasImage(
  graphData?: GraphData,
  parsedMath?: ParsedMathFunction | null
): Promise<GeneratedImageData | null> {
  try {
    const scale = 2; // Crisp 2x retina
    const displayWidth = 400;
    const displayHeight = 295;
    const width = displayWidth * scale;
    const height = displayHeight * scale;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // 1. Background & Border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 4, displayWidth - 8, displayHeight - 8);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, displayWidth - 8, displayHeight - 8);

    // Title at the top
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleText =
      graphData?.kind === 'f_prime' || graphData?.titleLabel?.includes("f'(x)")
        ? "ĐỒ THỊ HÀM SỐ y = f'(x)"
        : graphData?.titleLabel
        ? graphData.titleLabel.toUpperCase().startsWith('ĐỒ THỊ')
          ? graphData.titleLabel.toUpperCase()
          : `ĐỒ THỊ HÀM SỐ ${cleanMathForCanvas(graphData.titleLabel)}`
        : parsedMath?.expressionDisplay
        ? `ĐỒ THỊ HÀM SỐ ${cleanMathForCanvas(parsedMath.expressionDisplay)}`
        : "ĐỒ THỊ HÀM SỐ y = f'(x)";
    ctx.fillText(titleText, displayWidth / 2, 16);

    // Graph Area Bounds
    const padLeft = 36;
    const padRight = 28;
    const padTop = 32;
    const padBottom = 30;

    const plotW = displayWidth - padLeft - padRight;
    const plotH = displayHeight - padTop - padBottom;

    const xMin = parsedMath ? parsedMath.xMin : graphData?.xMin ?? -3.5;
    const xMax = parsedMath ? parsedMath.xMax : graphData?.xMax ?? 3.5;
    const yMin = parsedMath ? parsedMath.yMin : graphData?.yMin ?? -3.5;
    const yMax = parsedMath ? parsedMath.yMax : graphData?.yMax ?? 3.5;

    const spanX = Math.max(2, xMax - xMin);
    const spanY = Math.max(2, yMax - yMin);

    const toX = (x: number) => padLeft + ((x - xMin) / spanX) * plotW;
    const toY = (y: number) => padTop + ((yMax - y) / spanY) * plotH;

    const originX = toX(0);
    const originY = toY(0);

    // 2. Draw subtle Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2]);

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      if (x === 0) continue;
      const gx = toX(x);
      ctx.beginPath();
      ctx.moveTo(gx, padTop);
      ctx.lineTo(gx, padTop + plotH);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0) continue;
      const gy = toY(y);
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash

    // 3. Draw Axes Ox and Oy
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.6;

    // Ox
    const clampedOriginY = Math.min(padTop + plotH - 6, Math.max(padTop + 6, originY));
    ctx.beginPath();
    ctx.moveTo(padLeft - 6, clampedOriginY);
    ctx.lineTo(padLeft + plotW + 14, clampedOriginY);
    ctx.stroke();

    // Ox arrow
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(padLeft + plotW + 18, clampedOriginY);
    ctx.lineTo(padLeft + plotW + 10, clampedOriginY - 4.5);
    ctx.lineTo(padLeft + plotW + 10, clampedOriginY + 4.5);
    ctx.closePath();
    ctx.fill();

    // Oy
    const clampedOriginX = Math.min(padLeft + plotW - 6, Math.max(padLeft + 6, originX));
    ctx.beginPath();
    ctx.moveTo(clampedOriginX, padTop + plotH + 6);
    ctx.lineTo(clampedOriginX, padTop - 14);
    ctx.stroke();

    // Oy arrow
    ctx.beginPath();
    ctx.moveTo(clampedOriginX, padTop - 18);
    ctx.lineTo(clampedOriginX - 4.5, padTop - 10);
    ctx.lineTo(clampedOriginX + 4.5, padTop - 10);
    ctx.closePath();
    ctx.fill();

    // Labels x, y, O (In đậm size 15)
    ctx.font = 'italic bold 15px "Times New Roman", Times, serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('x', padLeft + plotW + 14, clampedOriginY - 8);
    ctx.fillText('y', clampedOriginX + 8, padTop - 10);
    ctx.fillText('O', clampedOriginX - 16, clampedOriginY + 14);

    // Number ticks on axes (In đậm size 15)
    ctx.font = 'bold 15px "Times New Roman", Times, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      if (x === 0 || Math.abs(x) > 10) continue;
      const gx = toX(x);
      if (gx >= padLeft && gx <= padLeft + plotW) {
        ctx.beginPath();
        ctx.moveTo(gx, clampedOriginY - 3);
        ctx.lineTo(gx, clampedOriginY + 3);
        ctx.stroke();
        ctx.fillText(String(x), gx, clampedOriginY + 14);
      }
    }

    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0 || Math.abs(y) > 10) continue;
      const gy = toY(y);
      if (gy >= padTop && gy <= padTop + plotH) {
        ctx.beginPath();
        ctx.moveTo(clampedOriginX - 3, gy);
        ctx.lineTo(clampedOriginX + 3, gy);
        ctx.stroke();
        ctx.fillText(String(y), clampedOriginX - 6, gy + 5);
      }
    }

    // 4. Draw Asymptotes if any
    const asymptotes = parsedMath?.asymptotes || graphData?.asymptotes || [];
    asymptotes.forEach((a) => {
      ctx.strokeStyle = a.type === 'oblique' ? '#7c3aed' : '#dc2626';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);

      if (a.type === 'vertical') {
        const ax = toX(a.val);
        ctx.beginPath();
        ctx.moveTo(ax, padTop);
        ctx.lineTo(ax, padTop + plotH);
        ctx.stroke();
      } else if (a.type === 'horizontal') {
        const ay = toY(a.val);
        ctx.beginPath();
        ctx.moveTo(padLeft, ay);
        ctx.lineTo(padLeft + plotW, ay);
        ctx.stroke();
      } else if (a.type === 'oblique') {
        const slope = (a as { slope?: number }).slope ?? 1;
        const intercept = (a as { intercept?: number }).intercept ?? 0;
        const x1 = xMin;
        const y1 = slope * x1 + intercept;
        const x2 = xMax;
        const y2 = slope * x2 + intercept;
        ctx.beginPath();
        ctx.moveTo(toX(x1), toY(y1));
        ctx.lineTo(toX(x2), toY(y2));
        ctx.stroke();
      }
      ctx.setLineDash([]);
    });

    // 5. Evaluate Curve
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

    const discontinuities: number[] = [];
    if (parsedMath) {
      discontinuities.push(...parsedMath.discontinuities);
    } else if (graphData?.asymptotes) {
      graphData.asymptotes
        .filter((a) => a.type === 'vertical')
        .forEach((a) => discontinuities.push(a.val));
    }

    // Clip to plot area for drawing the curve
    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft - 2, padTop - 2, plotW + 4, plotH + 4);
    ctx.clip();

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';

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
      ctx.beginPath();
      const steps = 300;
      let firstPoint = true;
      for (let s = 0; s <= steps; s++) {
        const x = iStart + (s / steps) * (iEnd - iStart);
        try {
          const y = evalFn(x);
          if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) {
            firstPoint = true;
            continue;
          }
          const px = toX(x);
          const py = toY(y);
          if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
          } else {
            ctx.lineTo(px, py);
          }
        } catch {
          firstPoint = true;
        }
      }
      ctx.stroke();
    });

    ctx.restore();

    // 6. Draw Key Points (dots + labels: In đậm size 15)
    const keyPoints = parsedMath?.keyPoints || graphData?.keyPoints || [];
    keyPoints.forEach((pt) => {
      const px = toX(pt.x);
      const py = toY(pt.y);
      if (px >= padLeft - 2 && px <= padLeft + plotW + 2 && py >= padTop - 2 && py <= padTop + plotH + 2) {
        // Projection dotted lines to axes
        if (Math.abs(pt.x) > 0.05 && Math.abs(pt.y) > 0.05) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, clampedOriginY);
          ctx.moveTo(px, py);
          ctx.lineTo(clampedOriginX, py);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        if (pt.label) {
          ctx.font = 'bold 15px "Times New Roman", Times, serif';
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'left';
          ctx.fillText(cleanMathForCanvas(pt.label), px + 6, py - 6);
        }
      }
    });

    const data = await canvasToUint8Array(canvas);
    if (!data) return null;

    return {
      data,
      type: 'png',
      width: 350,
      height: 258,
    };
  } catch (err) {
    console.error('Error rendering Graph to canvas:', err);
    return null;
  }
}

/**
 * Render Oxyz 3D coordinate system to Canvas
 */
export async function renderOxyzToCanvasImage(): Promise<GeneratedImageData | null> {
  try {
    const scale = 2;
    const displayWidth = 400;
    const displayHeight = 300;
    const canvas = document.createElement('canvas');
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Frame
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, displayWidth - 8, displayHeight - 8);

    // Title
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('HỆ TỌA ĐỘ Oxyz TRONG KHÔNG GIAN', displayWidth / 2, 20);

    const ox = 140;
    const oy = 180;

    // Draw grid planes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Ox axis (tọa độ trục Ox hướng xiên góc xuống trái)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox - 90, oy + 80);
    ctx.stroke();

    // Arrow for Ox
    ctx.beginPath();
    ctx.moveTo(ox - 90, oy + 80);
    ctx.lineTo(ox - 82, oy + 68);
    ctx.moveTo(ox - 90, oy + 80);
    ctx.lineTo(ox - 76, oy + 76);
    ctx.stroke();

    // Oy axis (hướng sang phải)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + 200, oy);
    ctx.stroke();

    // Arrow for Oy
    ctx.beginPath();
    ctx.moveTo(ox + 200, oy);
    ctx.lineTo(ox + 190, oy - 5);
    ctx.moveTo(ox + 200, oy);
    ctx.lineTo(ox + 190, oy + 5);
    ctx.stroke();

    // Oz axis (hướng thẳng đứng lên trên)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - 140);
    ctx.stroke();

    // Arrow for Oz
    ctx.beginPath();
    ctx.moveTo(ox, oy - 140);
    ctx.lineTo(ox - 5, oy - 130);
    ctx.moveTo(ox, oy - 140);
    ctx.lineTo(ox + 5, oy - 130);
    ctx.stroke();

    // Labels
    ctx.font = 'bold 15px "Times New Roman", Times, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('x', ox - 100, oy + 90);
    ctx.fillText('y', ox + 212, oy + 5);
    ctx.fillText('z', ox - 10, oy - 142);
    ctx.fillText('O', ox - 16, oy + 16);

    // Unit vectors i, j, k
    // Vector i (red)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox - 35, oy + 32);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillText('i⃗', ox - 48, oy + 44);

    // Vector j (emerald)
    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + 60, oy);
    ctx.stroke();
    ctx.fillStyle = '#059669';
    ctx.fillText('j⃗', ox + 55, oy - 8);

    // Vector k (blue)
    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - 50);
    ctx.stroke();
    ctx.fillStyle = '#2563eb';
    ctx.fillText('k⃗', ox + 8, oy - 42);

    const data = await canvasToUint8Array(canvas);
    if (!data) return null;

    return {
      data,
      type: 'png',
      width: 340,
      height: 255,
    };
  } catch (err) {
    console.error('Error rendering Oxyz to canvas:', err);
    return null;
  }
}

/**
 * Render 3D Tetrahedron / Pyramid to Canvas
 */
export async function render3DGeometryToCanvasImage(): Promise<GeneratedImageData | null> {
  try {
    const scale = 2;
    const displayWidth = 380;
    const displayHeight = 280;
    const canvas = document.createElement('canvas');
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, displayWidth - 8, displayHeight - 8);

    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('HÌNH CHÓP TAM GIÁC S.ABC', displayWidth / 2, 20);

    const S = { x: 190, y: 50 };
    const A = { x: 80, y: 190 };
    const B = { x: 170, y: 240 };
    const C = { x: 300, y: 190 };

    // Dashed line AC
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();

    // Solid lines: AB, BC, SA, SB, SC
    ctx.setLineDash([]);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.moveTo(S.x, S.y);
    ctx.lineTo(A.x, A.y);
    ctx.moveTo(S.x, S.y);
    ctx.lineTo(B.x, B.y);
    ctx.moveTo(S.x, S.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();

    // Points & Labels
    const points = [
      { pt: S, label: 'S', dx: 0, dy: -8 },
      { pt: A, label: 'A', dx: -14, dy: 4 },
      { pt: B, label: 'B', dx: 0, dy: 18 },
      { pt: C, label: 'C', dx: 14, dy: 4 },
    ];

    ctx.font = 'bold 15px "Times New Roman", Times, serif';
    ctx.fillStyle = '#0f172a';
    points.forEach(({ pt, label, dx, dy }) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(label, pt.x + dx, pt.y + dy);
    });

    const data = await canvasToUint8Array(canvas);
    if (!data) return null;

    return {
      data,
      type: 'png',
      width: 320,
      height: 240,
    };
  } catch (err) {
    console.error('Error rendering 3D Geometry to canvas:', err);
    return null;
  }
}

/**
 * Downloads a GeneratedImageData as a local PNG file
 */
export function downloadDiagramImageAsPng(img: GeneratedImageData, fileName: string = 'HinhVe.png') {
  const blob = new Blob([img.data], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies a GeneratedImageData directly to clipboard
 */
export async function copyDiagramImageToClipboard(img: GeneratedImageData): Promise<boolean> {
  try {
    const blob = new Blob([img.data], { type: 'image/png' });
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Failed to copy image to clipboard:', err);
    return false;
  }
}

/**
 * Resolves and generates the exact image data (BBT, Graph, 3D, TikZ, or Custom Image) for a Question to be embedded in Word docx
 */
export async function generateQuestionDiagramImage(question: Question): Promise<GeneratedImageData | null> {
  try {
    // 0. If question has direct TikZ code or embedded TikZ
    const tikzParsed = question.tikzCode
      ? extractTikZFromText(question.tikzCode)
      : extractTikZFromText(question.content);

    if (tikzParsed.hasTikZ) {
      if (tikzParsed.bbtData) {
        return await renderBBTToCanvasImage(tikzParsed.bbtData);
      }
      if (tikzParsed.tikzType === 'oxyz') {
        return await renderOxyzToCanvasImage();
      }
      if (tikzParsed.tikzType === 'geometry_3d') {
        return await render3DGeometryToCanvasImage();
      }
      if (tikzParsed.tikzType === 'graph') {
        return await renderGraphToCanvasImage(tikzParsed.graphData);
      }
    }

    // 0.5. If question has direct or parsed ASCII BBT data
    if (question.tableData?.bbtData) {
      return await renderBBTToCanvasImage(question.tableData.bbtData);
    }
    const asciiBBT = parseAsciiBBT(question.content);
    if (asciiBBT && asciiBBT.bbtData) {
      return await renderBBTToCanvasImage(asciiBBT.bbtData);
    }

    // 1. If question has a custom imageUrl (e.g. data:image/png;base64,... or uploaded chart)
    if (question.imageUrl) {
      const bytes = await urlToUint8Array(question.imageUrl);
      if (bytes) {
        return {
          data: bytes,
          type: 'png',
          width: 360,
          height: 220,
        };
      }
    }

    // 2. Resolve diagram ID using math graph parser
    const diagramId = resolveQuestionDiagram(question);
    if (!diagramId) {
      // Check if question content explicitly asks for Oxyz or 3D geometry
      const lowerC = (question.content || '').toLowerCase();
      if ((lowerC.includes('oxyz') || lowerC.includes('hệ trục tọa độ oxyz')) && (lowerC.includes('hình vẽ') || lowerC.includes('hình bên') || lowerC.includes('như hình'))) {
        return await renderOxyzToCanvasImage();
      }
      if ((lowerC.includes('hình chóp') || lowerC.includes('tứ diện') || lowerC.includes('lăng trụ')) && (lowerC.includes('hình vẽ') || lowerC.includes('hình bên') || lowerC.includes('như hình'))) {
        return await render3DGeometryToCanvasImage();
      }
      return null;
    }

    let item: DiagramItem | undefined = !diagramId.startsWith('formula:')
      ? DIAGRAM_BANK.find((d) => d.id === diagramId)
      : undefined;

    let parsedMath: ParsedMathFunction | null = null;
    const targetFormula = diagramId.startsWith('formula:') ? diagramId.replace('formula:', '') : null;

    if (targetFormula && !hasUnknownParameters(targetFormula)) {
      parsedMath = parseMathFunction(targetFormula);
    }

    if (!parsedMath && item?.type === 'graph' && item.graphData?.expression && !hasUnknownParameters(item.graphData.expression)) {
      parsedMath = parseMathFunction(item.graphData.expression);
    }

    // A. Render Bảng biến thiên
    if (item?.type === 'bbt' && item.bbtData) {
      return await renderBBTToCanvasImage(item.bbtData);
    }

    // B. Render Graph
    if (parsedMath || item?.graphData) {
      return await renderGraphToCanvasImage(item?.graphData, parsedMath);
    }

    return null;
  } catch (err) {
    console.warn(`Could not generate diagram image for question ${question.id}:`, err);
    return null;
  }
}

/**
 * Exports all diagram images (PNG) and LaTeX TikZ source codes of a test into a ZIP package
 */
export async function exportAllDiagramsZip(questions: Question[], testTitle: string = 'De_Thi_Toan_12'): Promise<{ count: number; success: boolean }> {
  try {
    const zip = new JSZip();
    const folder = zip.folder('Hinh_Ve_De_Thi') || zip;
    let count = 0;
    let tikzDoc = `# TẬP HỢP MÃ NGUỒN TIKZ (LATEX) & HÌNH VẼ ĐỀ THI: ${testTitle}\n# Tạo tự động bởi AI Studio - GDPT 2018\n\n`;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const partName = q.type === 'multiple_choice' ? 'PhanI' : q.type === 'true_false' ? 'PhanII' : 'PhanIII';
      const qNum = String(i + 1).padStart(2, '0');

      const img = await generateQuestionDiagramImage(q);
      if (img) {
        count++;
        const filename = `Cau_${qNum}_${partName}_HinhVe.png`;
        folder.file(filename, img.data);

        // Get TikZ code
        const diagramId = resolveQuestionDiagram(q);
        const item = diagramId && !diagramId.startsWith('formula:') ? DIAGRAM_BANK.find((d) => d.id === diagramId) : undefined;
        const tikzCode = getTikZCodeForQuestion(q, item);

        tikzDoc += `\n% ==========================================\n`;
        tikzDoc += `% CÂU ${i + 1} (${partName}): [${q.topicName}] - File ảnh: ${filename}\n`;
        tikzDoc += `% YCCĐ: ${q.learningOutcome}\n`;
        tikzDoc += `% ==========================================\n`;
        tikzDoc += `${tikzCode}\n\n`;
      }
    }

    if (count === 0) {
      return { count: 0, success: false };
    }

    // Add TikZ source codes file
    folder.file('Ma_Nguon_TikZ_LaTeX.tex', tikzDoc);

    // Generate zip content
    const content = await zip.generateAsync({ type: 'blob' });
    const cleanTitle = testTitle.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_');
    saveAs(content, `Bo_Hinh_Ve_${cleanTitle}.zip`);

    return { count, success: true };
  } catch (err) {
    console.error('Error exporting diagrams zip:', err);
    return { count: 0, success: false };
  }
}

