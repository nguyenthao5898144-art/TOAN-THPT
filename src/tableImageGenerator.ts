import { Question } from '../types';

export interface ValueTableData {
  title?: string;
  headers?: string[];
  rows: string[][];
}

/**
 * Escape text for safe inline SVG XML rendering
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Clean math symbols for clean SVG text rendering
 */
function cleanMathForSvg(val: string): string {
  if (!val) return '';
  let str = val.trim();
  // Strip outer $ if present
  if (str.startsWith('$') && str.endsWith('$') && str.length > 1) {
    str = str.slice(1, -1).trim();
  }
  // Replace common LaTeX symbols for SVG display
  str = str
    .replace(/\\infty/g, '∞')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\neq/g, '≠')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sqrt\{?(.*?)\}?/g, '√$1')
    .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '$1/$2')
    .replace(/\\\+/g, '+')
    .replace(/\\\-/g, '−');

  return str;
}

/**
 * Generate a crisp, publication-ready SVG Image Data URL for a Table of Values (Bảng giá trị)
 */
export function generateTableSvgDataUrl(rows: string[][], title: string = 'BẢNG GIÁ TRỊ HÀM SỐ'): string {
  if (!rows || rows.length === 0) return '';

  const numRows = rows.length;
  let numCols = 0;
  rows.forEach((r) => {
    if (r.length > numCols) numCols = r.length;
  });

  if (numCols === 0) return '';

  const cellWidth = Math.max(75, Math.min(120, Math.floor(580 / Math.max(1, numCols))));
  const rowHeight = 44;
  const paddingX = 20;
  const headerPaddingY = title ? 48 : 20;

  const totalWidth = paddingX * 2 + cellWidth * numCols;
  const totalHeight = headerPaddingY + rowHeight * numRows + 20;

  let svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <linearGradient id="firstColGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Container Box -->
  <rect x="8" y="8" width="${totalWidth - 16}" height="${totalHeight - 16}" rx="16" ry="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#cardShadow)" />
`;

  // Optional Title Banner
  if (title) {
    svgContent += `
  <rect x="8" y="8" width="${totalWidth - 16}" height="36" rx="14" ry="14" fill="url(#headerGrad)" />
  <rect x="8" y="30" width="${totalWidth - 16}" height="14" fill="url(#headerGrad)" />
  <circle cx="28" cy="26" r="4" fill="#38bdf8" />
  <text x="40" y="30" fill="#f8fafc" font-size="12" font-weight="800" letter-spacing="1">${escapeXml(title)}</text>
`;
  }

  const tableTopY = headerPaddingY;

  // Table Background Grid Frame
  const tableGridWidth = cellWidth * numCols;
  const tableGridHeight = rowHeight * numRows;

  svgContent += `
  <rect x="${paddingX}" y="${tableTopY}" width="${tableGridWidth}" height="${tableGridHeight}" rx="10" ry="10" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
`;

  // First Column Highlight (x / f(x) labels column)
  svgContent += `
  <path d="M ${paddingX} ${tableTopY + 10} A 10 10 0 0 1 ${paddingX + 10} ${tableTopY} L ${paddingX + cellWidth} ${tableTopY} L ${paddingX + cellWidth} ${tableTopY + tableGridHeight} L ${paddingX + 10} ${tableTopY + tableGridHeight} A 10 10 0 0 1 ${paddingX} ${tableTopY + tableGridHeight - 10} Z" fill="url(#firstColGrad)" />
`;

  // Draw Horizontal Dividers
  for (let r = 1; r < numRows; r++) {
    const y = tableTopY + r * rowHeight;
    svgContent += `<line x1="${paddingX}" y1="${y}" x2="${paddingX + tableGridWidth}" y2="${y}" stroke="#cbd5e1" stroke-width="1.5" />`;
  }

  // Draw Vertical Dividers
  for (let c = 1; c < numCols; c++) {
    const x = paddingX + c * cellWidth;
    const isFirstDivider = c === 1;
    svgContent += `<line x1="${x}" y1="${tableTopY}" x2="${x}" y2="${tableTopY + tableGridHeight}" stroke="${isFirstDivider ? '#64748b' : '#e2e8f0'}" stroke-width="${isFirstDivider ? '2' : '1.5'}" />`;
  }

  // Draw Table Cells Content
  for (let r = 0; r < numRows; r++) {
    const yCenter = tableTopY + r * rowHeight + rowHeight / 2 + 5;
    for (let c = 0; c < numCols; c++) {
      const cellVal = rows[r]?.[c] || '';
      const cleanVal = cleanMathForSvg(cellVal);
      const xCenter = paddingX + c * cellWidth + cellWidth / 2;

      const isFirstCol = c === 0;
      const isHeaderRow = r === 0;

      let textColor = '#0f172a';
      let fontStyle = 'font-weight="bold" font-size="16"';

      if (isFirstCol) {
        textColor = '#0f172a';
        fontStyle = 'font-weight="bold" font-size="16"';
      } else if (cleanVal === '||') {
        textColor = '#dc2626';
        fontStyle = 'font-weight="bold" font-size="16"';
      } else if (isHeaderRow) {
        textColor = '#0f172a';
        fontStyle = 'font-weight="bold" font-size="16"';
      } else {
        textColor = '#1d4ed8';
        fontStyle = 'font-weight="bold" font-size="16"';
      }

      svgContent += `
  <text x="${xCenter}" y="${yCenter}" text-anchor="middle" fill="${textColor}" ${fontStyle}>${escapeXml(cleanVal)}</text>
`;
    }
  }

  svgContent += `\n</svg>`;

  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  return svgDataUri;
}

/**
 * Parses LaTeX \begin{array}, \begin{tabular}, Markdown tables, or plain text table formats into rows
 */
export function extractTableDataFromText(text: string): { rows: string[][]; title?: string } | null {
  if (!text) return null;

  // 1. Check for LaTeX \begin{array} ... \end{array} or \begin{tabular} ... \end{tabular}
  const latexTableMatch = text.match(/\\begin\{(array|tabular)\}([\s\S]*?)\\end\{\1\}/i);
  if (latexTableMatch) {
    const tableBody = latexTableMatch[2];
    // Remove formatting commands like \hline, \ccline, etc.
    const cleanBody = tableBody.replace(/\\hline|\\cline\{.*?\}/gi, '');
    const rawRows = cleanBody.split('\\\\');

    const rows: string[][] = [];
    for (const r of rawRows) {
      const trimmedRow = r.trim();
      if (!trimmedRow) continue;
      const cells = trimmedRow.split('&').map((c) => c.trim().replace(/^[\$]+|[\$]+$/g, ''));
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        rows.push(cells);
      }
    }

    if (rows.length > 0 && rows[0].length > 0) {
      return { rows, title: 'BẢNG GIÁ TRỊ (GIAO DIỆN ẢNH)' };
    }
  }

  // 2. Check for Markdown table | x | -2 | -1 | 0 | 1 | ...
  const mdTableLines = text.split('\n').filter((line) => line.trim().startsWith('|') && line.trim().endsWith('|'));
  if (mdTableLines.length >= 2) {
    const rawRows: string[][] = [];
    for (const line of mdTableLines) {
      if (line.includes('---')) continue; // skip markdown header divider line
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length > 0) {
        rawRows.push(cells);
      }
    }
    if (rawRows.length > 0) {
      // Check if sign table (BXD)
      const firstRowHeader = (rawRows[0]?.[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
      const isSignTable =
        firstRowHeader === 'x' &&
        rawRows.some((r) => {
          const h = (r[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
          return h.includes("f'(x)") || h.includes("y'") || h.includes("f'");
        });

      if (isSignTable && rawRows.length >= 2) {
        const header0 = rawRows[0][0];
        const xVals = rawRows[0].slice(1).filter((v) => v.length > 0 && v !== '&nbsp;');
        const N = xVals.length;
        if (N >= 2) {
          const totalContentCols = 2 * N - 1;
          const normalizedRows: string[][] = [];

          // Row 0
          const xRowFormatted = new Array(totalContentCols + 1).fill('');
          xRowFormatted[0] = header0;
          for (let k = 0; k < N; k++) {
            xRowFormatted[1 + 2 * k] = xVals[k];
          }
          normalizedRows.push(xRowFormatted);

          // Subsequent rows
          for (let r = 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            const header = row[0];
            const cells = row.slice(1).filter((c) => c.length > 0 && c !== '&nbsp;');
            const formattedRow = new Array(totalContentCols + 1).fill('');
            formattedRow[0] = header;

            if (cells.length === 2 * N - 3) {
              for (let idx = 0; idx < cells.length; idx++) {
                formattedRow[2 + idx] = cells[idx];
              }
            } else if (cells.length === N - 1) {
              for (let k = 0; k < N - 1; k++) {
                formattedRow[1 + 2 * k + 1] = cells[k];
                if (k < N - 2) formattedRow[1 + 2 * (k + 1)] = '0';
              }
            } else {
              for (let c = 0; c < Math.min(cells.length, totalContentCols); c++) {
                formattedRow[1 + c] = cells[c];
              }
            }
            normalizedRows.push(formattedRow);
          }

          return { rows: normalizedRows, title: 'BẢNG XÉT DẤU' };
        }
      }

      return { rows: rawRows, title: 'BẢNG GIÁ TRỊ (GIAO DIỆN ẢNH)' };
    }
  }

  // 3. Check for HTML <table> ... </table>
  if (text.includes('<table') && text.includes('</table>')) {
    const trMatches = text.match(/<tr[\s\S]*?<\/tr>/gi);
    if (trMatches && trMatches.length > 0) {
      const rows: string[][] = [];
      for (const tr of trMatches) {
        const tdMatches = tr.match(/<(td|th)[\s\S]*?<\/\1>/gi);
        if (tdMatches) {
          const cells = tdMatches.map((td) => td.replace(/<[^>]+>/g, '').trim());
          rows.push(cells);
        }
      }
      if (rows.length > 0) {
        return { rows, title: 'BẢNG GIÁ TRỊ (GIAO DIỆN ẢNH)' };
      }
    }
  }

  // 4. Check for keywords like "Bảng giá trị" or "Cho bảng giá trị" with key-values
  if (/bảng giá trị/i.test(text) || /bảng số liệu/i.test(text)) {
    // Attempt line parsing for x and y
    const lines = text.split('\n');
    const tableRows: string[][] = [];
    for (const line of lines) {
      if (line.includes(':') || line.includes('|') || line.includes(';')) {
        const parts = line.split(/[:|;]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          tableRows.push(parts);
        }
      }
    }
    if (tableRows.length >= 2) {
      return { rows: tableRows, title: 'BẢNG GIÁ TRỊ HÀM SỐ' };
    }
  }

  return null;
}

/**
 * Automatically processes a question, converting any detected table of values into a high-quality SVG image URL
 */
export function processQuestionTableToImage<T extends Question>(q: T): T {
  const newQ = { ...q };

  // If question already has an imageUrl or diagramId, ensure table is rendered cleanly
  if (!newQ.imageUrl) {
    const extracted = extractTableDataFromText(newQ.content + '\n' + (newQ.solution || ''));
    if (extracted && extracted.rows.length >= 1) {
      const svgUrl = generateTableSvgDataUrl(extracted.rows, extracted.title);
      if (svgUrl) {
        newQ.imageUrl = svgUrl;
        newQ.tableData = extracted;
      }
    }
  }

  return newQ;
}
